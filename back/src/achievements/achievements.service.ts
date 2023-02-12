import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { AchievementData } from './types/achievemetsUser';

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async achievementsUser(nickname: string): Promise<AchievementData[]> {
    const res = await this.prisma.users.findMany({
      where: {
        nickname: nickname,
      },
      select: {
        achievements: {
          select: {
            user_id: true,
            achievement_id: true,
            user_score: true,
            unlocked: true,
            achievement: {
              select: {
                title: true,
                description: true,
                minimum_score: true,
              },
            },
          },
          orderBy: {
            achievement_id: 'asc',
          },
        },
      },
    });
    return res;
  }

  async update_achievement(
    user_id: string,
    achievement_id: number,
    user_score: number,
  ) {
    const user = await this.prisma.achievementsPerUser.updateMany({
      where: {
        user_id: user_id,
        achievement_id: achievement_id,
      },
      data: {
        user_score: user_score,
      },
    });
    return user;
  }

  async get_achievement_by_id(user_id: string, achievement_id: number) {
    const user_score = await this.prisma.achievementsPerUser.findMany({
      where: {
        user_id: user_id,
        achievement_id: achievement_id,
      },
      select: {
        user_score: true,
      },
    });
    return user_score;
  }
}
