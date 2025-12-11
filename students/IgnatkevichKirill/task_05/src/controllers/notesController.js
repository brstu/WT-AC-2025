const notesStorage = require('../utils/notesStorage');
const { NotFoundError } = require('../middleware/errorHandler');

const notesController = {
  /**
   * @swagger
   * /notes:
   *   get:
   *     summary: Get all notes with filtering and pagination
   *     tags: [Notes]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search query in title and content
   *       - in: query
   *         name: tags
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *         description: Filter by tags
   *       - in: query
   *         name: isArchived
   *         schema:
   *           type: boolean
   *         description: Filter by archive status
   *       - in: query
   *         name: isDone
   *         schema:
   *           type: boolean
   *         description: Filter by done status
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of notes per page
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Number of notes to skip
   *     responses:
   *       200:
   *         description: Successfully retrieved notes
   */
  getAllNotes: (req, res, next) => {
    try {
      const result = notesStorage.getAll(req.query);
      res.json({
        success: true,
        data: result.notes,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.hasMore
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /notes/{id}:
   *   get:
   *     summary: Get a note by ID
   *     tags: [Notes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Note ID
   *     responses:
   *       200:
   *         description: Successfully retrieved note
   *       404:
   *         description: Note not found
   */
  getNoteById: (req, res, next) => {
    try {
      const note = notesStorage.getById(parseInt(req.params.id));
      if (!note) {
        throw new NotFoundError('Note');
      }
      res.json({
        success: true,
        data: note
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /notes:
   *   post:
   *     summary: Create a new note
   *     tags: [Notes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - content
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *               content:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               dueDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Note created successfully
   *       400:
   *         description: Validation error
   */
  createNote: (req, res, next) => {
    try {
      const newNote = notesStorage.create(req.validatedData);
      res.status(201).json({
        success: true,
        data: newNote
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /notes/{id}:
   *   put:
   *     summary: Update a note
   *     tags: [Notes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Note ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *               content:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               dueDate:
   *                 type: string
   *                 format: date-time
   *               isArchived:
   *                 type: boolean
   *               isDone:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Note updated successfully
   *       404:
   *         description: Note not found
   */
  updateNote: (req, res, next) => {
    try {
      const updatedNote = notesStorage.update(parseInt(req.params.id), req.validatedData);
      if (!updatedNote) {
        throw new NotFoundError('Note');
      }
      res.json({
        success: true,
        data: updatedNote
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /notes/{id}:
   *   delete:
   *     summary: Delete a note
   *     tags: [Notes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Note ID
   *     responses:
   *       204:
   *         description: Note deleted successfully
   *       404:
   *         description: Note not found
   */
  deleteNote: (req, res, next) => {
    try {
      const deleted = notesStorage.delete(parseInt(req.params.id));
      if (!deleted) {
        throw new NotFoundError('Note');
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /notes/{id}/archive:
   *   patch:
   *     summary: Archive a note
   *     tags: [Notes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Note ID
   *     responses:
   *       200:
   *         description: Note archived successfully
   *       404:
   *         description: Note not found
   */
  archiveNote: (req, res, next) => {
    try {
      const archivedNote = notesStorage.archive(parseInt(req.params.id));
      if (!archivedNote) {
        throw new NotFoundError('Note');
      }
      res.json({
        success: true,
        data: archivedNote
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /notes/{id}/unarchive:
   *   patch:
   *     summary: Unarchive a note
   *     tags: [Notes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Note ID
   *     responses:
   *       200:
   *         description: Note unarchived successfully
   *       404:
   *         description: Note not found
   */
  unarchiveNote: (req, res, next) => {
    try {
      const unarchivedNote = notesStorage.unarchive(parseInt(req.params.id));
      if (!unarchivedNote) {
        throw new NotFoundError('Note');
      }
      res.json({
        success: true,
        data: unarchivedNote
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notesController;