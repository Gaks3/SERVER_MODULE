import { type Game, PrismaClient, type User, UserRole } from '@prisma/client';
import { generateId } from 'better-auth';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function createUsers(role: UserRole, count: number = 5) {
  const users: User[] = [];

  for (let i = 1; i <= count; i++) {
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        name: `${role} ${i}`,
        email: `${role}${i}@gmail.com`,
        role,
        emailVerified: false,
      },
    });

    const hashedPassword = await hashPassword('@Bagas098');

    await prisma.account.create({
      data: {
        id: generateId(),
        accountId: generateId(),
        providerId: 'credential',
        userId: user.id,
        password: hashedPassword,
      },
    });

    users.push(user);
  }

  return users;
}

async function main() {
  const admins = await createUsers('admin', 5);
  const developers = await createUsers('developer', 20);
  const users = await createUsers('user', 30);

  const games: Game[] = [];

  for (const developer of developers) {
    for (let i = 1; i <= 2; i++) {
      const game = await prisma.game.create({
        data: {
          id: generateId(),
          title: `Game ${i} by ${developer.name}`,
          slug: `game-${developer.name.toLowerCase().replace(/\s/g, '-')}-${i}`,
          description: `Deskripsi game ${i} oleh ${developer.name}`,
          image: '/70cd83fd-2.png',
          userId: developer.id,
        },
      });

      for (let v = 1; v <= 2; v++) {
        const version = await prisma.gameVersion.create({
          data: {
            id: generateId(),
            version: `${v}`,
            path: `/games/demo/1`,
            gameId: game.id,
          },
        });

        const shuffledUsers = users.sort(() => 0.5 - Math.random()).slice(0, 5);
        for (const user of shuffledUsers) {
          await prisma.score.create({
            data: {
              userId: user.id,
              gameVersionId: version.id,
              score: Math.floor(Math.random() * 1000),
            },
          });
        }
      }

      games.push(game);
    }
  }

  console.log(`✅ Seed selesai!`);
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
