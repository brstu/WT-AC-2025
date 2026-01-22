module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  globals: {
    addToCart: 'writable',
    filterCategory: 'writable',
    calculateTotal: 'writable',
    getCartCount: 'writable',
    clearCart: 'writable',
    cart: 'writable',
    total: 'writable',
    cy: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    test: 'readonly',
  },
  rules: {
    'no-unused-vars': 'off',
  },
};
