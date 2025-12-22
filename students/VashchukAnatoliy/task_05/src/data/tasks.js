// src/data/tasks.js

// Временное хранилище (память)
let tasks = [
  {
    id: "1",
    title: "Learn Node.js",
    done: false,
    dueDate: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Write REST API",
    done: false,
    dueDate: "2025-02-10T00:00:00.000Z",
  },
];

// Генерация ID (простая)
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// CRUD-функции
export function getAllTasks() {
  return tasks;
}

export function getTaskById(id) {
  return tasks.find((t) => t.id === id) || null;
}

export function createTask(data) {
  const newTask = {
    id: generateId(),
    ...data,
  };
  tasks.push(newTask);
  return newTask;
}

export function updateTask(id, data) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...data,
  };

  return tasks[index];
}

export function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
}
