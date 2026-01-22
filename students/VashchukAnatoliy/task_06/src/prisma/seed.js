const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order is important because of relations)
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'USER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Created users: ${user1.email}, ${admin.email}`);

  // Create tasks for user1
  await prisma.task.createMany({
    data: [
      {
        ownerId: user1.id,
        title: 'Сделать лабораторную работу №6',
        description: 'Реализовать БД, JWT, роли USER/ADMIN',
        completed: false,
        isPrivate: true,
      },
      {
        ownerId: user1.id,
        title: 'Подготовиться к защите',
        description: 'Повторить Prisma, JWT, middleware',
        completed: false,
        isPrivate: true,
      },
      {
        ownerId: user1.id,
        title: 'Исправить замечания преподавателя',
        description: 'Поправить архитектуру и README',
        completed: false,
        isPrivate: true,
      },
      {
        ownerId: user1.id,
        title: 'Отправить работу в LMS',
        description: 'Загрузить архив с исходниками',
        completed: true,
        isPrivate: true,
      },
    ],
  });

  const taskCount = await prisma.task.count();

  console.log(`✅ Created ${taskCount} tasks`);

  console.log('\n📊 Summary:');
  console.log(`Users: ${await prisma.user.count()}`);
  console.log(`Tasks: ${taskCount}`);

  console.log('\n🔑 Login credentials:');
  console.log('Email: john@example.com');
  console.log('Email: admin@example.com');
  console.log('Password: password123');

  console.log('\n✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
