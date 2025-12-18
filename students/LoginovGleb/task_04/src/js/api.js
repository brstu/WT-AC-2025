/**
 * API Module - Handles all CRUD operations with the server
 * Supports real API server or fallback to localStorage mock
 */

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const STORAGE_KEY = 'events_data';
const TOKEN_KEY = 'auth_token';

// Check if server is available
let useLocalStorage = false;

/**
 * Initialize API module
 * 
 * EDGE CASES:
 * - Server not running: Falls back to localStorage mock
 * - Server timeout (>2s): Treated as unavailable, uses localStorage
 * - Network error: Catches all fetch errors, enables localStorage mode
 * - Server returns error status: Falls back to localStorage
 * - CORS issues: Handled by catch block, uses localStorage
 * 
 * @returns {boolean} - true if real API available, false if using localStorage
 */
export async function initApi() {
    try {
        // EDGE CASE: Check server availability with timeout to avoid long waits
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        // EDGE CASE: Server responded but with error status
        useLocalStorage = !response.ok;
    } catch (error) {
        // EDGE CASES: Network error, timeout, CORS, server down
        console.warn('API server not available, using localStorage mock');
        console.debug('API init error:', error.message);
        useLocalStorage = true;
        initLocalStorage();
    }
    return !useLocalStorage;
}

/**
 * Initialize localStorage with sample data if empty
 */
function initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const sampleEvents = [
            {
                id: 1,
                title: 'Конференция по веб-разработке',
                description: 'Ежегодная конференция для веб-разработчиков с докладами от ведущих специалистов отрасли. Обсуждение современных технологий, фреймворков и лучших практик разработки.',
                date: '2025-02-15',
                time: '10:00',
                location: 'Минск, ул. Притыцкого, 62, конференц-зал',
                category: 'Конференция',
                organizer: 'TechHub Belarus',
                maxParticipants: 200,
                image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
                createdAt: '2025-01-10T10:00:00Z'
            },
            {
                id: 2,
                title: 'Мастер-класс по React',
                description: 'Практический мастер-класс по созданию современных веб-приложений с использованием React 18. Изучение хуков, контекста, и оптимизации производительности.',
                date: '2025-02-20',
                time: '14:00',
                location: 'Брест, ул. Московская, 267, IT-Hub',
                category: 'Мастер-класс',
                organizer: 'React Community',
                maxParticipants: 30,
                image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
                createdAt: '2025-01-12T14:30:00Z'
            },
            {
                id: 3,
                title: 'Хакатон "Innovation Challenge"',
                description: 'Командный хакатон на 48 часов. Создание инновационных решений в сфере искусственного интеллекта и машинного обучения. Призовой фонд - 10 000 BYN.',
                date: '2025-03-01',
                time: '09:00',
                location: 'Гродно, пр. Космонавтов, 21, Технопарк',
                category: 'Хакатон',
                organizer: 'Innovation Lab',
                maxParticipants: 100,
                image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop',
                createdAt: '2025-01-15T09:00:00Z'
            },
            {
                id: 4,
                title: 'Митап JavaScript Belarus',
                description: 'Регулярная встреча JavaScript-разработчиков. Три доклада по актуальным темам: TypeScript 5.0, Bun runtime и новые возможности ES2024.',
                date: '2025-02-25',
                time: '18:30',
                location: 'Минск, ул. Немига, 5, Space',
                category: 'Митап',
                organizer: 'JS Belarus',
                maxParticipants: 80,
                image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop',
                createdAt: '2025-01-18T11:00:00Z'
            },
            {
                id: 5,
                title: 'Курс "Backend разработка на Node.js"',
                description: 'Интенсивный курс по backend-разработке. Изучение Express, Fastify, работа с базами данных PostgreSQL и MongoDB, аутентификация и деплой.',
                date: '2025-03-10',
                time: '19:00',
                location: 'Онлайн (Zoom)',
                category: 'Курс',
                organizer: 'IT Academy',
                maxParticipants: 50,
                image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop',
                createdAt: '2025-01-20T16:00:00Z'
            },
            {
                id: 6,
                title: 'Выставка IT-стартапов',
                description: 'Демонстрация лучших белорусских стартапов. Возможность для инвесторов найти перспективные проекты, а для стартапов - получить финансирование.',
                date: '2025-03-15',
                time: '11:00',
                location: 'Минск, пр. Победителей, 65, Expo',
                category: 'Выставка',
                organizer: 'Startup Belarus',
                maxParticipants: 500,
                image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop',
                createdAt: '2025-01-22T13:00:00Z'
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
    }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Toggle authentication (for demo purposes)
 */
export function toggleAuth() {
    if (isAuthenticated()) {
        setAuthToken(null);
        return false;
    } else {
        // Generate a demo token
        const token = 'demo_token_' + Date.now();
        setAuthToken(token);
        return true;
    }
}

/**
 * Get request headers with optional auth token
 */
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Handle API errors
 * 
 * EDGE CASES:
 * - Error without message: Provides generic fallback message
 * - Network errors: Re-thrown with user-friendly message
 * - Logs error for debugging but throws for caller to handle
 * 
 * @param {Error} error - The error to handle
 * @throws {Error} - Always throws with user-friendly message
 */
function handleError(error) {
    // Log original error for debugging
    console.error('API Error:', error);
    // EDGE CASE: Error might not have message property
    throw new Error(error.message || 'Произошла ошибка при выполнении запроса');
}

/**
 * Simulate network delay for localStorage operations
 */
function delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== CRUD Operations =====

/**
 * Get all events with optional filters
 * @param {Object} params - Query parameters (search, category, page, limit)
 */
export async function getEvents(params = {}) {
    if (useLocalStorage) {
        await delay();
        let events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Apply search filter
        if (params.search) {
            const searchLower = params.search.toLowerCase();
            events = events.filter(event => 
                event.title.toLowerCase().includes(searchLower) ||
                event.description.toLowerCase().includes(searchLower) ||
                event.location.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply category filter
        if (params.category) {
            events = events.filter(event => event.category === params.category);
        }
        
        // Sort by date (newest first)
        events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            data: events.slice(startIndex, endIndex),
            total: events.length,
            page,
            totalPages: Math.ceil(events.length / limit)
        };
    }
    
    try {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.set('q', params.search);
        if (params.category) queryParams.set('category', params.category);
        if (params.page) queryParams.set('_page', params.page);
        if (params.limit) queryParams.set('_limit', params.limit);
        queryParams.set('_sort', 'createdAt');
        queryParams.set('_order', 'desc');
        
        const url = `${API_BASE_URL}/events?${queryParams.toString()}`;
        const response = await fetch(url, { headers: getHeaders() });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const total = parseInt(response.headers.get('X-Total-Count')) || data.length;
        
        return {
            data,
            total,
            page: parseInt(params.page) || 1,
            totalPages: Math.ceil(total / (parseInt(params.limit) || 10))
        };
    } catch (error) {
        handleError(error);
    }
}

/**
 * Get a single event by ID
 * 
 * EDGE CASES:
 * - ID not found in localStorage: Throws 'Event not found' error
 * - ID not found on server (404): Throws 'Event not found' error
 * - ID is string but needs parseInt: Handled in find comparison
 * - Invalid ID format: parseInt returns NaN, find returns undefined
 * - Server error (500, 503): Throws HTTP error with status code
 * - Network timeout: Caught and re-thrown by handleError
 * 
 * @param {number|string} id - Event ID
 * @returns {Promise<Object>} - Event object
 * @throws {Error} - If event not found or network error
 */
export async function getEvent(id) {
    if (useLocalStorage) {
        await delay();
        const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // EDGE CASE: ID might be string, parseInt for comparison
        const event = events.find(e => e.id === parseInt(id));
        // EDGE CASE: Event not found in localStorage
        if (!event) {
            throw new Error('Событие не найдено');
        }
        return event;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            // EDGE CASE: 404 Not Found - event doesn't exist
            if (response.status === 404) {
                throw new Error('Событие не найдено');
            }
            // EDGE CASE: Other HTTP errors (500, 503, etc.)
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        // EDGE CASE: Network error, timeout, or parsing error
        handleError(error);
    }
}

/**
 * Generate unique ID
 */
function generateId() {
    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Create a new event
 * @param {Object} eventData - Event data
 */
export async function createEvent(eventData) {
    const newEvent = {
        ...eventData,
        id: generateId(),
        createdAt: new Date().toISOString()
    };
    
    if (useLocalStorage) {
        await delay(500);
        const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        events.unshift(newEvent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        return newEvent;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(newEvent)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleError(error);
    }
}

/**
 * Update an existing event
 * @param {number|string} id - Event ID
 * @param {Object} eventData - Updated event data
 */
export async function updateEvent(id, eventData) {
    if (useLocalStorage) {
        await delay(500);
        const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const index = events.findIndex(e => e.id === parseInt(id));
        if (index === -1) {
            throw new Error('Событие не найдено');
        }
        events[index] = { ...events[index], ...eventData, id: parseInt(id) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        return events[index];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Событие не найдено');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleError(error);
    }
}

/**
 * Delete an event
 * 
 * EDGE CASES:
 * - Event not found in localStorage: Throws error, no deletion
 * - Event not found on server (404): Throws specific error
 * - Double delete attempt: Second attempt will get 404 error
 * - Network failure during delete: Error thrown, state unchanged
 * - Server error (500): Caught and re-thrown by handleError
 * 
 * @param {number|string} id - Event ID
 * @returns {Promise<Object>} - Success status
 * @throws {Error} - If event not found or deletion fails
 */
export async function deleteEvent(id) {
    if (useLocalStorage) {
        await delay(500);
        const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const filteredEvents = events.filter(e => e.id !== parseInt(id));
        // EDGE CASE: No event was filtered (event not found)
        if (filteredEvents.length === events.length) {
            throw new Error('Событие не найдено');
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEvents));
        return { success: true };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            // EDGE CASE: Event not found (404) - can't delete what doesn't exist
            if (response.status === 404) {
                throw new Error('Событие не найдено');
            }
            // EDGE CASE: Server error or other HTTP error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return { success: true };
    } catch (error) {
        // EDGE CASE: Network error or server unavailable
        handleError(error);
    }
}

/**
 * Get available categories
 */
export function getCategories() {
    return [
        'Конференция',
        'Мастер-класс',
        'Хакатон',
        'Митап',
        'Курс',
        'Выставка',
        'Семинар',
        'Вебинар'
    ];
}

// ===== Prefetch Cache =====
const prefetchCache = new Map();
const CACHE_TTL = 60000; // 1 minute

/**
 * Prefetch event data
 * @param {number|string} id - Event ID to prefetch
 */
export async function prefetchEvent(id) {
    const cacheKey = `event_${id}`;
    const cached = prefetchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    try {
        const data = await getEvent(id);
        prefetchCache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.warn('Prefetch failed:', error);
        return null;
    }
}

/**
 * Get cached event if available
 * @param {number|string} id - Event ID
 */
export function getCachedEvent(id) {
    const cacheKey = `event_${id}`;
    const cached = prefetchCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    return null;
}

/**
 * Clear prefetch cache
 */
export function clearCache() {
    prefetchCache.clear();
}
