// src/swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Tasks API",
    version: "1.0.0",
    description: "REST API для управления задачами (ЛР-05)",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
};

const options = {
  definition: swaggerDefinition,   // <-- ВАЖНО (было swaggerDefinition)
  apis: ["./routes/*.js", "./controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiMiddleware = [
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
];
