import { Controller, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Body, Patch, Param, Get } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AuthGuard } from '@nestjs/passport';
import { AchievementData } from './types/achievemetsUser';

@Controller('achievements')
export class AchievementsController {
  constructor(
    private httpService: HttpService,
    private achievementsService: AchievementsService,
  ) {}

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('user/:nickname')
  async achievementsUser(
    @Param('nickname') nickname: string,
  ): Promise<AchievementData[]> {
    try {
      return await this.achievementsService.achievementsUser(nickname);
    } catch (e) {
      console.log('achievementsUser');
    }
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Patch('update/')
  async update_achievement(
    @Body() data: { user_id: string; achievement_id: number },
  ) {
    const user = await this.achievementsService.get_achievement_by_id(
      data.user_id,
      data.achievement_id,
    );
    if (user.length > 0) {
      if (
        (data.achievement_id == 1 && user[0].user_score == 1) ||
        (data.achievement_id == 2 && user[0].user_score == 1) ||
        (data.achievement_id == 3 && user[0].user_score == 1) ||
        (data.achievement_id == 4 && user[0].user_score == 1) ||
        (data.achievement_id == 5 && user[0].user_score == 1) ||
        (data.achievement_id == 6 && user[0].user_score == 1) ||
        (data.achievement_id == 7 && user[0].user_score == 10)
      ) {
        return;
      }
      await this.achievementsService.update_achievement(
        data.user_id,
        data.achievement_id,
        user[0].user_score + 1,
      );
      return;
    }
  }
}
