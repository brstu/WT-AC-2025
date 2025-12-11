import { api } from "../api.js";
import { Router } from "../router.js";
import { Toast } from "../utils.js";
import { Progress } from "../utils.js";

export async function showPlaceForm({ params }) {
    const app = document.getElementById("app");
    const isEditing = !!params.id;
    
    Progress.start();
    
    let place = {
        name: "",
        type: "",
        address: "",
        district: "",
        description: ""
    };
    
    if (isEditing) {
        app.innerHTML = `
            <div class="card loading">
                <div class="loading-spinner"></div>
                <p>Загрузка данных для редактирования...</p>
            </div>
        `;
        
        try {
            place = await api.getPlace(params.id);
            Progress.update(50);
        } catch (error) {
            Progress.error();
            app.innerHTML = `
                <div class="error">
                    <h3>Не удалось загрузить место</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="Router.go('/places')" style="margin-top: 1rem;">
                        Вернуться к списку
                    </button>
                </div>
            `;
            Toast.error(error.message, "Ошибка загрузки");
            return;
        }
    }
    
    setTimeout(() => {
        app.innerHTML = `
            <div class="card fade-in">
                <h2>${isEditing ? "✏️ Редактировать место" : "➕ Добавить новое место"}</h2>
                <p class="note" style="color: var(--text-muted); margin-bottom: 1.5rem;">
                    ${isEditing ? 'Измените информацию о месте' : 'Заполните форму для добавления нового места'}
                </p>
                
                <form id="placeForm">
                    <div class="form-group">
                        <label class="form-label" for="name">Название места</label>
                        <input type="text" 
                               class="form-input" 
                               id="name"
                               name="name" 
                               value="${place.name}"
                               placeholder="Например: Центральный парк"
                               required
                               maxlength="100"
                               data-tooltip="Введите название места (максимум 100 символов)">
                        <div class="note" style="font-size: 0.75rem; margin-top: 0.25rem;">
                            Осталось символов: <span id="nameCounter">${100 - (place.name?.length || 0)}</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="type">Тип места</label>
                        <select class="form-select" id="type" name="type" required data-tooltip="Выберите тип места из списка">
                            <option value="">Выберите тип</option>
                            <option value="Парк" ${place.type === "Парк" ? "selected" : ""}>🌳 Парк</option>
                            <option value="Музей" ${place.type === "Музей" ? "selected" : ""}>🏛️ Музей</option>
                            <option value="Кафе" ${place.type === "Кафе" ? "selected" : ""}>☕ Кафе</option>
                            <option value="Ресторан" ${place.type === "Ресторан" ? "selected" : ""}>🍽️ Ресторан</option>
                            <option value="Кинотеатр" ${place.type === "Кинотеатр" ? "selected" : ""}>🎬 Кинотеатр</option>
                            <option value="Театр" ${place.type === "Театр" ? "selected" : ""}>🎭 Театр</option>
                            <option value="Библиотека" ${place.type === "Библиотека" ? "selected" : ""}>📚 Библиотека</option>
                            <option value="Торговый центр" ${place.type === "Торговый центр" ? "selected" : ""}>🏬 Торговый центр</option>
                            <option value="Спортивный комплекс" ${place.type === "Спортивный комплекс" ? "selected" : ""}>🏟️ Спортивный комплекс</option>
                            <option value="Больница" ${place.type === "Больница" ? "selected" : ""}>🏥 Больница</option>
                            <option value="Школа" ${place.type === "Школа" ? "selected" : ""}>🏫 Школа</option>
                            <option value="Университет" ${place.type === "Университет" ? "selected" : ""}>🎓 Университет</option>
                            <option value="Другое" ${place.type === "Другое" ? "selected" : ""}>📌 Другое</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="address">Адрес</label>
                        <input type="text" 
                               class="form-input" 
                               id="address"
                               name="address" 
                               value="${place.address}"
                               placeholder="Например: ул. Ленина, 15"
                               required
                               data-tooltip="Введите полный адрес места">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="district">Район города</label>
                        <input type="text" 
                               class="form-input" 
                               id="district"
                               name="district" 
                               value="${place.district || ''}"
                               placeholder="Например: Центральный район"
                               data-tooltip="Введите район, где находится место">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="description">Описание</label>
                        <textarea class="form-textarea" 
                                  id="description"
                                  name="description" 
                                  rows="5"
                                  placeholder="Опишите место, его особенности, часы работы и другую полезную информацию"
                                  data-tooltip="Подробное описание места (необязательно)">${place.description || ''}</textarea>
                        <div class="note" style="font-size: 0.75rem; margin-top: 0.25rem;">
                            Длина описания: <span id="descCounter">${place.description?.length || 0}</span> символов
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" id="submitBtn">
                            ${isEditing ? "💾 Сохранить изменения" : "➕ Добавить место"}
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancelBtn">
                            ❌ Отмена
                        </button>
                        ${isEditing ? `
                        <button type="button" class="btn btn-secondary" id="previewBtn" style="margin-left: auto;">
                            👁️ Предпросмотр
                        </button>
                        ` : ''}
                    </div>
                </form>
            </div>
        `;
        
        Progress.complete();
        
        const form = document.getElementById("placeForm");
        const submitBtn = document.getElementById("submitBtn");
        const cancelBtn = document.getElementById("cancelBtn");
        const nameInput = document.getElementById("name");
        const nameCounter = document.getElementById("nameCounter");
        const descTextarea = document.getElementById("description");
        const descCounter = document.getElementById("descCounter");
        const previewBtn = document.getElementById("previewBtn");
        
        nameInput.addEventListener("input", () => {
            const remaining = 100 - nameInput.value.length;
            nameCounter.textContent = remaining;
            nameCounter.style.color = remaining < 20 ? "var(--danger)" : "var(--text-muted)";
        });
        
        descTextarea.addEventListener("input", () => {
            descCounter.textContent = descTextarea.value.length;
        });
        
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const formData = new FormData(form);
            const placeData = Object.fromEntries(formData.entries());
            
            if (placeData.name.length > 100) {
                Toast.error("Название не должно превышать 100 символов", "Ошибка валидации");
                return;
            }
            
            if (!placeData.type) {
                Toast.error("Пожалуйста, выберите тип места", "Ошибка валидации");
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> Сохранение...';
            
            Progress.start();
            
            try {
                if (isEditing) {
                    await api.updatePlace(params.id, placeData);
                    Toast.success(`Место "${placeData.name}" успешно обновлено`, "Сохранено");
                    setTimeout(() => {
                        Router.go(`/places/${params.id}`);
                    }, 500);
                } else {
                    const newPlace = await api.createPlace(placeData);
                    Toast.success(`Место "${placeData.name}" успешно добавлено`, "Добавлено");
                    setTimeout(() => {
                        Router.go(`/places/${newPlace.id}`);
                    }, 500);
                }
                Progress.complete();
            } catch (error) {
                Progress.error();
                Toast.error(`Ошибка: ${error.message}`, "Ошибка сохранения");
                submitBtn.disabled = false;
                submitBtn.textContent = isEditing ? "💾 Сохранить изменения" : "➕ Добавить место";
            }
        });
        
        cancelBtn.addEventListener("click", () => {
            if (isEditing) {
                Router.go(`/places/${params.id}`);
            } else {
                Router.go("/places");
            }
        });
        
        if (previewBtn) {
            previewBtn.addEventListener("click", () => {
                const formData = new FormData(form);
                const previewData = Object.fromEntries(formData.entries());
                
                Toast.info(`
                    Название: ${previewData.name}
                    Тип: ${previewData.type}
                    Адрес: ${previewData.address}
                    Район: ${previewData.district || 'Не указан'}
                `.trim(), "Предпросмотр данных");
            });
        }
        
        form.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }, 300);
}