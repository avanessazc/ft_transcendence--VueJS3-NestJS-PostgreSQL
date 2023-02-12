import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AchievementsService } from './achievements.service';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AchievementsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly achievementsService: AchievementsService) {}

  @SubscribeMessage('updateAchievements')
  async updateUsers() {
    this.server.emit('update-achievements', 'server');
  }
}
