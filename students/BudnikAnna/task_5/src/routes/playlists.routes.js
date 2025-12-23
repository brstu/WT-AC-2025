const express = require('express');
const controller = require('../controllers/playlists.controller');

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       required: [id, title, done, createdAt, updatedAt]
 *       properties:
 *         id:
 *           type: string
 *           example: "b6caa67e-9f2b-4ed9-8be2-6e9ac0c1c0a1"
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Chill Electronic — Night Ride"
 *         done:
 *           type: boolean
 *           example: false
 *         dueDate:
 *           type: string
 *           nullable: true
 *           description: "ISO date (YYYY-MM-DD)"
 *           example: "2026-01-10"
 *         createdAt:
 *           type: string
 *           example: "2025-12-22T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           example: "2025-12-22T00:00:00.000Z"
 *
 *     PlaylistCreate:
 *       type: object
 *       required: [title]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         done:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           description: "ISO date (YYYY-MM-DD)"
 *           nullable: true
 *
 *     PlaylistPut:
 *       type: object
 *       required: [title, done]
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         done:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           description: "ISO date (YYYY-MM-DD)"
 *           nullable: true
 *
 *     PlaylistUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         done:
 *           type: boolean
 *         dueDate:
 *           type: string
 *           description: "ISO date (YYYY-MM-DD)"
 *           nullable: true
 */

/**
 * @openapi
 * /api/playlists:
 *   get:
 *     summary: List playlists (search + pagination)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by title substring
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 0, maximum: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0, minimum: 0 }
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlaylistCreate' }
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation error
 */
router.get('/', controller.list);
router.post('/', controller.create);

/**
 * @openapi
 * /api/playlists/{id}:
 *   get:
 *     summary: Get playlist by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *   put:
 *     summary: Replace playlist (PUT)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlaylistPut' }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation error
 *   patch:
 *     summary: Partial update playlist (PATCH)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PlaylistUpdate' }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation error
 *   delete:
 *     summary: Delete playlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: Not found
 */
router.get('/:id', controller.getById);
router.put('/:id', controller.replace);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.remove);

module.exports = router;
