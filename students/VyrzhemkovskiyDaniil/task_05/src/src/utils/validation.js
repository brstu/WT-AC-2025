const { z } = require('zod');

const postSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  author: z.string().min(1).max(50)
});

const postUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(1000).optional(),
  author: z.string().min(1).max(50).optional()
});

const commentSchema = z.object({
  author: z.string().min(1).max(50),
  content: z.string().min(1).max(500)
});

module.exports = {
  postSchema,
  postUpdateSchema,
  commentSchema
};