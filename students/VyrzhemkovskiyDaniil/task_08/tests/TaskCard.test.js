const TaskCard = require('../src/TaskCard');

describe('TaskCard Component Tests', () => {
    const mockTask = {
        id: '1',
        title: 'Тестовая задача',
        description: 'Описание тестовой задачи',
        dueDate: '2024-12-31',
        completed: false,
        priority: 'medium'
    };

    test('должен создать экземпляр TaskCard', () => {
        const taskCard = new TaskCard(mockTask);
        expect(taskCard).toBeInstanceOf(TaskCard);
        expect(taskCard.task).toEqual(mockTask);
    });

    test('должен отрендерить корректную HTML строку', () => {
        const taskCard = new TaskCard(mockTask);
        const html = taskCard.render();
        
        expect(html).toContain(`data-id="${mockTask.id}"`);
        expect(html).toContain(mockTask.title);
        expect(html).toContain(mockTask.description);
        expect(html).toContain('Ожидает');
        expect(html).toContain('Средний');
        expect(html).toContain('31 декабря 2024 г.');
    });

    test('должен отрендерить выполненную задачу', () => {
        const completedTask = { ...mockTask, completed: true };
        const taskCard = new TaskCard(completedTask);
        const html = taskCard.render();
        
        expect(html).toContain('completed');
        expect(html).toContain('Выполнена');
    });

    test('должен создать DOM элемент', () => {
        const taskCard = new TaskCard(mockTask);
        const element = taskCard.createElement();
        
        // Проверяем что элемент создан и имеет правильные свойства
        expect(element).toBeDefined();
        expect(typeof element).toBe('object');
        expect(element.innerHTML).toContain(mockTask.title);
        expect(element.innerHTML).toContain(mockTask.description);
    });

    test('должен обрабатывать задачу без даты выполнения', () => {
        const taskWithoutDate = { ...mockTask, dueDate: null };
        const taskCard = new TaskCard(taskWithoutDate);
        const html = taskCard.render();
        
        expect(html).toContain('Без срока');
    });

    test('должен обрабатывать задачу без описания', () => {
        const taskWithoutDesc = { ...mockTask, description: '' };
        const taskCard = new TaskCard(taskWithoutDesc);
        const html = taskCard.render();
        
        expect(html).toContain('Нет описания');
    });

    test('должен корректно преобразовывать приоритеты', () => {
        const taskCard = new TaskCard(mockTask);
        
        expect(taskCard.getPriorityText('low')).toBe('Низкий');
        expect(taskCard.getPriorityText('medium')).toBe('Средний');
        expect(taskCard.getPriorityText('high')).toBe('Высокий');
        expect(taskCard.getPriorityText('unknown')).toBe('unknown');
    });

    test('должен рендерить разные приоритеты', () => {
        const highPriorityTask = { ...mockTask, priority: 'high' };
        const taskCard = new TaskCard(highPriorityTask);
        const html = taskCard.render();
        
        expect(html).toContain('Высокий');
    });
});