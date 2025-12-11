const DB_KEY = 'gadgets_db';

// Начальные данные, если база пуста
const initialData = [
    { id: '1', name: 'iPhone 15', brand: 'Apple', price: 999, desc: 'Титан, USB-C.' },
    { id: '2', name: 'Galaxy S24', brand: 'Samsung', price: 899, desc: 'AI функции.' },
];

function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initialData;
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Имитация задержки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    async getAll(query = '') {
        await delay(500); // Имитация загрузки
        const gadgets = getDB();
        if (!query) return gadgets;
        return gadgets.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
    },

    async getById(id) {
        await delay(400);
        const gadget = getDB().find(g => g.id === id);
        if (!gadget) throw new Error('Гаджет не найден');
        return gadget;
    },

    async create(gadget) {
        await delay(600);
        const db = getDB();
        const newGadget = { ...gadget, id: Date.now().toString() };
        db.push(newGadget);
        saveDB(db);
        return newGadget;
    },

    async update(id, updates) {
        await delay(600);
        const db = getDB();
        const index = db.findIndex(g => g.id === id);
        if (index === -1) throw new Error('Гаджет не найден');
        db[index] = { ...db[index], ...updates };
        saveDB(db);
        return db[index];
    },

    async delete(id) {
        await delay(400);
        const db = getDB();
        const filtered = db.filter(g => g.id !== id);
        saveDB(filtered);
        return true;
    }
};