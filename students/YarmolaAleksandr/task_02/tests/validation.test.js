/**
 * Тесты для утилит валидации
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateField, formatDate } from '../src/utils/validation.js';

describe('validateField', () => {
  let input, errorDiv, container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'field';
    input = document.createElement('input');
    input.type = 'text';
    input.required = true;
    errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    container.appendChild(input);
    container.appendChild(errorDiv);
    document.body.appendChild(container);
  });

  it('должна проверять пустое поле', () => {
    input.value = '';
    expect(validateField(input)).toBe(false);
  });

  it('должна принимать заполненное поле', () => {
    input.value = 'Тест';
    expect(validateField(input)).toBe(true);
  });
});

describe('formatDate', () => {
  it('должна форматировать дату', () => {
    const date = new Date('2025-11-22T10:30:00');
    const formatted = formatDate(date);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('2025');
  });
});
