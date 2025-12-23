const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: pw,
      role: 'admin',
      posts: {
        create: [{ title: 'Seed post', content: 'This is a seed post', published: true }]
      }
    }
  });
  console.log('Seeded user id=', user.id);
}

async function extra() {
  const pw = await bcrypt.hash('userpass', 10);
  const user2 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      passwordHash: pw,
      role: 'user',
      posts: {
        create: [
          { title: 'User post', content: 'Content from user', published: false }
        ]
      }
    }
  });

  const posts = await prisma.post.findMany();
  if (posts.length > 0) {
    await prisma.comment.create({
      data: {
        text: 'Nice post!',
        postId: posts[0].id,
        authorId: user2.id
      }
    });
  }
  console.log('Seeded user2 id=', user2.id);
}

// run both seeding functions
main()
  .then(() => extra())
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

