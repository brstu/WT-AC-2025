import { Toast } from '../components/Toast.js';

/**
 * View для страницы входа
 */
export class LoginView {
    constructor(auth, router) {
        this.auth = auth;
        this.router = router;
    }

    /**
     * Рендер страницы входа
     */
    render() {
        const app = document.getElementById('app');
        app.innerHTML = this.getHTML();
        this.attachEventListeners();
    }

    /**
     * Генерация HTML
     */
    getHTML() {
        return `
            <div class="main-content">
                <div class="container form">
                    <div class="page-header" style="text-align: center;">
                        <h1 class="page-title">🔐 Вход в систему</h1>
                        <p class="page-subtitle">Войдите для управления инструментами</p>
                    </div>

                    <div class="form-card" style="max-width: 400px; margin: 0 auto;">
                        <form id="loginForm">
                            <div class="form-group">
                                <label class="form-label required" for="username">Имя пользователя</label>
                                <input 
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    class="form-input"
                                    required
                                    autofocus
                                >
                                <div class="form-error" id="usernameError"></div>
                            </div>

                            <div class="form-group">
                                <label class="form-label required" for="password">Пароль</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    class="form-input"
                                    required
                                >
                                <div class="form-error" id="passwordError"></div>
                            </div>

                            <div class="form-actions" style="flex-direction: column; gap: 1rem;">
                                <button type="submit" class="btn btn-primary" id="loginBtn" style="width: 100%;">
                                    Войти
                                </button>
                                <button type="button" class="btn btn-secondary" id="registerBtn" style="width: 100%;">
                                    Регистрация
                                </button>
                            </div>
                        </form>

                        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                            <p style="color: var(--text-muted); text-align: center; margin-bottom: 1rem;">
                                <strong>Демо-аккаунты:</strong>
                            </p>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <button class="btn btn-secondary" id="demoAdmin" style="width: 100%; font-size: 0.9rem;">
                                    👨‍💼 Войти как Admin (admin / admin123)
                                </button>
                                <button class="btn btn-secondary" id="demoUser" style="width: 100%; font-size: 0.9rem;">
                                    👤 Войти как User (user / user123)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Привязка обработчиков событий
     */
    attachEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerBtn = document.getElementById('registerBtn');
        const demoAdmin = document.getElementById('demoAdmin');
        const demoUser = document.getElementById('demoUser');

        // Вход
        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(new FormData(loginForm));
        });

        // Регистрация
        registerBtn?.addEventListener('click', () => {
            this.showRegisterForm();
        });

        // Демо-аккаунты
        demoAdmin?.addEventListener('click', () => {
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
            loginForm.requestSubmit();
        });

        demoUser?.addEventListener('click', () => {
            document.getElementById('username').value = 'user';
            document.getElementById('password').value = 'user123';
            loginForm.requestSubmit();
        });
    }

    /**
     * Обработка входа
     */
    handleLogin(formData) {
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        loginBtn.textContent = 'Вход...';

        const username = formData.get('username').trim();
        const password = formData.get('password').trim();

        // Эмуляция задержки сети
        setTimeout(() => {
            const result = this.auth.login(username, password);

            if (result.success) {
                Toast.success(`Добро пожаловать, ${result.user.username}!`);
                this.router.navigate('/');
            } else {
                Toast.error(result.error);
                document.getElementById('passwordError').textContent = result.error;
                document.getElementById('password').style.borderColor = 'var(--danger)';
            }

            loginBtn.disabled = false;
            loginBtn.textContent = 'Войти';
        }, 300);
    }

    /**
     * Показать форму регистрации
     */
    showRegisterForm() {
        const username = prompt('Введите имя пользователя:');
        if (!username) return;

        const password = prompt('Введите пароль:');
        if (!password) return;

        const result = this.auth.register(username, password);

        if (result.success) {
            Toast.success('Регистрация успешна! Теперь войдите в систему.');
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
        } else {
            Toast.error(result.error);
        }
    }
}
