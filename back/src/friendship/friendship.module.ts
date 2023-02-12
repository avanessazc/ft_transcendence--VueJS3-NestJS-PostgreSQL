import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipGateway } from './friendship.gateway';
import { HttpModule } from '@nestjs/axios';
import { FriendshipController } from './friendship.controller';

@Module({
  imports: [HttpModule],
  controllers: [FriendshipController],
  providers: [FriendshipGateway, FriendshipService],
  exports: [HttpModule],
})
export class FriendshipModule {}
