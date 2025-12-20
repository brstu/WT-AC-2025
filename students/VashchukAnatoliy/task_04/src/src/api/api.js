// api.js — модуль для работы с REST API

const BASE_URL = "http://localhost:3000";

/**
 * Вспомогательная функция для запросов
 */
async function request(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        // no content
        if (res.status === 204) return null;

        return await res.json();
    } catch (err) {
        console.error("API error:", err);
        throw err;
    }
}

/**
 * Получить список статей.
 * Поддержка: поиск по title → title_like.
 */
export function getItems(query = {}) {
    const params = new URLSearchParams();

    if (query.search) {
        params.append("title_like", query.search);
    }

    const url = `${BASE_URL}/items${params.toString() ? "?" + params.toString() : ""}`;
    return request(url);
}

/**
 * Получить статью по id
 */
export function getItem(id) {
    return request(`${BASE_URL}/items/${id}`);
}

/**
 * Создать новую статью
 */
export function createItem(data) {
    return request(`${BASE_URL}/items`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Обновить статью (PATCH)
 */
export function updateItem(id, data) {
    return request(`${BASE_URL}/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

/**
 * Удалить статью
 */
export function deleteItem(id) {
    return request(`${BASE_URL}/items/${id}`, {
        method: "DELETE",
    });
}
