/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: API для управления задачами
 */

// src/routes/tasks.routes.js

import { Router } from "express";

import { validate } from "../middleware/validate.js";
import { createTaskSchema, updateTaskSchema } from "../validation/task.schema.js";

import {
  getTasks,
  getTask,
  createTaskController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/tasks.controller.js";

const router = Router();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Получить список задач
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Поиск по названию
 *       - in: query
 *         name: done
 *         schema:
 *           type: boolean
 *         description: Фильтр по статусу
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество элементов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Смещение для пагинации
 *     responses:
 *       200:
 *         description: Список задач
 */
router.get("/", getTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Получить задачу по её ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID задачи
 *     responses:
 *       200:
 *         description: Задача найдена
 *       404:
 *         description: Задача не найдена
 */
router.get("/:id", getTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Создать новую задачу
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Купити молоко
 *               done:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Задача создана
 */
router.post("/", validate(createTaskSchema), createTaskController);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Обновить задачу по ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID задачи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Нове завдання
 *               done:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Задача обновлена
 *       404:
 *         description: Задача не найдена
 */
router.put("/:id", validate(updateTaskSchema), updateTaskController);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Удалить задачу по ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID задачи
 *     responses:
 *       204:
 *         description: Задача удалена
 *       404:
 *         description: Задача не найдена
 */
router.delete("/:id", deleteTaskController);

export default router;
