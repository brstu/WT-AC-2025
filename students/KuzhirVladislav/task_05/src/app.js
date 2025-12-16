require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes/index');

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', routes);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Educational API',
      version: '1.0.0',
      description: 'RESTful API for managing educational groups, tasks, and grades',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Local server',
      },
    ],
    tags: [
      { name: 'Groups', description: 'Operations related to groups' },
      { name: 'Tasks', description: 'Operations related to tasks' },
      { name: 'Grades', description: 'Operations related to grades' },
    ],
  },
  apis: [path.join(__dirname, 'routes', '*.js'), path.join(__dirname, 'schemas', '*.js')],
};

let specs;
try {
  specs = swaggerJsdoc(swaggerOptions);
} catch (err) {
  console.error('Failed to generate swagger specs:', err);
  specs = { openapi: '3.0.0', info: { title: 'API', version: '0.0.0' }, paths: {} };
}

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
    },
  })
);

app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.use(errorHandler);

const dataService = require('./services/dataService');

const start = async () => {
  try {
    await dataService.initData();
  } catch (err) {
    console.error('Failed to initialize data:', err);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  });
};

start();

module.exports = app;
