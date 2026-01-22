const { z } = require('zod');

const registrationCreateSchema = z.object({
  eventId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
});

const registrationUpdateSchema = registrationCreateSchema.partial().extend({
  status: z.enum(['confirmed', 'cancelled', 'waiting']).optional(),
});

module.exports = { registrationCreateSchema, registrationUpdateSchema };