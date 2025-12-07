// Глобальные переменные (антипаттерн)
var currentPage = 1;
var itemsPerPage = 10;
var allArticles = [];
var filteredArticles = [];
var cache = {};
var currentAbortController = null;

// Инициализация при загрузке страницы
window.onload = function() {
    loadArticles();
};

// Функция загрузки статей с JSONPlaceholder
function loadArticles(ignoreCache = false) {
    var loadingDiv = document.getElementById('loading');
    var errorDiv = document.getElementById('error');
    var articlesDiv = document.getElementById('articles');
    
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    articlesDiv.innerHTML = '';
    
    // Отмена предыдущего запроса
    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();
    
    var cacheKey = 'articles_list';
    
    // Проверка кэша (только если не принудительное обновление)
    if (!ignoreCache && cache[cacheKey]) {
        var cachedData = cache[cacheKey];
        var now = new Date().getTime();
        if (now - cachedData.timestamp < 300000) { // 5 минут TTL
            console.log('Загрузка из кэша');
            allArticles = cachedData.data;
            filteredArticles = allArticles;
            displayArticles();
            loadingDiv.style.display = 'none';
            return;
        }
    }
    
    // Запрос с retry и timeout
    fetchWithRetry('https://jsonplaceholder.typicode.com/posts', {
        retries: 3,
        backoffMs: 1000,
        timeoutMs: 5000,
        signal: currentAbortController.signal
    })
    .then(function(data) {
        // Берем только первые 20 постов
        allArticles = data.slice(0, 20);
        
        // Добавляем изображения из другого API
        allArticles = allArticles.map(function(article) {
            article.image = 'https://picsum.photos/400/300?random=' + article.id;
            return article;
        });
        
        filteredArticles = allArticles;
        
        // Сохранение в кэш
        cache[cacheKey] = {
            data: allArticles,
            timestamp: new Date().getTime()
        };
        
        displayArticles();
        loadingDiv.style.display = 'none';
    })
    .catch(function(error) {
        loadingDiv.style.display = 'none';
        if (error.name === 'AbortError') {
            console.log('Запрос отменен');
            return;
        }
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Ошибка загрузки: ' + error.message;
    });
}

// Функция с ретраями и таймаутом (много дублирования кода - антипаттерн)
function fetchWithRetry(url, options) {
    var retries = options.retries || 3;
    var backoffMs = options.backoffMs || 1000;
    var timeoutMs = options.timeoutMs || 5000;
    var signal = options.signal;
    
    return new Promise(function(resolve, reject) {
        var attemptFetch = function(attemptsLeft) {
            var timeoutId = setTimeout(function() {
                reject(new Error('Timeout'));
            }, timeoutMs);
            
            fetch(url, { signal: signal })
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                    }
                    return response.json();
                })
                .then(function(data) {
                    resolve(data);
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    
                    if (error.name === 'AbortError') {
                        reject(error);
                        return;
                    }
                    
                    if (attemptsLeft > 0) {
                        console.log('Повторная попытка... Осталось: ' + attemptsLeft);
                        setTimeout(function() {
                            attemptFetch(attemptsLeft - 1);
                        }, backoffMs);
                    } else {
                        reject(error);
                    }
                });
        };
        
        attemptFetch(retries);
    });
}

// Отображение статей
function displayArticles() {
    var articlesDiv = document.getElementById('articles');
    articlesDiv.innerHTML = '';
    
    var start = (currentPage - 1) * itemsPerPage;
    var end = start + itemsPerPage;
    var pageArticles = filteredArticles.slice(start, end);
    
    if (pageArticles.length === 0) {
        articlesDiv.innerHTML = '<div class="empty-state"><h2>Статьи не найдены</h2><p>Попробуйте изменить поисковый запрос</p></div>';
        updatePagination();
        return;
    }
    
    // Используем цикл for
    for (var i = 0; i < pageArticles.length; i++) {
        var article = pageArticles[i];
        
        var card = document.createElement('div');
        card.className = 'article-card';
        card.onclick = (function(art) {
            return function() {
                showArticleDetail(art.id);
            };
        })(article);
        
        var img = document.createElement('img');
        img.src = article.image;
        img.alt = 'Article image';
        
        var title = document.createElement('h3');
        title.textContent = article.title;
        
        var body = document.createElement('p');
        body.textContent = article.body.substring(0, 100) + '...';
        
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(body);
        
        articlesDiv.appendChild(card);
    }
    
    updatePagination();
}

// Показать детальную информацию о статье
function showArticleDetail(articleId) {
    var modal = document.getElementById('modal');
    var modalBody = document.getElementById('modal-body');
    
    modal.style.display = 'block';
    modalBody.innerHTML = '<p>Загрузка...</p>';
    
    var cacheKey = 'article_' + articleId;
    
    // Проверка кэша
    if (cache[cacheKey]) {
        var cachedData = cache[cacheKey];
        var now = new Date().getTime();
        if (now - cachedData.timestamp < 300000) { // 5 минут
            displayArticleDetail(cachedData.data);
            return;
        }
    }
    
    // Загрузка деталей
    fetch('https://jsonplaceholder.typicode.com/posts/' + articleId)
        .then(function(response) {
            return response.json();
        })
        .then(function(article) {
            article.image = 'https://picsum.photos/800/400?random=' + article.id;
            
            // Сохранение в кэш
            cache[cacheKey] = {
                data: article,
                timestamp: new Date().getTime()
            };
            
            displayArticleDetail(article);
        })
        .catch(function(error) {
            modalBody.innerHTML = '<p>Ошибка загрузки: ' + error.message + '</p>';
        });
}

// Отображение деталей статьи в модальном окне
function displayArticleDetail(article) {
    var modalBody = document.getElementById('modal-body');
    
    var html = '<h2>' + article.title + '</h2>';
    html += '<img src="' + article.image + '" alt="Article detail image">';
    html += '<p>' + article.body + '</p>';
    html += '<p><strong>ID статьи:</strong> ' + article.id + '</p>';
    html += '<p><strong>Автор ID:</strong> ' + article.userId + '</p>';
    
    modalBody.innerHTML = html;
}

// Закрыть модальное окно
function closeModal() {
    var modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Поиск
function search() {
    var searchInput = document.getElementById('search-input');
    var query = searchInput.value.toLowerCase();
    
    currentPage = 1;
    
    if (query === '') {
        filteredArticles = allArticles;
    } else {
        filteredArticles = allArticles.filter(function(article) {
            return article.title.toLowerCase().indexOf(query) !== -1 || 
                   article.body.toLowerCase().indexOf(query) !== -1;
        });
    }
    
    displayArticles();
}

// Обновление данных
function refreshData() {
    currentPage = 1;
    document.getElementById('search-input').value = '';
    loadArticles(true);
}

// Пагинация
function nextPage() {
    var totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayArticles();
        window.scrollTo(0, 0);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayArticles();
        window.scrollTo(0, 0);
    }
}

function updatePagination() {
    var totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    var pageInfo = document.getElementById('page-info');
    pageInfo.textContent = 'Страница ' + currentPage + ' из ' + (totalPages || 1);
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    var modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Поиск по нажатию Enter
document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                search();
            }
        });
    }
});
