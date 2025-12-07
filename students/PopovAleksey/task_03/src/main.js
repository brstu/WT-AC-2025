// Глобальные переменные
var cache = {};
var currentPage = 1;
var currentController = null;
var allLaunches = [];
var filteredLaunches = [];

// Константы
const CACHE_TTL = 60000;
const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/';

// Инициализация при загрузке страницы
window.onload = function() {
    loadLaunches();
    
    document.getElementById('searchInput').addEventListener('input', function() {
        handleSearch();
    });
    
    document.getElementById('agencyFilter').addEventListener('change', function() {
        handleFilter();
    });
    
    document.getElementById('refreshBtn').addEventListener('click', function() {
        cache = {};
        localStorage.clear();
        loadLaunches();
    });
    
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        currentPage++;
        loadLaunches(true);
    });
    
    document.getElementById('prevBtn').addEventListener('click', function() {
        if(currentPage > 1) {
            currentPage--;
            loadLaunches();
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', function() {
        currentPage++;
        loadLaunches();
    });
};

// Основная функция загрузки
function loadLaunches(append = false) {
    showLoading();
    hideError();
    
    if(currentController) {
        currentController.abort();
    }
    
    currentController = new AbortController();
    
    let url = API_URL + '?limit=10&offset=' + ((currentPage - 1) * 10);
    
    fetchWithRetry(url, {
        retries: 3,
        backoffMs: 1000,
        timeoutMs: 10000,
        signal: currentController.signal
    }).then(function(data) {
        hideLoading();
        
        allLaunches = append ? allLaunches.concat(data.results) : data.results;
        filteredLaunches = allLaunches;
        
        renderLaunches();
        updatePagination();
    }).catch(function(error) {
        hideLoading();
        showError('Ошибка загрузки данных: ' + error.message);
        console.error(error);
    });
}

// Функция с ретраями
function fetchWithRetry(url, options = {}) {
    var retries = options.retries || 3;
    var backoffMs = options.backoffMs || 1000;
    var timeoutMs = options.timeoutMs || 5000;
    var signal = options.signal;
    
    return new Promise(function(resolve, reject) {
        function attempt(attemptNumber) {
            // Проверка кэша
            var cacheKey = url;
            var cached = getCachedData(cacheKey);
            
            if(cached) {
                console.log('Данные из кэша');
                resolve(cached);
                return;
            }
            
            var timeoutId = setTimeout(function() {
                if(attemptNumber < retries) {
                    console.log('Таймаут, повтор ' + (attemptNumber + 1));
                    setTimeout(function() {
                        attempt(attemptNumber + 1);
                    }, backoffMs * attemptNumber);
                } else {
                    reject(new Error('Превышено время ожидания'));
                }
            }, timeoutMs);
            
            fetch(url, { signal: signal })
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if(!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                    }
                    return response.json();
                })
                .then(function(data) {
                    setCachedData(cacheKey, data);
                    resolve(data);
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    
                    if(error.name === 'AbortError') {
                        reject(error);
                        return;
                    }
                    
                    if(attemptNumber < retries) {
                        console.log('Ошибка, повтор ' + (attemptNumber + 1));
                        setTimeout(function() {
                            attempt(attemptNumber + 1);
                        }, backoffMs * attemptNumber);
                    } else {
                        reject(error);
                    }
                });
        }
        
        attempt(1);
    });
}

// Кэш функции
function getCachedData(key) {
    // Проверка in-memory кэша
    if(cache[key] && cache[key].timestamp + CACHE_TTL > Date.now()) {
        return cache[key].data;
    }
    
    // Проверка localStorage
    try {
        var stored = localStorage.getItem(key);
        if(stored) {
            var parsed = JSON.parse(stored);
            if(parsed.timestamp + CACHE_TTL > Date.now()) {
                cache[key] = parsed;
                return parsed.data;
            }
        }
    } catch(e) {
        console.error('Ошибка чтения кэша', e);
    }
    
    return null;
}

function setCachedData(key, data) {
    var cacheEntry = {
        data: data,
        timestamp: Date.now()
    };
    
    cache[key] = cacheEntry;
    
    try {
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch(e) {
        console.error('Ошибка записи кэша', e);
    }
}

// Рендеринг карточек
function renderLaunches() {
    var container = document.getElementById('launchesContainer');
    container.innerHTML = '';
    
    if(filteredLaunches.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; background: white; border-radius: 10px;"><h2>Ничего не найдено</h2></div>';
        return;
    }
    
    for(var i = 0; i < filteredLaunches.length; i++) {
        var launch = filteredLaunches[i];
        var card = document.createElement('div');
        card.className = 'launch-card';
        
        var imageUrl = launch.image || 'https://via.placeholder.com/400x200?text=Rocket+Launch';
        var name = launch.name || 'Неизвестно';
        var status = launch.status ? launch.status.name : 'Неизвестно';
        var date = launch.net ? new Date(launch.net).toLocaleString('ru-RU') : 'Неизвестно';
        var agency = launch.launch_service_provider ? launch.launch_service_provider.name : 'Неизвестно';
        var location = launch.pad ? launch.pad.location.name : 'Неизвестно';
        
        var statusClass = 'pending';
        if(status.includes('Success')) statusClass = 'success';
        if(status.includes('Failure')) statusClass = 'failed';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="Изображение запуска ${name}">
            <h3>${name}</h3>
            <p><strong>Агентство:</strong> ${agency}</p>
            <p><strong>Дата:</strong> ${date}</p>
            <p><strong>Локация:</strong> ${location}</p>
            <div class="status ${statusClass}">${status}</div>
        `;
        
        container.appendChild(card);
    }
}

// Поиск
function handleSearch() {
    var searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if(searchTerm === '') {
        filteredLaunches = allLaunches;
    } else {
        filteredLaunches = [];
        for(var i = 0; i < allLaunches.length; i++) {
            var launch = allLaunches[i];
            var name = launch.name ? launch.name.toLowerCase() : '';
            var agency = launch.launch_service_provider ? launch.launch_service_provider.name.toLowerCase() : '';
            
            if(name.indexOf(searchTerm) !== -1 || agency.indexOf(searchTerm) !== -1) {
                filteredLaunches.push(launch);
            }
        }
    }
    
    renderLaunches();
}

// Фильтр
function handleFilter() {
    var filterValue = document.getElementById('agencyFilter').value;
    
    if(filterValue === '') {
        filteredLaunches = allLaunches;
    } else {
        filteredLaunches = [];
        for(var i = 0; i < allLaunches.length; i++) {
            var launch = allLaunches[i];
            var agency = launch.launch_service_provider ? launch.launch_service_provider.name : '';
            
            if(agency.indexOf(filterValue) !== -1) {
                filteredLaunches.push(launch);
            }
        }
    }
    
    renderLaunches();
}

// UI функции
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

function showError(message) {
    var errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function updatePagination() {
    document.getElementById('pageInfo').textContent = 'Страница ' + currentPage;
    
    if(currentPage === 1) {
        document.getElementById('prevBtn').disabled = true;
    } else {
        document.getElementById('prevBtn').disabled = false;
    }
}
