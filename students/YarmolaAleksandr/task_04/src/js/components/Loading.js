/**
 * Компонент для отображения состояния загрузки
 */
export class Loading {
    /**
     * Рендер компонента загрузки
     * @param {string} message - Сообщение для отображения
     * @returns {string} HTML разметка
     */
    static render(message = 'Загрузка...') {
        return `
            <div class="loading">
                <div class="spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
    }
}
