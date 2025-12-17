/**
 * List View - Events list page with search, filters, and pagination
 */

import { getEvents, getCategories, prefetchEvent } from "../api.js";
import { navigate, updateQuery } from "../router.js";
import {
  render,
  showLoading,
  showError,
  showEmpty,
  escapeHtml,
  formatDate,
  truncateText,
  debounce,
} from "./utils.js";

// Debounced search function
const debouncedSearch = debounce(handleSearch, 400);

/**
 * Render the list view
 * @param {Object} params - Route params
 * @param {Object} query - Query parameters
 */
export async function renderListView(params, query = {}) {
  showLoading("Загрузка событий...");

  try {
    const { search = "", category = "", page = "1" } = query;
    const result = await getEvents({
      search,
      category,
      page: parseInt(page),
      limit: 6,
    });

    renderListContent(result, { search, category, page: parseInt(page) });
  } catch (error) {
    showError(error.message, () => renderListView(params, query));
  }
}

/**
 * Render list content
 * @param {Object} result - API result with data, total, page, totalPages
 * @param {Object} filters - Current filters
 */
function renderListContent(result, filters) {
  const { data: events, total, page, totalPages } = result;
  const { search, category } = filters;
  const categories = getCategories();

  const html = `
        <div class="page-header">
            <h1 class="page-title">Лента событий</h1>
            <p class="page-subtitle">Найдено событий: ${total}</p>
        </div>
        
        <!-- Search and Filters -->
        <div class="search-bar" role="search">
            <div class="search-field">
                <label for="search-input" class="sr-only">Поиск событий</label>
                <div class="search-input-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="search" 
                        id="search-input"
                        class="form-input search-input" 
                        placeholder="Поиск по названию, описанию, месту..."
                        value="${escapeHtml(search)}"
                        aria-label="Поиск событий"
                    >
                </div>
            </div>
            <div class="filter-group">
                <label for="category-filter" class="sr-only">Фильтр по категории</label>
                <select id="category-filter" class="form-select" aria-label="Выберите категорию">
                    <option value="">Все категории</option>
                    ${categories
                      .map(
                        (cat) => `
                        <option value="${escapeHtml(cat)}" ${
                          category === cat ? "selected" : ""
                        }>
                            ${escapeHtml(cat)}
                        </option>
                    `
                      )
                      .join("")}
                </select>
                ${
                  search || category
                    ? `
                    <button id="clear-filters" class="btn btn-ghost" aria-label="Сбросить фильтры">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Сбросить
                    </button>
                `
                    : ""
                }
            </div>
        </div>
        
        ${
          events.length === 0
            ? renderEmptyState(search, category)
            : renderEventsList(events)
        }
        
        ${totalPages > 1 ? renderPagination(page, totalPages) : ""}
    `;

  render(html);
  attachListEventHandlers(filters);
}

/**
 * Render empty state
 */
function renderEmptyState(search, category) {
  const hasFilters = search || category;
  return `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h.01M12 12h.01M16 12h.01"></path>
            </svg>
            <h2>${hasFilters ? "Ничего не найдено" : "Событий пока нет"}</h2>
            <p>${
              hasFilters
                ? "Попробуйте изменить параметры поиска или фильтры"
                : "Создайте первое событие, чтобы начать"
            }
            </p>
            ${
              hasFilters
                ? `<button id="empty-clear-filters" class="btn btn-secondary">Сбросить фильтры</button>`
                : `<a href="#/new" class="btn btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Создать событие
                </a>`
            }
        </div>
    `;
}

/**
 * Render events grid
 */
function renderEventsList(events) {
  return `
        <div class="events-grid" role="list">
            ${events.map((event) => renderEventCard(event)).join("")}
        </div>
    `;
}

/**
 * Render single event card
 */
