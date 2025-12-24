const prisma = require('../config/database');

module.exports = {
  prisma,
  User: prisma.user,
  Word: prisma.word,
  Note: prisma.note,
};