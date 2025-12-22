// src/api.js
const API_BASE = 'https://jsonplaceholder.typicode.com/posts';

export const api = {
    async getList(search = '') {
        // Имитируем комиксы: id, title, author (body → author), year
        const res = await fetch(`${API_BASE}?${search}`);
        if (!res.ok) throw new Error('Ошибка загрузки списка');
        return res.json(); // возвращаем массив
    },

    async getOne(id) {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) throw new Error('Серия не найдена');
        return res.json();
    },

    async create(data) {
        const res = await fetch(API_BASE, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Ошибка создания');
        return res.json();
    },

    async update(id, data) {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Ошибка обновления');
        return res.json();
    },

    async delete(id) {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Ошибка удаления');
        return true;
    }
};