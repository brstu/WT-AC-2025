import reducer, { addFavorite, removeFavorite } from '../store/favoritesSlice.js';

describe('favorites reducer', () => {
  it('should add favorite', () => {
    const state = reducer({ items: [] }, addFavorite('1'));
    expect(state.items).toEqual(['1']);
  });

  it('should remove favorite', () => {
    const state = reducer({ items: ['1', '2'] }, removeFavorite('1'));
    expect(state.items).toEqual(['2']);
  });
});
