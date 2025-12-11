import { api } from './api.js';

var content = document.getElementById('content');

function showLoading() {
    content.innerHTML = '<div class="loading">Загрузка...</div>';
}

function showError(message) {
    content.innerHTML = '<div class="error">' + message + '</div>';
}

function showSuccess(message) {
    var successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    content.insertBefore(successDiv, content.firstChild);
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

export var views = {
    showList: function() {
        showLoading();
        
        api.getItems()
            .then(items => {
                if (items.length === 0) {
                    content.innerHTML = '<div class="empty-state">Нет турниров. <a href="#/new">Добавить турнир</a></div>';
                    return;
                }
                
                var html = '<div class="items-list">';
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    html += '<div class="item-card" onclick="location.hash = \'#/items/' + item.id + '\'">';
                    html += '<img src="' + item.image + '" alt="' + item.name + '">';
                    html += '<h3>' + item.name + '</h3>';
                    html += '<p><strong>Вид спорта:</strong> ' + item.sport + '</p>';
                    html += '<p><strong>Дата:</strong> ' + item.date + '</p>';
                    html += '<p><strong>Место:</strong> ' + item.location + '</p>';
                    html += '</div>';
                }
                html += '</div>';
                
                content.innerHTML = html;
            })
            .catch(error => {
                showError('Ошибка загрузки: ' + error.message);
            });
    },
    
    showDetail: function(id) {
        showLoading();
        
        api.getItem(id)
            .then(item => {
                var html = '<div class="item-detail">';
                html += '<img src="' + item.image + '" alt="' + item.name + '">';
                html += '<h2>' + item.name + '</h2>';
                html += '<p><strong>Вид спорта:</strong> ' + item.sport + '</p>';
                html += '<p><strong>Дата проведения:</strong> ' + item.date + '</p>';
                html += '<p><strong>Место проведения:</strong> ' + item.location + '</p>';
                html += '<p><strong>Количество участников:</strong> ' + item.participants + '</p>';
                html += '<p><strong>Описание:</strong> ' + item.description + '</p>';
                html += '<div class="button-group">';
                html += '<button class="btn-primary" onclick="location.hash = \'#/items/' + item.id + '/edit\'">Редактировать</button>';
                html += '<button class="btn-danger" onclick="deleteItem(' + item.id + ')">Удалить</button>';
                html += '<button class="btn-secondary" onclick="location.hash = \'#/items\'">Назад</button>';
                html += '</div>';
                html += '</div>';
                
                content.innerHTML = html;
            })
            .catch(error => {
                showError('Ошибка загрузки: ' + error.message);
            });
    },
    
    showCreateForm: function() {
        var html = '<form id="itemForm">';
        html += '<h2>Добавить турнир</h2>';
        html += '<div class="form-group">';
        html += '<label for="name">Название турнира:</label>';
        html += '<input type="text" id="name" name="name" required>';
        html += '</div>';
        html += '<div class="form-group">';
        html += '<label for="sport">Вид спорта:</label>';
        html += '<input type="text" id="sport" name="sport" required>';
        html += '</div>';
        html += '<div class="form-group">';
        html += '<label for="date">Дата проведения:</label>';
        html += '<input type="date" id="date" name="date" required>';
        html += '</div>';
        html += '<div class="form-group">';
        html += '<label for="location">Место проведения:</label>';
        html += '<input type="text" id="location" name="location" required>';
        html += '</div>';
        html += '<div class="form-group">';
        html += '<label for="participants">Количество участников:</label>';
        html += '<input type="number" id="participants" name="participants" required>';
        html += '</div>';
        html += '<div class="form-group">';
        html += '<label for="description">Описание:</label>';
        html += '<textarea id="description" name="description" required></textarea>';
        html += '</div>';
        html += '<div class="button-group">';
        html += '<button type="submit" class="btn-primary">Создать</button>';
        html += '<button type="button" class="btn-secondary" onclick="location.hash = \'#/items\'">Отмена</button>';
        html += '</div>';
        html += '</form>';
        
        content.innerHTML = html;
        
        document.getElementById('itemForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Создание...';
            
            var formData = {
                name: document.getElementById('name').value,
                sport: document.getElementById('sport').value,
                date: document.getElementById('date').value,
                location: document.getElementById('location').value,
                participants: parseInt(document.getElementById('participants').value),
                description: document.getElementById('description').value
            };
            
            api.createItem(formData)
                .then(item => {
                    location.hash = '#/items';
                    setTimeout(() => {
                        showSuccess('Турнир успешно создан!');
                    }, 100);
                })
                .catch(error => {
                    showError('Ошибка создания: ' + error.message);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Создать';
                });
        });
    },
    
    showEditForm: function(id) {
        showLoading();
        
        api.getItem(id)
            .then(item => {
                var html = '<form id="itemForm">';
                html += '<h2>Редактировать турнир</h2>';
                html += '<div class="form-group">';
                html += '<label for="name">Название турнира:</label>';
                html += '<input type="text" id="name" name="name" value="' + item.name + '" required>';
                html += '</div>';
                html += '<div class="form-group">';
                html += '<label for="sport">Вид спорта:</label>';
                html += '<input type="text" id="sport" name="sport" value="' + item.sport + '" required>';
                html += '</div>';
                html += '<div class="form-group">';
                html += '<label for="date">Дата проведения:</label>';
                html += '<input type="date" id="date" name="date" value="' + item.date + '" required>';
                html += '</div>';
                html += '<div class="form-group">';
                html += '<label for="location">Место проведения:</label>';
                html += '<input type="text" id="location" name="location" value="' + item.location + '" required>';
                html += '</div>';
                html += '<div class="form-group">';
                html += '<label for="participants">Количество участников:</label>';
                html += '<input type="number" id="participants" name="participants" value="' + item.participants + '" required>';
                html += '</div>';
                html += '<div class="form-group">';
                html += '<label for="description">Описание:</label>';
                html += '<textarea id="description" name="description" required>' + item.description + '</textarea>';
                html += '</div>';
                html += '<div class="button-group">';
                html += '<button type="submit" class="btn-primary">Сохранить</button>';
                html += '<button type="button" class="btn-secondary" onclick="location.hash = \'#/items/' + item.id + '\'">Отмена</button>';
                html += '</div>';
                html += '</form>';
                
                content.innerHTML = html;
                
                document.getElementById('itemForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    var submitButton = e.target.querySelector('button[type="submit"]');
                    submitButton.disabled = true;
                    submitButton.textContent = 'Сохранение...';
                    
                    var formData = {
                        name: document.getElementById('name').value,
                        sport: document.getElementById('sport').value,
                        date: document.getElementById('date').value,
                        location: document.getElementById('location').value,
                        participants: parseInt(document.getElementById('participants').value),
                        description: document.getElementById('description').value
                    };
                    
                    api.updateItem(id, formData)
                        .then(updatedItem => {
                            location.hash = '#/items/' + id;
                            setTimeout(() => {
                                showSuccess('Турнир успешно обновлен!');
                            }, 100);
                        })
                        .catch(error => {
                            showError('Ошибка обновления: ' + error.message);
                            submitButton.disabled = false;
                            submitButton.textContent = 'Сохранить';
                        });
                });
            })
            .catch(error => {
                showError('Ошибка загрузки: ' + error.message);
            });
    }
};

window.deleteItem = function(id) {
    if (confirm('Вы уверены, что хотите удалить этот турнир?')) {
        api.deleteItem(id)
            .then(() => {
                location.hash = '#/items';
                setTimeout(() => {
                    showSuccess('Турнир успешно удален!');
                }, 100);
            })
            .catch(error => {
                showError('Ошибка удаления: ' + error.message);
            });
    }
};
