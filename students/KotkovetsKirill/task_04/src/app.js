// App модуль - основная логика приложения

var appContainer = document.getElementById('app');

// Показать страницу списка
function showListPage(params, queryString) {
    appContainer.innerHTML = showLoading();
    
    var searchQuery = getQueryParam(queryString, 'search');
    
    searchCoffeeShops(searchQuery).then(function(shops) {
        appContainer.innerHTML = renderCoffeeList(shops, searchQuery);
        
        // Добавляем обработчик поиска
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                var value = this.value;
                // Сохраняем поиск в hash
                if (value) {
                    window.location.hash = '#/items?search=' + encodeURIComponent(value);
                } else {
                    window.location.hash = '#/items';
                }
            });
        }
    }).catch(function(error) {
        appContainer.innerHTML = showError(error.message);
    });
}

// Показать страницу детали
function showDetailPage(params, queryString) {
    appContainer.innerHTML = showLoading();
    
    getCoffeeShopById(params.id).then(function(shop) {
        appContainer.innerHTML = renderCoffeeDetail(shop);
    }).catch(function(error) {
        appContainer.innerHTML = showError(error.message);
    });
}

// Показать страницу создания
function showNewPage(params, queryString) {
    appContainer.innerHTML = renderCoffeeForm(null);
    
    var form = document.getElementById('coffeeForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(null);
    });
}

// Показать страницу редактирования
function showEditPage(params, queryString) {
    appContainer.innerHTML = showLoading();
    
    getCoffeeShopById(params.id).then(function(shop) {
        appContainer.innerHTML = renderCoffeeForm(shop);
        
        var form = document.getElementById('coffeeForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(shop.id);
        });
    }).catch(function(error) {
        appContainer.innerHTML = showError(error.message);
    });
}

// Обработка отправки формы
function handleFormSubmit(shopId) {
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохранение...';
    
    var data = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        hours: document.getElementById('hours').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value,
        rating: document.getElementById('rating').value
    };
    
    // Простая валидация
    if (!data.name || !data.address) {
        showNotification('Заполните обязательные поля', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = shopId ? 'Сохранить' : 'Создать';
        return;
    }
    
    var promise;
    if (shopId) {
        promise = updateCoffeeShop(shopId, data);
    } else {
        promise = createCoffeeShop(data);
    }
    
    promise.then(function(result) {
        showNotification(shopId ? 'Кофейня обновлена!' : 'Кофейня создана!', 'success');
        navigateTo('#/items/' + result.id);
    }).catch(function(error) {
        showNotification('Ошибка: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = shopId ? 'Сохранить' : 'Создать';
    });
}

// Обработка удаления
function handleDelete(shopId) {
    if (confirm('Вы уверены, что хотите удалить эту кофейню?')) {
        deleteCoffeeShop(shopId).then(function() {
            showNotification('Кофейня удалена!', 'success');
            navigateTo('#/items');
        }).catch(function(error) {
            showNotification('Ошибка: ' + error.message, 'error');
        });
    }
}

// Обработка отправки отзыва
function handleReviewSubmit(event, shopId) {
    event.preventDefault();
    
    var reviewData = {
        author: document.getElementById('reviewAuthor').value,
        rating: document.getElementById('reviewRating').value,
        text: document.getElementById('reviewText').value
    };
    
    addReview(shopId, reviewData).then(function() {
        showNotification('Отзыв добавлен!', 'success');
        // Перезагружаем страницу
        showDetailPage({ id: shopId }, '');
    }).catch(function(error) {
        showNotification('Ошибка: ' + error.message, 'error');
    });
}

// Запуск приложения
initRouter();
