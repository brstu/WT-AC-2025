import { leaguesService } from '../services/leagues.service.js';

export const leaguesController = {
  getAll: (req, res) => {
    res.json(leaguesService.getAll());
  },

  getOne: (req, res) => {
    res.json(leaguesService.getById(req.params.id));
  },

  create: (req, res) => {
    const league = leaguesService.create(req.body);
    res.status(201).json(league);
  },

  update: (req, res) => {
    res.json(leaguesService.update(req.params.id, req.body));
  },

  delete: (req, res) => {
    leaguesService.delete(req.params.id);
    res.status(204).end();
  }
};
