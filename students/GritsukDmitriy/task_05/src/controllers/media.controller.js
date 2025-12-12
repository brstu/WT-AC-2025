const mediaService = require('../services/media.service');

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Get all media with optional filters
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, series]
 *         description: Filter by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: List of media with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 */
const getAllMedia = async (req, res, next) => {
  try {
    const result = await mediaService.getAll(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media ID
 *     responses:
 *       200:
 *         description: Media found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       404:
 *         description: Media not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getMediaById = async (req, res, next) => {
  try {
    const media = await mediaService.getById(req.params.id);
    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /media:
 *   post:
 *     summary: Create new media
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Media'
 *     responses:
 *       201:
 *         description: Media created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const createMedia = async (req, res, next) => {
  try {
    const newMedia = await mediaService.create(req.body);
    res.status(201).json(newMedia);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /media/{id}:
 *   patch:
 *     summary: Update media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media ID
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
 *               year:
 *                 type: integer
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [movie, series]
 *               rating:
 *                 type: number
 *               duration:
 *                 type: integer
 *               seasons:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Media updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       404:
 *         description: Media not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation error
 */
const updateMedia = async (req, res, next) => {
  try {
    const updatedMedia = await mediaService.update(req.params.id, req.body);
    res.status(200).json(updatedMedia);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media ID
 *     responses:
 *       204:
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const deleteMedia = async (req, res, next) => {
  try {
    await mediaService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /media/stats:
 *   get:
 *     summary: Get media statistics
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 movies:
 *                   type: integer
 *                 series:
 *                   type: integer
 *                 averageRating:
 *                   type: number
 *                 byGenre:
 *                   type: object
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await mediaService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /media/genres:
 *   get:
 *     summary: Get all available genres
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
const getGenres = async (req, res, next) => {
  try {
    const genres = await mediaService.getGenres();
    res.status(200).json(genres);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  getStats,
  getGenres
};