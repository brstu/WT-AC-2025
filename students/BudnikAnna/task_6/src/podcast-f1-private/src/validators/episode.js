const { z } = require('zod')

const createEpisodeSchema = z.object({
  podcastId: z.string().min(1),
  title: z.string().min(1).max(160),
  summary: z.string().max(2000).optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  isPrivate: z.boolean().optional()
})

const updateEpisodeSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  summary: z.string().max(2000).optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  isPrivate: z.boolean().optional()
})

module.exports = { createEpisodeSchema, updateEpisodeSchema }