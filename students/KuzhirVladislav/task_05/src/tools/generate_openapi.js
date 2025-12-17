const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

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
        url: `http://localhost:3000/api`,
        description: 'Local server',
      },
    ],
    tags: [
      { name: 'Groups', description: 'Operations related to groups' },
      { name: 'Tasks', description: 'Operations related to tasks' },
      { name: 'Grades', description: 'Operations related to grades' },
    ],
  },
  apis: [
    path.join(__dirname, '..', 'routes', '*.js'),
    path.join(__dirname, '..', 'schemas', '*.js'),
  ],
};

try {
  const specs = swaggerJsdoc(swaggerOptions);
  console.log(JSON.stringify(specs, null, 2));
} catch (err) {
  console.error('Failed to generate swagger specs:', err);
  process.exit(1);
}
