// Добавляем полифилы для Node.js окружения
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Мокаем matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Мокаем localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Мокаем fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Мокаем document.createElement для HTML элементов
const createMockElement = (tagName) => {
  const element = {
    tagName: tagName.toUpperCase(),
    innerHTML: '',
    className: '',
    style: {},
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    children: [],
    parentNode: null,
    dataset: {},
    textContent: '',
    click: jest.fn(),
  };
  
  // Делаем объект похожим на HTMLElement
  Object.setPrototypeOf(element, Object.prototype);
  
  return element;
};

// Мокаем document
document.createElement = jest.fn().mockImplementation((tagName) => {
  return createMockElement(tagName);
});

// Добавляем querySelector для document
document.querySelector = jest.fn();
document.querySelectorAll = jest.fn(() => []);

// Сбрасываем все моки после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});