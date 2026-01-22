require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const quizzesRouter = require('./routes/quizzes');
const resultsRouter = require('./routes/results');
const errorHandler = require('./utils/errorHandler');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quizzes/Polls API',
      version: '1.0.0',
      description: 'API для опросов и квизов с результатами'
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}/api/v1` }]
  },
  apis: ['./src/routes/*.js'] // файлы с @openapi комментариями
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1/quizzes', quizzesRouter);
app.use('/api/v1/results', resultsRouter);

// 404 handler
app.use('*', (req, res, next) => next(new (require('./utils/AppError'))(404, 'Route not found')));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. Docs: /docs`));