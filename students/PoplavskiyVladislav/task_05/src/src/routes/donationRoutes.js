const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { validate, validateQuery } = require('../middlewares/validation');
const { createDonationSchema, updateDonationSchema, querySchema } = require('../schemas/donationSchema');

// Маршруты для пожертвований
router
  .route('/')
  .get(validateQuery(querySchema), donationController.getAll)
  .post(validate(createDonationSchema), donationController.create);

router
  .route('/:id')
  .get(donationController.getById)
  .put(validate(updateDonationSchema), donationController.update)
  .delete(donationController.delete);

// Маршрут для статистики
router.get('/stats/summary', donationController.getStats);

module.exports = router;