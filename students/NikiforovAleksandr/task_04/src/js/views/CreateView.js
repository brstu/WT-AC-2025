async function CreateView() {
  const app = document.getElementById('app');
  app.innerHTML = Loading();

  try {
    app.innerHTML = `
      <h2 style="text-align:center; margin-bottom:2rem; color:#e0e0e0;">Создать арт</h2>
      <form id="create-form">
        <input name="title" placeholder="Название арта" required minlength="3" />
        <textarea name="description" placeholder="Описание" required minlength="10"></textarea>
        
        <input name="tags" placeholder="Теги через запятую: digital, fantasy, pixel art" />
        
        <select name="rating">
          <option value="5">★★★★★ 5 звёзд</option>
          <option value="4">★★★★☆ 4 звезды</option>
          <option value="3">★★★☆☆ 3 звезды</option>
          <option value="2">★★☆☆☆ 2 звезды</option>
          <option value="1">★☆☆☆☆ 1 звезда</option>
        </select>

        <input name="image" placeholder="URL изображения (опционально)" />

        <p id="form-error" style="color:#ef4444; display:none; margin-top:1rem;"></p>

        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick="history.back()">← Назад</button>
          <button type="submit" class="btn-primary">
            <span class="btn-text">Создать арт</span>
            <span class="btn-loading" style="display:none;">Создаём...</span>
          </button>
        </div>
      </form>
    `;

    const form = document.getElementById('create-form');
    const errorEl = document.getElementById('form-error');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      errorEl.style.display = 'none';
      errorEl.textContent = '';

      const fd = new FormData(e.target);
      let data = Object.fromEntries(fd.entries());

      if (!data.title?.trim() || data.title.trim().length < 3) {
        errorEl.textContent = 'Название должно быть не короче 3 символов';
        errorEl.style.display = 'block';
        return;
      }
      if (!data.description?.trim() || data.description.trim().length < 10) {
        errorEl.textContent = 'Описание должно быть не короче 10 символов';
        errorEl.style.display = 'block';
        return;
      }

      data.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      data.rating = Number(data.rating) || 5;
      if (!data.image?.trim()) delete data.image;

      const btn = e.target.querySelector('.btn-primary');
      const btnText = btn.querySelector('.btn-text');
      const btnLoading = btn.querySelector('.btn-loading');

      btn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';

      try {
        await api.create(data);
        showToast("Арт успешно создан!");
        location.hash = "#/items";
      } catch (err) {
        console.error(err);
        showToast("Ошибка создания арта", "error");
        errorEl.textContent = 'Произошла ошибка при сохранении';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    });
  } catch (err) {
    app.innerHTML = ErrorMessage("Не удалось загрузить форму");
    showToast("Ошибка", "error");
  }
}

router.add('/new', CreateView);