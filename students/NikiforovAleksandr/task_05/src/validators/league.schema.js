import { z } from 'zod';

export const leagueCreateSchema = z.object({
  name: z.string().min(1).max(100),
  country: z.string().min(1).max(100)
});

export const leagueUpdateSchema = leagueCreateSchema.partial();
