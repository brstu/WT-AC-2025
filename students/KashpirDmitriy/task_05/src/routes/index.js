const express = require('express');
const museumsRouter = require('./museums');
const reviewsRouter = require('./reviews');

const router = express.Router();

router.use('/museums', museumsRouter);
router.use('/reviews', reviewsRouter);

module.exports = router;
