import { api } from "../api.js";
import { Router } from "../router.js";
import { Prefetch } from "../utils.js";
import { Toast } from "../utils.js";
import { Progress } from "../utils.js";

function createPlaceCard(place) {
    const card = document.createElement("div");
    card.className = "place-card fade-in";
    card.dataset.id = place.id;
    card.dataset.prefetch = "true";
    
    card.innerHTML = `
        <div class="place-type">${place.type || "Место"}</div>
        <h3 class="place-name">${place.name}</h3>
        <div class="place-address">${place.address}</div>
        <div class="place-district">${place.district || ""}</div>
        <div class="place-preview">
            <small>Нажмите для просмотра деталей</small>
        </div>
    `;
    
    card.addEventListener("click", (e) => {
        e.stopPropagation();
        Router.go(`/places/${place.id}`);
    });
    
    card.addEventListener("mouseenter", async () => {
        if (!card.dataset.prefetched) {
            card.style.cursor = 'progress';
            await Prefetch.prefetchPlace(place.id);
            card.dataset.prefetched = "true";
            card.style.cursor = 'pointer';
        }
    });
    
    card.addEventListener("touchstart", () => {
        card.classList.add('active');
    }, { passive: true });
    
    card.addEventListener("touchend", () => {
        card.classList.remove('active');
    });
    
    return card;
}

function showSkeleton(count = 3) {
    return Array(count).fill().map((_, i) => `
        <div class="card skeleton-card" style="animation-delay: ${i * 0.1}s">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 70%"></div>
            <div class="skeleton skeleton-text" style="width: 50%"></div>
        </div>
    `).join('');
}

export async function showPlaces({ query }) {
    const app = document.getElementById("app");
    Progress.start();
    
    app.innerHTML = `
        <div class="card">
            <h2>Городские места</h2>
            <div class="search-box">
                <input type="text" 
                       class="search-input" 
                       placeholder="Поиск по названию, адресу, району..."
                       value="${query.q || ''}"
                       id="searchInput"
                       data-tooltip="Введите текст для поиска">
                <button class="btn btn-primary" id="searchBtn">Найти</button>
                ${query.q ? `<button class="btn btn-secondary" id="clearBtn">Очистить</button>` : ''}
            </div>
            
            <div id="placesList" class="list-grid">
                ${showSkeleton(6)}
            </div>
            <div id="message"></div>
        </div>
    `;
    
    try {
        const search = query.q || "";
        const places = await api.getPlaces(search);
        Progress.update(70);
        
        const placesList = document.getElementById("placesList");
        const message = document.getElementById("message");
        
        setTimeout(() => {
            placesList.innerHTML = '';
            
            if (places.length === 0) {
                message.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">🏙️</div>
                        <h3>Места не найдены</h3>
                        ${search ? `<p>Попробуйте изменить поисковый запрос</p>` : ''}
                    </div>
                `;
                Progress.complete();
                return;
            }
            
            places.forEach((place, index) => {
                const card = createPlaceCard(place);
                card.style.animationDelay = `${index * 0.05}s`;
                placesList.appendChild(card);
            });
            
            Progress.complete();
        }, 300);
        
        const searchInput = document.getElementById("searchInput");
        const searchBtn = document.getElementById("searchBtn");
        const clearBtn = document.getElementById("clearBtn");
        
        const performSearch = () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                Router.go("/places", { q: searchTerm });
                Toast.info(`Найдено мест: ${places.length}`, "Результаты поиска");
            } else {
                Router.go("/places");
            }
        };
        
        searchBtn.addEventListener("click", performSearch);
        
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                performSearch();
            }
        });
        
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                searchInput.value = "";
                Router.go("/places");
                Toast.info("Поиск очищен");
            });
        }
        
        searchInput.addEventListener("input", (e) => {
            if (e.target.value.length > 2) {
                Prefetch.clearCache();
            }
        });
        
    } catch (error) {
        Progress.error();
        app.innerHTML = `
            <div class="error">
                <h3>Ошибка загрузки</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="Router.go('/places')">
                    Попробовать снова
                </button>
            </div>
        `;
        Toast.error(error.message, "Ошибка загрузки мест");
    }
}