import { Router } from 'express';
import { getMovies, createMovie, updateMovie, deleteMovie } from '../controllers/movie.controller';
import authMiddleware from '../middleware/auth.middleware';
import prisma from '../prisma';

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Endpoints for managing movies
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies
 */

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details
 */

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Movie title
 *               description:
 *                 type: string
 *                 description: Movie description
 *     responses:
 *       201:
 *         description: Movie created
 */

const router = Router();

router.use(authMiddleware);

router.get('/', getMovies);
router.get('/:id', async (req, res) => {
  const movieId = parseInt(req.params.id, 10);
  if (Number.isNaN(movieId)) return res.status(400).json({ message: 'Invalid movie id' });

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: { collections: { include: { collection: true } } },
  });

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  interface CollectionResponse {
    id: number;
    title: string;
    role: string;
  }

  interface MovieResponse {
    id: number;
    title: string;
    year: number;
    genre: string;
    createdAt: Date;
    updatedAt: Date;
    collections: CollectionResponse[];
  }

  const collections: CollectionResponse[] = movie.collections.map(
    (cm: { collection: { id: number; title: string }; role: string }) => ({
      id: cm.collection.id,
      title: cm.collection.title,
      role: cm.role,
    })
  );

  res.json({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    genre: movie.genre,
    createdAt: movie.createdAt,
    updatedAt: movie.updatedAt,
    collections,
  });
});
router.post('/', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;
