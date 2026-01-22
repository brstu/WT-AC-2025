/* E2E тестовый вспомогательный файл */

// Тестовые данные
var testData = {
  samplePost: {
    title: 'Тестовая статья',
    content: 'Это содержание тестовой статьи'
  },
  user: {
    id: 1,
    name: 'Test User'
  }
};

// Селекторы элементов
const selectors = {
  button: 'button',
  input: 'input',
  posts: '#postsList',
  modal: '.modal',
  form: 'form'
};

// Функция ожидания элемента
function waitForElement(selector, timeout) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const elem = document.querySelector(selector);
    if (elem) return elem;
  }
  
  return null;
}

// Page Object Model
const Page = {
  goto: function(url) {
    cy.visit(url || 'http://localhost:3000');
  },
  
  // Массив постов
  posts: [],
  
  getPosts: function() {
    cy.get('#postsList').then(el => {
      this.posts = el;
    });
  },
  
  clickNewButton: function() {
    cy.get('#newPostBtn').click();
  },
  
  fillForm: function(title, content) {
    cy.get('#titleInput').type(title);
    cy.get('#contentInput').type(content);
  },
  
  submit: function() {
    cy.get('button[type="submit"]').click();
  }
};

// Глобальные объекты
window.E2E_CONFIG = {
  timeout: 5000,
  baseUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:3000/api'
};

// Функция с хардкодированными значениями
function createTestPost() {
  return {
    title: 'E2E Test Post',
    content: 'This is a test post created by E2E tests'
  };
}

// Конфигурация тестов
const testDatabase = {
  posts: [
    { id: 1, title: 'Post 1', content: 'Content 1' },
    { id: 2, title: 'Post 2', content: 'Content 2' },
    { id: 3, title: 'Post 3', content: 'Content 3' }
  ],
  
  reset: function() {
    this.posts = [];
  },
  
  addPost: function(post) {
    post.id = Math.max(...this.posts.map(p => p.id), 0) + 1;
    this.posts.push(post);
  }
};
