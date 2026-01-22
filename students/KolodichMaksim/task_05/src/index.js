require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const eventsRouter = require('./routes/events');
const registrationsRouter = require('./routes/registrations');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API (Афиша с регистрациями)',
      version: '1.0.0',
      description: 'REST API для управления событиями и регистрациями',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}/api/v1` }],
  },
  apis: ['./src/routes/*.js'], // файлы с JSDoc комментариями
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API с версионированием
app.use('/api/v1', eventsRouter);
app.use('/api/v1', registrationsRouter);

// Централизованный обработчик ошибок (должен быть последним)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/docs`);
});