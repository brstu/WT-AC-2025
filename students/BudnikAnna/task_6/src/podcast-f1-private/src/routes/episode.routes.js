const express = require('express')
const { prisma } = require('../prisma')
const { createEpisodeSchema, updateEpisodeSchema } = require('../validators/episode')

const router = express.Router()

router.get('/', async (req, res) => {
  const ownerId = req.user.id
  const { podcastId } = req.query

  const where = { ownerId }
  if (podcastId) where.podcastId = String(podcastId)

  const episodes = await prisma.episode.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  res.json({ data: episodes })
})

router.post('/', async (req, res) => {
  const parsed = createEpisodeSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })

  const ownerId = req.user.id
  const data = parsed.data

  const podcast = await prisma.podcast.findFirst({
    where: { id: data.podcastId, ownerId }
  })
  if (!podcast) return res.status(403).json({ message: 'Forbidden: podcast not yours or not found' })

  const episode = await prisma.episode.create({
    data: {
      title: data.title,
      summary: data.summary ?? null,
      audioUrl: data.audioUrl ?? null,
      isPrivate: data.isPrivate ?? false,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      podcastId: data.podcastId,
      ownerId,
    }
  })

  res.status(201).json({ data: episode })
})

router.get('/:id', async (req, res) => {
  const ownerId = req.user.id

  const episode = await prisma.episode.findFirst({
    where: { id: req.params.id, ownerId },
  })
  if (!episode) return res.status(404).json({ message: 'Episode not found' })

  res.json({ data: episode })
})

router.patch('/:id', async (req, res) => {
  const parsed = updateEpisodeSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })

  const ownerId = req.user.id

  const exists = await prisma.episode.findFirst({ where: { id: req.params.id, ownerId } })
  if (!exists) return res.status(404).json({ message: 'Episode not found' })

  const payload = { ...parsed.data }
  if (payload.publishedAt !== undefined) {
    payload.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : null
  }

  const updated = await prisma.episode.update({
    where: { id: req.params.id },
    data: payload,
  })

  res.json({ data: updated })
})

router.delete('/:id', async (req, res) => {
  const ownerId = req.user.id

  const exists = await prisma.episode.findFirst({ where: { id: req.params.id, ownerId } })
  if (!exists) return res.status(404).json({ message: 'Episode not found' })

  await prisma.episode.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

module.exports = { episodeRouter: router }