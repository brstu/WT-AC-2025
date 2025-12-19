import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 1);

  const user1 = await prisma.user.create({
    data: {
      email: 'ivan@example.com',
      password: hashedPassword,
      name: 'Иван Иванов',
      trips: {
        create: [
          {
            title: 'Поездка в Минск',
            description: 'Деловая поездка',
            destination: 'Минск',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-01-20'),
            budget: 500,
          },
        ],
      },
    },
  });

  console.log('База данных заполнена начальными данными');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
