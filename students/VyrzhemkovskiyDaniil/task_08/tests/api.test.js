const request = require('supertest');

// Создаем тестовый сервер
const createTestServer = () => {
    const express = require('express');
    const app = express();
    
    // Начальные данные для каждого теста
    let tasks = [
        {
            id: '1',
            title: 'Завершить лабораторную работу',
            description: 'Реализовать трекер задач',
            dueDate: '2024-12-15',
            completed: false,
            priority: 'high',
            createdAt: '2024-11-01T10:00:00Z'
        },
        {
            id: '2',
            title: 'Купить продукты',
            description: 'Молоко, яйца, хлеб',
            dueDate: '2024-12-10',
            completed: true,
            priority: 'low',
            createdAt: '2024-11-02T14:30:00Z'
        }
    ];

    const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

    app.use(require('cors')());
    app.use(express.json());

    app.get('/api/health', (req, res) => {
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            service: 'Tasks Tracker API'
        });
    });

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

    app.get('/api/tasks/:id', (req, res) => {
        const task = tasks.find(t => t.id === req.params.id);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: 'Задача не найдена' });
        }
    });

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
            priority: priority,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        res.status(201).json(newTask);
    });

    app.put('/api/tasks/:id', (req, res) => {
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }

        const updatedTask = { ...tasks[taskIndex], ...req.body };
        tasks[taskIndex] = updatedTask;
        res.json(updatedTask);
    });

    app.delete('/api/tasks/:id', (req, res) => {
        const initialLength = tasks.length;
        tasks = tasks.filter(t => t.id !== req.params.id);
        
        if (tasks.length === initialLength) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        res.json({ success: true, message: 'Задача удалена' });
    });

    app.patch('/api/tasks/:id/toggle', (req, res) => {
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Задача не найдена' });
        }
        
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        res.json(tasks[taskIndex]);
    });

    app.get('/api/stats', (req, res) => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        res.json({
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        });
    });

    return app;
};

describe('Tasks API Tests', () => {
    let app;

    beforeEach(() => {
        // Создаем новый сервер для каждого теста
        app = createTestServer();
    });

    test('должен вернуть статус здоровья', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('service', 'Tasks Tracker API');
    });

    test('должен вернуть все задачи', async () => {
        const response = await request(app).get('/api/tasks');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
        expect(response.body[0]).toHaveProperty('completed');
    });

    test('должен отфильтровать задачи по статусу', async () => {
        const response = await request(app).get('/api/tasks?completed=false');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].completed).toBe(false);
    });

    test('должен получить задачу по ID', async () => {
        const response = await request(app).get('/api/tasks/1');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', '1');
        expect(response.body).toHaveProperty('title', 'Завершить лабораторную работу');
    });

    test('должен вернуть 404 для несуществующей задачи', async () => {
        const response = await request(app).get('/api/tasks/999');
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Задача не найдена');
    });

    test('должен создать новую задачу', async () => {
        const newTask = {
            title: 'Новая тестовая задача',
            description: 'Описание для теста',
            dueDate: '2024-12-25',
            priority: 'high'
        };

        const response = await request(app)
            .post('/api/tasks')
            .send(newTask);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newTask.title);
        expect(response.body.completed).toBe(false);
        expect(response.body.priority).toBe('high');
    });

    test('должен требовать название задачи при создании', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .send({ description: 'Без названия' });
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Название задачи обязательно');
    });

    test('должен обновить задачу', async () => {
        const updates = {
            title: 'Обновленное название',
            completed: true
        };

        const response = await request(app)
            .put('/api/tasks/1')
            .send(updates);
        
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updates.title);
        expect(response.body.completed).toBe(true);
    });

    test('должен удалить задачу', async () => {
        const response = await request(app).delete('/api/tasks/2');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        
        // Проверяем, что задача удалена
        const getResponse = await request(app).get('/api/tasks/2');
        expect(getResponse.status).toBe(404);
    });

    test('должен переключить статус задачи', async () => {
        // Получаем текущий статус задачи с ID 1
        const getResponse = await request(app).get('/api/tasks/1');
        const initialStatus = getResponse.body.completed;
        
        const response = await request(app)
            .patch('/api/tasks/1/toggle');
        
        expect(response.status).toBe(200);
        expect(response.body.completed).toBe(!initialStatus);
    });

    test('должен вернуть статистику', async () => {
        const response = await request(app).get('/api/stats');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('completed');
        expect(response.body).toHaveProperty('pending');
        expect(response.body).toHaveProperty('completionRate');
        
        expect(typeof response.body.total).toBe('number');
        expect(typeof response.body.completed).toBe('number');
        expect(typeof response.body.pending).toBe('number');
    });
});