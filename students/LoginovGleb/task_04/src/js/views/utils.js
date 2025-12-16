/**
 * Views Utilities - Common functions for all views
 */

// Content container reference
let contentEl = null;

/**
 * Initialize views module
 */
export function initViews() {
  contentEl = document.getElementById("content");
}

/**
 * Get content container
 */
export function getContentEl() {
  if (!contentEl) {
    contentEl = document.getElementById("content");
  }
  return contentEl;
}

/**
 * Render content to the main container
 * @param {string} html - HTML content to render
 */
export function render(html) {
  const el = getContentEl();
  if (el) {
    el.innerHTML = html;
  }
}

/**
 * Show loading state
 * @param {string} message - Loading message
 */
export function showLoading(message = "Загрузка...") {
  render(`
        <div class="loading" role="status" aria-live="polite">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p>${escapeHtml(message)}</p>
        </div>
    `);
}

/**
 * Show error state
 * @param {string} message - Error message
 * @param {Function} retryFn - Optional retry function
 */
export function showError(message, retryFn = null) {
  const retryButton = retryFn
    ? `
        <button class="btn btn-primary" id="error-retry">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Попробовать снова
        </button>
    `
    : "";

  render(`
        <div class="error-state" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h2>Ошибка</h2>
            <p>${escapeHtml(message)}</p>
            ${retryButton}
            <a href="#/items" class="btn btn-secondary mt-md">Вернуться к списку</a>
        </div>
    `);

  if (retryFn) {
    document.getElementById("error-retry")?.addEventListener("click", retryFn);
  }
}

/**
 * Show empty state
 * @param {string} title - Empty state title
 * @param {string} message - Empty state message
 * @param {string} actionUrl - Optional action URL
 * @param {string} actionText - Optional action button text
 */
export function showEmpty(title, message, actionUrl = null, actionText = null) {
  const actionButton =
    actionUrl && actionText
      ? `
        <a href="${actionUrl}" class="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            ${escapeHtml(actionText)}
        </a>
    `
      : "";

  render(`
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(message)}</p>
            ${actionButton}
        </div>
    `);
}

/**
 * Show notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in ms (0 for no auto-close)
 */
export function showNotification(
  title,
  message,
  type = "info",
  duration = 5000
) {
  const container = document.getElementById("notifications");
  if (!container) return;

  const icons = {
    success:
      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
    error:
      '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
    warning:
      '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
    info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  };

  const id = "notification-" + Date.now();
  const notification = document.createElement("div");
  notification.id = id;
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${icons[type] || icons.info}
        </svg>
        <div class="notification-content">
            <div class="notification-title">${escapeHtml(title)}</div>
            ${
              message
                ? `<div class="notification-message">${escapeHtml(
                    message
                  )}</div>`
                : ""
            }
        </div>
        <button class="notification-close" aria-label="Закрыть уведомление">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

  container.appendChild(notification);

  // Close button handler
  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      removeNotification(notification);
    });

  // Auto-close
  if (duration > 0) {
    setTimeout(() => removeNotification(notification), duration);
  }
}

/**
 * Remove a notification
 * @param {HTMLElement} notification - Notification element
 */
function removeNotification(notification) {
  notification.style.animation = "slideOut 0.3s ease forwards";
  setTimeout(() => notification.remove(), 300);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Format date for display
 * @param {string} dateStr - Date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format time for display
 * @param {string} timeStr - Time string (HH:MM)
 */
export function formatTime(timeStr) {
  if (!timeStr) return "";
  return timeStr;
}

/**
 * Format date for input field
 * @param {string} dateStr - Date string
 */
export function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toISOString().split("T")[0];
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 */
export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Validate form data
 * @param {Object} data - Form data object
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid, errors }
 */
export function validateForm(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    if (fieldRules.required && (!value || !value.toString().trim())) {
      errors[field] = fieldRules.requiredMessage || "Это поле обязательно";
      continue;
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] =
        fieldRules.minLengthMessage ||
        `Минимум ${fieldRules.minLength} символов`;
      continue;
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] =
        fieldRules.maxLengthMessage ||
        `Максимум ${fieldRules.maxLength} символов`;
      continue;
    }

    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.patternMessage || "Неверный формат";
      continue;
    }

    if (
      value &&
      fieldRules.min !== undefined &&
      Number(value) < fieldRules.min
    ) {
      errors[field] =
        fieldRules.minMessage || `Минимальное значение: ${fieldRules.min}`;
      continue;
    }

    if (
      value &&
      fieldRules.max !== undefined &&
      Number(value) > fieldRules.max
    ) {
      errors[field] =
        fieldRules.maxMessage || `Максимальное значение: ${fieldRules.max}`;
      continue;
    }

    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Show validation errors on form
 * @param {HTMLFormElement} form - Form element
 * @param {Object} errors - Errors object
 */
