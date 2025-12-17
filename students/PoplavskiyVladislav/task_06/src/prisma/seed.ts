import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Начало seeding...');

  // Очистка базы данных
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  // Создание тестового пользователя
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      role: 'USER',
    },
  });

  console.log(`Создан пользователь: ${user.username}`);

  // Создание тестовых игр
  const games = [
    {
      title: 'The Witcher 3: Wild Hunt',
      description: 'Action RPG от CD Projekt Red',
      genre: 'RPG',
      platform: 'PC',
      releaseYear: 2015,
      rating: 9.7,
      imageUrl: 'https://example.com/witcher3.jpg',
      ownerId: user.id,
    },
    {
      title: 'Red Dead Redemption 2',
      description: 'Приключенческий боевик от Rockstar Games',
      genre: 'Action-Adventure',
      platform: 'PlayStation 4',
      releaseYear: 2018,
      rating: 9.8,
      ownerId: user.id,
    },
    {
      title: 'Cyberpunk 2077',
      description: 'Киберпанк RPG',
      genre: 'RPG',
      platform: 'PC',
      releaseYear: 2020,
      rating: 7.5,
      ownerId: user.id,
    },
    {
      title: 'The Legend of Zelda: Breath of the Wild',
      description: 'Приключенческая игра от Nintendo',
      genre: 'Adventure',
      platform: 'Nintendo Switch',
      releaseYear: 2017,
      rating: 9.5,
      ownerId: user.id,
    },
    {
      title: 'God of War',
      description: 'Эпическое приключение Кратоса',
      genre: 'Action-Adventure',
      platform: 'PlayStation 4',
      releaseYear: 2018,
      rating: 9.6,
      ownerId: user.id,
    },
  ];

  for (const game of games) {
    await prisma.game.create({
      data: game,
    });
  }

  console.log(`Создано ${games.length} игр`);
  console.log('Seeding завершен!');
}

main()
  .catch((e) => {
    console.error('Ошибка при seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });