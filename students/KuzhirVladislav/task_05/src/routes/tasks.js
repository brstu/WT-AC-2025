const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskGrades,
} = require('../controllers/tasks');
const validate = require('../middlewares/validate');
const { taskCreateSchema, taskUpdateSchema, querySchema } = require('../schemas/task');

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Retrieve a list of tasks
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by title
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
 *         description: A list of tasks
 */
router.get('/', validate(querySchema, 'query'), getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: The task
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTaskById);

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               done:
 *                 type: boolean
 *               groupId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', validate(taskCreateSchema, 'body'), createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update a task
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
 *         description: Task updated
 */
router.patch('/:id', validate(taskUpdateSchema, 'body'), updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204:
 *         description: Task deleted
 */
router.delete('/:id', deleteTask);

/**
 * @swagger
 * /tasks/{id}/grades:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get grades for a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: List of grades
 */
router.get('/:id/grades', getTaskGrades);

module.exports = router;
