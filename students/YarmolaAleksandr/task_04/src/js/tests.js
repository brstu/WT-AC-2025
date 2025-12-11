/**
 * Автоматизированные тесты для задания 04
 * 
 * Запуск тестов: откройте tests.html в браузере или запустите через Node.js с JSDOM
 */

// Простой тестовый фреймворк
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('🧪 Запуск тестов...\n');
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${test.name}`);
                console.error(`   ${error.message}`);
            }
        }

        console.log(`\n📊 Результаты: ${this.passed} пройдено, ${this.failed} не пройдено`);
        console.log(`   Всего тестов: ${this.tests.length}`);
        
        return { passed: this.passed, failed: this.failed, total: this.tests.length };
    }
}

// Вспомогательные функции для assertions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected} but got ${actual}`);
    }
}

function assertNotNull(value, message) {
    if (value === null || value === undefined) {
        throw new Error(message || 'Value is null or undefined');
    }
}

// Импорт модулей для тестирования
import { ToolForm } from './components/ToolForm.js';

// Создание экземпляра тестового фреймворка
const runner = new TestRunner();

/**
 * Тесты валидации формы
 */
runner.test('ToolForm.validate: корректные данные проходят валидацию', () => {
    const validData = {
        name: 'Test Tool',
        category: 'Development',
        description: 'This is a valid description with more than 20 characters',
        website: 'https://example.com',
        license: 'MIT',
        platforms: ['Windows', 'macOS'],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(validData);
    assertEquals(Object.keys(errors).length, 0, 'Не должно быть ошибок валидации');
});

runner.test('ToolForm.validate: короткое название не проходит валидацию', () => {
    const invalidData = {
        name: 'A',
        category: 'Development',
        description: 'This is a valid description with more than 20 characters',
        website: 'https://example.com',
        license: 'MIT',
        platforms: ['Windows'],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.name, 'Должна быть ошибка для поля name');
});

runner.test('ToolForm.validate: короткое описание не проходит валидацию', () => {
    const invalidData = {
        name: 'Test Tool',
        category: 'Development',
        description: 'Too short',
        website: 'https://example.com',
        license: 'MIT',
        platforms: ['Windows'],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.description, 'Должна быть ошибка для поля description');
});

runner.test('ToolForm.validate: неправильный URL не проходит валидацию', () => {
    const invalidData = {
        name: 'Test Tool',
        category: 'Development',
        description: 'This is a valid description with more than 20 characters',
        website: 'invalid-url',
        license: 'MIT',
        platforms: ['Windows'],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.website, 'Должна быть ошибка для поля website');
});

runner.test('ToolForm.validate: отсутствие категории не проходит валидацию', () => {
    const invalidData = {
        name: 'Test Tool',
        category: '',
        description: 'This is a valid description with more than 20 characters',
        website: 'https://example.com',
        license: 'MIT',
        platforms: ['Windows'],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.category, 'Должна быть ошибка для поля category');
});

runner.test('ToolForm.validate: отсутствие лицензии не проходит валидацию', () => {
    const invalidData = {
        name: 'Test Tool',
        category: 'Development',
        description: 'This is a valid description with more than 20 characters',
        website: 'https://example.com',
        license: '',
        platforms: ['Windows'],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.license, 'Должна быть ошибка для поля license');
});

runner.test('ToolForm.validate: отсутствие платформ не проходит валидацию', () => {
    const invalidData = {
        name: 'Test Tool',
        category: 'Development',
        description: 'This is a valid description with more than 20 characters',
        website: 'https://example.com',
        license: 'MIT',
        platforms: [],
        icon: '🛠️',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.platforms, 'Должна быть ошибка для поля platforms');
});

runner.test('ToolForm.validate: длинная иконка не проходит валидацию', () => {
    const invalidData = {
        name: 'Test Tool',
        category: 'Development',
        description: 'This is a valid description with more than 20 characters',
        website: 'https://example.com',
        license: 'MIT',
        platforms: ['Windows'],
        icon: '🛠️🔧🔨',
        rating: 4
    };

    const errors = ToolForm.validate(invalidData);
    assertNotNull(errors.icon, 'Должна быть ошибка для поля icon');
});

/**
 * Тесты генерации HTML
 */
runner.test('ToolForm.renderFields: генерирует HTML без ошибок', () => {
    const html = ToolForm.renderFields({}, ['Development', 'Design']);
    assert(html.length > 0, 'HTML должен быть сгенерирован');
    assert(html.includes('id="name"'), 'Должно быть поле name');
    assert(html.includes('id="description"'), 'Должно быть поле description');
    assert(html.includes('id="website"'), 'Должно быть поле website');
});

runner.test('ToolForm.renderFields: использует данные для заполнения полей', () => {
    const data = {
        name: 'Test Tool',
        description: 'Test description',
        website: 'https://test.com',
        icon: '🛠️',
        rating: 5
    };
    const html = ToolForm.renderFields(data, []);
    
    assert(html.includes('value="Test Tool"'), 'Название должно быть заполнено');
    assert(html.includes('Test description'), 'Описание должно быть заполнено');
    assert(html.includes('https://test.com'), 'Веб-сайт должен быть заполнен');
    assert(html.includes('🛠️'), 'Иконка должна быть заполнена');
});

runner.test('ToolForm.renderFields: добавляет ARIA-атрибуты для доступности', () => {
    const html = ToolForm.renderFields({}, []);
    
    assert(html.includes('aria-required="true"'), 'Должны быть ARIA атрибуты для обязательных полей');
    assert(html.includes('aria-describedby'), 'Должны быть описания для полей');
    assert(html.includes('role="alert"'), 'Ошибки должны иметь role="alert"');
    assert(html.includes('aria-live="polite"'), 'Ошибки должны быть live regions');
});

/**
 * Тесты collectData
 */
runner.test('ToolForm.collectData: собирает данные из FormData', () => {
    // Создаем mock FormData
    const formData = new FormData();
    formData.append('name', 'Test Tool');
    formData.append('category', 'Development');
    formData.append('description', 'Test description for this tool');
    formData.append('website', 'https://test.com');
    formData.append('license', 'MIT');
    formData.append('platforms', 'Windows');
    formData.append('platforms', 'macOS');
    formData.append('icon', '🛠️');
    formData.append('rating', '4');

    // Mock DOM элементов
    global.document = {
        getElementById: (id) => {
            if (id === 'category') return { value: 'Development' };
            if (id === 'newCategory') return { value: '' };
            return null;
        }
    };

    const data = ToolForm.collectData(formData);
    
    assertEquals(data.name, 'Test Tool', 'Название должно быть собрано');
    assertEquals(data.category, 'Development', 'Категория должна быть собрана');
    assertEquals(data.platforms.length, 2, 'Должны быть собраны две платформы');
    assertEquals(data.rating, 4, 'Рейтинг должен быть числом');
});

// Запуск всех тестов
if (typeof window !== 'undefined') {
    // Браузер
    window.addEventListener('DOMContentLoaded', async () => {
        const results = await runner.run();
        
        // Отображение результатов в DOM
        const resultsDiv = document.getElementById('test-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h2>Результаты тестирования</h2>
                <p><strong>Пройдено:</strong> ${results.passed} / ${results.total}</p>
                <p><strong>Не пройдено:</strong> ${results.failed}</p>
                <p><strong>Процент успеха:</strong> ${Math.round((results.passed / results.total) * 100)}%</p>
            `;
        }
    });
} else {
    // Node.js
    runner.run().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}

export { runner, assert, assertEquals, assertNotNull };
