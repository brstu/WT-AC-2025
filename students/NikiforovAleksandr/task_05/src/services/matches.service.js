import { store } from '../data/store.js';
import { ApiError } from '../errors/ApiError.js';
import crypto from 'crypto';

export const matchesService = {
  getAll({ leagueId, limit = 10, offset = 0 }) {
    let data = store.matches;

    if (leagueId) {
      data = data.filter(m => m.leagueId === leagueId);
    }

    return {
      total: data.length,
      limit: Number(limit),
      offset: Number(offset),
      items: data.slice(offset, offset + limit)
    };
  },

  getById(id) {
    const match = store.matches.find(m => m.id === id);
    if (!match) {
      throw ApiError.notFound('Match not found');
    }
    return match;
  },

  create(data) {
    const leagueExists = store.leagues.some(
      l => l.id === data.leagueId
    );

    if (!leagueExists) {
      throw ApiError.unprocessable('League does not exist');
    }

    const match = {
      id: crypto.randomUUID(),
      ...data
    };

    store.matches.push(match);
    return match;
  },

  update(id, data) {
    const match = this.getById(id);
    Object.assign(match, data);
    return match;
  },

  delete(id) {
    const index = store.matches.findIndex(m => m.id === id);
    if (index === -1) {
      throw ApiError.notFound('Match not found');
    }
    store.matches.splice(index, 1);
  }
};
