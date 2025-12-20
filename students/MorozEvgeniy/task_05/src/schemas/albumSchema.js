const { z } = require('zod');

/**
 * @openapi
 * components:
 *   schemas:
 *     Album:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         artist:
 *           type: string
 *         year:
 *           type: integer
 *         genre:
 *           type: string
 */

const baseAlbum = {
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  year: z.number().int().gte(1900, 'Year seems invalid'),
  genre: z.string().optional()
};

const createAlbumSchema = z.object(baseAlbum);
const updateAlbumSchema = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().min(1).optional(),
  year: z.number().int().gte(1900).optional(),
  genre: z.string().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

module.exports = {
  createAlbumSchema,
  updateAlbumSchema
};
