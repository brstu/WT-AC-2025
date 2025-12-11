/**
 * Detail View - Single event detail page
 */

import { getEvent, deleteEvent, getCachedEvent } from "../api.js";
import { navigate } from "../router.js";
import {
  render,
  showLoading,
  showError,
  showNotification,
  escapeHtml,
  formatDate,
} from "./utils.js";

// Current event ID for delete confirmation
let currentEventId = null;

/**
 * Render the detail view
 * @param {Object} params - Route params with id
 */
export async function renderDetailView(params) {
  const { id } = params;
  currentEventId = id;

  // Try to use cached data first for instant loading
  const cachedEvent = getCachedEvent(id);
  if (cachedEvent) {
    renderEventDetail(cachedEvent);
    return;
  }

  showLoading("Загрузка события...");

  try {
    const event = await getEvent(id);
    renderEventDetail(event);
  } catch (error) {
    showError(error.message, () => renderDetailView(params));
  }
}

/**
 * Render event detail content
 * @param {Object} event - Event data
 */
function renderEventDetail(event) {
  const defaultImage =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZTVlN2ViIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCI+0J3QtdGCINC40LfQvtCx0YDQsNC20LXQvdC40Y88L3RleHQ+PC9zdmc+";

  const html = `
        <div class="event-detail">
            <a href="#/items" class="back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Назад к списку
            </a>
            
            <article class="card">
                <img 
                    src="${escapeHtml(event.image || defaultImage)}" 
                    alt="${escapeHtml(event.title)}"
                    class="card-image"
                    onerror="this.onerror=null;this.src='${defaultImage}';"
                >
                
                <div class="card-body">
                    <div class="event-header">
                        <div>
                            <span class="event-category">${escapeHtml(
                              event.category
                            )}</span>
                            <h1 class="event-title">${escapeHtml(
                              event.title
                            )}</h1>
                        </div>
                    </div>
                    
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span><strong>Дата:</strong> ${formatDate(
                              event.date
                            )}</span>
                        </div>
                        
                        <div class="event-meta-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span><strong>Время:</strong> ${escapeHtml(
                              event.time || "Не указано"
                            )}</span>
                        </div>
                        
                        <div class="event-meta-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span><strong>Место:</strong> ${escapeHtml(
                              event.location
                            )}</span>
                        </div>
                        
                        <div class="event-meta-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span><strong>Организатор:</strong> ${escapeHtml(
                              event.organizer || "Не указан"
                            )}</span>
                        </div>
                        
                        ${
                          event.maxParticipants
                            ? `
                            <div class="event-meta-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span><strong>Максимум участников:</strong> ${escapeHtml(
                                  event.maxParticipants
                                )}</span>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="event-description">
                        <h3>Описание</h3>
                        <p>${escapeHtml(event.description)}</p>
                    </div>
                    
                    <div class="event-actions">
                        <a href="#/items/${
                          event.id
                        }/edit" class="btn btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Редактировать
                        </a>
                        <button id="delete-btn" class="btn btn-danger">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Удалить
                        </button>
                        <a href="#/items" class="btn btn-ghost">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            К списку
                        </a>
                    </div>
                </div>
            </article>
        </div>
    `;

  render(html);
  attachDetailEventHandlers();
}

/**
 * Attach event handlers for detail view
 */
function attachDetailEventHandlers() {
  // Delete button
  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", showDeleteConfirmation);
  }
}

/**
 * Show delete confirmation modal
 */
function showDeleteConfirmation() {
  const modal = document.getElementById("delete-modal");
  if (modal) {
    modal.showModal();
    setupModalHandlers();
  }
}

/**
 * Setup modal event handlers
 */
function setupModalHandlers() {
  const modal = document.getElementById("delete-modal");
  const cancelBtn = document.getElementById("modal-cancel");
  const confirmBtn = document.getElementById("modal-confirm");

  // Cancel button
  if (cancelBtn) {
    cancelBtn.onclick = () => modal.close();
  }

  // Confirm button
  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
                <div class="loading-spinner" style="width: 18px; height: 18px; border-width: 2px;"></div>
                Удаление...
            `;

      try {
        await deleteEvent(currentEventId);
        modal.close();
        showNotification("Успешно", "Событие удалено", "success");
        navigate("/items");
      } catch (error) {
        modal.close();
        showNotification("Ошибка", error.message, "error");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Удалить";
      }
    };
  }

  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.close();
    }
  };

  // Close on Escape key
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modal.close();
    }
  });
}
