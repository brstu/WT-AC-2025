// API модуль для работы с данными растений

var API_URL = 'https://jsonplaceholder.typicode.com';

var plantsData = [];

// Изображения растений с Unsplash
var plantImages = [
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?w=400',
    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400',
    'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
    'https://images.unsplash.com/photo-1502331538081-041522631b7e?w=400',
    'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400',
    'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400',
    'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=400',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400',
    'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=400'
];

// Названия растений
var plantNames = [
    'Роза садовая',
    'Тюльпан голландский',
    'Орхидея фаленопсис',
    'Фикус Бенджамина',
    'Кактус опунция',
    'Алоэ вера',
    'Герань душистая',
    'Лаванда узколистная',
    'Мята перечная',
    'Базилик душистый',
    'Папоротник нефролепис',
    'Драцена маргината'
];

// Описания растений
var plantDescriptions = [
    'Многолетнее растение с красивыми цветками. Требует регулярного полива и солнечного света.',
    'Луковичное растение, цветущее весной. Подходит для выращивания в саду и в горшках.',
    'Экзотическое растение с красивыми цветками. Любит влажность и рассеянный свет.',
    'Вечнозеленое декоративное растение. Неприхотливо в уходе, очищает воздух.',
    'Суккулент, устойчивый к засухе. Требует минимального ухода и яркого света.',
    'Лекарственное растение с мясистыми листьями. Используется в косметологии и медицине.',
    'Ароматное растение с красивыми цветками. Отпугивает насекомых.',
    'Ароматический полукустарник. Используется в кулинарии и ароматерапии.',
    'Травянистое растение с освежающим ароматом. Применяется в кулинарии и медицине.',
    'Пряное растение. Широко используется в кулинарии разных стран мира.',
    'Декоративное растение с красивыми листьями. Любит влажность и тень.',
    'Вечнозеленое растение с узкими листьями. Хорошо очищает воздух в помещении.'
];

// Функция для получения всех растений
function getPlants(callback) {
    // Синхронный вызов через setTimeout (имитация задержки)
    setTimeout(function() {
        if (plantsData.length == 0) {
            // Создаем данные если их нет
            for (var i = 0; i < 12; i++) {
                plantsData.push({
                    id: i + 1,
                    name: plantNames[i],
                    description: plantDescriptions[i],
                    image: plantImages[i],
                    category: 'Комнатные',
                    notes: ''
                });
            }
        }
        callback(null, plantsData);
    }, 500);
}

// Функция для получения растения по ID
function getPlantById(id, callback) {
    setTimeout(function() {
        var plant = null;
        for (var i = 0; i < plantsData.length; i++) {
            if (plantsData[i].id == id) {
                plant = plantsData[i];
                break;
            }
        }
        if (plant) {
            callback(null, plant);
        } else {
            callback('Растение не найдено', null);
        }
    }, 300);
}

// Функция для создания растения
function createPlant(data, callback) {
    setTimeout(function() {
        var newPlant = {
            id: plantsData.length + 1,
            name: data.name,
            description: data.description,
            image: plantImages[Math.floor(Math.random() * plantImages.length)],
            category: data.category || 'Другие',
            notes: data.notes || ''
        };
        plantsData.push(newPlant);
        callback(null, newPlant);
    }, 400);
}

// Функция для обновления растения
function updatePlant(id, data, callback) {
    setTimeout(function() {
        for (var i = 0; i < plantsData.length; i++) {
            if (plantsData[i].id == id) {
                plantsData[i].name = data.name || plantsData[i].name;
                plantsData[i].description = data.description || plantsData[i].description;
                plantsData[i].category = data.category || plantsData[i].category;
                plantsData[i].notes = data.notes || plantsData[i].notes;
                callback(null, plantsData[i]);
                return;
            }
        }
        callback('Растение не найдено', null);
    }, 400);
}

// Функция для удаления растения
function deletePlant(id, callback) {
    setTimeout(function() {
        for (var i = 0; i < plantsData.length; i++) {
            if (plantsData[i].id == id) {
                plantsData.splice(i, 1);
                callback(null, true);
                return;
            }
        }
        callback('Растение не найдено', null);
    }, 300);
}

// Функция поиска
function searchPlants(query, callback) {
    setTimeout(function() {
        var results = [];
        var q = query.toLowerCase();
        for (var i = 0; i < plantsData.length; i++) {
            if (plantsData[i].name.toLowerCase().indexOf(q) != -1 || 
                plantsData[i].description.toLowerCase().indexOf(q) != -1) {
                results.push(plantsData[i]);
            }
        }
        callback(null, results);
    }, 200);
}
