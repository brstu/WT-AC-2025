const { z } = require('zod');

// Academic Group Schemas
const academicGroupCreate = z.object({
  name: z.string().min(1).max(50),
  course: z.number().int().min(1).max(6),
  faculty: z.string().min(1).max(100),
  studentCount: z.number().int().min(1).max(100).optional().default(0),
});

const academicGroupUpdate = academicGroupCreate.partial();

// Assignment Schemas
const assignmentCreate = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime(),
  maxScore: z.number().int().min(1).max(100).optional().default(100),
  groupId: z.string().uuid(),
  subject: z.string().min(1).max(100),
});

const assignmentUpdate = assignmentCreate.partial().omit({ groupId: true });

// Query parameters validation
const queryParams = z.object({
  q: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  offset: z.string().regex(/^\d+$/).transform(Number).optional().default('0'),
});

module.exports = {
  academicGroupCreate,
  academicGroupUpdate,
  assignmentCreate,
  assignmentUpdate,
  queryParams,
};