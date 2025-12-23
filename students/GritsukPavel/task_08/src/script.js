// Глобальные переменные
var projects = [];
var currentFilter = 'all';
var counter = 0;

// Инициализация данных
function init() {
    projects = [
        {
            id: 1,
            title: 'Интернет магазин',
            category: 'web',
            image: 'https://picsum.photos/seed/shop1/300/200',
            description: 'Магазин одежды'
        },
        {
            id: 2,
            title: 'Мобильное приложение',
            category: 'mobile',
            image: 'https://picsum.photos/seed/mobile1/300/200',
            description: 'Приложение для заметок'
        },
        {
            id: 3,
            title: 'Корпоративный сайт',
            category: 'web',
            image: 'https://picsum.photos/seed/corporate1/300/200',
            description: 'Сайт компании'
        },
        {
            id: 4,
            title: 'Игра на телефон',
            category: 'mobile',
            image: 'https://picsum.photos/seed/game1/300/200',
            description: 'Головоломка'
        }
    ];
    counter = projects.length;
    renderProjects();
}

// Рендер проектов
function renderProjects() {
    var container = document.getElementById('projects');
    container.innerHTML = '';
    
    for (var i = 0; i < projects.length; i++) {
        if (currentFilter == 'all' || projects[i].category == currentFilter) {
            var div = document.createElement('div');
            div.className = 'project';
            div.innerHTML = '<img src="' + projects[i].image + '"><h3>' + projects[i].title + '</h3><p>' + projects[i].description + '</p><p>Категория: ' + projects[i].category + '</p>';
            container.appendChild(div);
        }
    }
}

// Фильтрация
function filterProjects(filter) {
    currentFilter = filter;
    renderProjects();
}

// Добавление проекта
function addProject() {
    var title = document.getElementById('title').value;
    var category = document.getElementById('category').value;
    var image = document.getElementById('image').value;
    
    counter++;
    
    var newProject = {
        id: counter,
        title: title,
        category: category,
        image: image,
        description: 'Описание проекта'
    };
    
    projects.push(newProject);
    
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('image').value = '';
    
    renderProjects();
}

// Утилиты
function calculateTotal() {
    var total = 0;
    for (var i = 0; i < projects.length; i++) {
        total = total + 1;
    }
    return total;
}

function getProjectById(id) {
    for (var i = 0; i < projects.length; i++) {
        if (projects[i].id == id) {
            return projects[i];
        }
    }
    return null;
}

function sum(a, b) {
    return a + b;
}

function multiply(x, y) {
    return x * y;
}

// Запуск
window.onload = function() {
    init();
};

// Экспорт для тестов
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sum: sum,
        multiply: multiply,
        calculateTotal: calculateTotal,
        getProjectById: getProjectById
    };
}
