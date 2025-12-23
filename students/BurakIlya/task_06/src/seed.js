const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('Начинаем заполнение БД...');
  
  // Создаем тестового пользователя
  const hashedPassword = await bcrypt.hash('password123', 5);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: hashedPassword,
      name: 'Тестовый Пользователь',
      role: 'user'
    }
  });
  
  console.log('Создан пользователь:', user1.email);
  
  // Создаем несколько заметок
  await prisma.note.create({
    data: {
      title: 'Первая заметка',
      content: 'Это моя первая заметка в системе',
      tags: 'работа,важное',
      userId: user1.id
    }
  });
  
  await prisma.note.create({
    data: {
      title: 'Список покупок',
      content: 'Молоко, хлеб, яйца',
      tags: 'личное,покупки',
      userId: user1.id
    }
  });
  
  await prisma.note.create({
    data: {
      title: 'Идеи для проекта',
      content: 'Добавить темную тему, улучшить UI',
      tags: 'работа,разработка',
      userId: user1.id
    }
  });
  
  console.log('Заполнение завершено!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
