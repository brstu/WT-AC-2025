module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    cy: 'readonly',
    describe: 'readonly',
    it: 'readonly',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
};
