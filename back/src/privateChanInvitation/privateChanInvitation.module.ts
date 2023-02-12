import { Module } from '@nestjs/common';
import { PrivateChanInvitationService } from './privateChanInvitation.service';
import { PrivateChanInvitationGateway } from './privateChanInvitation.gateway';
import { HttpModule } from '@nestjs/axios';
import { PrivateChanInvitationController } from './privateChanInvitation.controller';

@Module({
  imports: [HttpModule],
  controllers: [PrivateChanInvitationController],
  providers: [PrivateChanInvitationGateway, PrivateChanInvitationService],
  exports: [HttpModule],
})
export class PrivateChanInvitationModule {}
