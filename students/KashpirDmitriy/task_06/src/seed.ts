import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      password: userPassword,
      name: 'Test User',
      role: 'user',
    },
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: 'user',
    },
  });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const slot1 = await prisma.slot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
      capacity: 10,
      price: 15.0,
    },
  });

  const slot2 = await prisma.slot.upsert({
    where: { id: 2 },
    update: {},
    create: {
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
      capacity: 10,
      price: 15.0,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      slotId: slot1.id,
      userId: user.id,
      status: 'confirmed',
    },
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: user.id,
      amount: 15.0,
      status: 'completed',
    },
  });

  console.log('Seeded database with admin, user, slots, booking, and payment');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
