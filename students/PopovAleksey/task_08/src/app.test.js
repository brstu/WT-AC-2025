const { sum, calculateTotal, getItemById, getTypeLabel } = require('./app.js');

// Unit тесты
describe('Unit Tests', () => {
    test('sum функция складывает два числа', () => {
        expect(sum(2, 3)).toBe(5);
        expect(sum(0, 0)).toBe(0);
    });

    test('getTypeLabel возвращает правильные метки', () => {
        expect(getTypeLabel('painting')).toBe('Живопись');
        expect(getTypeLabel('sculpture')).toBe('Скульптура');
    });

    test('calculateTotal возвращает количество элементов', () => {
        const result = calculateTotal();
        expect(result).toBeGreaterThan(0);
    });
});

// Integration тест
describe('Integration Tests', () => {
    test('getItemById находит элемент по id', () => {
        const item = getItemById(1);
        expect(item).toBeDefined();
        expect(item.id).toBe(1);
        expect(item.title).toBeDefined();
    });
});
