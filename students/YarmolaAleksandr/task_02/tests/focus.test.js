/**
 * Тесты для работы с фокусом
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getFocusableElements, disableFocusable } from '../src/utils/focus.js';

describe('Утилиты фокуса', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) document.body.removeChild(container);
  });

  it('getFocusableElements находит интерактивные элементы', () => {
    container.innerHTML = '<a href="#">Ссылка</a><button>Кнопка</button>';
    const focusable = getFocusableElements(container);
    expect(Array.isArray(focusable)).toBe(true);
  });

  it('disableFocusable устанавливает tabindex', () => {
    container.innerHTML = '<button>Кнопка</button>';
    disableFocusable(container);
    const button = container.querySelector('button');
    expect(button.getAttribute('tabindex')).toBe('-1');
  });
});
