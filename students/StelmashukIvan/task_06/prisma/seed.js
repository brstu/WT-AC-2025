const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleaned');

  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');
  const testPassword = await hashPassword('test123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@university.edu',
      password: adminPassword,
      name: 'Администратор Системы',
      role: 'admin',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@university.edu',
      password: userPassword,
      name: 'Иван Петров',
      role: 'user',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'test@university.edu',
      password: testPassword,
      name: 'Тестовый Пользователь',
      role: 'user',
    },
  });

  console.log(`✅ Created users: ${admin.email}, ${user.email}, ${testUser.email}`);

  const tasks = [
    {
      title: 'Настроить сервер развертывания',
      description: 'Развернуть production среду для API',
      completed: false,
      dueDate: new Date('2024-12-31'),
      priority: 'high',
      tags: JSON.stringify(['devops', 'deployment', 'production']),
      ownerId: admin.id,
    },
    {
      title: 'Обновить документацию API',
      description: 'Добавить новые эндпоинты в Swagger документацию',
      completed: true,
      dueDate: new Date('2024-12-15'),
      priority: 'medium',
      tags: JSON.stringify(['documentation', 'swagger', 'api']),
      ownerId: admin.id,
    },

    {
      title: 'Завершить лабораторную работу 06',
      description: 'Реализовать REST API с аутентификацией и БД',
      completed: false,
      dueDate: new Date('2024-12-20'),
      priority: 'high',
      tags: JSON.stringify(['nodejs', 'express', 'prisma', 'jwt']),
      ownerId: user.id,
    },
    {
      title: 'Изучить Prisma ORM',
      description: 'Освоить основы работы с Prisma для работы с БД',
      completed: true,
      dueDate: new Date('2024-12-10'),
      priority: 'medium',
      tags: JSON.stringify(['prisma', 'database', 'orm']),
      ownerId: user.id,
    },
    {
      title: 'Написать тесты для API',
      description: 'Создать unit и integration тесты для эндпоинтов',
      completed: false,
      dueDate: new Date('2024-12-25'),
      priority: 'medium',
      tags: JSON.stringify(['testing', 'jest', 'api']),
      ownerId: user.id,
    },

    {
      title: 'Подготовить презентацию проекта',
      description: 'Создать презентацию для демонстрации функционала API',
      completed: false,
      dueDate: new Date('2024-12-18'),
      priority: 'high',
      tags: JSON.stringify(['presentation', 'demo', 'portfolio']),
      ownerId: testUser.id,
    },
    {
      title: 'Оптимизировать запросы к БД',
      description: 'Добавить индексы и оптимизировать медленные запросы',
      completed: false,
      dueDate: new Date('2024-12-22'),
      priority: 'medium',
      tags: JSON.stringify(['optimization', 'database', 'performance']),
      ownerId: testUser.id,
    },
    {
      title: 'Изучить JWT аутентификацию',
      description: 'Разобраться с принципами работы JWT токенов',
      completed: true,
      dueDate: new Date('2024-12-05'),
      priority: 'low',
      tags: JSON.stringify(['jwt', 'authentication', 'security']),
      ownerId: testUser.id,
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: taskData,
    });
  }

  console.log(`✅ Created ${tasks.length} tasks for different users`);
  console.log('🎉 Database seed completed successfully!');

  console.log('\n📋 Test credentials:');
  console.log('Admin:    email: admin@university.edu    password: admin123');
  console.log('User:     email: user@university.edu     password: user123');
  console.log('Test:     email: test@university.edu     password: test123');
  console.log('\n💡 Use these credentials to test different user roles');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });