import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { PrivateChanInvitationDto } from './dtos';
import { PCUsers } from './types/pc-users';
import { PCInvitations } from './types/pc-invitations';

@Injectable()
export class PrivateChanInvitationService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create_private_invitation(
    dto: PrivateChanInvitationDto,
  ): Promise<PCInvitations> {
    const invitation = await this.prisma.privateChannelInvitation.create({
      data: {
        from_user_id: dto.from_id,
        to_user_id: dto.to_id,
        invitation_status_id: dto.status,
        channel_id: dto.channel_id,
      },
    });
    return invitation;
  }

  async update_private_invitation(
    dto: PrivateChanInvitationDto,
  ): Promise<PCInvitations> {
    const invitation = await this.prisma.privateChannelInvitation.update({
      where: {
        id: dto.channel_id,
      },
      data: {
        invitation_status_id: dto.status,
      },
    });
    return invitation;
  }

  async delete_invitation(id: string) {
    await this.prisma.privateChannelInvitation.delete({
      where: {
        id: id,
      },
    });
  }

  // who_blocks => i_block = 1
  // 				 i_am_blocked = 2
  // who_invites => i_invite = 1
  // 				  i_am_invited = 2
  async get_users(userId: string, channelId: string): Promise<PCUsers> {
    const users = await this.prisma.$queryRaw`
		SELECT *
		FROM (SELECT id, nickname, avatar
		FROM "Users" as u
		WHERE nickname != 'Chief' AND u.id NOT IN (SELECT user_id
													FROM "UsersOnChannel"
													WHERE channel_id = ${channelId})) as first
		FULL JOIN (SELECT f.to_user_id as user,
				invitation_status_id as inv_status,
				(CASE 
					WHEN f.from_user_id = ${userId} AND f.invitation_status_id = 1 THEN 1
				END) as who_invites,
				f.channel_id
				FROM "PrivateChannelInvitation" as f
				WHERE f.from_user_id = ${userId} AND channel_id = ${channelId}
		UNION
		SELECT f.from_user_id as user,
				f.invitation_status_id as inv_status,
				(CASE 
					WHEN f.to_user_id = ${userId} AND f.invitation_status_id = 1 THEN 2
				END) as who_invites,
				f.channel_id
				FROM "PrivateChannelInvitation" as f
				WHERE f.to_user_id = ${userId} AND channel_id = ${channelId}) as second ON second.user = first.id`;
    return users;
  }

  async get_private_channel_invitations(
    user_id: string,
  ): Promise<PCInvitations> {
    const invitations = await this.prisma.$queryRaw`
		SELECT u.id,
				u.nickname,
				u.email,
				u.firstname,
				u.surname,
				u.avatar, 
				users.inv_status,
				users.channel_id,
				users.inv_id,
				c.title
		FROM (SELECT p.id as inv_id,
					p.from_user_id as inviting,
					p.to_user_id as invited,
					p.invitation_status_id as inv_status,
					p.channel_id
				FROM "PrivateChannelInvitation" as p
				WHERE p.to_user_id = ${user_id} AND p.invitation_status_id = 1) as users
		INNER JOIN "Users" as u ON users.inviting = u.id
		INNER JOIN "Channels" as c ON users.channel_id = c.id
		ORDER BY nickname ASC`;
    return invitations;
  }
}
