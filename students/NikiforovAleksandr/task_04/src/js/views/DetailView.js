async function DetailView({ params }) {
  const app = document.getElementById('app');

  function handleEsc(e) {
    if (e.key === 'Escape') {
      location.hash = '#/items';
    }
  }

  document.removeEventListener('keydown', handleEsc);

  app.innerHTML = Loading();

  try {
    const item = await api.getItem(params.id);

    app.innerHTML = `
      <div class="detail-card">
        <div class="detail-image-wrapper">
          <img src="${item.image || 'https://via.placeholder.com/800x600/16213e/ffffff?text=' + encodeURIComponent(item.title)}" alt="${item.title}">
        </div>

        <a href="#/items" class="back-btn">← Назад к каталогу</a>

        <div class="detail-content">
          <h2>${item.title || 'Без названия'}</h2>

          <div class="tags">
            ${(item.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>

          <p style="margin: 2rem 0; line-height: 1.8; color: #ccc;">
            ${item.description || 'Без описания'}
          </p>

          <div class="stars" style="font-size:1.5rem;margin:1rem 0;">
            ${'★'.repeat(item.rating || 5) + '☆'.repeat(5 - (item.rating || 5))}
          </div>

          <div class="detail-actions">
            <button class="btn btn-edit" onclick="location.hash='#/items/${item.id}/edit'">Редактировать</button>
            <button class="btn btn-delete" id="delete-btn">Удалить</button>
          </div>
        </div>
      </div>
    `;

    document.addEventListener('keydown', handleEsc);

    document.getElementById('delete-btn').addEventListener('click', async () => {
      if (confirm('Удалить арт?')) {
        try {
          await api.remove(params.id);
          showToast('Арт удалён');
          location.hash = '#/items';
        } catch (err) {
          showToast('Ошибка при удалении', 'error');
        }
      }
    });

  } catch (err) {
    document.removeEventListener('keydown', handleEsc);
    app.innerHTML = ErrorMessage("Арт не найден или произошла ошибка");
    showToast("Ошибка загрузки", "error");
  }
}

router.add('/items/:id', DetailView);
