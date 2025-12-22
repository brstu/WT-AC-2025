const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Recipes API 2.0',
            version: '1.0.0',
            description: 'REST API кулинарных рецептов с ингредиентами и категориями',
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;