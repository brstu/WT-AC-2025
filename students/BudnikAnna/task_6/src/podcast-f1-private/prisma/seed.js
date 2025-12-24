const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'test@f1.com'
  const password = 'qwerty123'
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  })

  await prisma.episode.deleteMany({ where: { ownerId: user.id } })
  await prisma.podcast.deleteMany({ where: { ownerId: user.id } })

  const podcast = await prisma.podcast.create({
    data: {
      title: 'F1 Weekend Debrief',
      description: 'Разбор гонок Формулы 1: стратегии, пит-стопы, радио и инсайды.',
      ownerId: user.id,
    },
  })

  await prisma.episode.createMany({
    data: [
      {
        title: 'Monaco GP: Strategy Breakdown',
        summary: 'Почему undercut не всегда работает в Монако и как читают трафик.',
        isPrivate: false,
        publishedAt: new Date(),
        podcastId: podcast.id,
        ownerId: user.id,
        audioUrl: 'https://example.com/audio/monaco.mp3'
      },
      {
        title: 'Team Radio Leaks (Private)',
        summary: 'Приватные заметки: что не попадает в трансляцию.',
        isPrivate: true,
        podcastId: podcast.id,
        ownerId: user.id
      }
    ],
  })

  console.log('Seed done ✅')
  console.log(`Demo user: ${email} / ${password}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })