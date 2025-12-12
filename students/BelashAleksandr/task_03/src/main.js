// Глобальные переменные
var currentPage = 1;
var totalPages = 1;
var allJobs = [];
var cache = {};
var currentController = null;

// Константы
const API_URL = 'https://remotive.com/api/remote-jobs';
const ITEMS_PER_PAGE = 10;

// Инициализация при загрузке
window.onload = function() {
    loadJobs();
    
    document.getElementById('search-input').addEventListener('input', function() {
        
        filterJobs();
    });
    
    document.getElementById('filter-select').addEventListener('change', function() {
        filterJobs();
    });
    
    document.getElementById('refresh-btn').addEventListener('click', function() {
        cache = {}; // Очистка кэша
        loadJobs();
    });
    
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });
    
    document.getElementById('next-btn').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    });
};

// Функция с ретраями и таймаутами
function fetchWithRetry(url, options) {
    var retries = 2;
    var timeoutMs = 5000;
    var backoffMs = 1000;
    
    return new Promise(function(resolve, reject) {
        function attemptFetch(attemptsLeft) {
            // Создаем новый контроллер каждый раз
            if (currentController) {
                currentController.abort();
            }
            currentController = new AbortController();
            
            // Таймаут
            var timeoutId = setTimeout(function() {
                currentController.abort();
            }, timeoutMs);
            
            fetch(url, {
                signal: currentController.signal,
                ...options
            })
            .then(function(response) {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error('Network error');
                }
                return response.json();
            })
            .then(function(data) {
                resolve(data);
            })
            .catch(function(error) {
                clearTimeout(timeoutId);
                if (attemptsLeft > 0) {
                    console.log('Retry attempt', 3 - attemptsLeft);
                    setTimeout(function() {
                        attemptFetch(attemptsLeft - 1);
                    }, backoffMs);
                } else {
                    reject(error);
                }
            });
        }
        
        attemptFetch(retries);
    });
}

// Простой кэш без TTL
function getCacheKey(query) {
    return 'jobs_' + query;
}

function loadJobs() {
    var cacheKey = getCacheKey('all');
    
    // Проверяем кэш
    if (cache[cacheKey]) {
        console.log('Using cache');
        allJobs = cache[cacheKey];
        filterJobs();
        return;
    }
    
    showLoading();
    
    fetchWithRetry(API_URL)
        .then(function(data) {
            allJobs = data.jobs || [];
            cache[cacheKey] = allJobs; // Кэшируем
            filterJobs();
            hideLoading();
        })
        .catch(function(error) {
            console.error('Error:', error);
            showError();
            hideLoading();
        });
}

function filterJobs() {
    var searchTerm = document.getElementById('search-input').value.toLowerCase();
    var filterType = document.getElementById('filter-select').value;
    
    var filtered = allJobs;
    
    // фильтрация
    if (searchTerm) {
        filtered = filtered.filter(function(job) {
            return job.title.toLowerCase().indexOf(searchTerm) !== -1;
        });
    }
    
    if (filterType) {
        filtered = filtered.filter(function(job) {
            return job.job_type === filterType;
        });
    }
    
    if (filtered.length === 0) {
        showEmpty();
        return;
    }
    
    hideEmpty();
    
    // Пересчитываем пагинацию
    totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    currentPage = 1;
    
    // Сохраняем отфильтрованные данные в глобальную переменную
    window.filteredJobs = filtered;
    
    renderPage();
}

function renderPage() {
    var filtered = window.filteredJobs || allJobs;
    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var end = start + ITEMS_PER_PAGE;
    var pageJobs = filtered.slice(start, end);
    
    var jobsList = document.getElementById('jobs-list');
    jobsList.innerHTML = ''; // Очищаем напрямую
    
    // Рендерим через innerHTML
    pageJobs.forEach(function(job) {
        var jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        
        // Используем innerHTML с конкатенацией строк
        jobCard.innerHTML = 
            '<img src="' + (job.company_logo_url || 'https://via.placeholder.com/50') + '" alt="Company logo">' +
            '<h3>' + job.title + '</h3>' +
            '<p><strong>Компания:</strong> ' + job.company_name + '</p>' +
            '<p><strong>Локация:</strong> ' + (job.candidate_required_location || 'Anywhere') + '</p>' +
            '<p><strong>Тип:</strong> ' + job.job_type + '</p>' +
            '<p><strong>Зарплата:</strong> ' + (job.salary || 'Не указана') + '</p>';
        
        jobsList.appendChild(jobCard);
    });
    
    updatePagination();
}

function updatePagination() {
    document.getElementById('page-info').textContent = 'Страница ' + currentPage + ' из ' + totalPages;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

function showLoading() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('jobs-list').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('jobs-list').style.display = 'block';
}

function showError() {
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('jobs-list').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
}

function showEmpty() {
    document.getElementById('empty-state').style.display = 'block';
    document.getElementById('jobs-list').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
}

function hideEmpty() {
    document.getElementById('empty-state').style.display = 'none';
}

console.log('Script loaded');
console.log('Current time:', new Date());
console.log('User agent:', navigator.userAgent);
