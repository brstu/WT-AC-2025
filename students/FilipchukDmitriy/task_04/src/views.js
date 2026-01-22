// Views
var content = document.getElementById('content');
var isLoading = false;
var searchQuery = '';

function showLoading() {
    isLoading = true;
    content.innerHTML = '<div class="loading">Загрузка...</div>';
}

function showError(message) {
    content.innerHTML = '<div class="error">Ошибка: ' + message + '</div>';
}

function showItemsList() {
    showLoading();
    
    var params = new URLSearchParams(window.location.hash.split('?')[1]);
    searchQuery = params.get('search') || '';
    
    getItems()
        .then(function(items) {
            isLoading = false;
            
            var filteredItems = items;
            if (searchQuery) {
                filteredItems = items.filter(function(item) {
                    return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.body.toLowerCase().includes(searchQuery.toLowerCase());
                });
            }
            
            if (filteredItems.length === 0) {
                content.innerHTML = '<div class="empty-state"><h3>Нет проектов</h3><p>Добавьте первый благотворительный проект</p></div>';
                return;
            }
            
            var html = '<div style="margin-bottom: 20px;"><input type="text" id="search" placeholder="Поиск проектов..." value="' + searchQuery + '" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 16px;"></div>';
            html += '<div class="items-list">';
            
            for (var i = 0; i < filteredItems.length; i++) {
                var item = filteredItems[i];
                var imageId = (item.id % 20) + 1;
                html += '<div class="item-card" onclick="navigate(\'#/items/' + item.id + '\')">';
                html += '<img src="https://picsum.photos/400/300?random=' + imageId + '" alt="Изображение проекта благотворительности">';
                html += '<div class="item-card-content">';
                html += '<h3>' + item.title.substring(0, 50) + '</h3>';
                html += '<p>' + item.body.substring(0, 100) + '...</p>';
                html += '</div>';
                html += '</div>';
            }
            
            html += '</div>';
            content.innerHTML = html;
            
            var searchInput = document.getElementById('search');
            searchInput.addEventListener('input', function(e) {
                var value = e.target.value;
                if (value) {
                    navigate('#/items?search=' + encodeURIComponent(value));
                } else {
                    navigate('#/items');
                }
            });
        })
        .catch(function(error) {
            isLoading = false;
            showError('Не удалось загрузить список проектов');
        });
}

function showItemDetail(params) {
    showLoading();
    
    var id = params.id;
    
    getItem(id)
        .then(function(item) {
            isLoading = false;
            var imageId = (item.id % 20) + 1;
            var html = '<div class="item-detail">';
            html += '<img src="https://picsum.photos/800/400?random=' + imageId + '" alt="Детальное изображение благотворительного проекта">';
            html += '<h2>' + item.title + '</h2>';
            html += '<p>' + item.body + '</p>';
            html += '<p><strong>ID проекта:</strong> ' + item.id + '</p>';
            html += '<p><strong>Автор:</strong> Пользователь #' + item.userId + '</p>';
            html += '<div>';
            html += '<button class="btn btn-primary" onclick="navigate(\'#/items/' + id + '/edit\')">Редактировать</button>';
            html += '<button class="btn btn-danger" onclick="handleDelete(' + id + ')">Удалить</button>';
            html += '<button class="btn btn-secondary" onclick="navigate(\'#/items\')">Назад</button>';
            html += '</div>';
            html += '</div>';
            content.innerHTML = html;
        })
        .catch(function(error) {
            isLoading = false;
            showError('Не удалось загрузить проект');
        });
}

function showCreateForm() {
    var html = '<div class="form-container">';
    html += '<h2>Создать новый проект</h2>';
    html += '<form id="createForm">';
    html += '<div class="form-group">';
    html += '<label>Название проекта</label>';
    html += '<input type="text" id="title" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>Описание проекта</label>';
    html += '<textarea id="body" required></textarea>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label>ID автора</label>';
    html += '<input type="number" id="userId" value="1" required>';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary" id="submitBtn">Создать</button>';
    html += '<button type="button" class="btn btn-secondary" onclick="navigate(\'#/items\')">Отмена</button>';
    html += '</form>';
    html += '</div>';
    content.innerHTML = html;
    
    document.getElementById('createForm').addEventListener('submit', handleCreate);
}

function showEditForm(params) {
    showLoading();
    
    var id = params.id;
    
    getItem(id)
        .then(function(item) {
            isLoading = false;
            var html = '<div class="form-container">';
            html += '<h2>Редактировать проект</h2>';
            html += '<form id="editForm">';
            html += '<div class="form-group">';
            html += '<label>Название проекта</label>';
            html += '<input type="text" id="title" value="' + item.title + '" required>';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<label>Описание проекта</label>';
            html += '<textarea id="body" required>' + item.body + '</textarea>';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<label>ID автора</label>';
            html += '<input type="number" id="userId" value="' + item.userId + '" required>';
            html += '</div>';
            html += '<button type="submit" class="btn btn-primary" id="submitBtn">Сохранить</button>';
            html += '<button type="button" class="btn btn-secondary" onclick="navigate(\'#/items/' + id + '\')">Отмена</button>';
            html += '</form>';
            html += '</div>';
            content.innerHTML = html;
            
            document.getElementById('editForm').addEventListener('submit', function(e) {
                handleEdit(e, id);
            });
        })
        .catch(function(error) {
            isLoading = false;
            showError('Не удалось загрузить проект для редактирования');
        });
}

function handleCreate(e) {
    e.preventDefault();
    
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Создание...';
    
    var title = document.getElementById('title').value;
    var body = document.getElementById('body').value;
    var userId = document.getElementById('userId').value;
    
    if (!title || !body) {
        alert('Заполните все поля!');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Создать';
        return;
    }
    
    var itemData = {
        title: title,
        body: body,
        userId: parseInt(userId)
    };
    
    createItem(itemData)
        .then(function(result) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Создать';
            alert('Проект успешно создан!');
            navigate('#/items');
        })
        .catch(function(error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Создать';
            alert('Ошибка при создании проекта');
        });
}

function handleEdit(e, id) {
    e.preventDefault();
    
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохранение...';
    
    var title = document.getElementById('title').value;
    var body = document.getElementById('body').value;
    var userId = document.getElementById('userId').value;
    
    var itemData = {
        id: id,
        title: title,
        body: body,
        userId: parseInt(userId)
    };
    
    updateItem(id, itemData)
        .then(function(result) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Сохранить';
            alert('Проект успешно обновлен!');
            navigate('#/items/' + id);
        })
        .catch(function(error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Сохранить';
            alert('Ошибка при обновлении проекта');
        });
}

function handleDelete(id) {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        deleteItem(id)
            .then(function() {
                alert('Проект успешно удален!');
                navigate('#/items');
            })
            .catch(function(error) {
                alert('Ошибка при удалении проекта');
            });
    }
}
