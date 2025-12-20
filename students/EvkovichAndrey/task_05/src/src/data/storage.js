import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('src/data/tasks.json');

let tasks = [];

async function loadTasks() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        tasks = JSON.parse(data);
    } catch (err) {
        tasks = [];
        await saveTasks();
    }
}

async function saveTasks() {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(tasks, null, 2));
}

loadTasks();

export { tasks, saveTasks };