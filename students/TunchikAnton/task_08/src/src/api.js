const mockFilms = [
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
];

export const fetchFilms = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockFilms;
  } catch (error) {
    console.error('Ошибка:', error);
    return [];
  }
};

export const filterByYear = (films, year) => {
  if (!films) return [];
  return films.filter(film => film.year >= year);
};