const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Создаем тестовых пользователей
  const password1 = await bcrypt.hash('123456', 10);
  const password2 = await bcrypt.hash('password', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: password1,
      name: 'Тестовый Пользователь'
    }
  });
  
  const user2 = await prisma.user.create({
    data: {
      email: 'doctor@health.ru',
      password: password2,
      name: 'Доктор Иванов'
    }
  });
  
  // Создаем тестовые записи
  await prisma.healthRecord.create({
    data: {
      type: 'Давление',
      value: '120/80',
      date: new Date(),
      goal: 'Нормализовать давление',
      notes: 'Измерено утром',
      ownerId: user1.id
    }
  });
  
  await prisma.healthRecord.create({
    data: {
      type: 'Вес',
      value: '75 кг',
      date: new Date(),
      goal: 'Снизить до 70 кг',
      ownerId: user1.id
    }
  });
  
  await prisma.healthRecord.create({
    data: {
      type: 'Температура',
      value: '36.6',
      date: new Date(),
      notes: 'Норма',
      ownerId: user2.id
    }
  });
  
  console.log('База данных заполнена тестовыми данными!');
  console.log('Пользователь 1: test@test.com / 123456');
  console.log('Пользователь 2: doctor@health.ru / password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
