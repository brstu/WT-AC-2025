const express = require('express');
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');
const validate = require('../middlewares/validate');
const { reviewCreateSchema, reviewUpdateSchema, querySchema } = require('../schemas/review');

const router = express.Router();

/**
 * @swagger
 * /reviews:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Retrieve a list of reviews
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by review text
 *       - in: query
 *         name: museumId
 *         schema:
 *           type: string
 *         description: Filter by museum ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of reviews
 */
router.get('/', validate(querySchema, 'query'), getReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get a review by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The review
 *       404:
 *         description: Review not found
 */
router.get('/:id', getReviewById);

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a new review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               museumId:
 *                 type: string
 *               rating:
 *                 type: integer
 *               text:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/', validate(reviewCreateSchema, 'body'), createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update a review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Review updated
 */
router.patch('/:id', validate(reviewUpdateSchema, 'body'), updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Review deleted
 */
router.delete('/:id', deleteReview);

module.exports = router;
