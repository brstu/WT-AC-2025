import { Router } from 'express';
import {
  addMovieToCollection,
  getCollectionMovies,
  updateCollectionMovie,
  deleteCollectionMovie,
} from '../controllers/collectionMovie.controller';
import authMiddleware from '../middleware/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: CollectionMovies
 *   description: Endpoints for managing movies in collections
 */

/**
 * @swagger
 * /collection-movies:
 *   post:
 *     summary: Add a movie to a collection
 *     tags: [CollectionMovies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 description: Role of the movie in the collection
 *               collectionId:
 *                 type: integer
 *                 description: ID of the collection
 *               movieId:
 *                 type: integer
 *                 description: ID of the movie
 *     responses:
 *       201:
 *         description: Movie added to collection
 */

const router = Router();

router.use(authMiddleware);

router.post('/', addMovieToCollection);
router.get('/:collectionId', getCollectionMovies);
router.put('/:id', updateCollectionMovie);
router.delete('/:id', deleteCollectionMovie);

export default router;
