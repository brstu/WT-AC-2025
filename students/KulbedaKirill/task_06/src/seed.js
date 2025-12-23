const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Создание тестовых пользователей
  const password = await bcrypt.hash('password123', 5);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: password,
      name: 'Тестовый пользователь',
      tasks: {
        create: [
          {
            title: 'Купить продукты',
            description: 'Молоко, хлеб, яйца',
            completed: false
          },
          {
            title: 'Сделать домашнее задание',
            description: 'По математике и физике',
            completed: true
          }
        ]
      }
    }
  });
  
  const user2 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: password,
      name: 'Администратор',
      tasks: {
        create: [
          {
            title: 'Проверить почту',
            description: '',
            completed: false
          }
        ]
      }
    }
  });
  
  console.log('Созданы пользователи:', user1, user2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
