const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Portfolio API',
            version: '1.0.0',
            description: 'REST API для портфолио с проектами и кейсами',
        },
    },
    apis: ['./src/routes/*.js'], // путь к файлам с JSDoc-комментариями
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;