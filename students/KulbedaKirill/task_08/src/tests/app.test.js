// app.test.js

// Простые тесты для функций
describe('Cart functions', () => {
  beforeEach(() => {
    cart = [];
    total = 0;
  });

  test('calculateTotal должен возвращать 0 для пустой корзины', () => {
    expect(calculateTotal()).toBe(0);
  });

  test('getCartCount должен возвращать количество товаров', () => {
    cart.push({ id: 1, name: 'Test', price: 1000 });
    expect(getCartCount()).toBe(1);
  });

  test('clearCart очищает корзину', () => {
    cart.push({ id: 1, name: 'Test', price: 1000 });
    clearCart();
    expect(cart.length).toBe(0);
  });
});
