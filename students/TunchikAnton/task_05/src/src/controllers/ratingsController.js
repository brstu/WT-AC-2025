const ApiError = require('../utils/ApiError');

// In-memory storage (temporary)
let ratings = [];
let idCounter = 1;

const ratingsController = {
  /**
   * @swagger
   * /api/v1/ratings:
   *   get:
   *     summary: Get all ratings with filtering and pagination
   *     tags: [Ratings]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Search term
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [movies, games, books, music, other]
   *         description: Filter by category
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Number of items to skip
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [title, rating, createdAt, dueDate]
   *           default: createdAt
   *         description: Field to sort by
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order
   *     responses:
   *       200:
   *         description: List of ratings
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Rating'
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
  getAllRatings(req, res, next) {
    try {
      const {
        q,
        category,
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      let filteredRatings = [...ratings];

      // Search
      if (q) {
        const searchTerm = q.toLowerCase();
        filteredRatings = filteredRatings.filter(rating =>
          rating.title.toLowerCase().includes(searchTerm) ||
          (rating.description && rating.description.toLowerCase().includes(searchTerm))
        );
      }

      // Filter by category
      if (category) {
        filteredRatings = filteredRatings.filter(rating => rating.category === category);
      }

      // Sort
      filteredRatings.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

      // Paginate
      const paginatedRatings = filteredRatings.slice(offset, offset + limit);

      res.json({
        status: 'success',
        data: paginatedRatings,
        meta: {
          total: filteredRatings.length,
          limit,
          offset,
          hasMore: offset + limit < filteredRatings.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /api/v1/ratings/{id}:
   *   get:
   *     summary: Get rating by ID
   *     tags: [Ratings]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Rating ID
   *     responses:
   *       200:
   *         description: Rating found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Rating'
   *       404:
   *         description: Rating not found
   */
  getRatingById(req, res, next) {
    try {
      const rating = ratings.find(r => r.id === parseInt(req.params.id));
      
      if (!rating) {
        throw new ApiError(404, 'Rating not found');
      }

      res.json({
        status: 'success',
        data: rating
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /api/v1/ratings:
   *   post:
   *     summary: Create a new rating
   *     tags: [Ratings]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateRating'
   *     responses:
   *       201:
   *         description: Rating created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Rating'
   *       422:
   *         description: Validation error
   */
  createRating(req, res, next) {
    try {
      const newRating = {
        id: idCounter++,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      ratings.push(newRating);

      res.status(201).json({
        status: 'success',
        data: newRating
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /api/v1/ratings/{id}:
   *   patch:
   *     summary: Update rating by ID
   *     tags: [Ratings]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Rating ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateRating'
   *     responses:
   *       200:
   *         description: Rating updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Rating'
   *       404:
   *         description: Rating not found
   */
  updateRating(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const ratingIndex = ratings.findIndex(r => r.id === id);
      
      if (ratingIndex === -1) {
        throw new ApiError(404, 'Rating not found');
      }

      const updatedRating = {
        ...ratings[ratingIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      ratings[ratingIndex] = updatedRating;

      res.json({
        status: 'success',
        data: updatedRating
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @swagger
   * /api/v1/ratings/{id}:
   *   delete:
   *     summary: Delete rating by ID
   *     tags: [Ratings]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Rating ID
   *     responses:
   *       204:
   *         description: Rating deleted successfully
   *       404:
   *         description: Rating not found
   */
  deleteRating(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const ratingIndex = ratings.findIndex(r => r.id === id);
      
      if (ratingIndex === -1) {
        throw new ApiError(404, 'Rating not found');
      }

      ratings.splice(ratingIndex, 1);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ratingsController;