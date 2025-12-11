// API module для работы с данными фильтров
var items = [];
var currentId = 1;
var DATA_VERSION = '2.0'; // версия для очистки старого кеша

// Инициализация данных
function initData() {
    var version = localStorage.getItem('filters_version');
    var stored = localStorage.getItem('filters');
    
    // Проверяем версию и очищаем старые данные
    if (version !== DATA_VERSION) {
        localStorage.removeItem('filters');
        localStorage.setItem('filters_version', DATA_VERSION);
        stored = null;
    }
    
    if (stored) {
        items = JSON.parse(stored);
        if (items.length > 0) {
            currentId = Math.max(...items.map(i => i.id)) + 1;
        }
    } else {
        // Создаем начальные данные
        items = [
            {
                id: 1,
                name: 'Vintage',
                category: 'Ретро',
                description: 'Классический винтажный эффект для фотографий',
                brightness: 0.9,
                contrast: 1.2,
                saturation: 0.8,
                image: 'https://picsum.photos/id/10/400/300'
            },
            {
                id: 2,
                name: 'Black & White',
                category: 'Черно-белый',
                description: 'Монохромный фильтр для драматичных снимков',
                brightness: 1.0,
                contrast: 1.3,
                saturation: 0.0,
                image: 'https://picsum.photos/id/20/400/300'
            },
            {
                id: 3,
                name: 'Warm Sunset',
                category: 'Теплые тона',
                description: 'Теплый закатный эффект',
                brightness: 1.1,
                contrast: 1.0,
                saturation: 1.3,
                image: 'https://picsum.photos/id/1015/400/300'
            }
        ];
        currentId = 4;
        saveData();
    }
}

function saveData() {
    localStorage.setItem('filters', JSON.stringify(items));
}

// API для CRUD операций
var API = {
    getItems: function() {
        // Асинхронное получение списка
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...items]);
            }, 500);
        });
    },
    
    getItem: function(id) {
        // Получение элемента по ID
        return items.find(item => item.id == id);
    },
    
    createItem: function(data) {
        var newItem = {
            id: currentId++,
            name: data.name,
            category: data.category,
            description: data.description,
            brightness: parseFloat(data.brightness) || 1.0,
            contrast: parseFloat(data.contrast) || 1.0,
            saturation: parseFloat(data.saturation) || 1.0,
            image: data.image || 'https://picsum.photos/400/300?random=' + Date.now()
        };
        items.push(newItem);
        saveData();
        return newItem;
    },
    
    updateItem: function(id, data) {
        var index = items.findIndex(item => item.id == id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                name: data.name,
                category: data.category,
                description: data.description,
                brightness: parseFloat(data.brightness),
                contrast: parseFloat(data.contrast),
                saturation: parseFloat(data.saturation),
                image: data.image
            };
            saveData();
            return items[index];
        }
        return null;
    },
    
    deleteItem: function(id) {
        items = items.filter(item => item.id != id);
        saveData();
        return true;
    }
};

initData();
