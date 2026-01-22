// src/controllers/tasks.controller.js

import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../data/tasks.js";

import { AppError } from "../middleware/errors.js";

// Получение всех задач + фильтрация, поиск, пагинация
export function getTasks(req, res) {
  const { q, limit, offset, done } = req.query;

  let tasks = getAllTasks();

  // Фильтрация по статусу done
  if (done === "true") tasks = tasks.filter((t) => t.done === true);
  if (done === "false") tasks = tasks.filter((t) => t.done === false);

  // Поиск по подстроке в title
  if (q) {
    tasks = tasks.filter((t) =>
      t.title.toLowerCase().includes(q.toLowerCase())
    );
  }

  // Пагинация
  const total = tasks.length;
  const lim = limit ? parseInt(limit) : total;
  const off = offset ? parseInt(offset) : 0;

  const paged = tasks.slice(off, off + lim);

  res.json({
    total,
    limit: lim,
    offset: off,
    items: paged,
  });
}

// Получение задачи по id
export function getTask(req, res, next) {
  const { id } = req.params;

  const task = getTaskById(id);
  if (!task) return next(new AppError("Task not found", 404));

  res.json(task);
}

// Создание задачи
export function createTaskController(req, res, next) {
  try {
    const newTask = createTask(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
}

// Обновление задачи
export function updateTaskController(req, res, next) {
  const { id } = req.params;

  const updated = updateTask(id, req.body);

  if (!updated) return next(new AppError("Task not found", 404));

  res.json(updated);
}

// Удаление задачи
export function deleteTaskController(req, res, next) {
  const { id } = req.params;

  const ok = deleteTask(id);
  if (!ok) return next(new AppError("Task not found", 404));

  res.status(204).send();
}
