// Глобальные переменные
var currentPage = 1;
var itemsPerPage = 6;
var allMemes = [];
var filteredMemes = [];
var cache = new Map();
var CACHE_TTL = 30000; // 30 секунд
var controller;
var isLoading = false;

// Инициализация при загрузке страницы
window.onload = function() {
    loadData();
    
    // Поиск с задержкой
    document.getElementById('search-input').addEventListener('input', function() {
        setTimeout(function() {
            filterMemes();
        }, 300);
    });
}

// Функция для получения данных с ретраями и таймаутами
async function fetchWithRetry(url, options = {}) {
    const retries = options.retries || 3;
    const backoffMs = options.backoffMs || 1000;
    const timeoutMs = options.timeoutMs || 5000;
    
    for (let i = 0; i < retries; i++) {
        try {
            // Показываем информацию о повторной попытке
            if (i > 0) {
                document.getElementById('retry-info').style.display = 'block';
            }
            
            // Создаем новый AbortController для каждой попытки
            controller = new AbortController();
            const signal = controller.signal;
            
            // Таймаут
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { ...options, signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('Network error');
            }
            
            document.getElementById('retry-info').style.display = 'none';
            return response;
        } catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            // Ждем перед следующей попыткой
            await new Promise(resolve => setTimeout(resolve, backoffMs * (i + 1)));
        }
    }
}

// Загрузка данных с кэшированием
async function loadData(ignoreCache = false) {
    if (isLoading) return;
    isLoading = true;
    
    showLoading();
    hideError();
    hideEmpty();
    
    try {
        const cacheKey = 'memes_data';
        const cachedData = cache.get(cacheKey);
        
        // Проверяем кэш
        if (!ignoreCache && cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
            console.log('Используем данные из кэша');
            allMemes = cachedData.data;
            filteredMemes = allMemes;
            displayMemes();
            hideLoading();
            isLoading = false;
            return;
        }
        
        console.log('Загружаем данные из API');
        
        // Используем JSONPlaceholder для получения данных
        const response = await fetchWithRetry('https://jsonplaceholder.typicode.com/photos', {
            retries: 3,
            backoffMs: 1000,
            timeoutMs: 5000
        });
        
        const data = await response.json();
        
        // Берем первые 15 элементов и создаем мемы
        allMemes = data.slice(0, 15).map((item, index) => {
            return {
                id: item.id,
                title: 'Мем #' + item.id,
                description: 'Это очень смешной мем про ' + ['котиков', 'программирование', 'жизнь', 'работу', 'учебу'][index % 5],
                image: 'https://picsum.photos/seed/' + item.id + '/300/200',
                url: item.url
            };
        });
        
        // Сохраняем в кэш
        cache.set(cacheKey, {
            data: allMemes,
            timestamp: Date.now()
        });
        
        filteredMemes = allMemes;
        currentPage = 1;
        displayMemes();
        hideLoading();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showError();
        hideLoading();
    } finally {
        isLoading = false;
    }
}

// Фильтрация мемов по поисковому запросу
function filterMemes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredMemes = allMemes;
    } else {
        filteredMemes = [];
        for (var i = 0; i < allMemes.length; i++) {
            if (allMemes[i].title.toLowerCase().includes(searchTerm) || 
                allMemes[i].description.toLowerCase().includes(searchTerm)) {
                filteredMemes.push(allMemes[i]);
            }
        }
    }
    
    currentPage = 1;
    displayMemes();
}

// Отображение мемов
function displayMemes() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    
    if (filteredMemes.length === 0) {
        showEmpty();
        return;
    }
    
    hideEmpty();
    
    // Вычисляем индексы для пагинации
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const memesToShow = filteredMemes.slice(startIndex, endIndex);
    
    // Создаем карточки мемов
    for (var i = 0; i < memesToShow.length; i++) {
        var meme = memesToShow[i];
        content.innerHTML += `
            <div class="meme-card">
                <img src="${meme.image}" alt="${meme.title}">
                <h3>${meme.title}</h3>
                <p>${meme.description}</p>
            </div>
        `;
    }
    
    updatePagination();
}

// Обновление пагинации
function updatePagination() {
    const totalPages = Math.ceil(filteredMemes.length / itemsPerPage);
    document.getElementById('page-info').textContent = 'Страница ' + currentPage + ' из ' + totalPages;
    
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage >= totalPages;
}

// Функции пагинации
function nextPage() {
    const totalPages = Math.ceil(filteredMemes.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayMemes();
        // Прокрутка вверх
        window.scrollTo(0, 0);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayMemes();
        window.scrollTo(0, 0);
    }
}

// Обновление данных
function refreshData() {
    // Отменяем предыдущий запрос если он есть
    if (controller) {
        controller.abort();
    }
    loadData(true);
}

// Очистка кэша
function clearCache() {
    cache.clear();
    alert('Кэш очищен!');
    console.log('Кэш очищен');
}

// Функции отображения состояний
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('content').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'grid';
}

function showError() {
    document.getElementById('error').style.display = 'block';
    document.getElementById('content').style.display = 'none';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function showEmpty() {
    document.getElementById('empty').style.display = 'block';
    document.getElementById('content').style.display = 'none';
}

function hideEmpty() {
    document.getElementById('empty').style.display = 'none';
}
