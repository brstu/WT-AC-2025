const { z } = require('zod');

const fileMetadataSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isPublic: z.boolean().default(false)
});

const permissionSchema = z.object({
  userId: z.string().min(1),
  canRead: z.boolean().default(false),
  canWrite: z.boolean().default(false),
  canDelete: z.boolean().default(false)
});

const fileUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isPublic: z.boolean().optional()
});

const filePermissionsUpdateSchema = z.object({
  permissions: z.array(permissionSchema)
});

const querySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  ownerId: z.string().optional(),
  isPublic: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, {
    message: 'Limit must be between 1 and 100'
  }).optional().default('20'),
  offset: z.string().transform(val => parseInt(val, 10)).refine(val => val >= 0, {
    message: 'Offset must be >= 0'
  }).optional().default('0')
});

module.exports = {
  fileMetadataSchema,
  fileUpdateSchema,
  filePermissionsUpdateSchema,
  querySchema
};