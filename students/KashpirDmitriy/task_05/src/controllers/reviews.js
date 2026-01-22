const { v4: uuidv4 } = require('uuid');
const dataService = require('../services/dataService');
const { NotFoundError } = require('../middlewares/errorHandler');

const getReviews = async (req, res) => {
  const { q, limit = 10, offset = 0, museumId } = req.query;
  let reviews = Object.values(await dataService.getData('reviews'));
  
  if (museumId) {
    reviews = reviews.filter((r) => r.museumId === museumId);
  }
  
  if (q) {
    reviews = reviews.filter((r) => r.text.toLowerCase().includes(q.toLowerCase()));
  }
  
  reviews = reviews.slice(offset, offset + parseInt(limit));
  res.status(200).json({ data: reviews });
};

const getReviewById = async (req, res) => {
  const review = await dataService.getDataById('reviews', req.params.id);
  if (!review) throw new NotFoundError('Review not found');
  res.status(200).json({ data: review });
};

const createReview = async (req, res) => {
  const museum = await dataService.getDataById('museums', req.body.museumId);
  if (!museum) throw new NotFoundError('Museum not found');
  
  const id = uuidv4();
  const review = { 
    id, 
    createdAt: new Date().toISOString(),
    ...req.body 
  };
  await dataService.addData('reviews', id, review);
  res.status(201).json({ data: review, message: 'Review created' });
};

const updateReview = async (req, res) => {
  const existing = await dataService.getDataById('reviews', req.params.id);
  if (!existing) throw new NotFoundError('Review not found');
  
  if (req.body.museumId) {
    const museum = await dataService.getDataById('museums', req.body.museumId);
    if (!museum) throw new NotFoundError('Museum not found');
  }
  
  const updated = { ...existing, ...req.body };
  await dataService.updateData('reviews', req.params.id, updated);
  res.status(200).json({ data: updated, message: 'Review updated' });
};

const deleteReview = async (req, res) => {
  const existing = await dataService.getDataById('reviews', req.params.id);
  if (!existing) throw new NotFoundError('Review not found');
  await dataService.deleteData('reviews', req.params.id);
  res.status(204).send();
};

module.exports = { getReviews, getReviewById, createReview, updateReview, deleteReview };
