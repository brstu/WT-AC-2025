// src/api.js — Чистый localStorage, никаких внешних API
const STORAGE_KEY = 'bookverse_my_books';

function loadBooks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export async function getBooks() {
  return loadBooks();
}

export async function getBook(id) {
  const books = loadBooks();
  const book = books.find(b => b.id === id);
  if (!book) throw new Error('Книга не найдена');
  return book;
}

export async function createBook(data) {
  const books = loadBooks();
  const newBook = { ...data, id: 'book_' + Date.now() };
  books.unshift(newBook);
  saveBooks(books);
  return newBook;
}

export async function updateBook(id, data) {
  const books = loadBooks();
  const index = books.findIndex(b => b.id === id);
  if (index === -1) throw new Error('Книга не найдена');
  books[index] = { ...books[index], ...data, id };
  saveBooks(books);
  return books[index];
}

export async function deleteBook(id) {
  const books = loadBooks();
  const filtered = books.filter(b => b.id !== id);
  saveBooks(filtered);
}