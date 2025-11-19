const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const notesRouter = require('./routes/notes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notes API',
      version: '1.0.0',
      description: 'REST API для управления заметками с метками и архивом',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/notes', notesRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(errorHandler);

module.exports = app;