import { Router } from "./router.js";
import { showPlaces } from "./views/places.js";
import { showPlaceDetail } from "./views/place-detail.js";
import { showPlaceForm } from "./views/place-form.js";

Router.route("/places", showPlaces, { 
    title: "Все места",
    requiresAuth: false 
});

Router.route("/places/:id", showPlaceDetail, { 
    title: "Детали места",
    requiresAuth: false 
});

Router.route("/places/:id/edit", showPlaceForm, { 
    title: "Редактирование",
    requiresAuth: true 
});

Router.route("/new", showPlaceForm, { 
    title: "Новое место",
    requiresAuth: true 
});

Router.route("/login", async () => {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="card fade-in">
            <h2>🔐 Авторизация</h2>
            <form id="loginForm" style="max-width: 400px; margin: 0 auto;">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Пароль</label>
                    <input type="password" class="form-input" name="password" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Войти</button>
                    <button type="button" class="btn btn-secondary" onclick="window.location.hash='#/places'">Отмена</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = Object.fromEntries(formData.entries());
        
        try {
            localStorage.setItem('authToken', 'demo-token-' + Date.now());
            window.location.hash = '#/places';
        } catch (error) {
            alert("Ошибка авторизации");
        }
    });
}, { title: "Вход" });

Router.start();

window.Router = Router;

window.addEventListener('online', () => {
    console.log("Соединение восстановлено");
});

window.addEventListener('offline', () => {
    console.log("Потеряно соединение с интернетом");
});