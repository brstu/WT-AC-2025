const express = require('express')
const { prisma } = require('../prisma')

const router = express.Router()

router.get('/episodes', async (req, res) => {
  const episodes = await prisma.episode.findMany({
    where: { isPrivate: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      summary: true,
      audioUrl: true,
      publishedAt: true,
      podcastId: true,
      createdAt: true,
      updatedAt: true,
      isPrivate: true
    }
  })

  res.json({ data: episodes })
})

module.exports = { publicRouter: router }