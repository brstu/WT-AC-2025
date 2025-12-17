const { z } = require('zod');

// Схемы валидации для книг
const bookCreateSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  year: z.number().int().min(1000).max(new Date().getFullYear()),
  genre: z.string().min(1).max(50).optional(),
  isbn: z.string().min(10).max(13).optional(),
  description: z.string().max(1000).optional()
});

const bookUpdateSchema = bookCreateSchema.partial();

// Схемы валидации для отзывов
const reviewCreateSchema = z.object({
  bookId: z.string().min(1),
  author: z.string().min(1).max(50),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500),
  userId: z.string().min(1).max(50).optional()
});

const reviewUpdateSchema = reviewCreateSchema.partial().omit({ bookId: true });

const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(422).json({
      message: 'Validation failed',
      details: error.errors
    });
  }
};

module.exports = {
  bookCreateSchema,
  bookUpdateSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  validate
};