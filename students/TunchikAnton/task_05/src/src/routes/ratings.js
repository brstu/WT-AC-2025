const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratingsController');
const { validate, validateQuery } = require('../middleware/validate');
const { ratingSchema, updateRatingSchema, querySchema } = require('../schemas/ratingSchema');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       required:
 *         - title
 *         - rating
 *         - category
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Rating title
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Optional description
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *           description: Rating value (0-10)
 *         category:
 *           type: string
 *           enum: [movies, games, books, music, other]
 *           description: Category
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *           description: Tags for filtering
 *         isPublic:
 *           type: boolean
 *           default: true
 *           description: Visibility flag
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Optional due date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CreateRating:
 *       type: object
 *       required:
 *         - title
 *         - rating
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         category:
 *           type: string
 *           enum: [movies, games, books, music, other]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *         isPublic:
 *           type: boolean
 *           default: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *     UpdateRating:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 500
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         category:
 *           type: string
 *           enum: [movies, games, books, music, other]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *         isPublic:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           format: date-time
 */

router.get('/', validateQuery(querySchema), ratingsController.getAllRatings);

router.get('/:id', ratingsController.getRatingById);

router.post('/', validate(ratingSchema), ratingsController.createRating);

router.patch('/:id', validate(updateRatingSchema), ratingsController.updateRating);

router.delete('/:id', ratingsController.deleteRating);

module.exports = router;