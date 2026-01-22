// Глобальные переменные
var API_URL = 'http://localhost:3000/api';
var posts = [];
var editingPostId = null;
var isLoading = false;

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    setupEventListeners();
});

// Загрузка статей
function loadPosts() {
    if (isLoading) return;
    isLoading = true;
    
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                posts = JSON.parse(xhr.responseText);
                renderPosts();
            } catch(e) {
                console.log('Ошибка парсинга');
            }
        }
        isLoading = false;
    };
    xhr.onerror = function() {
        console.error('Ошибка загрузки');
        isLoading = false;
    };
    xhr.open('GET', API_URL + '/posts');
    xhr.send();
}

// Рендеринг постов
function renderPosts() {
    var listDiv = document.getElementById('posts-list');
    
    if (!posts || posts.length === 0) {
        listDiv.innerHTML = '<div class="empty-state"><h2>Нет статей</h2><p>Создайте первую статью, нажав на кнопку "Новая статья"</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        html += '<div class="post-card">';
        html += '<h3>' + escapeHtml(post.title) + '</h3>';
        html += '<div class="post-date">' + post.date + '</div>';
        html += '<p>' + escapeHtml(post.content) + '</p>';
        html += '<div class="post-actions">';
        html += '<button class="btn btn-edit" onclick="editPost(' + post.id + ')">Редактировать</button>';
        html += '<button class="btn btn-danger" onclick="deletePost(' + post.id + ')">Удалить</button>';
        html += '</div>';
        html += '</div>';
    }
    
    listDiv.innerHTML = html;
}

// Экранирование HTML
function escapeHtml(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Настройка обработчиков событий
function setupEventListeners() {
    var btn = document.getElementById('new-post-btn');
    var modal = document.getElementById('modal');
    var closeBtn = document.querySelector('.close');
    var form = document.getElementById('post-form');
    var cancelBtn = document.getElementById('cancel-btn');
    
    if (btn) {
        btn.onclick = function() {
            modal.style.display = 'block';
            editingPostId = null;
            document.getElementById('modal-title').textContent = 'Новая статья';
            document.getElementById('post-form').reset();
        };
    }
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            savePost();
        };
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Сохранение поста
function savePost() {
    var title = document.getElementById('title-input').value;
    var content = document.getElementById('content-input').value;
    
    if (!title) {
        alert('Пожалуйста, введите название статьи');
        return;
    }
    
    var xhr = new XMLHttpRequest();
    
    if (editingPostId) {
        xhr.open('PUT', API_URL + '/posts/' + editingPostId);
    } else {
        xhr.open('POST', API_URL + '/posts');
    }
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 201 || xhr.status === 200) {
            document.getElementById('modal').style.display = 'none';
            document.getElementById('post-form').reset();
            editingPostId = null;
            loadPosts();
        } else {
            alert('Ошибка при сохранении статьи');
        }
    };
    xhr.onerror = function() {
        alert('Ошибка при сохранении статьи');
    };
    
    var data = JSON.stringify({ title: title, content: content });
    xhr.send(data);
}

// Редактирование поста
function editPost(id) {
    var post = posts.find(function(p) { return p.id === id; });
    
    document.getElementById('title-input').value = post.title;
    document.getElementById('content-input').value = post.content;
    document.getElementById('modal').style.display = 'block';
    document.getElementById('modal-title').textContent = 'Редактирование статьи';
    editingPostId = id;
}

// Удаление поста
function deletePost(id) {
    if (confirm('Вы уверены что хотите удалить эту статью?')) {
        var xhr = new XMLHttpRequest();
        xhr.open('DELETE', API_URL + '/posts/' + id);
        xhr.onload = function() {
            if (xhr.status === 200) {
                loadPosts();
            }
        };
        xhr.send();
    }
}
