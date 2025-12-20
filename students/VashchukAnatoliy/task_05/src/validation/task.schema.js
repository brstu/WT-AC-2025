// src/validation/task.schema.js
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  done: z.boolean().optional().default(false),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  done: z.boolean().optional(),
  dueDate: z.string().datetime().optional(),
});
