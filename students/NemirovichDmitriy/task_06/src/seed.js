const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('pass456', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      password: hashedPassword1,
      role: 'editor'
    }
  });
  
  const user2 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword2,
      role: 'user'
    }
  });
  
  await prisma.article.create({
    data: {
      title: 'Введение в базу знаний',
      content: 'Это первая статья в нашей базе знаний команды. Здесь мы будем хранить важную информацию.',
      ownerId: user1.id
    }
  });
  
  await prisma.article.create({
    data: {
      title: 'Руководство по работе',
      content: 'Подробное руководство по работе с системой управления знаниями.',
      ownerId: user1.id
    }
  });
  
  await prisma.article.create({
    data: {
      title: 'Заметки пользователя',
      content: 'Личные заметки для работы.',
      ownerId: user2.id
    }
  });
  
  console.log('База данных заполнена тестовыми данными');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
