// Глобальные переменные для хранения состояния
var podcasts = [];
var currentPodcast = null;
var isLoading = false;
var searchQuery = '';

// API URL (используем JSONPlaceholder как mock)
var API_URL = 'https://jsonplaceholder.typicode.com';

// Данные подкастов (mock данные)
var mockPodcasts = [
    { id: 1, title: 'Tech Talk Daily', description: 'Ежедневные новости из мира технологий. Обсуждаем последние тренды, гаджеты и инновации.', category: 'Технологии', author: 'Иван Петров', duration: '45 мин', image: 'https://picsum.photos/seed/tech1/400/300', episodes: 156 },
    { id: 2, title: 'История за чашкой кофе', description: 'Увлекательные исторические факты и события. Путешествие во времени каждую неделю.', category: 'История', author: 'Мария Сидорова', duration: '60 мин', image: 'https://picsum.photos/seed/history2/400/300', episodes: 89 },
    { id: 3, title: 'Бизнес-завтрак', description: 'Советы для предпринимателей и стартаперов. Интервью с успешными бизнесменами.', category: 'Бизнес', author: 'Алексей Козлов', duration: '35 мин', image: 'https://picsum.photos/seed/business3/400/300', episodes: 203 },
    { id: 4, title: 'Наука простыми словами', description: 'Сложные научные концепции объясняем простым языком для всех.', category: 'Наука', author: 'Елена Новикова', duration: '50 мин', image: 'https://picsum.photos/seed/science4/400/300', episodes: 78 },
    { id: 5, title: 'Музыкальный микс', description: 'Обзоры новых альбомов, интервью с музыкантами и история музыки.', category: 'Музыка', author: 'Дмитрий Волков', duration: '55 мин', image: 'https://picsum.photos/seed/music5/400/300', episodes: 134 },
    { id: 6, title: 'Спортивный час', description: 'Все о спорте: новости, аналитика матчей, интервью со спортсменами.', category: 'Спорт', author: 'Сергей Михайлов', duration: '40 мин', image: 'https://picsum.photos/seed/sport6/400/300', episodes: 245 },
    { id: 7, title: 'Книжный клуб', description: 'Обсуждаем книги: классику и современную литературу. Рекомендации для чтения.', category: 'Литература', author: 'Анна Белова', duration: '65 мин', image: 'https://picsum.photos/seed/books7/400/300', episodes: 112 },
    { id: 8, title: 'Путешествия и приключения', description: 'Рассказы о путешествиях по всему миру. Советы туристам и истории из поездок.', category: 'Путешествия', author: 'Ольга Смирнова', duration: '70 мин', image: 'https://picsum.photos/seed/travel8/400/300', episodes: 98 },
    { id: 9, title: 'Здоровый образ жизни', description: 'Советы по здоровью, питанию и фитнесу. Как жить долго и счастливо.', category: 'Здоровье', author: 'Виктор Орлов', duration: '30 мин', image: 'https://picsum.photos/seed/health9/400/300', episodes: 167 },
    { id: 10, title: 'Кино и сериалы', description: 'Обзоры фильмов и сериалов. Рекомендации что посмотреть на выходных.', category: 'Кино', author: 'Наталья Федорова', duration: '45 мин', image: 'https://picsum.photos/seed/cinema10/400/300', episodes: 189 }
];

// Комментарии (mock)
var mockComments = [
    { id: 1, podcastId: 1, author: 'Пользователь1', text: 'Отличный подкаст!', date: '2025-12-10' },
    { id: 2, podcastId: 1, author: 'Пользователь2', text: 'Очень интересно, жду новых выпусков', date: '2025-12-09' },
    { id: 3, podcastId: 2, author: 'Историк', text: 'Люблю этот подкаст', date: '2025-12-08' }
];

// Счетчики для новых ID
var nextPodcastId = 11;
var nextCommentId = 4;

// Инициализация приложения
function init() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
    
    // Загружаем данные из localStorage
    var saved = localStorage.getItem('podcasts');
    if (saved) {
        try {
            podcasts = JSON.parse(saved);
        } catch(e) {
            podcasts = mockPodcasts.slice();
        }
    } else {
        podcasts = mockPodcasts.slice();
    }
    
    var savedComments = localStorage.getItem('comments');
    if (savedComments) {
        try {
            mockComments = JSON.parse(savedComments);
        } catch(e) {}
    }
}

// Сохранение данных
function saveData() {
    localStorage.setItem('podcasts', JSON.stringify(podcasts));
    localStorage.setItem('comments', JSON.stringify(mockComments));
}

