const express = require('express');
const { 
  assignmentCreate, 
  assignmentUpdate, 
  queryParams 
} = require('../validation/schemas');
const { validate, validateQuery } = require('../middleware/validate');
const dataStore = require('../data/store');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       required:
 *         - title
 *         - dueDate
 *         - groupId
 *         - subject
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: "Math Homework 1"
 *         description:
 *           type: string
 *         dueDate:
 *           type: string
 *           format: date-time
 *         maxScore:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         groupId:
 *           type: string
 *           format: uuid
 *         subject:
 *           type: string
 *           example: "Mathematics"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
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
 *         description: List of assignments
 */
router.get('/', validateQuery(queryParams), (req, res) => {
  let assignments = dataStore.getAllAssignments();
  
  // Search filter
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    assignments = assignments.filter(assignment => 
      assignment.title.toLowerCase().includes(query) ||
      assignment.subject.toLowerCase().includes(query) ||
      assignment.description?.toLowerCase().includes(query)
    );
  }
  
  // Pagination
  const limit = req.query.limit;
  const offset = req.query.offset;
  const paginatedAssignments = assignments.slice(offset, offset + limit);
  
  res.json({
    data: paginatedAssignments,
    total: assignments.length,
    limit,
    offset
  });
});

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 */
router.get('/:id', (req, res, next) => {
  const assignment = dataStore.getAssignmentById(req.params.id);
  if (!assignment) {
    const error = new Error('Assignment not found');
    error.status = 404;
    return next(error);
  }
  res.json({ data: assignment });
});

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create a new assignment
 *     tags: [Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       422:
 *         description: Validation error
 */
router.post('/', validate(assignmentCreate), (req, res, next) => {
  // Check if group exists
  const group = dataStore.getGroupById(req.body.groupId);
  if (!group) {
    const error = new Error('Academic group not found');
    error.status = 404;
    return next(error);
  }

  const assignment = dataStore.createAssignment(req.body);
  res.status(201).json({ data: assignment });
});

/**
 * @swagger
 * /api/assignments/{id}:
 *   patch:
 *     summary: Update assignment
 *     tags: [Assignments]
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
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       200:
 *         description: Assignment updated
 *       404:
 *         description: Assignment not found
 */
router.patch('/:id', validate(assignmentUpdate), (req, res, next) => {
  const assignment = dataStore.updateAssignment(req.params.id, req.body);
  if (!assignment) {
    const error = new Error('Assignment not found');
    error.status = 404;
    return next(error);
  }
  res.json({ data: assignment });
});

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete assignment
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Assignment deleted successfully
 *       404:
 *         description: Assignment not found
 */
router.delete('/:id', (req, res, next) => {
  const deleted = dataStore.deleteAssignment(req.params.id);
  if (!deleted) {
    const error = new Error('Assignment not found');
    error.status = 404;
    return next(error);
  }
  res.status(204).send();
});

/**
 * @swagger
 * /api/assignments/group/{groupId}:
 *   get:
 *     summary: Get assignments by group
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assignments for the group
 *       404:
 *         description: Group not found
 */
router.get('/group/:groupId', (req, res, next) => {
  const group = dataStore.getGroupById(req.params.groupId);
  if (!group) {
    const error = new Error('Academic group not found');
    error.status = 404;
    return next(error);
  }

  const assignments = dataStore.getAssignmentsByGroup(req.params.groupId);
  res.json({ data: assignments });
});

module.exports = router;