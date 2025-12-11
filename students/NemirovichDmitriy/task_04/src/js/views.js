// Модуль представлений (views)
// Генерирует HTML для разных страниц

var contentElement = null;
var loadingElement = null;
var errorElement = null;

// Инициализация элементов
function initViews() {
    contentElement = document.getElementById('content');
    loadingElement = document.getElementById('loading');
    errorElement = document.getElementById('error');
}

// Показать загрузку
function showLoading() {
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    contentElement.innerHTML = '';
}

// Скрыть загрузку
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Показать ошибку
function showError(message) {
    hideLoading();
    errorElement.style.display = 'block';
    errorElement.innerHTML = '<p>' + message + '</p>';
}

// Показать уведомление
function showNotification(message) {
    var notification = document.getElementById('notification');
    notification.innerHTML = message;
    notification.style.display = 'block';
    setTimeout(function() {
        notification.style.display = 'none';
    }, 3000);
}

// Отрисовка списка растений
function renderPlantList(plants, searchQuery) {
    hideLoading();
    errorElement.style.display = 'none';
    
    var html = '';
    html += '<div class="search-box">';
    html += '<input type="text" id="searchInput" placeholder="Поиск растений..." value="' + (searchQuery || '') + '">';
    html += '</div>';
    
    if (plants.length == 0) {
        html += '<div class="empty-state">';
        html += '<p>Растения не найдены</p>';
        html += '</div>';
    } else {
        html += '<div class="plant-list">';
        for (var i = 0; i < plants.length; i++) {
            var plant = plants[i];
            html += '<div class="plant-card" onclick="navigateTo(\'#/items/' + plant.id + '\')">';
            html += '<img src="' + plant.image + '" alt="' + plant.name + '">';
            html += '<h3>' + plant.name + '</h3>';
            html += '<p>' + plant.description.substring(0, 80) + '...</p>';
            html += '</div>';
        }
        html += '</div>';
    }
    
    contentElement.innerHTML = html;
    
    // Обработчик поиска
    var searchInput = document.getElementById('searchInput');
    searchInput.onkeyup = function() {
        var query = this.value;
        // Сохраняем поиск в hash
        if (query) {
            window.location.hash = '#/items?search=' + encodeURIComponent(query);
        } else {
            window.location.hash = '#/items';
        }
    };
}

// Отрисовка детальной страницы растения
function renderPlantDetail(plant) {
    hideLoading();
    errorElement.style.display = 'none';
    
    var html = '';
    html += '<a href="#/items" class="back-link">← Назад к списку</a>';
    html += '<div class="plant-detail">';
    html += '<img src="' + plant.image + '" alt="' + plant.name + '">';
    html += '<h2>' + plant.name + '</h2>';
    html += '<p><strong>Категория:</strong> ' + plant.category + '</p>';
    html += '<p>' + plant.description + '</p>';
    if (plant.notes) {
        html += '<p><strong>Заметки:</strong> ' + plant.notes + '</p>';
    }
    html += '<div>';
    html += '<a href="#/items/' + plant.id + '/edit" class="btn btn-edit">Редактировать</a>';
    html += '<button class="btn btn-delete" onclick="confirmDelete(' + plant.id + ')">Удалить</button>';
    html += '</div>';
    html += '</div>';
    
    contentElement.innerHTML = html;
}

// Отрисовка формы создания
function renderCreateForm() {
    hideLoading();
    errorElement.style.display = 'none';
    
    var html = '';
    html += '<a href="#/items" class="back-link">← Назад к списку</a>';
    html += '<div class="form-container">';
    html += '<h2>Добавить растение</h2>';
    html += '<form id="plantForm">';
    html += '<div class="form-group">';
    html += '<label for="name">Название</label>';
    html += '<input type="text" id="name" name="name" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="category">Категория</label>';
    html += '<input type="text" id="category" name="category" value="Комнатные">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="description">Описание</label>';
    html += '<textarea id="description" name="description" required></textarea>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="notes">Заметки</label>';
    html += '<textarea id="notes" name="notes"></textarea>';
    html += '</div>';
    html += '<button type="submit" class="btn" id="submitBtn">Создать</button>';
    html += '</form>';
    html += '</div>';
    
    contentElement.innerHTML = html;
    
    // Обработчик формы
    document.getElementById('plantForm').onsubmit = function(e) {
        e.preventDefault();
        var submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Сохранение...';
        
        var data = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            notes: document.getElementById('notes').value
        };
        
        createPlant(data, function(err, plant) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Создать';
            
            if (err) {
                showError('Ошибка при создании');
            } else {
                showNotification('Растение успешно создано!');
                window.location.hash = '#/items/' + plant.id;
            }
        });
    };
}

// Отрисовка формы редактирования
function renderEditForm(plant) {
    hideLoading();
    errorElement.style.display = 'none';
    
    var html = '';
    html += '<a href="#/items/' + plant.id + '" class="back-link">← Назад</a>';
    html += '<div class="form-container">';
    html += '<h2>Редактировать растение</h2>';
    html += '<form id="plantForm">';
    html += '<div class="form-group">';
    html += '<label for="name">Название</label>';
    html += '<input type="text" id="name" name="name" value="' + plant.name + '" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="category">Категория</label>';
    html += '<input type="text" id="category" name="category" value="' + plant.category + '">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="description">Описание</label>';
    html += '<textarea id="description" name="description" required>' + plant.description + '</textarea>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="notes">Заметки</label>';
    html += '<textarea id="notes" name="notes">' + (plant.notes || '') + '</textarea>';
    html += '</div>';
    html += '<button type="submit" class="btn" id="submitBtn">Сохранить</button>';
    html += '</form>';
    html += '</div>';
    
    contentElement.innerHTML = html;
    
    // Обработчик формы
    document.getElementById('plantForm').onsubmit = function(e) {
        e.preventDefault();
        var submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Сохранение...';
        
        var data = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            notes: document.getElementById('notes').value
        };
        
        updatePlant(plant.id, data, function(err, updatedPlant) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Сохранить';
            
            if (err) {
                showError('Ошибка при обновлении');
            } else {
                showNotification('Растение успешно обновлено!');
                window.location.hash = '#/items/' + plant.id;
            }
        });
    };
}

// Подтверждение удаления
function confirmDelete(id) {
    if (confirm('Вы уверены, что хотите удалить это растение?')) {
        deletePlant(id, function(err, result) {
            if (err) {
                showError('Ошибка при удалении');
            } else {
                showNotification('Растение удалено!');
                window.location.hash = '#/items';
            }
        });
    }
}
