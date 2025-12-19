require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const albumRoutes = require('./routes/albumRoutes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Albums API',
    version: '1.0.0',
    description: 'Simple Albums CRUD API'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
    }
  ]
};
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/schemas/*.js'],
};
const swaggerSpec = swaggerJsdoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/albums', albumRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Docs available at http://localhost:${PORT}/docs`);
});
