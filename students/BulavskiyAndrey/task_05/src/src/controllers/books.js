const { ApiError } = require('../middleware/errorHandler');

// Временное хранилище в памяти
let books = [];
let currentId = 1;

const booksController = {
  // Получить все книги с пагинацией и поиском
  getAllBooks: (req, res) => {
    const { q, limit = 10, offset = 0 } = req.query;
    
    let filteredBooks = books;

    if (q) {
      filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(q.toLowerCase()) ||
        book.author.toLowerCase().includes(q.toLowerCase())
      );
    }

    const paginatedBooks = filteredBooks.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      data: paginatedBooks,
      meta: {
        total: filteredBooks.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  },

  getBookById: (req, res) => {
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }
    res.json({ data: book });
  },

  createBook: (req, res) => {
    const book = {
      id: String(currentId++),
      ...req.validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (book.isbn) {
      const existingBook = books.find(b => b.isbn === book.isbn);
      if (existingBook) {
        throw new ApiError(409, 'Book with this ISBN already exists');
      }
    }

    books.push(book);
    res.status(201).json({ data: book });
  },

  updateBook: (req, res) => {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) {
      throw new ApiError(404, 'Book not found');
    }

    if (req.validatedData.isbn) {
      const existingBook = books.find(
        b => b.isbn === req.validatedData.isbn && b.id !== req.params.id
      );
      if (existingBook) {
        throw new ApiError(409, 'Book with this ISBN already exists');
      }
    }

    books[bookIndex] = {
      ...books[bookIndex],
      ...req.validatedData,
      updatedAt: new Date().toISOString()
    };

    res.json({ data: books[bookIndex] });
  },

  deleteBook: (req, res) => {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    if (bookIndex === -1) {
      throw new ApiError(404, 'Book not found');
    }

    books.splice(bookIndex, 1);
    res.status(204).send();
  }
};

// Экспортируем books для использования в reviews controller
booksController.books = books;

module.exports = booksController;