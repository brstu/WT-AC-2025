import { z } from 'zod';

export const matchCreateSchema = z.object({
  leagueId: z.string().uuid(),
  homeTeam: z.string().min(1).max(100),
  awayTeam: z.string().min(1).max(100),
  date: z.string().datetime(),
  finished: z.boolean()
});

export const matchUpdateSchema = matchCreateSchema.partial();
