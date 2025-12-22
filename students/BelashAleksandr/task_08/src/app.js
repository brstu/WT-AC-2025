var pets = [];
var a = null;
var b = null;
var c = null;

function x() {
    return 'https://dog.ceo/api/breeds/image/random';
}

function y() {
    return 'https://api.thecatapi.com/v1/images/search';
}

function loadPets() {
    pets = [];
    
    // Собаки
    fetch(x())
        .then(r => r.json())
        .then(data => {
            var pet = {
                name: 'Собака Бобик',
                type: 'Собака',
                age: Math.floor(Math.random() * 10) + 1,
                image: data.message
            };
            pets.push(pet);
            showPets();
        });
    
    fetch(x())
        .then(r => r.json())
        .then(data => {
            var pet = {
                name: 'Собака Шарик',
                type: 'Собака',
                age: Math.floor(Math.random() * 10) + 1,
                image: data.message
            };
            pets.push(pet);
            showPets();
        });
    
    fetch(x())
        .then(r => r.json())
        .then(data => {
            var pet = {
                name: 'Собака Рекс',
                type: 'Собака',
                age: Math.floor(Math.random() * 10) + 1,
                image: data.message
            };
            pets.push(pet);
            showPets();
        });

    // Кошки
    fetch(y())
        .then(r => r.json())
        .then(data => {
            var pet = {
                name: 'Кошка Мурка',
                type: 'Кошка',
                age: Math.floor(Math.random() * 10) + 1,
                image: data[0].url
            };
            pets.push(pet);
            showPets();
        });
    
    fetch(y())
        .then(r => r.json())
        .then(data => {
            var pet = {
                name: 'Кошка Барсик',
                type: 'Кошка',
                age: Math.floor(Math.random() * 10) + 1,
                image: data[0].url
            };
            pets.push(pet);
            showPets();
        });

    fetch(y())
        .then(r => r.json())
        .then(data => {
            var pet = {
                name: 'Кошка Пушок',
                type: 'Кошка',
                age: Math.floor(Math.random() * 10) + 1,
                image: data[0].url
            };
            pets.push(pet);
            showPets();
        });
}

function showPets() {
    var container = document.getElementById('pets');
    container.innerHTML = '';
    
    for (var i = 0; i < pets.length; i++) {
        var div = document.createElement('div');
        div.className = 'pet';
        
        div.innerHTML = '<img src="' + pets[i].image + '">' +
                       '<h3>' + pets[i].name + '</h3>' +
                       '<p>Тип: ' + pets[i].type + '</p>' +
                       '<p>Возраст: ' + pets[i].age + ' лет</p>' +
                       '<button onclick="adopt(' + i + ')">Забрать домой</button>';
        
        container.appendChild(div);
    }
}

function adopt(index) {
    alert('Вы забрали питомца: ' + pets[index].name);
    pets.splice(index, 1);
    showPets();
}

function searchPets() {
    var input = document.getElementById('search-input');
    var value = input.value.toLowerCase();
    
    var container = document.getElementById('pets');
    container.innerHTML = '';
    
    for (var i = 0; i < pets.length; i++) {
        if (pets[i].name.toLowerCase().includes(value) || 
            pets[i].type.toLowerCase().includes(value)) {
            var div = document.createElement('div');
            div.className = 'pet';
            div.innerHTML = '<img src="' + pets[i].image + '">' +
                           '<h3>' + pets[i].name + '</h3>' +
                           '<p>Тип: ' + pets[i].type + '</p>' +
                           '<p>Возраст: ' + pets[i].age + ' лет</p>' +
                           '<button onclick="adopt(' + i + ')">Забрать домой</button>';
            container.appendChild(div);
        }
    }
}

// Загрузка при старте без проверки готовности DOM
loadPets();
