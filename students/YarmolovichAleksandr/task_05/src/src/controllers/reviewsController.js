// Временное хранилище в памяти
let reviews = [];
let nextId = 1;

// GET /reviews - Получить все отзывы
const getAllReviews = (req, res) => {
  res.json({ data: reviews });
};

// GET /reviews/:id - Получить отзыв по ID
const getReviewById = (req, res, next) => {
  const review = reviews.find(r => r.id === parseInt(req.params.id));
  
  if (!review) {
    return next(new Error('Review not found'));
  }
  
  res.json({ data: review });
};

// POST /reviews - Создать новый отзыв
const createReview = (req, res) => {
  const newReview = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  reviews.push(newReview);
  res.status(201).json({ data: newReview });
};

// PATCH /reviews/:id - Обновить отзыв
const updateReview = (req, res, next) => {
  const index = reviews.findIndex(r => r.id === parseInt(req.params.id));
  
  if (index === -1) {
    return next(new Error('Review not found'));
  }
  
  reviews[index] = {
    ...reviews[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  res.json({ data: reviews[index] });
};

// DELETE /reviews/:id - Удалить отзыв
const deleteReview = (req, res, next) => {
  const index = reviews.findIndex(r => r.id === parseInt(req.params.id));
  
  if (index === -1) {
    return next(new Error('Review not found'));
  }
  
  reviews.splice(index, 1);
  res.status(204).send();
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};