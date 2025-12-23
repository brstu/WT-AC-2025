const z = require('zod');

const submitResultSchema = z.object({
  quizId: z.string(),
  userId: z.string().optional(), // анонимно можно
  answers: z.array(z.number().int().min(0)) // массив индексов ответов
});

module.exports = { submitResultSchema };