const express = require('express');
const router = express.Router();
const controller = require('../controllers/albumController');

/**
 * @openapi
 * /api/v1/albums:
 *   get:
 *     summary: Get list of albums
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for title or artist
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: list of albums
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /api/v1/albums/{id}:
 *   get:
 *     summary: Get album by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: album object
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /api/v1/albums:
 *   post:
 *     summary: Create a new album
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       201:
 *         description: created album
 */
router.post('/', controller.create);

/**
 * @openapi
 * /api/v1/albums/{id}:
 *   put:
 *     summary: Update an album
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Album'
 *     responses:
 *       200:
 *         description: updated album
 */
router.put('/:id', controller.update);

/**
 * @openapi
 * /api/v1/albums/{id}:
 *   delete:
 *     summary: Delete an album
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: deleted
 */
router.delete('/:id', controller.remove);

module.exports = router;
