import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Viewer, MatchInfo, PongInv, PongMatchInv } from './types/pong.type';

export type Client = {
  socket_id?: string;
  user_id?: string;
  nickname?: string;
  avatar?: string;
};

export let matches: Array<MatchInfo> = [];

@Injectable()
export class PongService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async get_users(): Promise<PongInv> {
    const users = await this.prisma.$queryRaw`
        SELECT 
                nickname,
                email,
                firstname,
                surname,
                avatar,
                points,
                CAST(ROW_NUMBER() OVER (ORDER BY points DESC) as INT) pos
        FROM (SELECT u.id,
                u.nickname,
                u.email,
                u.firstname,
                u.surname,
                u.avatar,
                CAST(COALESCE(SUM(m.points),0) as INT) as points
        FROM "Users" as u
        LEFT JOIN "Matches" as m ON u.id = m.winner_id
        GROUP BY u.id
        ORDER BY points DESC, nickname ASC) as ranking
        WHERE nickname != 'Chief'`;
    return users;
  }

  async check_update_match(body: {
    userId: string;
    chiefId: string;
  }): Promise<PongMatchInv> {
    const existing_game = await this.prisma.matches.findFirst({
      where: {
        to_player_id: body.chiefId,
      },
    });
    if (existing_game && existing_game.from_player_id == body.userId) {
      return existing_game;
    } else if (existing_game) {
      const tmp = await this.prisma.matches.update({
        where: {
          id: existing_game.id,
        },
        data: {
          to_player_id: body.userId,
          invitation_status_id: 2,
        },
      });
      return tmp;
    }
  }

  update_player_arrivals(
    match_id: string,
    player_id: string,
    playerIn: boolean,
    socket_id: string,
  ) {
    const found_match = matches.find((elem) => elem.match_id == match_id);
    if (found_match) {
      if (player_id == found_match.players.fromPlayer.player_id) {
        found_match.players.fromPlayer.socket_id = socket_id;
        found_match.players.fromPlayer.in = playerIn;
      }
      if (player_id == found_match.players.toPlayer.player_id) {
        found_match.players.toPlayer.socket_id = socket_id;
        found_match.players.toPlayer.in = playerIn;
      }
      if (
        found_match.players.fromPlayer.in &&
        found_match.players.toPlayer.in
      ) {
        found_match.start_game = true;
        found_match.stop_game = false;
        found_match.start_date = new Date();
        found_match.blackhole_frame = Math.max(Math.random() * 300, 90);
        found_match.blackhole_length = Math.max(Math.random() * 300, 90);
        found_match.blackhole_coords = {
          x: Math.max(Math.random() * 500, 100),
          y: Math.max(Math.random() * 350, 50),
        };
      }
    } else {
      console.log('Insert match');
    }
  }

  update_viewers_arrivals(match_id: string, new_viewer: Viewer) {
    const found_match = matches.find((elem) => elem.match_id == match_id);
    if (found_match) {
      let found_viewer = found_match.viewers.find(
        (elem) => elem.nickname == new_viewer.nickname,
      );
      if (!found_viewer) {
        found_match.viewers.push(new_viewer);
      } else {
        found_viewer = new_viewer;
      }
    } else {
      console.log('Insert match');
    }
  }

  async leaveMatchDisconnected(socket_id: string) {
    let found_match: MatchInfo;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].players.fromPlayer.socket_id == socket_id) {
        matches[i].players.fromPlayer.in = false;
        matches[i].stop_game = true;
        found_match = matches[i];
        await this.userService.set_user_status(
          matches[i].players.fromPlayer.player_id,
          1,
        );
        break;
      } else if (matches[i].players.toPlayer.socket_id == socket_id) {
        matches[i].players.toPlayer.in = false;
        matches[i].stop_game = true;
        found_match = matches[i];
        await this.userService.set_user_status(
          matches[i].players.toPlayer.player_id,
          1,
        );
        break;
      } else {
        for (let j = 0; j < matches[i].viewers.length; j++) {
          if (matches[i].viewers[j].socket_id == socket_id) {
            matches[i].viewers[j].in = false;
            matches[i].viewers = this.arrayRemove(
              matches[i].viewers,
              socket_id,
            );
            found_match = matches[i];
            break;
          }
        }
      }
    }
    return found_match;
  }

  arrayRemove(array: Array<Viewer>, value: string) {
    return array.filter(function (ele) {
      return ele.socket_id != value;
    });
  }

  matchArrayRemove(array: Array<MatchInfo>, value: string) {
    matches = array.filter(function (ele) {
      return ele.match_id != value;
    });
  }

  async get_matches_list(user_id: string): Promise<PongMatchInv> {
    const matches = await this.prisma.$queryRaw`
        SELECT
            from_player_id,
            u1.nickname as from_player_nickname,
            u1.avatar as from_player_avatar,
            score_from_player,
            to_player_id,
            u2.nickname as to_player_nickname,
            u2.avatar as to_player_avatar,
            score_to_player,
            points,
            pong_map,
            start_date,
            end_date,
            (CASE
                WHEN WINNER_id = ${user_id} THEN 'VICTORY'
                WHEN WINNER_id != ${user_id} THEN 'DEFEAT'
            END) as res
        FROM "Matches"
        INNER JOIN "Users" as u1 ON u1.id = from_player_id
        INNER JOIN "Users" as u2 ON u2.id = to_player_id
        WHERE (from_player_id = ${user_id}
            OR to_player_id = ${user_id})
            AND game_over = 'true'
        ORDER BY start_date DESC`;
    return matches;
  }

  async get_pending_accepted_matches_list(
    user_id: string,
  ): Promise<PongMatchInv> {
    const matches = await this.prisma.$queryRaw`
        SELECT * FROM (SELECT
                            m.id,
                            from_player_id,
                            u1.nickname as from_player_nickname,
                            u1.avatar as from_player_avatar,
                            score_from_player,
                            to_player_id,
                            u2.nickname as to_player_nickname,
                            u2.avatar as to_player_avatar,
                            score_to_player,
                            start_date,
                            end_date,
                            (CASE
                                WHEN from_player_id = ${user_id} OR to_player_id = ${user_id} THEN 'Go'
                                WHEN from_player_id != ${user_id} AND to_player_id != ${user_id} THEN 'View'
                            END) as actions
                        FROM "Matches" as m
                        INNER JOIN "Users" as u1 ON u1.id = from_player_id
                        INNER JOIN "Users" as u2 ON u2.id = to_player_id
                        WHERE (from_player_id = ${user_id}
                            OR to_player_id = ${user_id})
                            AND invitation_status_id = 2
                            AND game_over = 'false'
                        ORDER BY invitation_date ASC) AS to_play
        UNION ALL
        SELECT * FROM (SELECT
                            m.id,
                            from_player_id,
                            u1.nickname as from_player_nickname,
                            u1.avatar as from_player_avatar,
                            score_from_player,
                            to_player_id,
                            u2.nickname as to_player_nickname,
                            u2.avatar as to_player_avatar,
                            score_to_player,
                            start_date,
                            end_date,
                            (CASE
                                WHEN from_player_id = ${user_id} OR to_player_id = ${user_id} THEN 'Go'
                                WHEN from_player_id != ${user_id} AND to_player_id != ${user_id} THEN 'View'
                            END) as actions
                        FROM "Matches" as m
                        INNER JOIN "Users" as u1 ON u1.id = from_player_id
                        INNER JOIN "Users" as u2 ON u2.id = to_player_id
                        WHERE (from_player_id != ${user_id}
                            AND to_player_id != ${user_id})
                            AND invitation_status_id = 2
                            AND game_over = 'false'
                        ORDER BY invitation_date ASC) AS to_view`;
    return matches;
  }

  async update_to_play_invitation(
    match_id: string,
    from_player_id: string,
    to_player_id: string,
    status: number,
  ): Promise<PongMatchInv> {
    let data;
    const match = await this.prisma.matches.upsert({
      where: {
        id: match_id,
      },
      update: {
        from_player_id: from_player_id,
        to_player_id: to_player_id,
        invitation_status_id: status,
      },
      create: {
        ...data,
        id: match_id,
        from_player_id: from_player_id,
        to_player_id: to_player_id,
        invitation_status_id: status,
      },
    });
    return match;
  }

  async update_match_data(
    match_id: string,
    from_score: number,
    to_score: number,
    points: number,
    winner_id: string,
    start_date: Date,
    end_date: Date,
    game_over: boolean,
  ) {
    await this.prisma.matches.update({
      where: {
        id: match_id,
      },
      data: {
        score_from_player: from_score,
        score_to_player: to_score,
        points: points,
        winner_id: winner_id,
        start_date: start_date,
        end_date: end_date,
        game_over: game_over,
      },
    });
  }

  async get_pong_invitations(user_id: string): Promise<PongInv> {
    const matches = await this.prisma.$queryRaw`
        SELECT 
                matches.match_id,
                u.id,
                u.nickname,
                u.email,
                u.firstname,
                u.surname,
                u.avatar, 
                matches.inv_status
        FROM (SELECT 
                    f.id as match_id,
                    f.from_player_id as inviting,
                    f.to_player_id as invited,
                    f.invitation_status_id as inv_status
            FROM "Matches" as f
            WHERE f.to_player_id = ${user_id} AND f.invitation_status_id = 1) as matches
        INNER JOIN "Users" as u ON matches.inviting = u.id
        ORDER BY nickname ASC`;
    return matches;
  }

  async find_match_by_id(match_id: string): Promise<PongMatchInv> {
    const match = await this.prisma.$queryRaw`
        SELECT
            m.id,
            from_player_id,
            u1.nickname as from_player_nickname,
            u1.avatar as from_player_avatar,
            score_from_player,
            to_player_id,
            u2.nickname as to_player_nickname,
            u2.avatar as to_player_avatar,
            score_to_player,
            invitation_status_id,
            points,
            winner_id,
            invitation_date,
            start_date,
            end_date,
            game_over,
            pong_map
        FROM "Matches" as m
        INNER JOIN "Users" as u1 ON u1.id = from_player_id
        INNER JOIN "Users" as u2 ON u2.id = to_player_id
        WHERE m.id = ${match_id}`;
    return match;
  }

  async create_match(
    from_player: string,
    to_player: string,
    status: number,
    pong_map: number,
  ): Promise<any> {
    let data;
    const match = await this.prisma.matches.findMany({
      where: {
        from_player_id: from_player,
        to_player_id: to_player,
        invitation_status_id: status,
      },
    });
    if (match.length == 0) {
      const match2 = await this.prisma.matches.create({
        data: {
          ...data,
          from_player_id: from_player,
          to_player_id: to_player,
          invitation_status_id: status,
          pong_map: pong_map,
        },
      });
      return match2;
    }
    return match;
  }

  async find_pending_invitation_with_user_x(
    player_id: string,
  ): Promise<PongMatchInv> {
    const matches = await this.prisma.$queryRaw`
                SELECT to_player_id as player_id,
                invitation_status_id,
                (CASE
                    WHEN from_player_id = ${player_id} THEN 1
                    WHEN to_player_id = ${player_id} THEN 2
                END) as who_invites_to_play_pong,
                game_over
        FROM "Matches"
        WHERE game_over = 'false' AND
                from_player_id = ${player_id} AND
                invitation_status_id != 3 AND
                invitation_status_id != 4
        UNION ALL
        SELECT from_player_id as player_id,
                invitation_status_id,
                (CASE
                    WHEN from_player_id = ${player_id} THEN 1
                    WHEN to_player_id = ${player_id} THEN 2
                END) as who_invites_to_play_pong,
                game_over
        FROM "Matches"
        WHERE game_over = 'false' AND
                to_player_id = ${player_id} AND
                invitation_status_id != 3 AND
                invitation_status_id != 4`;
    return matches;
  }

  async delete_pending_match_invitation(from_id: string, to_id: string) {
    await this.prisma.$queryRaw`
        DELETE
        FROM "Matches"
        WHERE ((from_player_id = ${from_id} AND
                to_player_id = ${to_id}) OR
              (from_player_id = ${from_id} AND
                to_player_id = ${to_id})) AND
                game_over = 'false'`;
  }
}