function renderEventCard(event) {
  const defaultImage =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZTVlN2ViIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+0J3QtdGCINC40LfQvtCx0YDQsNC20LXQvdC40Y88L3RleHQ+PC9zdmc+";

  return `
        <article class="card card-clickable" role="listitem" data-event-id="${
          event.id
        }">
            <img 
                src="${escapeHtml(event.image || defaultImage)}" 
                alt="${escapeHtml(event.title)}"
                class="card-image"
                loading="lazy"
                onerror="this.onerror=null;this.src='${defaultImage}';"
            >
            <div class="card-body">
                <span class="badge badge-primary">${escapeHtml(
                  event.category
                )}</span>
                <h2 class="card-title">
                    <a href="#/items/${event.id}" data-prefetch="${
    event.id
  }">${escapeHtml(event.title)}</a>
                </h2>
                <p class="card-text">${escapeHtml(
                  truncateText(event.description, 120)
                )}</p>
                <div class="card-meta">
                    <span class="card-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${formatDate(event.date)}
                    </span>
                    <span class="card-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${escapeHtml(event.time || "")}
                    </span>
                </div>
            </div>
            <div class="card-footer">
                <span class="card-meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${escapeHtml(truncateText(event.location, 40))}
                </span>
            </div>
        </article>
    `;
}

/**
 * Render pagination
 */
function renderPagination(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return `
        <nav class="pagination" role="navigation" aria-label="Постраничная навигация">
            <button 
                class="pagination-btn" 
                data-page="${currentPage - 1}"
                ${currentPage === 1 ? "disabled" : ""}
                aria-label="Предыдущая страница"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            
            ${
              startPage > 1
                ? `
                <button class="pagination-btn" data-page="1">1</button>
                ${
                  startPage > 2
                    ? '<span class="pagination-info">...</span>'
                    : ""
                }
            `
                : ""
            }
            
            ${pages
              .map(
                (p) => `
                <button 
                    class="pagination-btn ${p === currentPage ? "active" : ""}" 
                    data-page="${p}"
                    ${p === currentPage ? 'aria-current="page"' : ""}
                >
                    ${p}
                </button>
            `
              )
              .join("")}
            
            ${
              endPage < totalPages
                ? `
                ${
                  endPage < totalPages - 1
                    ? '<span class="pagination-info">...</span>'
                    : ""
                }
                <button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>
            `
                : ""
            }
            
            <button 
                class="pagination-btn" 
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? "disabled" : ""}
                aria-label="Следующая страница"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </nav>
    `;
}

/**
 * Attach event handlers for list view
 */
function attachListEventHandlers(currentFilters) {
  // Search input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      debouncedSearch(e.target.value);
    });
  }

  // Category filter
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", (e) => {
      updateQuery({ category: e.target.value, page: "" });
    });
  }

  // Clear filters button
  const clearFiltersBtn = document.getElementById("clear-filters");
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      navigate("/items");
    });
  }

  // Empty state clear filters
  const emptyClearBtn = document.getElementById("empty-clear-filters");
  if (emptyClearBtn) {
    emptyClearBtn.addEventListener("click", () => {
      navigate("/items");
    });
  }

  // Event cards - click to navigate
  document.querySelectorAll(".card-clickable").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't navigate if clicking on a link inside the card
      if (e.target.closest("a")) return;

      const eventId = card.dataset.eventId;
      if (eventId) {
        navigate(`/items/${eventId}`);
      }
    });
  });

  // Prefetch on hover/focus
  document.querySelectorAll("[data-prefetch]").forEach((link) => {
    const eventId = link.dataset.prefetch;

    link.addEventListener("mouseenter", () => {
      prefetchEvent(eventId);
    });

    link.addEventListener("focus", () => {
      prefetchEvent(eventId);
    });
  });

  // Pagination
  document.querySelectorAll(".pagination-btn[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      updateQuery({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

/**
 * Handle search input change
 */
function handleSearch(searchValue) {
  updateQuery({ search: searchValue, page: "" });
}
