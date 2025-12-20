const { v4: uuidv4 } = require('uuid');
const dataService = require('../services/dataService');
const { NotFoundError } = require('../middlewares/errorHandler');

const getMuseums = async (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;
  let museums = Object.values(await dataService.getData('museums'));
  if (q) {
    museums = museums.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
  }
  museums = museums.slice(offset, offset + parseInt(limit));
  res.status(200).json({ data: museums });
};

const getMuseumById = async (req, res) => {
  const museum = await dataService.getDataById('museums', req.params.id);
  if (!museum) throw new NotFoundError('Museum not found');
  res.status(200).json({ data: museum });
};

const createMuseum = async (req, res) => {
  const id = uuidv4();
  const museum = { id, ...req.body };
  await dataService.addData('museums', id, museum);
  res.status(201).json({ data: museum, message: 'Museum created' });
};

const updateMuseum = async (req, res) => {
  const existing = await dataService.getDataById('museums', req.params.id);
  if (!existing) throw new NotFoundError('Museum not found');
  const updated = { ...existing, ...req.body };
  await dataService.updateData('museums', req.params.id, updated);
  res.status(200).json({ data: updated, message: 'Museum updated' });
};

const deleteMuseum = async (req, res) => {
  const existing = await dataService.getDataById('museums', req.params.id);
  if (!existing) throw new NotFoundError('Museum not found');
  await dataService.deleteData('museums', req.params.id);
  res.status(204).send();
};

const getMuseumReviews = async (req, res) => {
  const museum = await dataService.getDataById('museums', req.params.id);
  if (!museum) throw new NotFoundError('Museum not found');
  const reviews = Object.values(await dataService.getData('reviews')).filter(
    (r) => r.museumId === req.params.id
  );
  res.status(200).json({ data: reviews });
};

module.exports = { getMuseums, getMuseumById, createMuseum, updateMuseum, deleteMuseum, getMuseumReviews };
