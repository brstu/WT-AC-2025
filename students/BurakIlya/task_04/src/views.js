// Views module для рендеринга страниц

// Переменная для хранения текущих данных
var currentData = null;

// Рендер списка
function renderItemsList(items) {
    var app = document.getElementById('app');
    
    if (!items || items.length === 0) {
        app.innerHTML = '<div class="empty"><h2>Нет доступных фильтров</h2><p>Добавьте первый фильтр!</p></div>';
        return;
    }
    
    var html = '<h2>Все фильтры</h2><div class="items-grid">';
    
    // Формирование HTML для карточек фильтров
    for (var i = 0; i < items.length; i++) {
        html += '<div class="item-card" onclick="navigateTo(\'#/items/' + items[i].id + '\')">';
        html += '<img src="' + items[i].image + '" alt="' + items[i].name + '">';
        html += '<h3>' + items[i].name + '</h3>';
        html += '<p><strong>Категория:</strong> ' + items[i].category + '</p>';
        html += '<p style="color: #666; font-size: 14px;">' + items[i].description.substring(0, 50) + '...</p>';
        html += '</div>';
    }
    
    html += '</div>';
    app.innerHTML = html;
}

// Рендер детальной страницы
function renderItemDetail(id) {
    var item = API.getItem(parseInt(id));
    var app = document.getElementById('app');
    
    if (!item) {
        app.innerHTML = '<div class="error">Фильтр не найден</div>';
        return;
    }
    
    // Формирование HTML для детальной страницы
    var html = '<div class="item-detail">';
    html += '<img src="' + item.image + '" alt="' + item.name + '">';
    html += '<h2>' + item.name + '</h2>';
    html += '<p><strong>Категория:</strong> ' + item.category + '</p>';
    html += '<p>' + item.description + '</p>';
    html += '<div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">';
    html += '<h3>Параметры фильтра:</h3>';
    html += '<p><strong>Яркость:</strong> ' + item.brightness + '</p>';
    html += '<p><strong>Контраст:</strong> ' + item.contrast + '</p>';
    html += '<p><strong>Насыщенность:</strong> ' + item.saturation + '</p>';
    html += '</div>';
    html += '<div class="actions">';
    html += '<button class="btn btn-primary" onclick="navigateTo(\'#/items/' + id + '/edit\')">Редактировать</button>';
    html += '<button class="btn btn-danger" onclick="deleteItem(' + id + ')">Удалить</button>';
    html += '<button class="btn btn-secondary" onclick="navigateTo(\'#/items\')">Назад</button>';
    html += '</div>';
    html += '</div>';
    
    app.innerHTML = html;
}

// Рендер формы создания
function renderCreateForm() {
    var app = document.getElementById('app');
    
    var html = '<form id="itemForm" onsubmit="handleSubmit(event)">';
    html += '<h2>Добавить новый фильтр</h2>';
    html += '<div class="form-group">';
    html += '<label>Название:</label>';
    html += '<input type="text" name="name" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Категория:</label>';
    html += '<select name="category">';
    html += '<option value="Ретро">Ретро</option>';
    html += '<option value="Черно-белый">Черно-белый</option>';
    html += '<option value="Теплые тона">Теплые тона</option>';
    html += '<option value="Холодные тона">Холодные тона</option>';
    html += '<option value="Драматичный">Драматичный</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Описание:</label>';
    html += '<textarea name="description" required></textarea>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Яркость (0.0 - 2.0):</label>';
    html += '<input type="number" name="brightness" step="0.1" value="1.0" min="0" max="2">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Контраст (0.0 - 2.0):</label>';
    html += '<input type="number" name="contrast" step="0.1" value="1.0" min="0" max="2">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Насыщенность (0.0 - 2.0):</label>';
    html += '<input type="number" name="saturation" step="0.1" value="1.0" min="0" max="2">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>URL изображения:</label>';
    html += '<input type="url" name="image" placeholder="https://example.com/image.jpg">';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary">Создать</button>';
    html += '<button type="button" class="btn btn-secondary" onclick="navigateTo(\'#/items\')">Отмена</button>';
    html += '</form>';
    
    app.innerHTML = html;
}

// Рендер формы редактирования
function renderEditForm(id) {
    var item = API.getItem(parseInt(id));
    var app = document.getElementById('app');
    
    if (!item) {
        app.innerHTML = '<div class="error">Фильтр не найден</div>';
        return;
    }
    
    // Формирование HTML формы редактирования
    var html = '<form id="itemForm" onsubmit="handleUpdate(event, ' + id + ')">';
    html += '<h2>Редактировать фильтр</h2>';
    html += '<div class="form-group">';
    html += '<label>Название:</label>';
    html += '<input type="text" name="name" value="' + item.name + '" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Категория:</label>';
    html += '<select name="category">';
    html += '<option value="Ретро" ' + (item.category === 'Ретро' ? 'selected' : '') + '>Ретро</option>';
    html += '<option value="Черно-белый" ' + (item.category === 'Черно-белый' ? 'selected' : '') + '>Черно-белый</option>';
    html += '<option value="Теплые тона" ' + (item.category === 'Теплые тона' ? 'selected' : '') + '>Теплые тона</option>';
    html += '<option value="Холодные тона" ' + (item.category === 'Холодные тона' ? 'selected' : '') + '>Холодные тона</option>';
    html += '<option value="Драматичный" ' + (item.category === 'Драматичный' ? 'selected' : '') + '>Драматичный</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Описание:</label>';
    html += '<textarea name="description" required>' + item.description + '</textarea>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Яркость (0.0 - 2.0):</label>';
    html += '<input type="number" name="brightness" step="0.1" value="' + item.brightness + '" min="0" max="2">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Контраст (0.0 - 2.0):</label>';
    html += '<input type="number" name="contrast" step="0.1" value="' + item.contrast + '" min="0" max="2">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Насыщенность (0.0 - 2.0):</label>';
    html += '<input type="number" name="saturation" step="0.1" value="' + item.saturation + '" min="0" max="2">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>URL изображения:</label>';
    html += '<input type="url" name="image" value="' + item.image + '" placeholder="https://example.com/image.jpg">';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary">Сохранить</button>';
    html += '<button type="button" class="btn btn-secondary" onclick="navigateTo(\'#/items\')">Отмена</button>';
    html += '</form>';
    
    app.innerHTML = html;
}

// Обработчик отправки формы создания
function handleSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var formData = new FormData(form);
    var data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    API.createItem(data);
    showMessage('Фильтр успешно создан!', 'success');
    setTimeout(() => {
        navigateTo('#/items');
    }, 1000);
}

// Обработчик обновления
function handleUpdate(e, id) {
    e.preventDefault();
    var form = e.target;
    var formData = new FormData(form);
    var data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    API.updateItem(id, data);
    showMessage('Фильтр успешно обновлен!', 'success');
    setTimeout(() => {
        navigateTo('#/items/' + id);
    }, 1000);
}

// Удаление элемента
function deleteItem(id) {
    // Подтверждение удаления
    if (confirm('Вы уверены, что хотите удалить этот фильтр?')) {
        API.deleteItem(id);
        showMessage('Фильтр удален', 'success');
        navigateTo('#/items');
    }
}

// Показ сообщения
function showMessage(text, type) {
    var app = document.getElementById('app');
    var msg = document.createElement('div');
    msg.className = type;
    msg.textContent = text;
    app.insertBefore(msg, app.firstChild);
    
    setTimeout(() => {
        msg.remove();
    }, 3000);
}

// Загрузка
function showLoading() {
    document.getElementById('app').innerHTML = '<div class="loading">Загрузка...</div>';
}
