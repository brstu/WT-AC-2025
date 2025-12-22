const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      email: "test@test.com",
      password,
      movies: {
        create: {
          title: "Breaking Bad",
          type: "SERIES"
        }
      }
    }
  });
}

main();
