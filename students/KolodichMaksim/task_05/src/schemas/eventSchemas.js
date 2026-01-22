const { z } = require('zod');

const eventCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  date: z.string().datetime(), // ISO date
  location: z.string().min(1),
});

const eventUpdateSchema = eventCreateSchema.partial();

module.exports = { eventCreateSchema, eventUpdateSchema };