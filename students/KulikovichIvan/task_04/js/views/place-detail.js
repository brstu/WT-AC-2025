import { api } from '../api.js';
import { Router } from '../router.js';
import { Toast } from '../utils.js';
import { Progress } from '../utils.js';

export async function showPlaceDetail({ params }) {
    const app = document.getElementById('app');
    Progress.start();
    
    app.innerHTML = `
        <div class="card loading">
            <div class="loading-spinner"></div>
            <p>Загрузка информации о месте...</p>
        </div>
    `;
    
    try {
        const place = await api.getPlace(params.id);
        Progress.update(50);
        
        setTimeout(() => {
            app.innerHTML = `
                <div class="card fade-in">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                        <div style="flex: 1; min-width: 300px;">
                            <div class="place-type">${place.type || "Место"}</div>
                            <h2 style="margin-top: 0.5rem; margin-bottom: 0.5rem;">${place.name}</h2>
                            <div class="note" style="color: var(--text-muted);">
                                Обновлено: ${new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-secondary" onclick="Router.go('/places')" data-tooltip="Вернуться к списку">
                                ← Назад
                            </button>
                            <button class="btn btn-primary" onclick="Router.go('/places/${place.id}/edit')" data-tooltip="Редактировать это место">
                                Редактировать
                            </button>
                            <button class="btn btn-danger" id="deleteBtn" data-tooltip="Удалить это место">
                                Удалить
                            </button>
                        </div>
                    </div>
                    
                    <div style="display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                        <div class="card" style="background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">📌 Основная информация</h4>
                            <div style="display: grid; gap: 0.75rem;">
                                <div>
                                    <strong style="display: block; color: var(--text-muted); font-size: 0.875rem;">Адрес</strong>
                                    <p style="margin: 0.25rem 0; font-size: 1.1rem;">${place.address}</p>
                                </div>
                                <div>
                                    <strong style="display: block; color: var(--text-muted); font-size: 0.875rem;">Район</strong>
                                    <p style="margin: 0.25rem 0; font-size: 1.1rem;">${place.district || 'Не указан'}</p>
                                </div>
                                <div>
                                    <strong style="display: block; color: var(--text-muted); font-size: 0.875rem;">Тип места</strong>
                                    <p style="margin: 0.25rem 0; font-size: 1.1rem;">${place.type || 'Не указан'}</p>
                                </div>
                            </div>
                        </div>
                        
                        ${place.description ? `
                        <div class="card">
                            <h4 style="margin-bottom: 1rem; color: var(--primary);">📝 Описание</h4>
                            <p style="line-height: 1.6; white-space: pre-wrap;">${place.description}</p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button class="btn btn-secondary" onclick="window.print()" data-tooltip="Распечатать информацию">
                                🖨️ Печать
                            </button>
                            <button class="btn btn-secondary" onclick="sharePlace(${place.id})" data-tooltip="Поделиться местом">
                                📤 Поделиться
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            Progress.complete();
            
            document.getElementById("deleteBtn").addEventListener("click", async () => {
                if (!confirm("Вы уверены, что хотите удалить это место? Это действие нельзя отменить.")) {
                    return;
                }
                
                const deleteBtn = document.getElementById('deleteBtn');
                deleteBtn.disabled = true;
                deleteBtn.innerHTML = '<span class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> Удаление...';
                
                try {
                    await api.deletePlace(place.id);
                    Toast.success(`Место "${place.name}" успешно удалено`, "Удалено");
                    
                    setTimeout(() => {
                        Router.go("/places");
                    }, 500);
                    
                } catch (error) {
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = 'Удалить';
                    Toast.error(`Ошибка удаления: ${error.message}`, "Ошибка");
                }
            });
            
            window.sharePlace = async (id) => {
                try {
                    if (navigator.share) {
                        await navigator.share({
                            title: place.name,
                            text: `${place.name} - ${place.address}`,
                            url: window.location.href,
                        });
                        Toast.success("Место успешно отправлено", "Поделиться");
                    } else {
                        await navigator.clipboard.writeText(window.location.href);
                        Toast.info("Ссылка скопирована в буфер обмена", "Поделиться");
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        Toast.error("Не удалось поделиться местом", "Ошибка");
                    }
                }
            };
            
        }, 300);
        
    } catch (error) {
        Progress.error();
        if (error.message && error.message.includes('404')) {
            app.innerHTML = `
                <div class="card error">
                    <h2>Место не найдено</h2>
                    <p>Запрошенное место не существует или было удалено.</p>
                    <button class="btn btn-primary" onclick="Router.go('/places')" style="margin-top: 1rem;">
                        Вернуться к списку мест
                    </button>
                </div>
            `;
            Toast.error("Место не найдено", "Ошибка");
        } else {
            app.innerHTML = `
                <div class="error">
                    <h3>Не удалось загрузить информацию о месте</h3>
                    <p>${error.message}</p>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="Router.go('/places')">
                            К списку мест
                        </button>
                        <button class="btn btn-secondary" onclick="showPlaceDetail({ params: { id: '${params.id}' } })">
                            Повторить попытку
                        </button>
                    </div>
                </div>
            `;
            Toast.error(error.message, "Ошибка загрузки");
        }
    }
}