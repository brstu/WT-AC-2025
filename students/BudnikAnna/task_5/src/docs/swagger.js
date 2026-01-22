const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

function buildOpenApiSpec() {
  const options = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'Playlist API (Variant 27)',
        version: '1.0.0',
        description:
          'Lab API: playlists/music. Fields kept per requirements: title (1..100), done (boolean), dueDate (ISO date YYYY-MM-DD).'
      },
      servers: [{ url: 'http://localhost:3000' }]
    },
    apis: ['src/routes/*.js']
  };

  return swaggerJsdoc(options);
}

function setupSwagger(app) {
  const spec = buildOpenApiSpec();
  app.get('/openapi.json', (req, res) => res.json(spec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { setupSwagger, buildOpenApiSpec };
