import { matchesService } from '../services/matches.service.js';

export const matchesController = {
  getAll(req, res) {
    const result = matchesService.getAll(req.query);
    res.json(result);
  },

  getOne(req, res) {
    const match = matchesService.getById(req.params.id);
    res.json(match);
  },

  create(req, res) {
    const match = matchesService.create(req.body);
    res.status(201).json(match);
  },

  update(req, res) {
    const match = matchesService.update(req.params.id, req.body);
    res.json(match);
  },

  delete(req, res) {
    matchesService.delete(req.params.id);
    res.status(200).json({ message: 'Match deleted successfully' });
  }
};
