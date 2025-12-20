/**
 * Тесты для данных уроков
 */

import { describe, it, expect } from 'vitest';
import { lessonsMeta, getLessonMeta } from '../src/data/lessons.js';

describe('Данные уроков', () => {
  it('lessonsMeta содержит структуру уроков', () => {
    expect(Object.keys(lessonsMeta).length).toBeGreaterThan(0);
    const meta = Object.values(lessonsMeta)[0];
    expect(meta).toHaveProperty('authors');
    expect(meta).toHaveProperty('duration');
  });

  it('getLessonMeta возвращает данные по ID', () => {
    const meta = getLessonMeta('html-1');
    expect(meta).toBeDefined();
    expect(meta.authors).toBeDefined();
  });
});