export function showFormErrors(form, errors) {
  // Clear previous errors
  form.querySelectorAll(".form-error").forEach((el) => el.remove());
  form.querySelectorAll(".error").forEach((el) => {
    el.classList.remove("error");
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  });

  // Show new errors
  for (const [field, message] of Object.entries(errors)) {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add("error");
      input.setAttribute("aria-invalid", "true");

      const errorId = `${field}-error`;
      const errorEl = document.createElement("span");
      errorEl.id = errorId;
      errorEl.className = "form-error";
      errorEl.setAttribute("role", "alert");
      errorEl.textContent = message;
      input.parentNode.appendChild(errorEl);

      // Update aria-describedby to include error
      const existingDescribedBy = input.getAttribute("aria-describedby");
      if (existingDescribedBy) {
        input.setAttribute(
          "aria-describedby",
          `${existingDescribedBy} ${errorId}`
        );
      } else {
        input.setAttribute("aria-describedby", errorId);
      }
    }
  }
}

/**
 * Clear form errors
 * @param {HTMLFormElement} form - Form element
 */
export function clearFormErrors(form) {
  form.querySelectorAll(".form-error").forEach((el) => el.remove());
  form.querySelectorAll(".error").forEach((el) => {
    el.classList.remove("error");
    el.removeAttribute("aria-invalid");
    // Restore original aria-describedby (remove error references)
    const describedBy = el.getAttribute("aria-describedby");
    if (describedBy) {
      const cleanedDescribedBy = describedBy
        .split(" ")
        .filter((id) => !id.endsWith("-error"))
        .join(" ");
      if (cleanedDescribedBy) {
        el.setAttribute("aria-describedby", cleanedDescribedBy);
      } else {
        el.removeAttribute("aria-describedby");
      }
    }
  });
}

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

/**
 * Set form data from object
 * @param {HTMLFormElement} form - Form element
 * @param {Object} data - Data object
 */
export function setFormData(form, data) {
  for (const [key, value] of Object.entries(data)) {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
      if (input.type === "checkbox") {
        input.checked = Boolean(value);
      } else {
        input.value = value ?? "";
      }
    }
  }
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ===== Accessibility: Color Contrast Checker =====

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color (e.g., '#ffffff' or 'ffffff')
 * @returns {Object} - { r, g, b } values (0-255)
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color (WCAG 2.0 formula)
 * @param {Object} rgb - { r, g, b } values (0-255)
 * @returns {number} - Relative luminance (0-1)
 */
function getRelativeLuminance(rgb) {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.0)
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} - Contrast ratio (1-21)
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    console.warn('Invalid color format for contrast calculation');
    return 0;
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - 'AA' or 'AAA'
 * @param {boolean} largeText - Is text large (18pt+ or 14pt+ bold)?
 * @returns {boolean} - true if meets standard
 */
export function meetsContrastStandard(ratio, level = 'AA', largeText = false) {
  if (level === 'AAA') {
    return largeText ? ratio >= 4.5 : ratio >= 7;
  }
  // AA level (default)
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Verify color contrast for accessibility
 * Checks if foreground and background colors meet WCAG AA standards
 * 
 * IMPLEMENTATION NOTE:
 * This function provides programmatic verification of the color contrast
 * mentioned in README.md. Used during development to ensure accessibility.
 * 
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {boolean} largeText - Is text large (18pt+ or 14pt+ bold)?
 * @returns {Object} - { ratio, passes, level }
 */
export function verifyColorContrast(foreground, background, largeText = false) {
  const ratio = getContrastRatio(foreground, background);
  const passesAA = meetsContrastStandard(ratio, 'AA', largeText);
  const passesAAA = meetsContrastStandard(ratio, 'AAA', largeText);
  
  return {
    ratio: ratio.toFixed(2),
    passes: passesAA,
    level: passesAAA ? 'AAA' : (passesAA ? 'AA' : 'Fail'),
    details: `Contrast ratio: ${ratio.toFixed(2)}:1 (${passesAA ? '✓' : '✗'} WCAG AA, ${passesAAA ? '✓' : '✗'} WCAG AAA)`
  };
}
