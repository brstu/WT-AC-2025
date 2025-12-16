const { ApiError } = require('../middleware/errorHandler');

let reviews = [];
let currentReviewId = 1;

const reviewsController = {
  getBookReviews: (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    const bookReviews = reviews.filter(r => r.bookId === req.params.bookId);

    const paginatedReviews = bookReviews.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      data: paginatedReviews,
      meta: {
        total: bookReviews.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  },

  getReviewById: (req, res) => {
    const review = reviews.find(r => r.id === req.params.id);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    res.json({ data: review });
  },

  createReview: (req, res) => {
    // В реальном приложении здесь должна быть проверка существования книги
    // Для простоты считаем, что книга существует
    const review = {
      id: String(currentReviewId++),
      ...req.validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reviews.push(review);
    res.status(201).json({ data: review });
  },

  updateReview: (req, res) => {
    const reviewIndex = reviews.findIndex(r => r.id === req.params.id);
    if (reviewIndex === -1) {
      throw new ApiError(404, 'Review not found');
    }

    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      ...req.validatedData,
      updatedAt: new Date().toISOString()
    };

    res.json({ data: reviews[reviewIndex] });
  },

  deleteReview: (req, res) => {
    const reviewIndex = reviews.findIndex(r => r.id === req.params.id);
    if (reviewIndex === -1) {
      throw new ApiError(404, 'Review not found');
    }

    reviews.splice(reviewIndex, 1);
    res.status(204).send();
  }
};

module.exports = reviewsController;