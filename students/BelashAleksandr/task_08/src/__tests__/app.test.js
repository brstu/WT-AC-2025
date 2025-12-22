// Базовые тесты

test('test 1', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
});

test('pet test', () => {
    const pet = { name: 'Собака', age: 5 };
    expect(pet.name).toBeTruthy();
});

test('check age', () => {
    const x = 10;
    const y = 5;
    expect(x - y).toBe(5);
});

test('empty test', () => {
    expect(true).toBe(true);
});
