import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthDto } from '../auth/dto';
import * as argon2 from 'argon2';
import { User, MarvinUser, GoogleUser } from '../auth/types';
import { UserIdDto } from '../dtos/userId.dto';
import { error_codes } from '../errors';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async findOne(id: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }

  async findFirst(id: string): Promise<User> {
    return await this.prisma.users.findFirst({
      where: {
        id: id,
      },
    });
  }

  async user(@Req() request: Request) {
    try {
      const accessToken = request.cookies['access_token'];
      if (!accessToken) return { data: undefined, error: error_codes[4] };
      const { sub } = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_AT_SECRET,
      });
      const tmp: User = await this.findOne(sub);
      if (tmp) {
        const { hash, two_factor_auth_secret, ...data } = tmp;
        return { data: data, error: {} };
      } else {
        return { data: {}, error: {} };
      }
    } catch (e) {
      throw new UnauthorizedException('Denied');
    }
  }

  async getAllUsers(table: string) {
    return await this.prisma[table].findMany({
      select: {
        email: true,
        nickname: true,
        firstname: true,
        surname: true,
        avatar: true,
      },
      orderBy: [
        {
          nickname: 'asc',
        },
      ],
    });
  }

  async get_users_except_one(user_id: string) {
    const users = await this.prisma.users.findMany({
      where: {
        NOT: [
          {
            id: user_id,
          },
        ],
      },
    });
    return users;
  }

  async create_new_user(dto: Partial<AuthDto>) {
    return await this.prisma.users.create({
      data: {
        firstname: dto.firstname,
        surname: dto.surname,
        nickname: dto.nickname,
        email: dto.email,
        hash: dto.password,
        avatar: dto.avatar,
      },
    });
  }

  async update_user(dto: Partial<UserIdDto>) {
    return await this.prisma.users.update({
      where: {
        id: dto.id,
      },
      data: {
        firstname: dto.firstname,
        surname: dto.surname,
        nickname: dto.nickname,
        email: dto.email,
        avatar: dto.avatar,
      },
    });
  }
  async update_password(dto: Partial<UserIdDto>) {
    return await this.prisma.users.update({
      where: {
        id: dto.id,
      },
      data: {
        hash: dto.password,
      },
    });
  }

  async create_new_google_user(user: GoogleUser) {
    return await this.prisma.users.create({
      data: {
        email: user.email,
        firstname: user.firstName,
        surname: user.lastName,
        nickname: user.nickname,
        hash: user.password,
        avatar: user.picture,
      },
    });
  }

  async check_alive_refresh_tokens(user_id: string): Promise<number> {
    try {
      const response = await this.prisma.refreshTokens.findMany({
        where: {
          userid: user_id,
        },
      });
      return response.length;
    } catch (e) {
      console.log('check_alive_refresh_tokens ');
    }
  }

  async create_new_marvin_user(user: MarvinUser): Promise<User> {
    return await this.prisma.users.create({
      data: {
        email: user.email,
        firstname: user.first_name,
        surname: user.last_name,
        nickname: user.nickname,
        hash: user.password,
        avatar: user.image.link,
      },
    });
  }

  async find_one_by_id(id: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        id: id,
      },
    });
  }

  async find_one_by_email(email: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }

  async find_one_by_email_restricted(email: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        email: email,
      },
      select: {
        two_factor_enabled: true,
      },
    });
  }

  async find_one_by_nickname_all_fields(nickname: string): Promise<User> {
    return await this.prisma.users.findUnique({
      where: {
        nickname: nickname,
      },
    });
  }

  async find_one_by_nickname(nickname: string): Promise<User> {
    return await this.prisma.users.findUnique({
      select: {
        id: true,
        email: true,
        nickname: true,
        firstname: true,
        surname: true,
        avatar: true,
        hash: true,
      },
      where: {
        nickname: nickname,
      },
    });
  }

  async delete_refresh_token(refresh_token: string) {
    return await this.prisma.refreshTokens.deleteMany({
      where: {
        refresh_token: refresh_token,
      },
    });
  }

  async find_first_refresh_token(refresh_token: string) {
    return await this.prisma.refreshTokens.findFirst({
      where: {
        refresh_token: refresh_token,
      },
    });
  }

  async achievementsUser(nickname: string) {
    return await this.prisma.users.findMany({
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
                description: true,
                minimum_score: true,
              },
            },
          },
        },
      },
    });
  }

  async update_two_factor_on(user: User) {
    return await this.prisma.users.update({
      where: {
        id: user['sub'],
      },
      data: {
        two_factor_enabled: true,
      },
    });
  }

  async set_user_status(user_id: string, status_code: number) {
    await this.prisma.users.update({
      where: {
        id: user_id,
      },
      data: {
        status_id: status_code,
      },
    });
  }

  async update_two_factor_off(user: User): Promise<User> {
    return await this.prisma.users.update({
      where: {
        id: user['sub'],
      },
      data: {
        two_factor_enabled: false,
        two_factor_auth_secret: null,
      },
    });
  }

  async update_two_factor_secret(
    secret: string,
    userId: string,
  ): Promise<User> {
    return await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        two_factor_auth_secret: secret,
      },
    });
  }

  async remove_former_rt(former_rt: string) {
    await this.prisma.refreshTokens.deleteMany({
      where: {
        refresh_token: former_rt,
      },
    });
  }

  async add_new_rt(userId: string, new_rt: string) {
    await this.prisma.refreshTokens.create({
      data: {
        userid: userId,
        refresh_token: new_rt,
      },
    });
  }

  async update_avatar_file_name(userId: string, filename: string) {
    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        avatar: 'http://localhost:3000/files/' + filename,
      },
    });
  }

  async update_user_profile(dto: Partial<UserIdDto>) {
    const users = await this.get_users_except_one(dto.id);
    for (let i = 0; i < users.length; i++) {
      if (users[i].nickname === dto.nickname) {
        return { data: undefined, error: error_codes[0] };
      }
      if (users[i].email === dto.email) {
        return { data: undefined, error: error_codes[1] };
      }
    }
    if (dto.password !== dto.password_confirm) {
      throw new BadRequestException('New Passwords do not match!');
    }
    if (dto.password !== '') {
      const user = await this.find_one_by_id(dto.id);
      const passwordMatches = await argon2.verify(user.hash, dto.old_password);
      if (!passwordMatches) {
        return { data: undefined, error: error_codes[2] };
      }
      const hash = await this.hashData(dto.password);
      dto.password = hash;
      await this.update_password(dto);
    }
    const updateUser = await this.update_user(dto);
    return { data: updateUser, error: {} };
  }

  async create_achievementsPerUser(user_id: string) {
    const achievements = await this.prisma.achievements.findMany({});
    for (let j = 0; j < achievements.length; j++) {
      try {
        await this.prisma.users.update({
          where: {
            id: user_id,
          },
          data: {
            achievements: {
              create: [
                {
                  user_score: 0,
                  unlocked: false,
                  achievement: {
                    connect: {
                      id: achievements[j]['id'],
                    },
                  },
                },
              ],
            },
          },
        });
      } catch (e) {
        continue;
      }
    }
  }

  hashData(data: string) {
    return argon2.hash(data);
  }
}
