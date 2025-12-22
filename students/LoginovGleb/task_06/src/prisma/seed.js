const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Очистка существующих данных
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();

  // Создание пользователей
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Админ',
      lastName: 'Администратов',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: hashedPassword,
      firstName: 'Иван',
      lastName: 'Иванов',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: hashedPassword,
      firstName: 'Петр',
      lastName: 'Петров',
      role: 'USER',
    },
  });

  console.log('✅ Users created:', { admin, user1, user2 });

  // Создание оборудования для разных пользователей
  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'Dell Latitude 5520',
      type: 'LAPTOP',
      serialNumber: 'DL-LAT-5520-001',
      manufacturer: 'Dell',
      model: 'Latitude 5520',
      purchaseDate: new Date('2023-01-15'),
      warrantyEnd: new Date('2026-01-15'),
      status: 'IN_USE',
      location: 'Офис 201',
      notes: 'Рабочий ноутбук менеджера',
      ownerId: user1.id,
    },
  });

  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'HP LaserJet Pro',
      type: 'PRINTER',
      serialNumber: 'HP-LJ-PRO-002',
      manufacturer: 'HP',
      model: 'LaserJet Pro M404dn',
      purchaseDate: new Date('2023-03-20'),
      warrantyEnd: new Date('2025-03-20'),
      status: 'AVAILABLE',
      location: 'Офис 201',
      notes: 'Принтер для отдела',
      ownerId: user1.id,
    },
  });

  const equipment3 = await prisma.equipment.create({
    data: {
      name: 'MacBook Pro 16',
      type: 'LAPTOP',
      serialNumber: 'MBP-16-003',
      manufacturer: 'Apple',
      model: 'MacBook Pro 16" M2',
      purchaseDate: new Date('2024-01-10'),
      warrantyEnd: new Date('2027-01-10'),
      status: 'IN_USE',
      location: 'Офис 305',
      notes: 'Ноутбук дизайнера',
      ownerId: user2.id,
    },
  });

  const equipment4 = await prisma.equipment.create({
    data: {
      name: 'Dell UltraSharp 27',
      type: 'MONITOR',
      serialNumber: 'DL-US-27-004',
      manufacturer: 'Dell',
      model: 'UltraSharp U2720Q',
      purchaseDate: new Date('2023-06-15'),
      warrantyEnd: new Date('2026-06-15'),
      status: 'AVAILABLE',
      location: 'Офис 305',
      notes: '4K монитор',
      ownerId: user2.id,
    },
  });

  const equipment5 = await prisma.equipment.create({
    data: {
      name: 'Cisco Switch 48-Port',
      type: 'NETWORK',
      serialNumber: 'CS-SW-48-005',
      manufacturer: 'Cisco',
      model: 'Catalyst 2960-48TC-L',
      purchaseDate: new Date('2022-08-01'),
      warrantyEnd: new Date('2027-08-01'),
      status: 'IN_USE',
      location: 'Серверная',
      notes: 'Основной коммутатор',
      ownerId: admin.id,
    },
  });

  const equipment6 = await prisma.equipment.create({
    data: {
      name: 'Dell PowerEdge R740',
      type: 'SERVER',
      serialNumber: 'DL-PE-R740-006',
      manufacturer: 'Dell',
      model: 'PowerEdge R740',
      purchaseDate: new Date('2023-02-01'),
      warrantyEnd: new Date('2028-02-01'),
      status: 'IN_USE',
      location: 'Серверная',
      notes: 'Основной сервер приложений',
      ownerId: admin.id,
    },
  });

  console.log('✅ Equipment created:', {
    equipment1,
    equipment2,
    equipment3,
    equipment4,
    equipment5,
    equipment6,
  });

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Test accounts:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   User1: user1@example.com / password123');
  console.log('   User2: user2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
