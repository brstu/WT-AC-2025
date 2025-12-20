const express = require('express');
const {
  getMuseums,
  getMuseumById,
  createMuseum,
  updateMuseum,
  deleteMuseum,
  getMuseumReviews,
} = require('../controllers/museums');
const validate = require('../middlewares/validate');
const { museumCreateSchema, museumUpdateSchema, querySchema } = require('../schemas/museum');

const router = express.Router();

/**
 * @swagger
 * /museums:
 *   get:
 *     tags:
 *       - Museums
 *     summary: Retrieve a list of museums
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by name
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
 *         description: A list of museums
 */
router.get('/', validate(querySchema, 'query'), getMuseums);

/**
 * @swagger
 * /museums/{id}:
 *   get:
 *     tags:
 *       - Museums
 *     summary: Get a museum by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The museum
 *       404:
 *         description: Museum not found
 */
router.get('/:id', getMuseumById);

/**
 * @swagger
 * /museums:
 *   post:
 *     tags:
 *       - Museums
 *     summary: Create a new museum
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               hours:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Museum created
 */
router.post('/', validate(museumCreateSchema, 'body'), createMuseum);

/**
 * @swagger
 * /museums/{id}:
 *   patch:
 *     tags:
 *       - Museums
 *     summary: Update a museum
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
 *         description: Museum updated
 */
router.patch('/:id', validate(museumUpdateSchema, 'body'), updateMuseum);

/**
 * @swagger
 * /museums/{id}:
 *   delete:
 *     tags:
 *       - Museums
 *     summary: Delete a museum
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Museum deleted
 */
router.delete('/:id', deleteMuseum);

/**
 * @swagger
 * /museums/{id}/reviews:
 *   get:
 *     tags:
 *       - Museums
 *     summary: Get reviews for a museum
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/:id/reviews', getMuseumReviews);

module.exports = router;
