const STORAGE_KEY = 'arts';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    throw new Error('Ошибка чтения хранилища');
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    throw new Error('Ошибка сохранения');
  }
}

const api = {
  async getList() {
    await new Promise(r => setTimeout(r, 500)); 
    return load();
  },

  async getItem(id) {
    await new Promise(r => setTimeout(r, 500));
    const item = load().find(x => x.id === id);
    if (!item) throw new Error('Элемент не найден');
    return item;
  },

  async create(data) {
    await new Promise(r => setTimeout(r, 500));
    const list = load();
    const item = { id: String(Date.now()), ...data };
    list.push(item);
    save(list);
    return item;
  },

  async update(id, data) {
    await new Promise(r => setTimeout(r, 500));
    const list = load();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) throw new Error('Элемент не найден');
    list[idx] = { ...list[idx], ...data };
    save(list);
    return list[idx];
  },

  async remove(id) {
    await new Promise(r => setTimeout(r, 500));
    const list = load().filter(x => x.id !== id);
    save(list);
  }
};