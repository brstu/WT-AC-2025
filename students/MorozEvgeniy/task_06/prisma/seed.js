import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const salt = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  const adminPass = await bcrypt.hash('adminpass', salt);
  const userPass = await bcrypt.hash('userpass', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', passwordHash: adminPass, role: 'admin' }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', passwordHash: userPass, role: 'user' }
  });

  await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Public Project A',
      description: 'Пример публичного проекта',
      isPublic: true,
      ownerId: admin.id
    }
  });

  await prisma.project.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Private User Project',
      description: 'Приватный проект пользователя',
      isPublic: false,
      ownerId: user.id
    }
  });

  console.log('Seed done');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
