const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем сидирование...');

  try {
    // Проверяем подключение к БД
    console.log('Проверяем подключение к БД...');
    await prisma.$connect();
    console.log('Подключение к БД успешно');

    // Очистка таблиц (в правильном порядке из-за foreign keys)
    console.log('Очистка таблиц...');
    await prisma.favorite.deleteMany({});
    console.log('Таблица favorites очищена');
    
    await prisma.recipe.deleteMany({});
    console.log('Таблица recipes очищена');
    
    await prisma.user.deleteMany({});
    console.log('Таблица users очищена');

    // Создание пользователей
    console.log('Создание пользователей...');
    const user1 = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Иван Иванов',
        role: 'USER',
      },
    });
    console.log('Пользователь 1 создан:', user1.email);

    const user2 = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Администратор',
        role: 'ADMIN',
      },
    });
    console.log('Пользователь 2 создан:', user2.email);

    // Создание рецептов
    console.log('Создание рецептов...');
    const recipe1 = await prisma.recipe.create({
      data: {
        title: 'Спагетти Карбонара',
        description: 'Классический итальянский рецепт',
        ingredients: JSON.stringify(['спагетти 400г', 'бекон 200г', 'яйца 3шт', 'сыр пармезан 100г', 'чеснок 2 зубчика']),
        steps: JSON.stringify(['Отварить спагетти', 'Обжарить бекон с чесноком', 'Смешать яйца с сыром', 'Соединить все ингредиенты']),
        cookingTime: 25,
        difficulty: 'EASY',
        authorId: user1.id,
      },
    });
    console.log('Рецепт 1 создан:', recipe1.title);

    const recipe2 = await prisma.recipe.create({
      data: {
        title: 'Тирамису',
        description: 'Итальянский десерт',
        ingredients: JSON.stringify(['маскарпоне 500г', 'яйца 4шт', 'сахар 100г', 'кофе 200мл', 'печенье савоярди']),
        steps: JSON.stringify(['Приготовить кофе', 'Взбить яйца с сахаром', 'Смешать с маскарпоне', 'Собрать десерт']),
        cookingTime: 40,
        difficulty: 'MEDIUM',
        authorId: user2.id,
      },
    });
    console.log('Рецепт 2 создан:', recipe2.title);

    // Добавление в избранное
    console.log('Добавление в избранное...');
    await prisma.favorite.create({
      data: {
        userId: user1.id,
        recipeId: recipe2.id,
      },
    });
    console.log('Рецепт 2 добавлен в избранное пользователя 1');

    await prisma.favorite.create({
      data: {
        userId: user2.id,
        recipeId: recipe1.id,
      },
    });
    console.log('Рецепт 1 добавлен в избранное пользователя 2');

    console.log('\n✅ Сидирование завершено успешно!');
    console.log('\n📋 Тестовые данные:');
    console.log('- Пользователь:', user1.email, '| Пароль: password123 | Роль: USER');
    console.log('- Администратор:', user2.email, '| Пароль: admin123 | Роль: ADMIN');
    console.log('- Создано рецептов: 2');
    console.log('- Создано избранных: 2');

  } catch (error) {
    console.error('\n❌ Ошибка при сидировании:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('\n💥 Критическая ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('\n🔌 Отключаемся от БД...');
    await prisma.$disconnect();
    console.log('Отключение завершено');
  });