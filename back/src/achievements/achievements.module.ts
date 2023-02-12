import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsGateway } from './achievements.gateway';
import { HttpModule } from '@nestjs/axios';
import { AchievementsController } from './achievements.controller';

@Module({
  imports: [HttpModule],
  controllers: [AchievementsController],
  providers: [AchievementsGateway, AchievementsService],
  exports: [HttpModule],
})
export class AchievementsModule {}
