const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  },
  log: []
});

global.testPrisma = testPrisma;

beforeAll(async () => {
  await testPrisma.$connect();
  await testPrisma.refreshToken.deleteMany();
  await testPrisma.review.deleteMany();
  await testPrisma.user.deleteMany();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

afterEach(async () => {
  await testPrisma.refreshToken.deleteMany();
  await testPrisma.review.deleteMany();
  await testPrisma.user.deleteMany();
});

const createTestUser = async (email, username, role = 'USER') => {
  const hashedPassword = await bcrypt.hash('Test123!', 12);
  return await testPrisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role
    },
    select: { id: true, email: true, username: true, role: true }
  });
};

const createTestReview = async (userId, status = 'PENDING') => {
  return await testPrisma.review.create({
    data: {
      placeName: 'Test Place',
      description: 'Test description for testing',
      rating: 4.5,
      location: 'Test location',
      tags: ['test', 'place'],
      status,
      userId
    }
  });
};

global.createTestUser = createTestUser;
global.createTestReview = createTestReview;