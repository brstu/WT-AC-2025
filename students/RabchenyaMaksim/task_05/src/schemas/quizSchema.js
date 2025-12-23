const z = require('zod');

const questionSchema = z.object({
  text: z.string().min(1, 'Question text required'),
  options: z.array(z.string().min(1)).min(2, 'At least 2 options'),
  correctIndex: z.number().int().min(0).max(z.array(z.string()).length - 1) // динамически проверит
});

const createQuizSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1)
});

const updateQuizSchema = createQuizSchema.partial(); // частичное обновление

module.exports = { createQuizSchema, updateQuizSchema };