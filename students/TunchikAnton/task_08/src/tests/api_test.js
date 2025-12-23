import { filterByYear } from '../src/api.js';

describe('API Functions', () => {
  test('фильтрует фильмы по году', () => {
    const films = [
      { title: 'Фильм 1', year: 2020 },
      { title: 'Фильм 2', year: 2021 },
      { title: 'Фильм 3', year: 2019 },
    ];
    
    const filtered = filterByYear(films, 2020);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].title).toBe('Фильм 1');
    expect(filtered[1].title).toBe('Фильм 2');
  });

  test('возвращает пустой массив при отсутствии фильмов', () => {
    const filtered = filterByYear(null, 2020);
    expect(filtered).toEqual([]);
  });
});