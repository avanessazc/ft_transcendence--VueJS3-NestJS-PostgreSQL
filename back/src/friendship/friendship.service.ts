import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { FriendshipInv, FriendshipUser } from './types/friendshipUsers';

@Injectable()
export class FriendshipService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  compare(str1: string, str2: string): boolean {
    if (str1 > str2) return true;
    return false;
  }

  define_friendship_id(user_id1: string, user_id2: string): string {
    let friendship_id;
    if (this.compare(user_id1, user_id2) == true) {
      friendship_id = user_id2 + user_id1;
    } else {
      friendship_id = user_id1 + user_id2;
    }
    return friendship_id;
  }

  async update_friendship(
    friendship_id: string,
    from_user_id: string,
    to_user_id: string,
    status: number,
  ): Promise<FriendshipInv> {
    const friendship = await this.prisma.friendships.upsert({
      where: {
        id: friendship_id,
      },
      update: {
        from_user_id: from_user_id,
        to_user_id: to_user_id,
        invitation_status_id: status,
      },
      create: {
        id: friendship_id,
        from_user_id: from_user_id,
        to_user_id: to_user_id,
        invitation_status_id: status,
      },
    });
    return friendship;
  }

  async delete_friendship(friendship_id: string) {
    await this.prisma.friendships.deleteMany({
      where: {
        id: friendship_id,
      },
    });
  }

  // who_blocks => i_block = 1
  // 				 i_am_blocked = 2
  // who_invites => i_invite = 1
  // 				  i_am_invited = 2
  async get_users(user_id: string): Promise<FriendshipUser> {
    const friends = await this.prisma.$queryRaw`
		SELECT u.id,
		u.nickname,
		u.email,
		u.firstname,
		u.surname,
		u.avatar,
		u.status_id,
		relation.inv_status,
		relation.who_blocks,
		relation.who_invites
		FROM "Users" as u
		LEFT OUTER JOIN (SELECT f.to_user_id as user,
								f.invitation_status_id as inv_status,
								(CASE 
									WHEN f.from_user_id = ${user_id} AND f.invitation_status_id = 4 THEN 1
								END) as who_blocks,
								(CASE 
									WHEN f.from_user_id = ${user_id} AND f.invitation_status_id = 1 THEN 1
								END) as who_invites
				FROM "Friendships" as f
				WHERE f.from_user_id = ${user_id}
				UNION
				SELECT f.from_user_id as user,
								f.invitation_status_id as inv_status,
								(CASE 
									WHEN f.to_user_id = ${user_id} AND f.invitation_status_id = 4 THEN 2
								END) as who_blocks,
								(CASE 
									WHEN f.to_user_id = ${user_id} AND f.invitation_status_id = 1 THEN 2
								END) as who_invites
				FROM "Friendships" as f
				WHERE f.to_user_id = ${user_id}) as relation ON relation.user = u.id
		WHERE relation.inv_status != 2 OR relation.inv_status IS NULL AND u.id != ${user_id}  AND u.nickname != 'Chief'
		ORDER BY nickname ASC`;
    return friends;
  }

  async get_friends(user_id: string): Promise<FriendshipUser> {
    const friends = await this.prisma.$queryRaw`
	  	SELECT u.id,
				u.nickname,
				u.email,
				u.firstname,
				u.surname,
				u.avatar,
				u.status_id,
				friends.inv_status
		FROM (SELECT f.from_user_id as inviting, f.to_user_id as invited, f.invitation_status_id as inv_status
				FROM "Friendships" as f
				WHERE f.from_user_id = ${user_id} AND f.invitation_status_id = 2) as friends
		INNER JOIN "Users" as u ON friends.invited = u.id
		UNION
		SELECT u.id,
				u.nickname,
				u.email,
				u.firstname,
				u.surname,
				u.avatar, 
				u.status_id,
				friends.inv_status
		FROM (SELECT f.from_user_id as inviting, f.to_user_id as invited, f.invitation_status_id as inv_status
				FROM "Friendships" as f
				WHERE f.to_user_id = ${user_id} AND f.invitation_status_id = 2) as friends
		INNER JOIN "Users" as u ON friends.inviting = u.id
		ORDER BY nickname ASC`;
    return friends;
  }

  async get_friendship_invitations(user_id: string): Promise<FriendshipUser> {
    const friends = await this.prisma.$queryRaw`
		SELECT u.id,
				u.nickname,
				u.email,
				u.firstname,
				u.surname,
				u.avatar, 
				friends.inv_status
		FROM (SELECT f.from_user_id as inviting,
					f.to_user_id as invited,
					f.invitation_status_id as inv_status
				FROM "Friendships" as f
				WHERE f.to_user_id = ${user_id} AND f.invitation_status_id = 1) as friends
		INNER JOIN "Users" as u ON friends.inviting = u.id
		ORDER BY nickname ASC`;
    return friends;
  }

  async get_friendship_status(
    user_id: string,
    friendship_id: string,
  ): Promise<FriendshipInv> {
    const friendship = await this.prisma.$queryRaw`
    SELECT id,
		from_user_id,
		to_user_id,
		invitation_status_id,
		(CASE 
		  WHEN from_user_id = ${user_id} AND invitation_status_id = 4 THEN 1
		 WHEN to_user_id = ${user_id} AND invitation_status_id = 4 THEN 2
		END) as who_blocks,
		(CASE 
		  WHEN from_user_id =${user_id} AND invitation_status_id = 1 THEN 1
		 WHEN to_user_id =${user_id} AND invitation_status_id = 1 THEN 2
		END) as who_invites
        FROM "Friendships"
		WHERE id = ${friendship_id}`;
    return friendship;
  }

  async check_if_friends(
    first_user_id: string,
    second_user_id: string,
  ): Promise<boolean> {
    const cur_friendship_id: string = this.define_friendship_id(
      first_user_id,
      second_user_id,
    );
    const friendship = await this.get_friendship_status(
      first_user_id,
      cur_friendship_id,
    );
    if (friendship && friendship[0] && friendship[0].invitation_status_id == 2)
      return true;
    return false;
  }
}
