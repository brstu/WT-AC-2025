// Views модуль - отображение компонентов

// Показать уведомление
function showNotification(message, type) {
    var existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(function() {
        notification.remove();
    }, 3000);
}

// Показать загрузку
function showLoading() {
    return '<div class="loading">Загрузка...</div>';
}

// Показать ошибку
function showError(message) {
    return '<div class="error">Ошибка: ' + message + '</div>';
}

// Показать пустой список
function showEmpty() {
    return '<div class="empty">Кофейни не найдены</div>';
}

// Рендер списка кофеен
function renderCoffeeList(shops, searchQuery) {
    var html = '';
    html += '<div class="search-bar">';
    html += '<input type="text" id="searchInput" placeholder="Поиск кофеен..." value="' + (searchQuery || '') + '">';
    html += '</div>';
    
    if (shops.length === 0) {
        html += showEmpty();
        return html;
    }
    
    html += '<div class="coffee-list">';
    for (var i = 0; i < shops.length; i++) {
        var shop = shops[i];
        html += '<div class="coffee-card" onclick="navigateTo(\'#/items/' + shop.id + '\')">';
        html += '<img src="' + shop.image + '" alt="Фото кофейни ' + shop.name + '">';
        html += '<div class="coffee-card-content">';
        html += '<h3>' + shop.name + '</h3>';
        html += '<p>' + shop.address + '</p>';
        html += '<p class="rating">★ ' + shop.rating + '</p>';
        html += '</div>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}

// Рендер детальной страницы
function renderCoffeeDetail(shop) {
    var html = '';
    html += '<div class="coffee-detail">';
    html += '<img src="' + shop.image + '" alt="Фото кофейни ' + shop.name + '">';
    html += '<div class="coffee-detail-content">';
    html += '<h2>' + shop.name + '</h2>';
    html += '<p class="rating">★ ' + shop.rating + '</p>';
    html += '<p><strong>Адрес:</strong> ' + shop.address + '</p>';
    html += '<p><strong>Телефон:</strong> ' + shop.phone + '</p>';
    html += '<p><strong>Часы работы:</strong> ' + shop.hours + '</p>';
    html += '<p>' + shop.description + '</p>';
    
    html += '<div class="btn-group">';
    html += '<a href="#/items/' + shop.id + '/edit" class="btn btn-primary">Редактировать</a>';
    html += '<button class="btn btn-danger" onclick="handleDelete(' + shop.id + ')">Удалить</button>';
    html += '<a href="#/items" class="btn btn-secondary">Назад</a>';
    html += '</div>';
    
    // Отзывы
    html += '<div class="reviews-section">';
    html += '<h3>Отзывы</h3>';
    
    if (shop.reviews && shop.reviews.length > 0) {
        for (var i = 0; i < shop.reviews.length; i++) {
            var review = shop.reviews[i];
            html += '<div class="review-item">';
            html += '<span class="author">' + review.author + '</span>';
            html += ' <span class="rating">★ ' + review.rating + '</span>';
            html += ' <span class="date">' + review.date + '</span>';
            html += '<p class="text">' + review.text + '</p>';
            html += '</div>';
        }
    } else {
        html += '<p>Пока нет отзывов</p>';
    }
    
    // Форма добавления отзыва
    html += '<div class="review-form">';
    html += '<h4>Оставить отзыв</h4>';
    html += '<form id="reviewForm" onsubmit="handleReviewSubmit(event, ' + shop.id + ')">';
    html += '<div class="form-group">';
    html += '<label for="reviewAuthor">Ваше имя</label>';
    html += '<input type="text" id="reviewAuthor" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="reviewRating">Оценка</label>';
    html += '<select id="reviewRating" required>';
    html += '<option value="5">5 - Отлично</option>';
    html += '<option value="4">4 - Хорошо</option>';
    html += '<option value="3">3 - Нормально</option>';
    html += '<option value="2">2 - Плохо</option>';
    html += '<option value="1">1 - Ужасно</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="reviewText">Отзыв</label>';
    html += '<textarea id="reviewText" required></textarea>';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary">Отправить</button>';
    html += '</form>';
    html += '</div>';
    
    html += '</div>'; // reviews-section
    html += '</div>'; // coffee-detail-content
    html += '</div>'; // coffee-detail
    
    return html;
}

// Рендер формы создания/редактирования
function renderCoffeeForm(shop) {
    var isEdit = shop !== null;
    var html = '';
    html += '<div class="form-container">';
    html += '<h2>' + (isEdit ? 'Редактировать кофейню' : 'Добавить кофейню') + '</h2>';
    html += '<form id="coffeeForm">';
    
    html += '<div class="form-group">';
    html += '<label for="name">Название</label>';
    html += '<input type="text" id="name" value="' + (shop ? shop.name : '') + '" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="address">Адрес</label>';
    html += '<input type="text" id="address" value="' + (shop ? shop.address : '') + '" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="phone">Телефон</label>';
    html += '<input type="text" id="phone" value="' + (shop ? shop.phone : '') + '" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="hours">Часы работы</label>';
    html += '<input type="text" id="hours" value="' + (shop ? shop.hours : '') + '" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="description">Описание</label>';
    html += '<textarea id="description" required>' + (shop ? shop.description : '') + '</textarea>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="image">URL изображения</label>';
    html += '<input type="text" id="image" value="' + (shop ? shop.image : '') + '">';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="rating">Рейтинг (1-5)</label>';
    html += '<input type="number" id="rating" min="1" max="5" step="0.1" value="' + (shop ? shop.rating : '4') + '" required>';
    html += '</div>';
    
    html += '<div class="btn-group">';
    html += '<button type="submit" class="btn btn-primary" id="submitBtn">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<a href="#/items" class="btn btn-secondary">Отмена</a>';
    html += '</div>';
    
    html += '</form>';
    html += '</div>';
    
    return html;
}
