// API модуль для работы с данными
var API_BASE = 'https://jsonplaceholder.typicode.com';
var items = [];

// Моковые данные турниров
var mockTournaments = [
    {
        id: 1,
        name: 'Чемпионат мира по футболу 2026',
        sport: 'Футбол',
        date: '2026-06-15',
        location: 'США, Канада, Мексика',
        participants: 48,
        description: 'Крупнейший футбольный турнир мира с участием 48 команд из разных стран.',
        image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop'
    },
    {
        id: 2,
        name: 'Олимпийские игры 2028',
        sport: 'Мультиспорт',
        date: '2028-07-21',
        location: 'Лос-Анджелес, США',
        participants: 10500,
        description: 'Летние Олимпийские игры с участием спортсменов со всего мира.',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop'
    },
    {
        id: 3,
        name: 'Чемпионат Европы по баскетболу',
        sport: 'Баскетбол',
        date: '2025-09-01',
        location: 'Европа',
        participants: 24,
        description: 'Европейский турнир по баскетболу среди национальных сборных.',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop'
    },
    {
        id: 4,
        name: 'Открытый чемпионат США по теннису',
        sport: 'Теннис',
        date: '2025-08-25',
        location: 'Нью-Йорк, США',
        participants: 256,
        description: 'Один из четырех турниров Большого шлема в теннисе.',
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop'
    },
    {
        id: 5,
        name: 'Чемпионат мира по хоккею',
        sport: 'Хоккей',
        date: '2025-05-09',
        location: 'Прага, Чехия',
        participants: 16,
        description: 'Ежегодный международный турнир по хоккею с шайбой.',
        image: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&h=600&fit=crop'
    }
];

export var api = {
    getItems: function() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (items.length === 0) {
                    items = JSON.parse(JSON.stringify(mockTournaments));
                }
                resolve(items);
            }, 500);
        });
    },
    
    getItem: function(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var item = items.find(i => i.id == id);
                if (item) {
                    resolve(item);
                } else {
                    reject(new Error('Турнир не найден'));
                }
            }, 300);
        });
    },
    
    createItem: function(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
                var newItem = {
                    id: newId,
                    ...data,
                    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop&q=80&sig=' + newId
                };
                items.push(newItem);
                resolve(newItem);
            }, 500);
        });
    },
    
    updateItem: function(id, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var index = items.findIndex(i => i.id == id);
                if (index !== -1) {
                    items[index] = { ...items[index], ...data };
                    resolve(items[index]);
                } else {
                    reject(new Error('Турнир не найден'));
                }
            }, 500);
        });
    },
    
    deleteItem: function(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                var index = items.findIndex(i => i.id == id);
                if (index !== -1) {
                    items.splice(index, 1);
                    resolve();
                } else {
                    reject(new Error('Турнир не найден'));
                }
            }, 500);
        });
    }
};
