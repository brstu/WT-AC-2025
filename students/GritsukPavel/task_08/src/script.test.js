const { sum, multiply, calculateTotal } = require('./script.js');

describe('Basic Math Tests', () => {
    test('sum function adds two numbers', () => {
        expect(sum(2, 3)).toBe(5);
    });

    test('multiply function multiplies two numbers', () => {
        expect(multiply(4, 5)).toBe(20);
    });
});

describe('Project Tests', () => {
    test('calculateTotal returns number', () => {
        const result = calculateTotal();
        expect(typeof result).toBe('number');
    });
});
