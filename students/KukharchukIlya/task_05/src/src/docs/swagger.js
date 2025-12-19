const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'REST API для библиотеки книг с системой отзывов',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Путь к файлам с JSDoc комментариями
};

module.exports = options;