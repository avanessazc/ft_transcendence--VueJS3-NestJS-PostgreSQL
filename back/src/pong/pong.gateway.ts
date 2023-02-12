import {
  SubscribeMessage,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { PongService } from './pong.service';
import { Server, Socket } from 'socket.io';
import { matches } from './pong.service';
import { Player, Viewer, MatchInfo, Ball } from './types/pong.type';

const SCORE = 2;
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class PongGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly pongService: PongService) {}

  @SubscribeMessage('updateProfile')
  async updateUsers(
    @MessageBody()
    data: {
      email: string;
      nickname: string;
      firstname: string;
      surname: string;
      avatar: string;
    },
  ) {
    this.server.emit('update-profile', data);
  }

  @SubscribeMessage('updatePongInvitationList')
  async updatePongInvitationList() {
    this.server.emit('update-pong-invitation-list', 'server');
  }

  @SubscribeMessage('updatePendingPongInvitationUserList')
  async updatePendingPongInvitationUserList() {
    this.server.emit('update-pending-pong-invitation-user-list', 'server');
  }

  @SubscribeMessage('updatePendingPongInvitationFriendList')
  async updatePendingPongInvitationFriendList() {
    this.server.emit('update-pending-pong-invitation-friend-list', 'server');
  }

  @SubscribeMessage('updatePongPendingGames')
  async updatePongPendingGames() {
    this.server.emit('update-pong-pending-games', 'server');
  }

  // If Invited player declines invitation, and Inviting player is waiting for him
  @SubscribeMessage('declinedMatchInvitation')
  async declinedMatchInvitation(@MessageBody('match_id') match_id: string) {
    this.server.to(match_id).emit('declined-match-invitation', 'server');
  }

  @SubscribeMessage('disconnected-by-socket-unplug')
  disconnectedInGame(@MessageBody('match_id') match_id: string) {
    setTimeout(() => {
      this.server.emit('update-pong-pending-games', 'server');
      this.server.to(match_id).emit('open-game-notifications');
    }, 5000);
  }

  @SubscribeMessage('init-match-info-with-players-info')
  async initMatchInfoWithPlayersInfo(
    @MessageBody('init_match_info') init_match_info: MatchInfo,
  ) {
    const found_match = matches.find(
      (elem) => elem.match_id == init_match_info.match_id,
    );
    if (!found_match) {
      matches.push(init_match_info);
    }
  }

  @SubscribeMessage('joinOpenedMatch')
  async join_opened_match(@MessageBody('match_id') match_id: string) {
    this.server.emit('join-opened-match', match_id);
  }

  @SubscribeMessage('get-game-status')
  async get_game_status(@MessageBody('match_id') match_id: string) {
    const found_match = matches.find((elem) => elem.match_id == match_id);
    if (found_match) {
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
    }
  }

  @SubscribeMessage('update-players-arrivals')
  async updatePlayerArrivals(
    @MessageBody()
    data: {
      match_id: string;
      player_id: string;
      playerIn: boolean;
      socket_id: string;
    },
  ) {
    this.pongService.update_player_arrivals(
      data.match_id,
      data.player_id,
      data.playerIn,
      data.socket_id,
    );
    const found_match = matches.find((elem) => elem.match_id == data.match_id);
    if (found_match) {
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
    }
  }

  @SubscribeMessage('update-viewers-arrivals')
  async updateViewersArrivals(
    @MessageBody()
    data: {
      match_id: string;
      new_viewer: Viewer;
    },
  ) {
    this.pongService.update_viewers_arrivals(data.match_id, data.new_viewer);
    const found_match = matches.find((elem) => elem.match_id == data.match_id);
    if (found_match) {
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
    }
  }

  @SubscribeMessage('join-match-room')
  async joinMatchRoom(
    @MessageBody() data: { match_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.match_id);
  }

  @SubscribeMessage('leave-match-room')
  async leaveMatchRoom(
    @MessageBody() data: { match_id: string; user_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const found_match = matches.find((elem) => elem.match_id == data.match_id);
    if (found_match) {
      if (found_match.players.fromPlayer.player_id == data.user_id) {
        found_match.players.fromPlayer.in = false;
        found_match.stop_game = true;
      } else if (found_match.players.toPlayer.player_id == data.user_id) {
        found_match.players.toPlayer.in = false;
        found_match.stop_game = true;
      } else {
        found_match.viewers = this.pongService.arrayRemove(
          found_match.viewers,
          client.id,
        );
      }
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
      client.leave(data.match_id);
    }
  }

  @SubscribeMessage('update-fromPlayer-position')
  async streamingFromPlayerPosition(
    @MessageBody() data: { match_info: MatchInfo; fromPlayer: Player },
  ) {
    this.server
      .to(data.match_info.match_id)
      .emit('streaming-fromPlayer-position', data.fromPlayer);
  }

  @SubscribeMessage('update-toPlayer-position')
  async streamingToPlayerPosition(
    @MessageBody() data: { match_info: MatchInfo; toPlayer: Player },
  ) {
    this.server
      .to(data.match_info.match_id)
      .emit('streaming-toPlayer-position', data.toPlayer);
  }

  @SubscribeMessage('update-nbr-frames')
  async update_nbr_frames(
    @MessageBody() data: { match_id: string; nb_frames: number },
  ) {
    const found_match = matches.find(
      (element) => element.match_id === data.match_id,
    );
    if (found_match) {
      found_match.nb_frames = data.nb_frames;
      this.server
        .to(found_match.match_id)
        .emit('nbr-frames-updated', data.nb_frames);
    }
  }

  @SubscribeMessage('updatePauseGoal')
  async updatePauseGoal(
    @MessageBody() data: { match_id: string; pause_goal: boolean },
  ) {
    const found_match = matches.find(
      (element) => element.match_id === data.match_id,
    );
    if (found_match) {
      found_match.pause_goal = data.pause_goal;
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
    }
  }

  @SubscribeMessage('resetBlackhole')
  async reset_blackhole(@MessageBody('match_id') match_id: string) {
    const found_match = matches.find(
      (element) => element.match_id === match_id,
    );
    if (found_match) {
      found_match.blackhole_frame = Math.max(Math.random() * 300, 90);
      found_match.blackhole_length = Math.max(Math.random() * 900, 90);
      found_match.blackhole_coords = {
        x: Math.max(Math.random() * 500, 100),
        y: Math.max(Math.random() * 350, 50),
      };
      this.server.to(found_match.match_id).emit('reset-blackhole', {
        blackhole_frame: found_match.blackhole_frame,
        blackhole_length: found_match.blackhole_length,
        blackhole_coords: found_match.blackhole_coords,
      });
    }
  }

  @SubscribeMessage('update-match-ball')
  async streamingMatchBall(
    @MessageBody() data: { match_info: MatchInfo; ball: Ball },
  ) {
    const found_match = matches.find(
      (element) => element.match_id === data.match_info.match_id,
    );
    if (data.ball.x < 10 && found_match) {
      found_match.score.to_score += 1;
      found_match.blackhole_frame = Math.max(Math.random() * 300, 90);
      found_match.blackhole_length = Math.max(Math.random() * 900, 90);
      found_match.blackhole_coords = {
        x: Math.max(Math.random() * 450, 150),
        y: Math.max(Math.random() * 250, 0),
      };
      found_match.pause_goal = true;
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
      this.server.to(data.match_info.match_id).emit('reset-ball', 'serve');
    }
    if (data.ball.x > 590 && found_match) {
      found_match.score.from_score += 1;
      found_match.blackhole_frame = Math.max(Math.random() * 300, 90);
      found_match.blackhole_length = Math.max(Math.random() * 900, 90);
      found_match.blackhole_coords = {
        x: Math.max(Math.random() * 450, 150),
        y: Math.max(Math.random() * 250, 0),
      };
      found_match.pause_goal = true;
      this.server
        .to(found_match.match_id)
        .emit('download-updated-match-info', found_match);
      this.server.to(data.match_info.match_id).emit('reset-ball', 'serve');
    }
    if (found_match) {
      this.server
        .to(data.match_info.match_id)
        .emit('streaming-match-ball', data.ball, {
          from_score: found_match.score.from_score,
          to_score: found_match.score.to_score,
        });
      // GAME OVER
      if (
        found_match.score.from_score > SCORE ||
        found_match.score.to_score > SCORE
      ) {
        if (found_match.score.from_score > SCORE + 1) {
          found_match.score.from_score = SCORE + 1;
        }
        if (found_match.score.to_score > SCORE + 1) {
          found_match.score.to_score = SCORE + 1;
        }
        found_match.game_over = true;
        found_match.end_date = new Date();
        let winner_id = '';
        let points = 100;
        // set winner id, and the scone to assign
        if (found_match.score.from_score > found_match.score.to_score) {
          winner_id = found_match.players.fromPlayer.player_id;
          points = Math.round(
            points *
              (found_match.score.from_score / (found_match.score.to_score + 1)),
          );
        } else {
          winner_id = found_match.players.toPlayer.player_id;
          points = Math.round(
            points *
              (found_match.score.to_score / (found_match.score.from_score + 1)),
          );
        }
        // update match in database
        this.pongService.update_match_data(
          found_match.match_id,
          found_match.score.from_score,
          found_match.score.to_score,
          points,
          winner_id,
          found_match.start_date,
          found_match.end_date,
          true,
        );
        this.server
          .to(data.match_info.match_id)
          .emit('game-over', found_match.game_over);
      }
    }
  }

  @SubscribeMessage('deleteMatchFromArray')
  async deleteMatchFromArray(@MessageBody('match_id') match_id: string) {
    this.pongService.matchArrayRemove(matches, match_id);
  }

  @SubscribeMessage('update-bgColor')
  async streamingBgColor(
    @MessageBody() data: { match_info: MatchInfo; bgColor: string },
  ) {
    const found_match = matches.find(
      (element) => element.match_id === data.match_info.match_id,
    );
    if (found_match) {
      found_match.bgColor = data.bgColor;
    }
    this.server
      .to(data.match_info.match_id)
      .emit('streaming-bgColor', data.bgColor);
  }
}
