const express = require('express')
const { prisma } = require('../prisma')
const { createPodcastSchema, updatePodcastSchema } = require('../validators/podcast')

const router = express.Router()

router.get('/', async (req, res) => {
  const ownerId = req.user.id
  const podcasts = await prisma.podcast.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ data: podcasts })
})

router.post('/', async (req, res) => {
  const parsed = createPodcastSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })

  const ownerId = req.user.id
  const podcast = await prisma.podcast.create({
    data: { ...parsed.data, ownerId },
  })
  res.status(201).json({ data: podcast })
})

router.get('/:id', async (req, res) => {
  const ownerId = req.user.id
  const podcast = await prisma.podcast.findFirst({
    where: { id: req.params.id, ownerId },
    include: { episodes: { orderBy: { createdAt: 'desc' } } }
  })
  if (!podcast) return res.status(404).json({ message: 'Podcast not found' })
  res.json({ data: podcast })
})

router.patch('/:id', async (req, res) => {
  const parsed = updatePodcastSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })

  const ownerId = req.user.id

  const exists = await prisma.podcast.findFirst({ where: { id: req.params.id, ownerId } })
  if (!exists) return res.status(404).json({ message: 'Podcast not found' })

  const updated = await prisma.podcast.update({
    where: { id: req.params.id },
    data: parsed.data,
  })

  res.json({ data: updated })
})

router.delete('/:id', async (req, res) => {
  const ownerId = req.user.id

  const exists = await prisma.podcast.findFirst({ where: { id: req.params.id, ownerId } })
  if (!exists) return res.status(404).json({ message: 'Podcast not found' })

  await prisma.podcast.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

module.exports = { podcastRouter: router }