var isSubmitting = false;
var searchQuery = '';

function showLoading() {
    console.log('Showing loading...');
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('view-container').innerHTML = '';
}

function hideLoading() {
    console.log('Hiding loading...');
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    console.log('Showing error:', message);
    document.getElementById('error').style.display = 'block';
    document.getElementById('error-message').textContent = message;
    document.getElementById('loading').style.display = 'none';
}

function hideError() {
    console.log('Hiding error...');
    document.getElementById('error').style.display = 'none';
}

function showNotification(message) {
    console.log('Showing notification:', message);
    var notification = document.getElementById('notification');
    document.getElementById('notification-message').textContent = message;
    notification.style.display = 'block';
    
    setTimeout(function() {
        notification.style.display = 'none';
    }, 3000);
}

function renderNotesList(params) {
    console.log('Rendering notes list...');
    showLoading();
    hideError();
    
    var hash = window.location.hash;
    var urlParams = new URLSearchParams(hash.split('?')[1] || '');
    searchQuery = urlParams.get('search') || '';
    
    var promise;
    if (searchQuery) {
        promise = searchNotes(searchQuery);
    } else {
        promise = getNotes();
    }
    
    promise.then(function(notes) {
        hideLoading();
        
        var html = '<div style="margin-bottom: 20px;">';
        html += '<h2 style="color: #4CAF50; margin-bottom: 15px;">Все заметки</h2>';
        html += '<div style="display: flex; gap: 10px; margin-bottom: 20px;">';
        html += '<input type="text" id="search-input" placeholder="Поиск заметок..." value="' + searchQuery + '" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">';
        html += '<button onclick="performSearch()" class="btn btn-primary">Искать</button>';
        html += '</div>';
        html += '</div>';
        
        if (notes.length === 0) {
            html += '<div class="empty-state">';
            html += '<h3>Заметок не найдено</h3>';
            html += '<p>Создайте свою первую заметку!</p>';
            html += '<a href="#/new" class="btn btn-primary" style="margin-top: 20px;">Создать заметку</a>';
            html += '</div>';
        } else {
            html += '<div class="note-list">';
            
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];
                var truncatedBody = note.body.substring(0, 100);
                if (note.body.length > 100) {
                    truncatedBody += '...';
                }
                
                html += '<div class="note-card" onclick="navigate(\'/items/' + note.id + '\')">';
                html += '<h3>' + note.title + '</h3>';
                html += '<p>' + truncatedBody + '</p>';
                html += '<div class="note-meta">ID: ' + note.id + '</div>';
                html += '</div>';
            }
            
            html += '</div>';
        }
        
        document.getElementById('view-container').innerHTML = html;
    })
    .catch(function(error) {
        hideLoading();
        showError('Не удалось загрузить заметки. Попробуйте позже.');
        console.log('Error loading notes:', error);
    });
}

function performSearch() {
    var searchInput = document.getElementById('search-input');
    var query = searchInput.value;
    console.log('Performing search with query:', query);
    
    if (query) {
        navigate('/items?search=' + encodeURIComponent(query));
    } else {
        navigate('/items');
    }
}

function renderNoteDetail(params) {
    console.log('Rendering note detail for id:', params.id);
    showLoading();
    hideError();
    
    getNote(params.id)
        .then(function(note) {
            hideLoading();
            
            var imageId = parseInt(params.id) % 100 + 1;
            var imageUrl = 'https://picsum.photos/800/400?random=' + imageId;
            
            var html = '<div class="note-detail">';
            html += '<h2>' + note.title + '</h2>';
            html += '<img src="' + imageUrl + '" alt="Изображение для заметки" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">';
            html += '<div class="note-content">' + note.body + '</div>';
            html += '<div class="note-meta" style="color: #999; font-size: 14px; margin-bottom: 20px;">ID заметки: ' + note.id + '</div>';
            html += '<div class="note-actions">';
            html += '<a href="#/items" class="btn btn-secondary">Назад к списку</a>';
            html += '<a href="#/items/' + note.id + '/edit" class="btn btn-primary">Редактировать</a>';
            html += '<button onclick="handleDelete(' + note.id + ')" class="btn btn-danger">Удалить</button>';
            html += '</div>';
            html += '</div>';
            
            document.getElementById('view-container').innerHTML = html;
        })
        .catch(function(error) {
            hideLoading();
            showError('Не удалось загрузить заметку. Возможно, она не существует.');
            console.log('Error loading note:', error);
        });
}

