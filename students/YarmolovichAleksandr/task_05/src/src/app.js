const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const reviewsRouter = require('./routes/reviews');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Routes
app.use('/reviews', reviewsRouter);

// Swagger Documentation
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Places Reviews API',
      version: '1.0.0',
      description: 'A simple REST API for managing place reviews',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;