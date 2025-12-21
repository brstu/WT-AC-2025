/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // Главное правило — разрешаем директивы Tailwind
    'at-rule-no-unknown': [
      'error',
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],

    // Дополнительно отключаем проверку at-rule в CSS-файлах полностью (если хочешь ещё проще)
    // 'at-rule-no-unknown': 'off',
  },

  // Важно: для CSS-файлов применяем отдельные правила
  overrides: [
    {
      files: ['**/*.css'],
      processor: 'stylelint-processor-styled-components', // если используешь styled-components (не обязательно)
      rules: {
        'at-rule-no-unknown': 'off', // полностью отключаем для .css — самый простой и надёжный способ
      },
    },
  ],
};