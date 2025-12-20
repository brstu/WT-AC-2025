import { api } from '../api.js';

export class DetailView {
    id = null;

    async render() {
        const content = document.getElementById('content');
        content.innerHTML = '<div class="loading">Загрузка...</div>';

        try {
            const item = await api.getOne(this.id);
            content.innerHTML = `
        <a href="#/items">← Назад к списку</a>
        <h2>${item.title}</h2>
        <p><strong>Автор/Описание:</strong> ${item.body}</p>
        <div>
          <a href="#/items/${item.id}/edit">Редактировать</a>
        </div>

        <hr>
        <h3>Отзывы</h3>
        <form id="review-form">
          <textarea name="text" placeholder="Ваш отзыв..." required></textarea><br>
          <button type="submit">Отправить отзыв</button>
        </form>
        <div id="reviews-list">Отзывов пока нет</div>
      `;

            // Здесь можно хранить отзывы в localStorage, т.к. JSONPlaceholder их не сохраняет
            const reviews = JSON.parse(localStorage.getItem(`reviews_${this.id}`) || '[]');
            this.renderReviews(reviews);

            document.getElementById('review-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const text = e.target.text.value.trim();
                if (text) {
                    reviews.push({ text, date: new Date().toLocaleString() });
                    localStorage.setItem(`reviews_${this.id}`, JSON.stringify(reviews));
                    this.renderReviews(reviews);
                    e.target.reset();
                }
            });

        } catch (err) {
            content.innerHTML = `<div class="error">${err.message}</div>`;
        }
    }

    renderReviews(reviews) {
        const list = document.getElementById('reviews-list');
        if (reviews.length === 0) {
            list.innerHTML = 'Отзывов пока нет';
            return;
        }
        list.innerHTML = '<ul>' + reviews.map(r => `<li><strong>${r.date}</strong><br>${r.text}</li>`).join('') + '</ul>';
    }
}