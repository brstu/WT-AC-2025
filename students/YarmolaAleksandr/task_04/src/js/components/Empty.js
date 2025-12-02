/**
 * Компонент для отображения пустого состояния
 */
export class Empty {
    /**
     * Рендер компонента пустого состояния
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {string} actionText - Текст кнопки действия
     * @param {string} actionLink - Ссылка для кнопки действия
     * @returns {string} HTML разметка
     */
    static render(
        title = 'Ничего не найдено',
        message = 'Попробуйте изменить параметры поиска или добавьте новый инструмент',
        actionText = 'Добавить инструмент',
        actionLink = '#/new'
    ) {
        return `
            <div class="empty-container">
                <div class="empty-icon">📦</div>
                <h2 class="empty-title">${title}</h2>
                <p class="empty-message">${message}</p>
                ${actionLink ? `<a href="${actionLink}" class="btn btn-primary">${actionText}</a>` : ''}
            </div>
        `;
    }
}
