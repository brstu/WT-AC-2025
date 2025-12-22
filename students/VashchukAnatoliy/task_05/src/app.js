// src/app.js

import express from "express";
import cors from "cors";
import morgan from "morgan";

import tasksRouter from "./routes/tasks.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { AppError } from "./middleware/errors.js";
import { swaggerUiMiddleware } from "./swagger.js";

const app = express();

// Основные middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI
app.use("/api-docs", ...swaggerUiMiddleware);

// Роуты
app.use("/api/v1/tasks", tasksRouter);

// 404 — всё, что не попало в маршруты
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// Централизованный обработчик ошибок
app.use(errorHandler);

export default app;
