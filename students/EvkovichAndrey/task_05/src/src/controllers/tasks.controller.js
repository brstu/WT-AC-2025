import { tasks, saveTasks } from '../data/storage.js';

let nextId = () => Date.now();

export const getTasks = async (req, res) => {
    const { q, limit = 10, offset = 0 } = req.query;

    let filtered = tasks;
    if (q) {
        const term = q.toLowerCase();
        filtered = tasks.filter(t => t.title.toLowerCase().includes(term));
    }

    const total = filtered.length;
    const paginated = filtered.slice(+offset, +offset + +limit);

    res.json({
        data: paginated,
        meta: { total, limit: +limit, offset: +offset, q }
    });
};

export const getTaskById = (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) throw createError(404, 'Задача не найдена');
    res.json(task);
};

export const createTask = async (req, res) => {
    const taskData = req.validatedBody;
    const newTask = {
        id: String(nextId()),
        ...taskData,
        createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    await saveTasks();
    res.status(201).json(newTask);
};

export const updateTask = async (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) throw createError(404, 'Задача не найдена');

    tasks[index] = { ...tasks[index], ...req.validatedBody };
    await saveTasks();
    res.json(tasks[index]);
};

export const deleteTask = async (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) throw createError(404, 'Задача не найдена');

    tasks.splice(index, 1);
    await saveTasks();
    res.status(204).send();
};

// Утилита для ошибок
export function createError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}