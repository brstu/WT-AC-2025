import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'tet@example.scom' },
    update: {
      password: hashedPassword,
      name: 'Test User',
    },
    create: {
      email: 'tet@example.scom',
      password: hashedPassword,
      name: 'Test User',
    },
  });
  console.log('Test user created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
