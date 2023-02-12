import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import * as argon2 from 'argon2';
import { v4 } from 'uuid';
import { UserService } from '../user/user.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChanUserListDto } from './dto/chan-users-list.dto';
import { ChanUserInfosDto } from './dto/chan-user-infos.dto';
import { UserInChannelDto } from './dto/user-in-channel.dto';
import { MemberNonMemberChannelsDto } from './dto/member-non-member-channels.dto';
import { User } from '../auth/types';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  async registerClientSocket(user_id: string, socket_id: string) {
    if (user_id === null) user_id = undefined;
    let existing_user_id: User;
    if (user_id) existing_user_id = await this.userService.findFirst(user_id);
    if (existing_user_id) {
      await this.prisma.sockets.upsert({
        where: {
          socket_id: socket_id,
        },
        update: {
          socket_id: socket_id,
          user_id: user_id,
        },
        create: {
          socket_id: socket_id,
          user_id: user_id,
        },
      });
    }
  }

  async updateUserToChanAdmin(
    from_id: string,
    user_id: string,
    chan_id: string,
  ) {
    if (this.IsUserAdmin_byChanId(from_id, chan_id)) {
      const res = await this.prisma.usersOnChannel.updateMany({
        where: {
          user_id: user_id,
          channel_id: chan_id,
        },
        data: {
          user_role_id: 2,
        },
      });
      return res.count;
    }
    return;
  }

  async updateUserToChanBasicUser(
    from_id: string,
    user_id: string,
    chan_id: string,
  ) {
    const current_chan_owner = await this.prisma.channels.findFirst({
      where: {
        id: chan_id,
      },
    });
    if (current_chan_owner.user_owner_id === from_id) {
      const res = await this.prisma.usersOnChannel.updateMany({
        where: {
          user_id: user_id,
          channel_id: chan_id,
        },
        data: {
          user_role_id: 1,
        },
      });
      return res.count;
    }
    return;
  }

  async updateUserMode(
    from_id: string,
    user_id: string,
    chan_id: string,
    user_mode_id: number,
  ) {
    const find_admin = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: from_id,
        user_role_id: 2,
        channel_id: chan_id,
      },
    });
    if (find_admin) {
      const res = await this.prisma.usersOnChannel.updateMany({
        where: {
          user_id: user_id,
          channel_id: chan_id,
        },
        data: {
          user_mode_id: user_mode_id,
          mode_date_hour: new Date(),
          mode_time: 60,
        },
      });
      return res.count;
    }
    return;
  }

  async IsUserAdmin(user_id: string, chan_name: string) {
    const chan_id = await this.getChanId(chan_name);
    const find_admin = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: user_id,
        user_role_id: 2,
        channel_id: chan_id,
      },
    });
    if (find_admin) return true;
    return false;
  }

  async IsUserAdmin_byChanId(user_id: string, chan_id: string) {
    const find_admin = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: user_id,
        user_role_id: 2,
        channel_id: chan_id,
      },
    });
    if (find_admin) return true;
    return false;
  }

  async kickUserFromChan(from_id: string, user_id: string, chan_id: string) {
    const find_admin = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: from_id,
        user_role_id: 2,
        channel_id: chan_id,
      },
    });
    if (find_admin) {
      const res = await this.prisma.usersOnChannel.deleteMany({
        where: {
          user_id: user_id,
          channel_id: chan_id,
        },
      });
      return res.count;
    }
    return;
  }

  async deleteSocket(socket_id: string) {
    await this.prisma.sockets.deleteMany({
      where: {
        socket_id: socket_id,
      },
    });
  }

  generateVirtualRoomName(user1_id: string, user2_id: string) {
    if (user1_id < user2_id) return user1_id + '-' + user2_id;
    else return user2_id + '-' + user1_id;
  }

  async checkIfSocketIsRegistered(client_id: string) {
    const user_id = await this.getClientUserId(client_id);
    if (user_id != '') return true;
    return false;
  }

  async CheckIfUserAlreadyInChannel(client_id: string, chan_name: string) {
    const user_id = await this.getClientUserId(client_id);
    const channel_id = await this.getChanId(chan_name);
    const existing_user = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: user_id,
        channel_id: channel_id,
      },
    });
    if (existing_user) {
      return true;
    }
    return false;
  }

  async addUserToUsersOnChannel(
    client_id: string,
    chan_name: string,
    user_mode_id: number,
    user_role_id: number,
    mode_time: number,
  ) {
    const user_id = await this.getClientUserId(client_id);
    const channel_id = await this.getChanId(chan_name);
    if (user_id && channel_id) {
      return await this.prisma.usersOnChannel.create({
        data: {
          user_id: user_id,
          channel_id: channel_id,
          user_mode_id: user_mode_id,
          user_role_id: user_role_id,
          mode_time: mode_time,
        },
      });
    }
  }

  async getClientName(socket_id: string) {
    const response = await this.prisma.sockets.findFirst({
      where: {
        socket_id: socket_id,
      },
      select: {
        user: {
          select: {
            nickname: true,
          },
        },
      },
    });
    return response.user.nickname;
  }

  async getChanTopic(chan_name: string): Promise<string> {
    const response = await this.prisma.channels.findFirst({
      where: {
        title: chan_name,
      },
      select: {
        topic: true,
      },
    });
    return response.topic;
  }

  async getChanType(chan_name: string): Promise<number> {
    const response = await this.prisma.channels.findFirst({
      where: {
        title: chan_name,
      },
      select: {
        type_id: true,
      },
    });
    if (response) {
      return response.type_id;
    }
    return 0;
  }

  async getChanUsersList(chan_id: string): Promise<ChanUserListDto> {
    try {
      const chanUsersList: ChanUserListDto = await this.prisma.$queryRaw`
      SELECT c.nickname,
          c.status_id,
          uoc.channel_id, 
          uoc.user_id,
          uoc.user_mode_id,
          uoc.user_role_id,
          uoc.mode_time,
          uoc.mode_date_hour,
          ch.user_owner_id,				
          (CASE
            WHEN ch.user_owner_id = c.id THEN 'true'
          END) as is_owner
      FROM "UsersOnChannel" as uoc
      INNER JOIN "Users" as c ON c.id = uoc.user_id
      INNER JOIN "Channels" as ch ON ch.id = uoc.channel_id
      WHERE channel_id = ${chan_id} 
      ORDER BY is_owner ASC, uoc.user_role_id DESC, c.nickname ASC`;
      return chanUsersList;
    } catch (e) {
      console.log('chanUsersList');
    }
  }

  async getChanDetails(
    chan_id: string,
  ): Promise<{ topic: string; type_id: number }> {
    const response = await this.prisma.channels.findFirst({
      where: {
        id: chan_id,
      },
      select: {
        topic: true,
        type_id: true,
      },
    });
    return response;
  }

  async getChanOwnerUserId(chan_id: string): Promise<string> {
    const response = await this.prisma.channels.findFirst({
      where: {
        id: chan_id,
      },
      select: {
        user_owner_id: true,
      },
    });
    return response.user_owner_id;
  }

  async getClientUserId(socket_id: string) {
    const response = await this.prisma.sockets.findFirst({
      where: {
        socket_id: socket_id,
      },
      select: {
        user_id: true,
      },
    });
    if (response && response.user_id) {
      return response.user_id;
    }
    return '';
  }

  async getChanId(chan_name: string): Promise<string> {
    const response = await this.prisma.channels.findFirst({
      where: {
        title: chan_name,
      },
      select: {
        id: true,
      },
    });
    if (response) return response.id;
    else return '';
  }

  async getUserId(nickname: string): Promise<string> {
    const response = await this.prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
      select: {
        id: true,
      },
    });
    if (response) return response.id;
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async removeSocket(client_id: string) {
    await this.prisma.sockets.deleteMany({
      where: {
        socket_id: client_id,
      },
    });
  }

  async getChief(): Promise<string> {
    return await this.getUserId('Chief');
  }

  async leaveChannel(
    user_id: string,
    channel_id: string,
  ): Promise<{ count: number }> {
    try {
      const response = await this.prisma.usersOnChannel.deleteMany({
        where: {
          user_id: user_id,
          channel_id: channel_id,
        },
      });
      const chief_id = await this.getUserId('Chief');
      await this.prisma.channels.updateMany({
        where: {
          user_owner_id: user_id,
          id: channel_id,
        },
        data: {
          user_owner_id: chief_id,
        },
      });
      return response;
    } catch (e) {
      console.log('leaveChannel');
    }
  }

  async create(
    createMessageDto: Partial<CreateMessageDto>,
  ): Promise<Partial<CreateMessageDto>> {
    const message = {
      user_id: createMessageDto.user_id,
      nickname: createMessageDto.nickname,
      content: createMessageDto.content,
      side: createMessageDto.side,
      chan_id: createMessageDto.chan_id,
      chan_name: createMessageDto.chan_name,
      guest_id: createMessageDto.guest_id,
    };
    if (
      createMessageDto.user_id == '' &&
      createMessageDto.nickname == 'Chief'
    ) {
      createMessageDto.user_id = await this.getUserId('Chief');
    }
    if (
      createMessageDto.guest_id == '' &&
      createMessageDto.nickname == 'Chief'
    ) {
      createMessageDto.guest_id = await this.getUserId('Chief');
    }

    await this.prisma.messages.create({
      data: {
        user_id: createMessageDto.user_id,
        nickname: createMessageDto.nickname,
        content: createMessageDto.content,
        side: createMessageDto.side,
        chan_id: createMessageDto.chan_id,
        guest_id: createMessageDto.guest_id,
      },
    });
    return message; // 'This action adds a new message';
  }

  async getChanMemberStatus(chan_name: string, cur_user_id: string) {
    const chan_id = await this.getChanId(chan_name);
    const response = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: cur_user_id,
        channel_id: chan_id,
      },
      select: {
        user_mode_id: true,
        mode_time: true,
        mode_date_hour: true,
      },
    });
    if (response) {
      const time_now = new Date();
      const timestamp = new Date(response.mode_date_hour);
      const updated_timestamp = new Date(
        timestamp.getTime() + response.mode_time * 1000,
      );
      if (response.user_mode_id == 1) return 1;
      else if (response.user_mode_id > 1 && updated_timestamp < time_now)
        return 1;
      else if (response.user_mode_id == 2 && updated_timestamp >= time_now)
        return 2;
      else if (response.user_mode_id == 3 && updated_timestamp >= time_now)
        return 3;
    } else return 0;
  }

  async findAll() {
    return await this.prisma.messages.findMany();
  }
  async findAllChannelMessages(chan_name: string, user_id: string) {
    const all_messages_of_channel = await this.prisma.$queryRaw`
		SELECT * FROM "Messages" as messages 
		INNER JOIN "Channels" as c ON c.id = messages.chan_id 
		WHERE c.title = ${chan_name} AND messages.id NOT IN 
		(SELECT id FROM ( SELECT msg.id, msg.content, msg.created_at, msg.nickname, msg.user_id, msg.side, msg.chan_id, msg.guest_id, f.from_user_id, f.to_user_id, f.invitation_status_id 
		FROM "Messages" as msg 
		INNER JOIN "Channels" as c ON c.id = msg.chan_id 
		INNER JOIN "Friendships" as f ON f.to_user_id = msg.user_id 
		WHERE c.title = ${chan_name} 
		AND f.from_user_id = ${user_id} 
		AND f.invitation_status_id = 4 
		AND msg.nickname != 'Chief'
		ORDER BY msg.created_at ASC) as second)`;
    return all_messages_of_channel;
  }

  async findAllChannelMessagesPrivateChat(
    main_user_id: string,
    guest_id: string,
  ) {
    const all_messages_of_private_chat = await this.prisma
      .$queryRaw`SELECT msg.id, msg.content, msg.created_at, msg.nickname, msg.user_id, msg.side, msg.chan_id, msg.guest_id
		FROM "Messages" as msg
		WHERE (msg.user_id = ${main_user_id} AND msg.guest_id = ${guest_id}) OR (msg.user_id = ${guest_id} AND msg.guest_id = ${main_user_id}) ORDER BY msg.created_at ASC`;
    return all_messages_of_private_chat;
  }

  async checkChanName(chan_name: string) {
    if (chan_name.length && chan_name.length < 13) {
      const existing_chan = await this.prisma.channels.findFirst({
        where: {
          title: chan_name,
        },
      });
      if (!existing_chan) return true;
      else return false;
    }
    return true;
  }

  async checkChanPwd(chan_name: string, chan_pwd: string) {
    const existing_chan = await this.prisma.channels.findFirst({
      where: {
        title: chan_name,
      },
    });
    const passwordMatches = await argon2.verify(
      existing_chan.password,
      chan_pwd,
    );
    if (!passwordMatches) return false;
    return true;
  }

  async checkCurrentChanOwner(chan_id: string) {
    const current_chan_owner = await this.prisma.channels.findFirst({
      where: {
        id: chan_id,
      },
    });
    return current_chan_owner;
  }

  async channelsUser(user_id: string) {
    return await this.prisma.users.findMany({
      where: {
        id: user_id,
      },
      select: {
        channels: {
          select: {
            channel: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });
  }

  async getMemberNonMemberChannelsUser(
    user_id: string,
  ): Promise<MemberNonMemberChannelsDto> {
    const member_non_member_channels: MemberNonMemberChannelsDto = await this
      .prisma.$queryRaw`
    SELECT *
    FROM (SELECT
                c.title,
                c.type_id,
                c.user_owner_id,
                uoc.channel_id,
                uoc.user_mode_id,
                (CASE
                  WHEN true THEN 'true'
                END) as is_in
          FROM "UsersOnChannel" as uoc
          INNER JOIN "Channels" as c ON c.id = uoc.channel_id
          WHERE user_id = ${user_id} AND c.title != 'private' ORDER BY title ASC) as second
    UNION ALL
    SELECT 
          ch.title,
          ch.type_id,
          ch.user_owner_id,
          ch.id,
          (CASE
            WHEN true THEN 0
          END) as user_mode_id,
          (CASE
            WHEN true THEN 'false'
          END) as is_in
        FROM "Channels" as ch
        WHERE ch.title NOT IN 
                            (SELECT * 
                              FROM (SELECT c.title
                              FROM "UsersOnChannel" as uoc
                              INNER JOIN "Channels" as c ON c.id = uoc.channel_id
                              WHERE user_id = ${user_id}
                              ORDER BY title ASC) as first) AND ch.title != 'private' ORDER BY is_in DESC, title`;
    return member_non_member_channels;
  }

  async getAvatarByNickname(nickname: string) {
    const response = await this.prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
      select: {
        avatar: true,
      },
    });
    return response.avatar;
  }

  async getAllChannels() {
    return this.prisma.channels.findMany({
      orderBy: [{ title: 'asc' }],
      select: {
        title: true,
      },
    });
  }

  async getAllDBSockets() {
    return this.prisma.sockets.findMany({});
  }

  async createChannel(body: CreateChannelDto) {
    let hash = '';
    if (body.formData.chan_pwd)
      hash = await this.hashData(body.formData.chan_pwd);
    const tmp = await this.getChanId(body.formData.chan_name);
    const new_chan_id = await this.create_detailed_channel(
      body.userid,
      body.formData.chan_name,
      hash,
      body.formData.chan_topic,
      body.formData.chan_type,
    );
    if (!tmp)
      await this.create_user_on_channel(body.userid, new_chan_id, 1, 2, 0);
  }

  async create_detailed_channel(
    user_owner_id: string,
    title: string,
    password: string,
    topic: string,
    type: number,
  ) {
    try {
      const tmp = await this.getChanId(title);
      const chan_id = tmp != '' ? tmp : v4();
      await this.prisma.users.update({
        where: {
          id: user_owner_id,
        },
        data: {
          channels_owner: {
            upsert: {
              where: {
                id: chan_id,
              },
              update: {
                password: password,
                topic: topic,
                type: {
                  connect: {
                    id: type,
                  },
                },
              },
              create: {
                id: chan_id,
                title: title,
                password: password,
                topic: topic,
                type: {
                  connect: {
                    id: type,
                  },
                },
              },
            },
          },
        },
        include: {
          channels_owner: {
            orderBy: {
              id: 'desc',
            },
            select: {
              id: true,
            },
          },
        },
      });
      return chan_id;
    } catch (e) {
      console.log('chan_id');
    }
  }

  async create_channel(user_owner_id: string, title: string) {
    try {
      await this.prisma.users.update({
        where: {
          id: user_owner_id,
        },
        data: {
          channels_owner: {
            create: [
              {
                title: title,
                password: '',
                topic: '',
                type: {
                  connect: {
                    id: 1,
                  },
                },
              },
            ],
          },
        },
      });
    } catch (e) {}
  }

  async create_user_on_channel(
    user_id: string,
    channel_id: string,
    mode: number,
    role: number,
    mode_time: number,
  ) {
    try {
      await this.prisma.users.update({
        where: {
          id: user_id,
        },
        data: {
          channels: {
            create: [
              {
                mode_time: mode_time,
                channel: {
                  connect: {
                    id: channel_id,
                  },
                },
                user_mode: {
                  connect: {
                    id: mode,
                  },
                },
                user_role: {
                  connect: {
                    id: role,
                  },
                },
              },
            ],
          },
        },
      });
    } catch (e) {}
  }

  async get_owner_channels(user_owner_id: string) {
    const channels = await this.prisma.channels.findMany({
      where: {
        user_owner_id: user_owner_id,
      },
      select: {
        id: true,
      },
    });
    return channels;
  }

  async getChanUserInfos(
    user_id: string,
    chan_id: string,
  ): Promise<ChanUserInfosDto> {
    const ChanUserInfos = await this.prisma.usersOnChannel.findFirst({
      where: {
        user_id: user_id,
        channel_id: chan_id,
      },
      select: {
        user_role_id: true,
        user_mode_id: true,
        mode_time: true,
        mode_date_hour: true,
      },
    });
    return ChanUserInfos;
  }

  async get_user_in_channel(
    userId: string,
    channel_name: string,
  ): Promise<UserInChannelDto> {
    const user: UserInChannelDto = await this.prisma.$queryRaw`
	SELECT u.user_id,
			u.channel_id,
			u.user_mode_id,
			u.user_role_id,
			n.type_id,
			n.title,
			n.topic
	FROM "UsersOnChannel" as u
	INNER JOIN "Channels" as n ON u.channel_id = n.id
	WHERE user_id = ${userId} AND
			title = ${channel_name}`;
    return user;
  }
}
