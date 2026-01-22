import { store } from '../data/store.js';
import { ApiError } from '../errors/ApiError.js';
import crypto from 'crypto';

export const leaguesService = {
  getAll() {
    return store.leagues;
  },

  getById(id) {
    const league = store.leagues.find(l => l.id === id);
    if (!league) throw ApiError.notFound('League not found');
    return league;
  },

  create(data) {
    const league = { id: crypto.randomUUID(), ...data };
    store.leagues.push(league);
    return league;
  },

  update(id, data) {
    const league = this.getById(id);
    Object.assign(league, data);
    return league;
  },

  delete(id) {
    const index = store.leagues.findIndex(l => l.id === id);
    if (index === -1) throw ApiError.notFound('League not found');
    store.leagues.splice(index, 1);
  }
};
