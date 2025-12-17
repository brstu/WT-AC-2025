import { Router } from 'express';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../controllers/collection.controller';
import authMiddleware from '../middleware/auth.middleware';
import prisma from '../prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Endpoints for managing collections
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get all collections
 *     tags: [Collections]
 *     responses:
 *       200:
 *         description: List of collections
 */

/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Collection title
 *               description:
 *                 type: string
 *                 description: Collection description
 *     responses:
 *       201:
 *         description: Collection created
 */

router.use(authMiddleware);

router.get('/', getCollections);
router.get('/:id', async (req, res) => {
  const collectionId = parseInt(req.params.id, 10);
  if (Number.isNaN(collectionId)) return res.status(400).json({ message: 'Invalid collection id' });

  interface MovieInCollection {
    id: number;
    title: string;
    year: number | null;
    genre: string | null;
    role: string;
  }

  interface CollectionResponse {
    id: number;
    title: string;
    description: string | null;
    ownerId: number;
    createdAt: Date;
    updatedAt: Date;
    movies: MovieInCollection[];
  }

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { movies: { include: { movie: true } } },
  });
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }

  const movies: MovieInCollection[] = collection.movies.map(
    (cm: { movie: { id: any; title: any; year: any; genre: any }; role: any }) => ({
      id: cm.movie.id,
      title: cm.movie.title,
      year: cm.movie.year,
      genre: cm.movie.genre,
      role: cm.role,
    })
  );

  const response: CollectionResponse = {
    id: collection.id,
    title: collection.title,
    description: collection.description,
    ownerId: collection.ownerId,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    movies,
  };

  res.json(response);
});
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

export default router;
