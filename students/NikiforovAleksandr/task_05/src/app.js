import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import leaguesRoutes from './routes/leagues.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/leagues', leaguesRoutes);
app.use('/api/v1/matches', matchesRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    message: 'Sports Leagues & Matches API',
    docs: '/docs'
  });
});


app.use(errorHandler);

export default app;
