// Глобальные переменные
var data = [
    {id: 1, title: "Закат над морем", type: "painting", author: "Иванов И.И.", year: 2020, img: "https://picsum.photos/seed/paint1/400/300"},
    {id: 2, title: "Городская жизнь", type: "painting", author: "Петров П.П.", year: 2021, img: "https://picsum.photos/seed/paint2/400/300"},
    {id: 3, title: "Портрет женщины", type: "painting", author: "Сидоров С.С.", year: 2019, img: "https://picsum.photos/seed/paint3/400/300"},
    {id: 4, title: "Абстракция", type: "graphics", author: "Иванов И.И.", year: 2022, img: "https://picsum.photos/seed/graph1/400/300"},
    {id: 5, title: "Линии и формы", type: "graphics", author: "Петров П.П.", year: 2021, img: "https://picsum.photos/seed/graph2/400/300"},
    {id: 6, title: "Венера", type: "sculpture", author: "Сидоров С.С.", year: 2018, img: "https://picsum.photos/seed/sculp1/400/300"},
    {id: 7, title: "Мыслитель", type: "sculpture", author: "Иванов И.И.", year: 2020, img: "https://picsum.photos/seed/sculp2/400/300"},
    {id: 8, title: "Горный пейзаж", type: "painting", author: "Петров П.П.", year: 2023, img: "https://picsum.photos/seed/paint4/400/300"}
];

var currentFilter = 'all';

function renderGallery() {
    var gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    for (var i = 0; i < data.length; i++) {
        if (currentFilter == 'all' || data[i].type == currentFilter) {
            var div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = '<img src="' + data[i].img + '" alt="' + data[i].title + '">' +
                          '<h3>' + data[i].title + '</h3>' +
                          '<p>Автор: ' + data[i].author + '</p>' +
                          '<p>Год: ' + data[i].year + '</p>' +
                          '<p>Тип: ' + getTypeLabel(data[i].type) + '</p>';
            gallery.appendChild(div);
        }
    }
}

function getTypeLabel(type) {
    if (type == 'painting') return 'Живопись';
    if (type == 'sculpture') return 'Скульптура';
    if (type == 'graphics') return 'Графика';
    return 'Неизвестно';
}

function filter(type) {
    currentFilter = type;
    renderGallery();
}

function addItem(item) {
    data.push(item);
    renderGallery();
}

function removeItem(id) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            data.splice(i, 1);
            break;
        }
    }
    renderGallery();
}

function getItemById(id) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            return data[i];
        }
    }
    return null;
}

function calculateTotal() {
    return data.length;
}

function sum(a, b) {
    return a + b;
}

window.onload = function() {
    renderGallery();
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sum: sum,
        calculateTotal: calculateTotal,
        getItemById: getItemById,
        addItem: addItem,
        removeItem: removeItem,
        getTypeLabel: getTypeLabel,
        data: data
    };
}
