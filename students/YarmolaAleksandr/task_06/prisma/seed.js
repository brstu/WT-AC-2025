const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.refreshToken.deleteMany();
  await prisma.meal.deleteMany();
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

  // Create meals for user1
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.meal.createMany({
    data: [
      {
        userId: user1.id,
        name: 'Овсянка с фруктами',
        description: 'Овсяная каша с бананом, ягодами и медом',
        mealType: 'BREAKFAST',
        date: today,
        calories: 350,
        protein: 12,
        carbs: 65,
        fat: 8,
        notes: 'Отличный завтрак!',
        isPrivate: true,
      },
      {
        userId: user1.id,
        name: 'Куриный салат',
        description: 'Салат с курицей, овощами и оливковым маслом',
        mealType: 'LUNCH',
        date: today,
        calories: 450,
        protein: 35,
        carbs: 25,
        fat: 20,
        notes: 'Сытный обед',
        isPrivate: true,
      },
      {
        userId: user1.id,
        name: 'Запеченная рыба с овощами',
        description: 'Лосось с брокколи и сладким картофелем',
        mealType: 'DINNER',
        date: today,
        calories: 520,
        protein: 40,
        carbs: 35,
        fat: 22,
        notes: 'Полезный ужин',
        isPrivate: true,
      },
      {
        userId: user1.id,
        name: 'Греческий йогурт с орехами',
        description: 'Натуральный йогурт с миндалем',
        mealType: 'SNACK',
        date: today,
        calories: 180,
        protein: 15,
        carbs: 12,
        fat: 8,
        isPrivate: true,
      },
      {
        userId: user1.id,
        name: 'Яичница с тостом',
        description: 'Два яйца с цельнозерновым хлебом',
        mealType: 'BREAKFAST',
        date: yesterday,
        calories: 320,
        protein: 18,
        carbs: 30,
        fat: 14,
        isPrivate: true,
      },
    ],
  });

  const mealCount = await prisma.meal.count();
  console.log(`✅ Created ${mealCount} meals`);

  console.log('\n📊 Summary:');
  console.log(`Users: ${await prisma.user.count()}`);
  console.log(`Meals: ${mealCount}`);
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
