const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Mock данные для задач
let tasks = [
    {
        id: '1',
        title: 'Завершить лабораторную работу',
        description: 'Реализовать трекер задач с тестами и Docker',
        dueDate: '2024-12-15',
        completed: false,
        priority: 'high',
        createdAt: '2024-11-01T10:00:00Z'
    },
    {
        id: '2',
        title: 'Подготовиться к экзамену',
        description: 'Изучить материалы по компьютерным наукам',
        dueDate: '2024-12-20',
        completed: true,
        priority: 'medium',
        createdAt: '2024-11-02T14:30:00Z'
    },
    {
        id: '3',
        title: 'Купить продукты',
        description: 'Молоко, яйца, хлеб, фрукты',
        dueDate: '2024-12-10',
        completed: false,
        priority: 'low',
        createdAt: '2024-11-03T09:15:00Z'
    },
    {
        id: '4',
        title: 'Написать отчет',
        description: 'Подготовить отчет о проделанной работе',
        dueDate: '2024-12-05',
        completed: false,
        priority: 'high',
        createdAt: '2024-11-04T16:45:00Z'
    },
    {
        id: '5',
        title: 'Посетить встречу',
        description: 'Встреча с командой разработки',
        dueDate: '2024-12-03',
        completed: true,
        priority: 'medium',
        createdAt: '2024-11-05T11:20:00Z'
    }
];

// Вспомогательные функции
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// API routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Tasks Tracker API',
        version: '1.0.0'
    });
});

// GET /api/tasks - Получить все задачи
app.get('/api/tasks', (req, res) => {
    const { completed, priority } = req.query;
    let result = [...tasks];

    if (completed !== undefined) {
        const isCompleted = completed === 'true';
        result = result.filter(task => task.completed === isCompleted);
    }

    if (priority) {
        result = result.filter(task => task.priority === priority);
    }

    res.json(result);
});

// GET /api/tasks/:id - Получить задачу по ID
app.get('/api/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ error: 'Задача не найдена' });
    }
});

// POST /api/tasks - Создать новую задачу
app.post('/api/tasks', (req, res) => {
    const { title, description, dueDate, priority = 'medium' } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Название задачи обязательно' });
    }

    const newTask = {
        id: generateId(),
        title: title.trim(),
        description: description ? description.trim() : '',
        dueDate: dueDate || null,
        completed: false,
        priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Обновить задачу
app.put('/api/tasks/:id', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }

    const { title, description, dueDate, completed, priority } = req.body;
    const updatedTask = { ...tasks[taskIndex] };

    if (title !== undefined) updatedTask.title = title.trim();
    if (description !== undefined) updatedTask.description = description ? description.trim() : '';
    if (dueDate !== undefined) updatedTask.dueDate = dueDate;
    if (completed !== undefined) updatedTask.completed = Boolean(completed);
    if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
        updatedTask.priority = priority;
    }

    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
});

// DELETE /api/tasks/:id - Удалить задачу
app.delete('/api/tasks/:id', (req, res) => {
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== req.params.id);
    
    if (tasks.length === initialLength) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    res.json({ success: true, message: 'Задача удалена' });
});

// PATCH /api/tasks/:id/toggle - Переключить статус выполнения
app.patch('/api/tasks/:id/toggle', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    res.json(tasks[taskIndex]);
});

// GET /api/stats - Получить статистику
app.get('/api/stats', (req, res) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    const priorityStats = {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length
    };
    
    res.json({
        total,
        completed,
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        priorityStats
    });
});

// Отдаем index.html для всех остальных маршрутов
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
    console.log(`✅ Трекер задач запущен на http://localhost:${PORT}`);
    console.log(`✅ API доступен на http://localhost:${PORT}/api/tasks`);
    console.log(`✅ Здоровье API: http://localhost:${PORT}/api/health`);
    console.log(`✅ Статистика: http://localhost:${PORT}/api/stats`);
    console.log(`\n📋 Доступно задач: ${tasks.length} (${tasks.filter(t => t.completed).length} выполнено)`);
});

module.exports = app;