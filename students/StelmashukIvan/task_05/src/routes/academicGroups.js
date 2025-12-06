const express = require('express');
const { 
  academicGroupCreate, 
  academicGroupUpdate, 
  queryParams 
} = require('../validation/schemas');
const { validate, validateQuery } = require('../middleware/validate');
const dataStore = require('../data/store');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AcademicGroup:
 *       type: object
 *       required:
 *         - name
 *         - course
 *         - faculty
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "CS-101"
 *         course:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *         faculty:
 *           type: string
 *           example: "Computer Science"
 *         studentCount:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all academic groups
 *     tags: [Academic Groups]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of academic groups
 */
router.get('/', validateQuery(queryParams), (req, res) => {
  let groups = dataStore.getAllGroups();
  
  // Search filter
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    groups = groups.filter(group => 
      group.name.toLowerCase().includes(query) ||
      group.faculty.toLowerCase().includes(query)
    );
  }
  
  // Pagination
  const limit = req.query.limit;
  const offset = req.query.offset;
  const paginatedGroups = groups.slice(offset, offset + limit);
  
  res.json({
    data: paginatedGroups,
    total: groups.length,
    limit,
    offset
  });
});

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get academic group by ID
 *     tags: [Academic Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Academic group details
 *       404:
 *         description: Group not found
 */
router.get('/:id', (req, res, next) => {
  const group = dataStore.getGroupById(req.params.id);
  if (!group) {
    const error = new Error('Academic group not found');
    error.status = 404;
    return next(error);
  }
  res.json({ data: group });
});

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new academic group
 *     tags: [Academic Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcademicGroup'
 *     responses:
 *       201:
 *         description: Academic group created successfully
 *       422:
 *         description: Validation error
 */
router.post('/', validate(academicGroupCreate), (req, res) => {
  const group = dataStore.createGroup(req.body);
  res.status(201).json({ data: group });
});

/**
 * @swagger
 * /api/groups/{id}:
 *   patch:
 *     summary: Update academic group
 *     tags: [Academic Groups]
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
 *             $ref: '#/components/schemas/AcademicGroup'
 *     responses:
 *       200:
 *         description: Academic group updated
 *       404:
 *         description: Group not found
 */
router.patch('/:id', validate(academicGroupUpdate), (req, res, next) => {
  const group = dataStore.updateGroup(req.params.id, req.body);
  if (!group) {
    const error = new Error('Academic group not found');
    error.status = 404;
    return next(error);
  }
  res.json({ data: group });
});

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete academic group
 *     tags: [Academic Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 */
router.delete('/:id', (req, res, next) => {
  const deleted = dataStore.deleteGroup(req.params.id);
  if (!deleted) {
    const error = new Error('Academic group not found');
    error.status = 404;
    return next(error);
  }
  res.status(204).send();
});

module.exports = router;