module.exports = {
  extends: ['plugin:tailwindcss/recommended'],
  rules: {
    'at-rule-no-unknown': [
      'error',
      {
        ignoreAtRules: ['tailwind', 'layer', 'apply', 'screen'],
      },
    ],
  },
};