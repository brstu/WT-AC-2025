const express = require('express');
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupTasks,
} = require('../controllers/groups');
const validate = require('../middlewares/validate');
const { groupCreateSchema, groupUpdateSchema, querySchema } = require('../schemas/group');

const router = express.Router();

/**
 * @swagger
 * /groups:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Retrieve a list of groups
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
 *         description: Limit results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: A list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', validate(querySchema, 'query'), getGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get a group by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The group
 *       404:
 *         description: Group not found
 */
router.get('/:id', getGroupById);

/**
 * @swagger
 * /groups:
 *   post:
 *     tags:
 *       - Groups
 *     summary: Create a new group
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
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Group created
 */
router.post('/', validate(groupCreateSchema, 'body'), createGroup);

/**
 * @swagger
 * /groups/{id}:
 *   patch:
 *     tags:
 *       - Groups
 *     summary: Update a group
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Group updated
 *       404:
 *         description: Group not found
 */
router.patch('/:id', validate(groupUpdateSchema, 'body'), updateGroup);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     tags:
 *       - Groups
 *     summary: Delete a group
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Group deleted
 *       404:
 *         description: Group not found
 */
router.delete('/:id', deleteGroup);

/**
 * @swagger
 * /groups/{id}/tasks:
 *   get:
 *     tags:
 *       - Groups
 *     summary: Get tasks for a group
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 *       404:
 *         description: Group not found
 */
router.get('/:id/tasks', getGroupTasks);

module.exports = router;
