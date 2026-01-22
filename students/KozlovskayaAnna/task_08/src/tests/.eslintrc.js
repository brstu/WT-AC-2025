module.exports = {
  extends: ['../.eslintrc.js'],
  env: {
    jest: true
  },
  globals: {
    posts: 'readonly',
    isLoading: 'readonly',
    escapeHtml: 'readonly'
  }
};
