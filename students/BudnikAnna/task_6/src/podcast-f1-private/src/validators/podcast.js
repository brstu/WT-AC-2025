const { z } = require('zod')

const createPodcastSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
})

const updatePodcastSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional().nullable(),
})

module.exports = { createPodcastSchema, updatePodcastSchema }