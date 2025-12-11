// Модуль для работы с API
export class BookApi {
    constructor() {
        // Используем localStorage для имитации работы с API
        // Это позволит нам сохранять изменения локально
        this.storageKey = 'book-catalog-data';
        this.initializeStorage();
    }
    
    // Инициализация хранилища с начальными данными
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            // Начальные данные книг
            const initialBooks = [
                {
                    id: 1,
                    title: "Мастер и Маргарита",
                    author: "Михаил Булгаков",
                    year: 1967,
                    description: "Роман о дьяволе, посетившем Москву 1930-х годов, и о любви, способной преодолеть всё.",
                    isbn: "978-5-699-12345-6",
                    pages: 480,
                    genre: "Роман"
                },
                {
                    id: 2,
                    title: "Преступление и наказание",
                    author: "Фёдор Достоевский",
                    year: 1866,
                    description: "История бывшего студента Родиона Раскольникова, совершившего убийство.",
                    isbn: "978-5-17-123456-7",
                    pages: 592,
                    genre: "Психологический роман"
                },
                {
                    id: 3,
                    title: "Война и мир",
                    author: "Лев Толстой",
                    year: 1869,
                    description: "Эпопея о жизни русского общества во время Наполеоновских войн.",
                    isbn: "978-5-389-12345-8",
                    pages: 1225,
                    genre: "Исторический роман"
                },
                {
                    id: 4,
                    title: "1984",
                    author: "Джордж Оруэлл",
                    year: 1949,
                    description: "Антиутопия о тоталитарном обществе под постоянным наблюдением Большого Брата.",
                    isbn: "978-5-17-098456-2",
                    pages: 328,
                    genre: "Антиутопия"
                },
                {
                    id: 5,
                    title: "Гарри Поттер и философский камень",
                    author: "Джоан Роулинг",
                    year: 1997,
                    description: "Первая книга о юном волшебнике Гарри Поттере и его обучении в Хогвартсе.",
                    isbn: "978-5-389-04567-1",
                    pages: 432,
                    genre: "Фэнтези"
                }
            ];
            
            localStorage.setItem(this.storageKey, JSON.stringify(initialBooks));
        }
    }
    
    // Получить все книги
    async getAllBooks() {
        try {
            // Имитация задержки сети
            await this.delay(300);
            
            const booksJson = localStorage.getItem(this.storageKey);
            return JSON.parse(booksJson) || [];
        } catch (error) {
            console.error('Ошибка при получении списка книг:', error);
            throw error;
        }
    }
    
    // Получить книгу по ID
    async getBookById(id) {
        try {
            await this.delay(200);
            
            const booksJson = localStorage.getItem(this.storageKey);
            const books = JSON.parse(booksJson) || [];
            const book = books.find(b => b.id === parseInt(id));
            
            if (!book) {
                throw new Error(`Книга с ID ${id} не найдена`);
            }
            
            return book;
        } catch (error) {
            console.error(`Ошибка при получении книги с ID ${id}:`, error);
            throw error;
        }
    }
    
    // Создать новую книгу
    async createBook(bookData) {
        try {
            await this.delay(400);
            
            const booksJson = localStorage.getItem(this.storageKey);
            const books = JSON.parse(booksJson) || [];
            
            // Генерируем новый ID
            const newId = books.length > 0 
                ? Math.max(...books.map(b => b.id)) + 1 
                : 1;
            
            const newBook = {
                id: newId,
                ...bookData
            };
            
            books.push(newBook);
            localStorage.setItem(this.storageKey, JSON.stringify(books));
            
            return newBook;
        } catch (error) {
            console.error('Ошибка при создании книги:', error);
            throw error;
        }
    }
    
    // Обновить книгу
    async updateBook(id, bookData) {
        try {
            await this.delay(400);
            
            const booksJson = localStorage.getItem(this.storageKey);
            const books = JSON.parse(booksJson) || [];
            const bookIndex = books.findIndex(b => b.id === parseInt(id));
            
            if (bookIndex === -1) {
                throw new Error(`Книга с ID ${id} не найдена`);
            }
            
            const updatedBook = {
                id: parseInt(id),
                ...bookData
            };
            
            books[bookIndex] = updatedBook;
            localStorage.setItem(this.storageKey, JSON.stringify(books));
            
            return updatedBook;
        } catch (error) {
            console.error(`Ошибка при обновлении книги с ID ${id}:`, error);
            throw error;
        }
    }
    
    // Удалить книгу
    async deleteBook(id) {
        try {
            await this.delay(300);
            
            const booksJson = localStorage.getItem(this.storageKey);
            const books = JSON.parse(booksJson) || [];
            const filteredBooks = books.filter(b => b.id !== parseInt(id));
            
            if (filteredBooks.length === books.length) {
                throw new Error(`Книга с ID ${id} не найдена`);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredBooks));
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении книги с ID ${id}:`, error);
            throw error;
        }
    }
    
    // Вспомогательная функция для имитации задержки сети
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}