function renderCreateForm(params) {
    console.log('Rendering create form...');
    hideLoading();
    hideError();
    
    var html = '<div class="form-container">';
    html += '<h2 style="color: #4CAF50; margin-bottom: 20px;">Создать новую заметку</h2>';
    html += '<form id="note-form" onsubmit="handleSubmit(event, \'create\')">';
    html += '<div class="form-group">';
    html += '<label for="title">Заголовок:</label>';
    html += '<input type="text" id="title" name="title" required>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="body">Содержание:</label>';
    html += '<textarea id="body" name="body" required></textarea>';
    html += '</div>';
    html += '<div class="form-actions">';
    html += '<a href="#/items" class="btn btn-secondary">Отмена</a>';
    html += '<button type="submit" class="btn btn-primary" id="submit-btn">Создать</button>';
    html += '</div>';
    html += '</form>';
    html += '</div>';
    
    document.getElementById('view-container').innerHTML = html;
}

function renderEditForm(params) {
    console.log('Rendering edit form for id:', params.id);
    showLoading();
    hideError();
    
    getNote(params.id)
        .then(function(note) {
            hideLoading();
            
            var html = '<div class="form-container">';
            html += '<h2 style="color: #4CAF50; margin-bottom: 20px;">Редактировать заметку</h2>';
            html += '<form id="note-form" onsubmit="handleSubmit(event, \'edit\', ' + note.id + ')">';
            html += '<div class="form-group">';
            html += '<label for="title">Заголовок:</label>';
            html += '<input type="text" id="title" name="title" value="' + note.title + '" required>';
            html += '</div>';
            html += '<div class="form-group">';
            html += '<label for="body">Содержание:</label>';
            html += '<textarea id="body" name="body" required>' + note.body + '</textarea>';
            html += '</div>';
            html += '<div class="form-actions">';
            html += '<a href="#/items/' + note.id + '" class="btn btn-secondary">Отмена</a>';
            html += '<button type="submit" class="btn btn-primary" id="submit-btn">Сохранить</button>';
            html += '</div>';
            html += '</form>';
            html += '</div>';
            
            document.getElementById('view-container').innerHTML = html;
        })
        .catch(function(error) {
            hideLoading();
            showError('Не удалось загрузить заметку для редактирования.');
            console.log('Error loading note for edit:', error);
        });
}

function handleSubmit(event, action, noteId) {
    event.preventDefault();
    console.log('Handling submit for action:', action, 'noteId:', noteId);
    
    if (isSubmitting) {
        console.log('Already submitting, ignoring...');
        return;
    }
    
    isSubmitting = true;
    var submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    
    var title = document.getElementById('title').value;
    var body = document.getElementById('body').value;
    
    if (!title || !body) {
        alert('Заполните все поля!');
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = action === 'create' ? 'Создать' : 'Сохранить';
        return;
    }
    
    var noteData = {
        title: title,
        body: body,
        userId: 1
    };
    
    var promise;
    if (action === 'create') {
        promise = createNote(noteData);
    } else {
        promise = updateNote(noteId, noteData);
    }
    
    promise
        .then(function(result) {
            console.log('Submit successful:', result);
            isSubmitting = false;
            showNotification(action === 'create' ? 'Заметка создана!' : 'Заметка обновлена!');
            
            setTimeout(function() {
                if (action === 'create') {
                    navigate('/items');
                } else {
                    navigate('/items/' + noteId);
                }
            }, 500);
        })
        .catch(function(error) {
            console.log('Submit error:', error);
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = action === 'create' ? 'Создать' : 'Сохранить';
            alert('Произошла ошибка при сохранении. Попробуйте еще раз.');
        });
}

function handleDelete(noteId) {
    console.log('Handling delete for note:', noteId);
    
    var confirmed = confirm('Вы уверены, что хотите удалить эту заметку?');
    
    if (!confirmed) {
        console.log('Delete cancelled');
        return;
    }
    
    showLoading();
    
    deleteNote(noteId)
        .then(function() {
            console.log('Delete successful');
            hideLoading();
            showNotification('Заметка удалена!');
            
            setTimeout(function() {
                navigate('/items');
            }, 500);
        })
        .catch(function(error) {
            console.log('Delete error:', error);
            hideLoading();
            alert('Не удалось удалить заметку. Попробуйте еще раз.');
        });
}

function initApp() {
    console.log('Initializing app...');
    
    addRoute('/items', renderNotesList);
    addRoute('/items/:id', renderNoteDetail);
    addRoute('/new', renderCreateForm);
    addRoute('/items/:id/edit', renderEditForm);
    
    initRouter();
    
    console.log('App initialized!');
}

window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting app...');
    initApp();
});
