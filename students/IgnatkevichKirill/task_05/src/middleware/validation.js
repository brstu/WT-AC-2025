const { z } = require('zod');

const noteCreateSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  tags: z.array(z.string().min(1).max(20)).max(10).optional().default([]),
  dueDate: z.string().datetime().optional().nullable(),
});

const noteUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(1000).optional(),
  tags: z.array(z.string().min(1).max(20)).max(10).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  isArchived: z.boolean().optional(),
  isDone: z.boolean().optional(),
});

const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Validation error',
      details: error.errors,
    });
  }
};

module.exports = {
  validateNoteCreate: validate(noteCreateSchema),
  validateNoteUpdate: validate(noteUpdateSchema),
};