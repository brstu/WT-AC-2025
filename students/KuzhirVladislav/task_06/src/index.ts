import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import collectionRoutes from './routes/collection.routes';
import movieRoutes from './routes/movie.routes';
import collectionMovieRoutes from './routes/collectionMovie.routes';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/collection-movies', collectionMovieRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Collections API',
      version: '1.0.0',
      description: 'API for managing movie collections',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
