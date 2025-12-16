// src/middleware/error-handler.js

import { AppError, ValidationError } from "./errors.js";
import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  // Zod -> наш ValidationError
  if (err instanceof ZodError) {
    err = new ValidationError("Validation error", err.errors);
  }

  // Если не AppError — сделаем Internal Error
  if (!(err instanceof AppError)) {
    err = new AppError(err.message || "Internal Server Error", 500);
  }

  const status = err.status || 500;

  const response = {
    message: err.message,
  };

  if (err.details) {
    response.details = err.details;
  }

  return res.status(status).json(response);
}
