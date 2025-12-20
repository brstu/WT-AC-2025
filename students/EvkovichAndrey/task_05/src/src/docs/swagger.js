import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task API',
            version: '1.0.0',
            description: 'REST API для управления задачами (ЛР №5)',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Локальный сервер' },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
