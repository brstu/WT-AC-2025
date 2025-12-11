const BASE_URL = "http://localhost:3000";

let authToken = localStorage.getItem('authToken');

function updateAuthToken(token) {
    authToken = token;
    localStorage.setItem('authToken', token);
}

function clearAuthToken() {
    authToken = null;
    localStorage.removeItem('authToken');
}

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };
    
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    
    console.log("➡️ Отправка запроса:", options.method || 'GET', url);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        
        console.log("⬅️ Ответ:", response.status, response.statusText);
        
        if (!response.ok) {
            let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                try {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                } catch {}
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error("Не удалось подключиться к серверу. Убедитесь, что json-server запущен на порту 3000.");
        }
        throw error;
    }
}

export const api = {
    setAuthToken: (token) => updateAuthToken(token),
    clearAuthToken: () => clearAuthToken(),
    getAuthToken: () => authToken,
    
    getPlaces: async (search = "") => {
        const query = search ? `?q=${encodeURIComponent(search)}` : "";
        let places = await request(`/places${query}`);
        
        // Дополнительная фильтрация на клиенте
        if (search && places.length > 0) {
            const searchLower = search.toLowerCase();
            places = places.filter(place => {
                // Проверяем каждое поле
                const nameMatch = place.name && place.name.toLowerCase().includes(searchLower);
                const addressMatch = place.address && place.address.toLowerCase().includes(searchLower);
                const districtMatch = place.district && place.district.toLowerCase().includes(searchLower);
                const typeMatch = place.type && place.type.toLowerCase().includes(searchLower);
                const descMatch = place.description && place.description.toLowerCase().includes(searchLower);
                
                return nameMatch || addressMatch || districtMatch || typeMatch || descMatch;
            });
        }
        
        return places;
    },
    
    getPlace: async (id) => {
        return request(`/places/${id}`);
    },
    
    createPlace: async (placeData) => {
        return request("/places", {
            method: "POST",
            body: placeData,
        });
    },
    
    updatePlace: async (id, placeData) => {
        return request(`/places/${id}`, {
            method: "PUT",
            body: placeData,
        });
    },
    
    deletePlace: async (id) => {
        return request(`/places/${id}`, {
            method: "DELETE",
        });
    },
};