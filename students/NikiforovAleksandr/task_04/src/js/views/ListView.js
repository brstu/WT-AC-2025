async function ListView({ query }) {
  const app = document.getElementById('app');
  app.innerHTML = Loading();

  try {
    const items = await api.getList();
    const search = (query.get('search') || '').toLowerCase();
    const tagFilter = query.get('tag');

    let filtered = items;
    if (search) {
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(search) || 
        i.description.toLowerCase().includes(search)
      );
    }
    if (tagFilter) {
      filtered = filtered.filter(i => i.tags?.includes(tagFilter));
    }

    const allTags = [...new Set(items.flatMap(i => i.tags || []))];

    app.innerHTML = `
      <div class="controls">
        <input type="text" class="search-input" placeholder="Поиск артов..." value="${search}" id="search-input" />
      </div>

      ${allTags.length > 0 ? `
        <div class="tags-filter">
          ${allTags.map(t => `
            <span class="tag ${tagFilter === t ? 'active' : ''}" data-tag="${t}">${t}</span>
          `).join('')}
        </div>
      ` : ''}

      ${filtered.length === 0 ? Empty() : `
        <div class="art-grid">
          ${filtered.map(art => `
            <div class="art-card" onclick="location.hash='#/items/${art.id}'">
              <div class="image-wrapper">
                <img src="${art.image || 'https://via.placeholder.com/400x600/16213e/ffffff?text=ART'}" alt="${art.title || 'Без названия'}">
              </div>
              <div class="content">
                <h3>${art.title || 'Без названия'}</h3>
                <p class="description">${art.description || 'Без описания'}</p>
                <div class="tags">
                  ${(art.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                <div class="stars">${'★'.repeat(art.rating || 5) + '☆'.repeat(5 - (art.rating || 5))}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;

    const searchInput = document.getElementById('search-input');
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = e.target.value;
    location.hash = val ? `#/items?search=${encodeURIComponent(val)}` : '#/items';
  }
});

    document.querySelectorAll('.tag[data-tag]').forEach(el => {
      el.addEventListener('click', () => {
        const tag = el.dataset.tag;
        if (tagFilter === tag) {
          location.hash = search ? `#/items?search=${encodeURIComponent(search)}` : '#/items';
        } else {
          location.hash = `#/items?tag=${tag}${search ? '&search=' + encodeURIComponent(search) : ''}`;
        }
      });
    });

  } catch (err) {
    app.innerHTML = ErrorMessage(err.message);
  }
}

router.add('/items', ListView);