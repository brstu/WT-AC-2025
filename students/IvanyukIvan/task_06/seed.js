require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Начало сидирования базы данных...');

    // Очистка данных
    await prisma.note.deleteMany();
    await prisma.word.deleteMany();
    await prisma.user.deleteMany();

    // Создание тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword
      }
    });

    console.log(`✅ Создан пользователь: ${user.email}`);

    // Создание слов
    const words = [
      {
        original: 'hello',
        translation: 'привет',
        language: 'english',
        category: 'greetings',
        difficulty: 1,
        userId: user.id
      },
      {
        original: 'book',
        translation: 'книга',
        language: 'english',
        category: 'objects',
        difficulty: 2,
        userId: user.id
      },
      {
        original: 'apprendre',
        translation: 'учиться',
        language: 'french',
        category: 'verbs',
        difficulty: 3,
        userId: user.id
      },
      {
        original: 'Haus',
        translation: 'дом',
        language: 'german',
        category: 'objects',
        difficulty: 2,
        userId: user.id
      },
      {
        original: 'comer',
        translation: 'есть',
        language: 'spanish',
        category: 'verbs',
        difficulty: 3,
        userId: user.id
      }
    ];

    await prisma.word.createMany({ data: words });
    console.log(`✅ Создано ${words.length} слов`);

    // Создание заметок
    const notes = [
      {
        title: 'Грамматические правила',
        content: 'В английском языке порядок слов фиксированный: Subject + Verb + Object.',
        tags: ['грамматика', 'английский'],
        isPrivate: true,
        userId: user.id
      },
      {
        title: 'Список для изучения',
        content: 'Необходимо выучить неправильные глаголы и времена Present Perfect.',
        tags: ['задачи', 'английский'],
        isPrivate: false,
        userId: user.id
      }
    ];

    await prisma.note.createMany({ data: notes });
    console.log(`✅ Создано ${notes.length} заметок`);

    console.log('🎉 Сидирование завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при сидировании:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();