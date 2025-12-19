/**
 * Компонент для отображения ошибок
 */
export class ErrorComponent {
    /**
     * Рендер компонента ошибки
     * @param {string} message - Сообщение об ошибке
     * @param {Function} onRetry - Callback для повторной попытки
     * @returns {string} HTML разметка
     */
    static render(message = 'Произошла ошибка', onRetry = null) {
        const retryButton = onRetry ? 
            `<button class="btn btn-primary" onclick="window.retryAction()">Попробовать снова</button>` : '';
        
        if (onRetry) {
            window.retryAction = onRetry;
        }

        return `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h2 class="error-title">Упс! Что-то пошло не так</h2>
                <p class="error-message">${message}</p>
                ${retryButton}
            </div>
        `;
    }
}
