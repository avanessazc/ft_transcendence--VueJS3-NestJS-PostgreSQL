import {
  SubscribeMessage,
  MessageBody,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrivateChanInvitationService } from './privateChanInvitation.service';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class PrivateChanInvitationGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly privateChanInvitationService: PrivateChanInvitationService,
  ) {}

  @SubscribeMessage('updatePrivateChannelInvitationList')
  async updatePrivateChannelInvitationList() {
    this.server.emit('update-private-channel-invitation-list', 'server');
  }

  @SubscribeMessage('updateUsersToInviteToPC')
  async updateUsersToInviteToPC() {
    this.server.emit('update-users-to-invite-to-private-channel', 'server');
  }

  @SubscribeMessage('updateAdminInChannel')
  async updateAdminInChannel(@MessageBody() data: { channel: string }) {
    this.server.emit('update-admin-in-channel', data.channel);
  }

  @SubscribeMessage('updateTypeChannel')
  async updateTypeChannel() {
    this.server.emit('update-type-channel', 'server');
  }
}
