const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const playlistsRoutes = require('./routes/playlists.routes');
const { notFound } = require('./middleware/not-found');
const { errorHandler } = require('./middleware/error-handler');
const { setupSwagger } = require('./docs/swagger');

async function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(morgan('dev'));

  app.use('/api/playlists', playlistsRoutes);

  setupSwagger(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
