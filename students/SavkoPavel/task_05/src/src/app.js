import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import adsRoutes from './routes/ads.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger/openapi.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/ads', adsRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