// Роутер
function handleRoute() {
    var hash = window.location.hash || '#/items';
    var app = document.getElementById('app');
    
    // Парсинг hash
    if (hash.indexOf('?') !== -1) {
        var parts = hash.split('?');
        hash = parts[0];
        var params = new URLSearchParams(parts[1]);
        searchQuery = params.get('search') || '';
    }
    
    // Маршрутизация
    if (hash === '#/items' || hash === '#/' || hash === '') {
        renderList();
    } else if (hash === '#/new') {
        renderForm();
    } else if (hash.match(/#\/items\/\d+\/edit/)) {
        var id = parseInt(hash.split('/')[2]);
        renderForm(id);
    } else if (hash.match(/#\/items\/\d+/)) {
        var id = parseInt(hash.split('/')[2]);
        renderDetail(id);
    } else {
        renderList();
    }
}

// Рендер списка подкастов
function renderList() {
    var app = document.getElementById('app');
    
    // Показываем загрузку
    app.innerHTML = '<div class="loading">Загрузка подкастов...</div>';
    
    // Имитация задержки загрузки
    setTimeout(function() {
        var filteredPodcasts = podcasts;
        
        // Фильтрация по поиску
        if (searchQuery) {
            filteredPodcasts = podcasts.filter(function(p) {
                return p.title.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
                       p.description.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
            });
        }
        
        if (filteredPodcasts.length === 0) {
            app.innerHTML = '<div class="search-box"><input type="text" id="searchInput" placeholder="Поиск подкастов..." value="' + searchQuery + '"></div><div class="empty">Подкасты не найдены</div>';
            document.getElementById('searchInput').addEventListener('input', handleSearch);
            return;
        }
        
        var html = '<div class="search-box"><input type="text" id="searchInput" placeholder="Поиск подкастов..." value="' + searchQuery + '"></div>';
        html += '<div class="podcast-list">';
        
        for (var i = 0; i < filteredPodcasts.length; i++) {
            var p = filteredPodcasts[i];
            html += '<div class="podcast-card" onclick="goToDetail(' + p.id + ')">';
            html += '<img src="' + p.image + '" alt="Обложка подкаста ' + p.title + '">';
            html += '<div class="podcast-card-content">';
            html += '<h3>' + p.title + '</h3>';
            html += '<p>' + p.description.substring(0, 80) + '...</p>';
            html += '<span class="category">' + p.category + '</span>';
            html += '</div></div>';
        }
        
        html += '</div>';
        app.innerHTML = html;
        
        document.getElementById('searchInput').addEventListener('input', handleSearch);
    }, 500);
}

// Обработка поиска
function handleSearch(e) {
    searchQuery = e.target.value;
    if (searchQuery) {
        window.location.hash = '#/items?search=' + encodeURIComponent(searchQuery);
    } else {
        window.location.hash = '#/items';
    }
    renderList();
}

// Переход к детальной странице
function goToDetail(id) {
    window.location.hash = '#/items/' + id;
}

// Рендер детальной страницы
function renderDetail(id) {
    var app = document.getElementById('app');
    app.innerHTML = '<div class="loading">Загрузка...</div>';
    
    setTimeout(function() {
        var podcast = null;
        for (var i = 0; i < podcasts.length; i++) {
            if (podcasts[i].id === id) {
                podcast = podcasts[i];
                break;
            }
        }
        
        if (!podcast) {
            app.innerHTML = '<div class="error">Подкаст не найден</div>';
            return;
        }
        
        var html = '<a href="#/items" class="back-link">← Назад к списку</a>';
        html += '<div class="podcast-detail">';
        html += '<img src="' + podcast.image + '" alt="Обложка подкаста ' + podcast.title + '">';
        html += '<h2>' + podcast.title + '</h2>';
        html += '<div class="meta">Автор: ' + podcast.author + ' | Категория: ' + podcast.category + ' | Длительность: ' + podcast.duration + ' | Выпусков: ' + podcast.episodes + '</div>';
        html += '<div class="description">' + podcast.description + '</div>';
        html += '<div class="actions">';
        html += '<a href="#/items/' + podcast.id + '/edit" class="btn btn-primary">Редактировать</a>';
        html += '<button class="btn btn-danger" onclick="deletePodcast(' + podcast.id + ')">Удалить</button>';
        html += '</div>';
        
        // Комментарии
        html += '<div class="comments-section">';
        html += '<h3>Комментарии</h3>';
        
        var comments = mockComments.filter(function(c) { return c.podcastId === id; });
        
        if (comments.length === 0) {
            html += '<p>Комментариев пока нет</p>';
        } else {
            for (var j = 0; j < comments.length; j++) {
                var c = comments[j];
                html += '<div class="comment">';
                html += '<span class="author">' + c.author + '</span>';
                html += '<span class="date">' + c.date + '</span>';
                html += '<div class="text">' + c.text + '</div>';
                html += '</div>';
            }
        }
        
        // Форма комментария
        html += '<div class="comment-form">';
        html += '<h4>Оставить комментарий</h4>';
        html += '<div class="form-group"><label for="commentAuthor">Ваше имя</label><input type="text" id="commentAuthor"></div>';
        html += '<div class="form-group"><label for="commentText">Комментарий</label><textarea id="commentText"></textarea></div>';
        html += '<button class="btn btn-primary" onclick="addComment(' + podcast.id + ')">Отправить</button>';
        html += '</div>';
        
        html += '</div></div>';
        
        app.innerHTML = html;
    }, 300);
}

// Добавление комментария
function addComment(podcastId) {
    var author = document.getElementById('commentAuthor').value;
    var text = document.getElementById('commentText').value;
    
    if (!author || !text) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    var comment = {
        id: nextCommentId++,
        podcastId: podcastId,
        author: author,
        text: text,
        date: new Date().toISOString().split('T')[0]
    };
    
    mockComments.push(comment);
    saveData();
    showNotification('Комментарий добавлен', 'success');
    renderDetail(podcastId);
}

// Удаление подкаста
function deletePodcast(id) {
    if (confirm('Вы уверены, что хотите удалить этот подкаст?')) {
        podcasts = podcasts.filter(function(p) { return p.id !== id; });
        saveData();
        showNotification('Подкаст удален', 'success');
        window.location.hash = '#/items';
    }
}

// Рендер формы создания/редактирования
function renderForm(id) {
    var app = document.getElementById('app');
    var podcast = null;
    var isEdit = false;
    
    if (id) {
        isEdit = true;
        for (var i = 0; i < podcasts.length; i++) {
            if (podcasts[i].id === id) {
                podcast = podcasts[i];
                break;
            }
        }
        
        if (!podcast) {
            app.innerHTML = '<div class="error">Подкаст не найден</div>';
            return;
        }
    }
    
    var html = '<div class="form-container">';
    html += '<h2>' + (isEdit ? 'Редактировать подкаст' : 'Создать подкаст') + '</h2>';
    html += '<form id="podcastForm" onsubmit="submitForm(event, ' + (id || 'null') + ')">';
    
    html += '<div class="form-group">';
    html += '<label for="title">Название</label>';
    html += '<input type="text" id="title" name="title" value="' + (podcast ? podcast.title : '') + '" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="description">Описание</label>';
    html += '<textarea id="description" name="description" required>' + (podcast ? podcast.description : '') + '</textarea>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="author">Автор</label>';
    html += '<input type="text" id="author" name="author" value="' + (podcast ? podcast.author : '') + '" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="category">Категория</label>';
    html += '<select id="category" name="category" required>';
    var categories = ['Технологии', 'История', 'Бизнес', 'Наука', 'Музыка', 'Спорт', 'Литература', 'Путешествия', 'Здоровье', 'Кино'];
    for (var i = 0; i < categories.length; i++) {
        var selected = podcast && podcast.category === categories[i] ? ' selected' : '';
        html += '<option value="' + categories[i] + '"' + selected + '>' + categories[i] + '</option>';
    }
    html += '</select>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="duration">Длительность</label>';
    html += '<input type="text" id="duration" name="duration" value="' + (podcast ? podcast.duration : '') + '" placeholder="например: 45 мин" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="episodes">Количество выпусков</label>';
    html += '<input type="number" id="episodes" name="episodes" value="' + (podcast ? podcast.episodes : '1') + '" min="1" required>';
    html += '</div>';
    
    html += '<div class="form-group">';
    html += '<label for="image">URL изображения</label>';
    html += '<input type="url" id="image" name="image" value="' + (podcast ? podcast.image : 'https://picsum.photos/seed/podcast/400/300') + '">';
    html += '</div>';
    
    html += '<div class="form-actions">';
    html += '<button type="submit" class="btn btn-primary" id="submitBtn">' + (isEdit ? 'Сохранить' : 'Создать') + '</button>';
    html += '<a href="#/items" class="btn btn-secondary">Отмена</a>';
    html += '</div>';
    
    html += '</form></div>';
    
    app.innerHTML = html;
}

// Отправка формы
function submitForm(e, id) {
    e.preventDefault();
    
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохранение...';
    
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var author = document.getElementById('author').value;
    var category = document.getElementById('category').value;
    var duration = document.getElementById('duration').value;
    var episodes = parseInt(document.getElementById('episodes').value);
    var image = document.getElementById('image').value;
    
    // Валидация
    if (!title || !description || !author) {
        showNotification('Заполните все обязательные поля', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = id ? 'Сохранить' : 'Создать';
        return;
    }
    
    setTimeout(function() {
        if (id) {
            // Редактирование
            for (var i = 0; i < podcasts.length; i++) {
                if (podcasts[i].id === id) {
                    podcasts[i].title = title;
                    podcasts[i].description = description;
                    podcasts[i].author = author;
                    podcasts[i].category = category;
                    podcasts[i].duration = duration;
                    podcasts[i].episodes = episodes;
                    podcasts[i].image = image || podcasts[i].image;
                    break;
                }
            }
            showNotification('Подкаст обновлен', 'success');
        } else {
            // Создание
            var newPodcast = {
                id: nextPodcastId++,
                title: title,
                description: description,
                author: author,
                category: category,
                duration: duration,
                episodes: episodes,
                image: image || 'https://picsum.photos/seed/new' + nextPodcastId + '/400/300'
            };
            podcasts.push(newPodcast);
            showNotification('Подкаст создан', 'success');
        }
        
        saveData();
        window.location.hash = '#/items';
    }, 500);
}

// Показать уведомление
function showNotification(message, type) {
    var notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + type;
    
    setTimeout(function() {
        notification.className = 'notification hidden';
    }, 3000);
}

// Запуск приложения
init();
