const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const config = require('./config');
const routes = require('./routes');
const errorMiddleware = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(config.apiPrefix, routes);

app.use(errorMiddleware);

module.exports = app;