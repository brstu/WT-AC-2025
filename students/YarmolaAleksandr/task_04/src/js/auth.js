/**
 * Класс для управления аутентификацией
 */
export class Auth {
    constructor() {
        this.TOKEN_KEY = 'it_tools_auth_token';
        this.USER_KEY = 'it_tools_current_user';
        this.USERS_KEY = 'it_tools_users';
        this.initUsers();
    }

    /**
     * Инициализация демо-пользователей
     */
    initUsers() {
        if (!localStorage.getItem(this.USERS_KEY)) {
            const demoUsers = [
                { username: 'admin', password: 'admin123', role: 'admin' },
                { username: 'user', password: 'user123', role: 'user' }
            ];
            localStorage.setItem(this.USERS_KEY, JSON.stringify(demoUsers));
        }
    }

    /**
     * Вход в систему
     * @param {string} username - Имя пользователя
     * @param {string} password - Пароль
     * @returns {Object} Результат входа { success, token, user, error }
     */
    login(username, password) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Генерация токена
            const token = this.generateToken(user);
            
            // Сохранение токена и пользователя
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify({
                username: user.username,
                role: user.role
            }));

            return { 
                success: true, 
                token, 
                user: { username: user.username, role: user.role }
            };
        }

        return { 
            success: false, 
            error: 'Неверное имя пользователя или пароль' 
        };
    }

    /**
     * Регистрация нового пользователя
     * @param {string} username - Имя пользователя
     * @param {string} password - Пароль
     * @returns {Object} Результат регистрации
     */
    register(username, password) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        
        // Проверка на существование
        if (users.find(u => u.username === username)) {
            return { 
                success: false, 
                error: 'Пользователь с таким именем уже существует' 
            };
        }

        // Добавление пользователя
        users.push({ username, password, role: 'user' });
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { success: true };
    }

    /**
     * Выход из системы
     */
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    /**
     * Проверка авторизации
     * @returns {boolean} true если пользователь авторизован
     */
    isAuthenticated() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Получение токена
     * @returns {string|null} Токен или null
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Получение текущего пользователя
     * @returns {Object|null} Объект пользователя или null
     */
    getCurrentUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    /**
     * Генерация токена
     * @param {Object} user - Объект пользователя
     * @returns {string} JWT-подобный токен
     */
    generateToken(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            username: user.username,
            role: user.role,
            exp: Date.now() + 24 * 60 * 60 * 1000 // 24 часа
        }));
        const signature = btoa(`${header}.${payload}.secret`);
        
        return `${header}.${payload}.${signature}`;
    }

    /**
     * Проверка прав администратора
     * @returns {boolean} true если пользователь - администратор
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
}
