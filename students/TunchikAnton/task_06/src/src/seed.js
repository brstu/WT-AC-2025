const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seedDatabase = async () => {
  console.log('🌱 Seeding database...');
  
  try {
    await prisma.refreshToken.deleteMany();
    await prisma.review.deleteMany();
    await prisma.user.deleteMany();
    
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const userPassword = await bcrypt.hash('User123!', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN'
      }
    });
    
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@example.com',
        username: 'john_doe',
        password: userPassword,
        role: 'USER'
      }
    });
    
    const user2 = await prisma.user.create({
      data: {
        email: 'user2@example.com',
        username: 'jane_smith',
        password: userPassword,
        role: 'USER'
      }
    });
    
    console.log(`✅ Created users: ${admin.username}, ${user1.username}, ${user2.username}`);
    
    const reviews = [
      {
        placeName: 'Кафе "Уют"',
        description: 'Отличное место с вкусным кофе и приятной атмосферой. Персонал вежливый, Wi-Fi быстрый. Обязательно вернусь!',
        rating: 4.5,
        location: 'ул. Центральная, 10',
        tags: ['кафе', 'кофе', 'wifi'],
        status: 'APPROVED',
        userId: user1.id
      },
      {
        placeName: 'Парк Горького',
        description: 'Красивый парк для прогулок. Чисто, много лавочек, есть детская площадка. Не хватает больше урн для мусора.',
        rating: 4.0,
        location: 'ул. Парковая, 5',
        tags: ['парк', 'прогулка', 'отдых'],
        status: 'APPROVED',
        userId: user1.id
      },
      {
        placeName: 'Ресторан "Море"',
        description: 'Дорого и невкусно. Рыба была несвежей, обслуживание медленное. Не рекомендую.',
        rating: 1.5,
        location: 'наб. Речная, 25',
        tags: ['ресторан', 'рыба', 'дорого'],
        status: 'PENDING',
        userId: user2.id
      }
    ];
    
    for (const reviewData of reviews) {
      await prisma.review.create({ data: reviewData });
    }
    
    console.log(`✅ Created ${reviews.length} reviews`);
    console.log('🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;