const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty'
});

prisma.$connect()
  .then(() => console.log('Connected to SQLite database'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = prisma;