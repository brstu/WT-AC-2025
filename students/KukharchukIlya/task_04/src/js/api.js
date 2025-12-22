if (!location.hash) {
    location.hash = "#/albums";
}

const API_BASE = "http://localhost:3000";

async function request(url, opts = {}) {
    console.log("➡️ Fetching:", API_BASE + url, opts);
    const res = await fetch(API_BASE + url, {
        headers: { "Content-Type": "application/json" },
        ...opts
    });

    const text = await res.text();
    let parsed;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch (e) {
        parsed = text;
    }

    console.log("⬅️ Response:", res.status, parsed);

    if (!res.ok) {
        throw new Error(typeof parsed === "string" ? parsed : (parsed?.error || res.statusText));
    }

    return parsed;
}

export const api = {
    // поддерживаем оба варианта: q и search
    listAlbums: async (opts = {}) => {
        const params = new URLSearchParams();
        if (opts.q) params.set("q", opts.q);
        if (opts.search && !opts.q) params.set("q", opts.search); // fallback
        const qs = params.toString();
        return request(`/albums${qs ? "?" + qs : ""}`);
    },

    getAlbum: (id) => request(`/albums/${id}`),
    createAlbum: (data) => request("/albums", { method: "POST", body: JSON.stringify(data) }),
    updateAlbum: (id, data) => request(`/albums/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteAlbum: (id) => request(`/albums/${id}`, { method: "DELETE" })
};
