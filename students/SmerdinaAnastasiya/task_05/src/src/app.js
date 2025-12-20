const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const booksRouter = require('./routes/books');
const reviewsRouter = require('./routes/reviews');
const errorHandler = require('./middleware/errorHandler');
const swaggerOptions = require('./docs/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Swagger документация
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/reviews', reviewsRouter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;