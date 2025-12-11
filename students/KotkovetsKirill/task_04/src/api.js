// API модуль для работы с данными кофеен

var API_URL = 'https://jsonplaceholder.typicode.com';

// Глобальная переменная для хранения данных
var coffeeShopsData = [
    {
        id: 1,
        name: "Coffee House",
        address: "ул. Советская, 15",
        description: "Уютная кофейня в центре города с отличным кофе и выпечкой. Здесь вы можете насладиться ароматным напитком в теплой атмосфере.",
        rating: 4.5,
        phone: "+375 29 123-45-67",
        hours: "08:00 - 22:00",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
        reviews: [
            { id: 1, author: "Иван", text: "Отличное место!", rating: 5, date: "2025-01-15" },
            { id: 2, author: "Мария", text: "Вкусный кофе", rating: 4, date: "2025-01-10" }
        ]
    },
    {
        id: 2,
        name: "Espresso Bar",
        address: "пр. Машерова, 28",
        description: "Современная кофейня с широким выбором эспрессо-напитков и десертов.",
        rating: 4.2,
        phone: "+375 29 234-56-78",
        hours: "07:00 - 23:00",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
        reviews: [
            { id: 1, author: "Петр", text: "Быстрое обслуживание", rating: 4, date: "2025-01-12" }
        ]
    },
    {
        id: 3,
        name: "Latte Art",
        address: "ул. Ленина, 42",
        description: "Кофейня для ценителей латте-арта. Наши бариста создают настоящие шедевры.",
        rating: 4.8,
        phone: "+375 29 345-67-89",
        hours: "09:00 - 21:00",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        reviews: []
    },
    {
        id: 4,
        name: "Morning Coffee",
        address: "ул. Гоголя, 7",
        description: "Идеальное место для утреннего кофе. Свежая выпечка каждый день.",
        rating: 4.0,
        phone: "+375 29 456-78-90",
        hours: "06:00 - 20:00",
        image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400",
        reviews: []
    },
    {
        id: 5,
        name: "Bean Brothers",
        address: "ул. Пушкина, 33",
        description: "Семейная кофейня с домашней атмосферой и авторскими рецептами.",
        rating: 4.6,
        phone: "+375 29 567-89-01",
        hours: "08:00 - 22:00",
        image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400",
        reviews: []
    },
    {
        id: 6,
        name: "Brew & Co",
        address: "пр. Независимости, 55",
        description: "Современное пространство для работы и отдыха с отличным кофе.",
        rating: 4.3,
        phone: "+375 29 678-90-12",
        hours: "07:30 - 23:30",
        image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400",
        reviews: []
    }
];

// Имитация задержки сервера
function delay(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

// Получить все кофейни
function getAllCoffeeShops() {
    return delay(500).then(function() {
        return coffeeShopsData;
    });
}

// Получить кофейню по ID
function getCoffeeShopById(id) {
    return delay(300).then(function() {
        var shop = null;
        for (var i = 0; i < coffeeShopsData.length; i++) {
            if (coffeeShopsData[i].id == id) {
                shop = coffeeShopsData[i];
                break;
            }
        }
        if (!shop) {
            throw new Error('Кофейня не найдена');
        }
        return shop;
    });
}

// Создать кофейню
function createCoffeeShop(data) {
    return delay(400).then(function() {
        var newId = 1;
        for (var i = 0; i < coffeeShopsData.length; i++) {
            if (coffeeShopsData[i].id >= newId) {
                newId = coffeeShopsData[i].id + 1;
            }
        }
        var newShop = {
            id: newId,
            name: data.name,
            address: data.address,
            description: data.description,
            rating: parseFloat(data.rating) || 0,
            phone: data.phone,
            hours: data.hours,
            image: data.image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
            reviews: []
        };
        coffeeShopsData.push(newShop);
        return newShop;
    });
}

// Обновить кофейню
function updateCoffeeShop(id, data) {
    return delay(400).then(function() {
        var index = -1;
        for (var i = 0; i < coffeeShopsData.length; i++) {
            if (coffeeShopsData[i].id == id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            throw new Error('Кофейня не найдена');
        }
        coffeeShopsData[index].name = data.name || coffeeShopsData[index].name;
        coffeeShopsData[index].address = data.address || coffeeShopsData[index].address;
        coffeeShopsData[index].description = data.description || coffeeShopsData[index].description;
        coffeeShopsData[index].rating = parseFloat(data.rating) || coffeeShopsData[index].rating;
        coffeeShopsData[index].phone = data.phone || coffeeShopsData[index].phone;
        coffeeShopsData[index].hours = data.hours || coffeeShopsData[index].hours;
        coffeeShopsData[index].image = data.image || coffeeShopsData[index].image;
        return coffeeShopsData[index];
    });
}

// Удалить кофейню
function deleteCoffeeShop(id) {
    return delay(300).then(function() {
        var index = -1;
        for (var i = 0; i < coffeeShopsData.length; i++) {
            if (coffeeShopsData[i].id == id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            throw new Error('Кофейня не найдена');
        }
        coffeeShopsData.splice(index, 1);
        return true;
    });
}

// Добавить отзыв
function addReview(shopId, reviewData) {
    return delay(300).then(function() {
        var shop = null;
        for (var i = 0; i < coffeeShopsData.length; i++) {
            if (coffeeShopsData[i].id == shopId) {
                shop = coffeeShopsData[i];
                break;
            }
        }
        if (!shop) {
            throw new Error('Кофейня не найдена');
        }
        var newReviewId = 1;
        for (var j = 0; j < shop.reviews.length; j++) {
            if (shop.reviews[j].id >= newReviewId) {
                newReviewId = shop.reviews[j].id + 1;
            }
        }
        var newReview = {
            id: newReviewId,
            author: reviewData.author,
            text: reviewData.text,
            rating: parseInt(reviewData.rating),
            date: new Date().toISOString().split('T')[0]
        };
        shop.reviews.push(newReview);
        // Пересчитываем рейтинг
        var totalRating = 0;
        for (var k = 0; k < shop.reviews.length; k++) {
            totalRating += shop.reviews[k].rating;
        }
        shop.rating = Math.round((totalRating / shop.reviews.length) * 10) / 10;
        return newReview;
    });
}

// Поиск кофеен
function searchCoffeeShops(query) {
    return delay(300).then(function() {
        if (!query) {
            return coffeeShopsData;
        }
        var lowerQuery = query.toLowerCase();
        var results = [];
        for (var i = 0; i < coffeeShopsData.length; i++) {
            var shop = coffeeShopsData[i];
            if (shop.name.toLowerCase().indexOf(lowerQuery) !== -1 || 
                shop.address.toLowerCase().indexOf(lowerQuery) !== -1) {
                results.push(shop);
            }
        }
        return results;
    });
}
