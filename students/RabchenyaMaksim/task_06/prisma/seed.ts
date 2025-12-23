import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      tasks: {
        create: [
          { title: 'Task 1', description: 'Description 1' },
          { title: 'Task 2', completed: true },
        ],
      },
    },
  });
  console.log('Seed completed');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());