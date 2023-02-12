import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { User } from '../auth/types/user.type';

const prisma = new PrismaClient();

async function create_achievement(
  id: number,
  requiered_points: number,
  title: string,
  description: string,
) {
  try {
    await prisma.achievements.upsert({
      where: {
        title: title,
      },
      update: {
        minimum_score: requiered_points,
      },
      create: {
        id: id,
        title: title,
        description: description,
        minimum_score: requiered_points,
      },
    });
  } catch (e) {}
}

async function create_user_mode(id: number, description: string) {
  try {
    await prisma.userMode.upsert({
      where: {
        description: description,
      },
      update: {
        description: description,
      },
      create: {
        id: id,
        description: description,
      },
    });
  } catch (e) {}
}

async function create_user_role(id: number, description: string) {
  try {
    await prisma.userRole.upsert({
      where: {
        description: description,
      },
      update: {
        description: description,
      },
      create: {
        id: id,
        description: description,
      },
    });
  } catch (e) {}
}

async function create_channel_type(id: number, description: string) {
  try {
    await prisma.channelType.upsert({
      where: {
        description: description,
      },
      update: {
        description: description,
      },
      create: {
        id: id,
        description: description,
      },
    });
  } catch (e) {}
}

async function create_invitation_status(id: number, description: string) {
  try {
    await prisma.invitationStatus.upsert({
      where: {
        description: description,
      },
      update: {
        description: description,
      },
      create: {
        id: id,
        description: description,
      },
    });
  } catch (e) {}
}

async function hashData(data: string) {
  return await argon2.hash(data);
}

async function create_user(
  email: string,
  nickname: string,
  firstname: string,
  surname: string,
  avatar: string,
  hash: string,
): Promise<User> {
  try {
    const new_user = await prisma.users.upsert({
      where: {
        email: email,
      },
      update: {
        email: email,
        nickname: nickname,
        firstname: firstname,
        surname: surname,
        hash: hash,
        status_id: 0,
      },
      create: {
        email: email,
        nickname: nickname,
        firstname: firstname,
        surname: surname,
        hash: hash,
        avatar: avatar,
        status_id: 0,
      },
    });
    return new_user;
  } catch (e) {}
}

async function create_user_status(status_id: number, status_name: string) {
  try {
    await prisma.status.upsert({
      where: {
        id: status_id,
      },
      update: {
        status_name: status_name,
      },
      create: {
        id: status_id,
        status_name: status_name,
      },
    });
  } catch (e) {}
}

async function create_channel(user_owner_id: string, title: string) {
  const chan = await prisma.channels.findFirst({
    where: {
      title: title,
    },
  });
  if (chan) return;
  await prisma.users.update({
    where: {
      id: user_owner_id,
    },
    data: {
      channels_owner: {
        create: [
          {
            title: title,
            password: '',
            topic: '',
            type: {
              connect: {
                id: 1,
              },
            },
          },
        ],
      },
    },
  });
}

async function main() {
  // create achievements
  await create_achievement(1, 1, 'You are nice', 'Receive a friend request');
  await create_achievement(2, 1, 'Hi!', 'Send a friend request');
  await create_achievement(
    3,
    1,
    'My first victory',
    'Win a game for the first time',
  );
  await create_achievement(4, 1, "I'm Selective", 'Decline a friend request');
  await create_achievement(5, 1, 'Friendly', 'Invite someone to a channel');
  await create_achievement(6, 1, 'Leader', 'Create a channel');
  await create_achievement(7, 10, 'The King', 'Win 10 matches');

  // create user modes
  await create_user_mode(1, 'No mode');
  await create_user_mode(2, 'Banned');
  await create_user_mode(3, 'Muted');

  // create user roles
  await create_user_role(1, 'User');
  await create_user_role(2, 'Admin');
  await create_user_role(3, 'Moderator');

  // create channel type
  await create_channel_type(1, 'Public');
  await create_channel_type(2, 'Private');
  await create_channel_type(3, 'Protected');

  // create invitation status
  await create_invitation_status(1, 'Pending');
  await create_invitation_status(2, 'Accepted');
  await create_invitation_status(3, 'Declined');
  await create_invitation_status(4, 'Blocked');

  // create user status
  await create_user_status(0, 'Offline');
  await create_user_status(1, 'Online');
  await create_user_status(2, 'Playing');

  try {
    const admin_user = await create_user(
      'admin@unique-paris.fr',
      'Chief',
      'Alexandre',
      'Besombes',
      'http://localhost:3000/files/unknownUser.jpeg',
      await hashData(process.env.CHIEF_PWD),
    );
    if (admin_user != undefined) {
      await create_channel(admin_user.id, 'private');
    }
  } catch (e) {}
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
