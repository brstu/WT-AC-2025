import '@testing-library/jest-dom';

window.alert = jest.fn();

global.fetch = jest.fn((url) => {
  if (url === '/api/films') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 1,
          title: 'Интерстеллар',
          director: 'Кристофер Нолан',
          year: 2014,
          rating: 8.6,
          duration: 169
        },
        {
          id: 2,
          title: 'Паразиты',
          director: 'Пон Чжун Хо',
          year: 2019,
          rating: 8.6,
          duration: 132
        }
      ])
    });
  }
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve([])
  });
});