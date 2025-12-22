import { z } from 'zod'

export const playlistSchema = z.object({
  name: z.string().min(3, 'Название должно быть минимум 3 символа'),
  description: z.string().optional(),
})