import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { FriendshipService } from './friendship.service';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class FriendshipGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly friendshipService: FriendshipService) {}

  @SubscribeMessage('updateUsers')
  async updateUsers() {
    this.server.emit('update-users', 'server');
  }

  @SubscribeMessage('updateFriends')
  async updateFriends() {
    this.server.emit('update-friends', 'server');
  }

  @SubscribeMessage('updateInvitationList')
  async updateInvitationList() {
    this.server.emit('update-invitation-list', 'server');
  }
}
