import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import { PongService } from '../pong/pong.service';
import { MatchInfo } from '../pong/types/pong.type';
import { FriendshipService } from '../friendship/friendship.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  users = 0;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly pongService: PongService,
    private readonly friendshipService: FriendshipService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.users++;
    this.server.emit('update-users', 'server');
    await this.messagesService.registerClientSocket(null, client.id);
    const sids = this.server.of('/').adapter.sids;
    const allDBSockets = await this.messagesService.getAllDBSockets();
    for (let i = 0; i < allDBSockets.length; i++) {
      if (sids.get(allDBSockets[i].socket_id) === undefined) {
        await this.messagesService.deleteSocket(allDBSockets[i].socket_id);
      }
    }
    this.server.emit('authenticate');
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.users--;
    this.server.emit('update-users', 'server');

    const found_match: MatchInfo =
      await this.pongService.leaveMatchDisconnected(client.id);
    if (found_match) {
      // Inform players
      this.server
        .to(found_match.players.fromPlayer.socket_id)
        .emit('download-updated-match-info', found_match);
      this.server
        .to(found_match.players.toPlayer.socket_id)
        .emit('download-updated-match-info', found_match);
      // Inform viewers
      for (let i = 0; i < found_match.viewers.length; i++) {
        this.server
          .to(found_match.viewers[i].socket_id)
          .emit('download-updated-match-info', found_match);
      }
    }
    await this.messagesService.removeSocket(client.id);
    this.server.of('/').adapter.rooms;
  }

  async updateFriendsUsers() {
    this.server.emit('update-users', 'server');
    this.server.emit('update-friends', 'server');
  }

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    let message: Partial<CreateMessageDto>;
    const cur_user_id = await this.messagesService.getClientUserId(client.id);
    // Check if guest_id is an active Friend and if not blocked
    const cur_friendship_id: string =
      this.friendshipService.define_friendship_id(
        cur_user_id,
        createMessageDto.guest_id,
      );
    const friendship = await this.friendshipService.get_friendship_status(
      cur_user_id,
      cur_friendship_id,
    );

    if (
      createMessageDto.chan_name != 'private' &&
      (await this.messagesService.getChanMemberStatus(
        createMessageDto.chan_name,
        cur_user_id,
      )) == 1
    ) {
      message = await this.messagesService.create(createMessageDto);
      this.server.to(createMessageDto.chan_name).emit('message', message);
    } else if (
      createMessageDto.chan_name == 'private' &&
      createMessageDto.guest_id != '' &&
      friendship[0] &&
      friendship[0].invitation_status_id == 2
    ) {
      message = await this.messagesService.create(createMessageDto);
      const virtual_room_name = this.messagesService.generateVirtualRoomName(
        createMessageDto.user_id,
        createMessageDto.guest_id,
      );
      this.server.to(virtual_room_name).emit('message', message);
    }
    return message;
  }

  @SubscribeMessage('findAllMessages')
  async findAll() {
    return await this.messagesService.findAll();
  }

  @SubscribeMessage('findAllMessagesPrivateChat')
  async findAllMessagesPrivateChat(
    @MessageBody() d: { main_user_id: string; guest_id: string },
  ) {
    return await this.messagesService.findAllChannelMessagesPrivateChat(
      d.main_user_id,
      d.guest_id,
    );
  }

  @SubscribeMessage('update-chan-topic')
  updateChanTopic(@MessageBody() d: { chan_name: string; chan_topic: string }) {
    this.server.to(d.chan_name).emit('update-chan-topic', {
      chan_name: d.chan_name,
      chan_topic: d.chan_topic,
    });
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(
    @MessageBody()
    d: {
      chan_id: string;
      chan_name: string;
      cur_user_id: string;
      cur_user_nickname: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(d.chan_name);
    const message: Partial<CreateMessageDto> = {
      user_id: d.cur_user_id,
      nickname: 'Chief',
      content:
        d.cur_user_nickname + ' just left the channel ' + d.chan_name + '.',
      side: '',
      chan_id: d.chan_id,
      chan_name: d.chan_name,
      guest_id: d.cur_user_id,
    };
    await this.messagesService.create(message);
    this.server.to(d.chan_name).emit('message', message);
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('temp-modify-user-mode-infos')
  async tempChangeUserModeInfos(
    @MessageBody()
    d: {
      from_id: string;
      user_id: string;
      chan_id: string;
      user_mode_id: number;
      user_mode_time: number;
    },
  ) {
    await this.messagesService.updateUserMode(
      d.from_id,
      d.user_id,
      d.chan_id,
      d.user_mode_id,
    );
    this.server.emit('update-users', 'server');
    if (d.user_mode_time == 2) this.server.emit('update-channels', 'server');
    setTimeout(async () => {
      await this.messagesService.updateUserMode(
        d.from_id,
        d.user_id,
        d.chan_id,
        1,
      );
      this.server.emit('update-users', 'server');
      this.server.emit('update-channels', 'server');
    }, d.user_mode_time * 1000);
  }

  @SubscribeMessage('wasMuted')
  async wasMutedFromChannel(
    @MessageBody()
    d: {
      chan_id: string;
      chan_name: string;
      muted_user_id: string;
      muted_user_nickname: string;
      muter_user_nickname: string;
      muted_user_mode_time: number;
    },
  ) {
    const message: Partial<CreateMessageDto> = {
      user_id: d.muted_user_id,
      nickname: 'Chief',
      content:
        d.muted_user_nickname +
        ' was muted for ' +
        d.muted_user_mode_time +
        ' seconds by ' +
        d.muter_user_nickname +
        ' from the channel ' +
        d.chan_name +
        '.',
      side: '',
      chan_id: d.chan_id,
      chan_name: d.chan_name,
      guest_id: d.muted_user_id,
    };
    await this.messagesService.create(message);
    this.server.to(d.chan_name).emit('message', message);
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('wasKickedFromChannel')
  async wasKickedFromChannel(
    @MessageBody()
    d: {
      chan_id: string;
      chan_name: string;
      cur_user_id: string;
      cur_user_nickname: string;
      kicker_nickname: string;
    },
  ) {
    const message: Partial<CreateMessageDto> = {
      user_id: d.cur_user_id,
      nickname: 'Chief',
      content:
        d.cur_user_nickname +
        ' was kicked from the channel ' +
        d.chan_name +
        ' by ' +
        d.kicker_nickname +
        '.',
      side: '',
      chan_id: d.chan_id,
      chan_name: d.chan_name,
      guest_id: d.cur_user_id,
    };
    await this.messagesService.create(message);
    this.server.to(d.chan_name).emit('message', message);
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('wasBanned')
  async wasBannedFromChannel(
    @MessageBody()
    d: {
      chan_id: string;
      chan_name: string;
      banned_user_id: string;
      banned_user_nickname: string;
      banner_user_nickname: string;
      banned_user_mode_time: number;
    },
  ) {
    const message: Partial<CreateMessageDto> = {
      user_id: d.banned_user_id,
      nickname: 'Chief',
      content:
        d.banned_user_nickname +
        ' was banned for ' +
        d.banned_user_mode_time +
        ' seconds by ' +
        d.banner_user_nickname +
        ' from the channel ' +
        d.chan_name +
        '.',
      side: '',
      chan_id: d.chan_id,
      chan_name: d.chan_name,
      guest_id: d.banned_user_id,
    };
    await this.messagesService.create(message);
    this.server.to(d.chan_name).emit('message', message);
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('YouAreMuted')
  async YouAreMuted(
    @MessageBody()
    d: {
      chan_name: string;
      chan_id: string;
      muted_user_id: string;
      muted_user_mode_time: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message: Partial<CreateMessageDto> = {
      user_id: d.muted_user_id,
      nickname: 'Chief',
      content:
        "You've been muted for " +
        d.muted_user_mode_time +
        ' seconds on this channel. You cannot send any message at the moment. Please try again later.',
      side: '',
      chan_id: d.chan_id,
      chan_name: d.chan_name,
      guest_id: d.muted_user_id,
    };
    this.server.to(client.id).emit('message', message);
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('out-of-channel')
  async outOfChannel(@MessageBody() d: { user_id: string; chan_name: string }) {
    this.server.emit('out-of-channel', {
      user_id: d.user_id,
      chan_name: d.chan_name,
    });
  }

  @SubscribeMessage('out-of-private-chat')
  async outOfPrivateChat(
    @MessageBody() d: { user_id: string; guest_id: string },
  ) {
    const virtual_room_name = this.messagesService.generateVirtualRoomName(
      d.user_id,
      d.guest_id,
    );
    this.server.to(virtual_room_name).emit('out-of-private-chat', {
      user_id: d.user_id,
      guest_id: d.guest_id,
    });
  }

  @SubscribeMessage('findAllChannelMessages')
  findAllChannelMessages(
    @MessageBody() d: { chan_name: string; user_id: string },
  ) {
    return this.messagesService.findAllChannelMessages(d.chan_name, d.user_id);
  }

  @SubscribeMessage('updateChanUsersList')
  async updateChanUsersList() {
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('updateMessages')
  async updateMessages() {
    this.server.emit('update-messages');
  }

  @SubscribeMessage('updateChannels')
  async updateChannels() {
    this.server.emit('update-channels', 'server');
  }

  @SubscribeMessage('join-channel')
  async joinChannel(
    @MessageBody() data: { nickname: string; chan_name: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (this.messagesService.checkIfSocketIsRegistered(client.id)) {
      client.join(data.chan_name);
      const existing_user_in_channel =
        await this.messagesService.CheckIfUserAlreadyInChannel(
          client.id,
          data.chan_name,
        );
      if (!existing_user_in_channel) {
        const new_user_on_channel =
          await this.messagesService.addUserToUsersOnChannel(
            client.id,
            data.chan_name,
            1,
            1,
            0,
          );
        if (new_user_on_channel) {
          this.server.emit('update-channels', 'server');
          this.server.emit('update-users', 'server');
        }
        const cur_user_id = await this.messagesService.getClientUserId(
          client.id,
        );
        const chan_id = await this.messagesService.getChanId(data.chan_name);
        const message: Partial<CreateMessageDto> = {
          user_id: cur_user_id,
          nickname: 'Chief',
          content:
            data.nickname + ' just joined the channel ' + data.chan_name + '.',
          side: '',
          chan_id: chan_id,
          chan_name: data.chan_name,
          guest_id: cur_user_id,
        };
        await this.messagesService.create(message);
        this.server.to(data.chan_name).emit('message', message);
        this.server
          .to(data.chan_name)
          .emit(
            'User ' +
              data.nickname +
              ' just joined the channel ' +
              data.chan_name,
          );
      }
    }
  }

  @SubscribeMessage('join-private-chat')
  async joinPrivateChat(
    @MessageBody() d: { main_user_id: string; guest_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(
      this.messagesService.generateVirtualRoomName(d.main_user_id, d.guest_id),
    );
    this.server.of('/').adapter.rooms;
  }

  @SubscribeMessage('remove-socket')
  async removeSocket(@ConnectedSocket() client: Socket) {
    return this.messagesService.removeSocket(client.id);
  }

  @SubscribeMessage('join-server')
  joinServer(
    @MessageBody() data: { user_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.messagesService.registerClientSocket(data.user_id, client.id);
  }

  @SubscribeMessage('leave-server')
  async leaveServer(
    @MessageBody() data: { user_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.messagesService.registerClientSocket(data.user_id, client.id);
  }

  @SubscribeMessage('close')
  DisplayCloseSockets() {
    console.log('disconnected socket: ');
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody() data: { chan_name: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const nickname = await this.messagesService.getClientName(client.id);
    const cur_user_id = await this.messagesService.getClientUserId(client.id);
    if (
      (await this.messagesService.getChanMemberStatus(
        data.chan_name,
        cur_user_id,
      )) == 1
    ) {
      client.broadcast.to(data.chan_name).emit('typing', {
        chan_name: data.chan_name,
        nickname: nickname,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('private-chat-typing')
  async privateChatTyping(
    @MessageBody()
    d: {
      typing_user_id: string;
      typing_user_nickname: string;
      recipient_id: string;
      isTyping: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast
      .to(
        this.messagesService.generateVirtualRoomName(
          d.typing_user_id,
          d.recipient_id,
        ),
      )
      .emit('private-chat-typing', {
        typing_user_id: d.typing_user_id,
        typing_user_nickname: d.typing_user_nickname,
        recipient_id: d.recipient_id,
        isTyping: d.isTyping,
      });
  }
}
