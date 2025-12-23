const express = require('express');
const router = express.Router();
const {
  registrations,
  addRegistration,
  findRegById,
  // добавьте updateRegistration, deleteRegistration в storage.js
} = require('../data/storage');
const validate = require('../middleware/validate');
const { registrationCreateSchema, registrationUpdateSchema } = require('../schemas/registrationSchemas');
const { NotFoundError } = require('../utils/errors');

/**
 * @swagger
 * /events/{eventId}/registrations:
 *   get:
 *     summary: Список регистраций на конкретное событие
 *   post:
 *     summary: Зарегистрироваться на событие
 */

// Пример: регистрации привязаны к событию
router.route('/events/:eventId/registrations')
  .get((req, res) => {
    const { eventId } = req.params;
    const eventRegistrations = registrations().filter(r => r.eventId === Number(eventId));
    res.json({ data: eventRegistrations });
  })
  .post(validate(registrationCreateSchema), (req, res, next) => {
    const registration = addRegistration({
      ...req.body,
      eventId: Number(req.params.eventId),
    });
    res.status(201).json(registration);
  });

// По ID регистрации (глобальный)
router.route('/registrations/:id')
  .get((req, res, next) => {
    const reg = findRegById(req.params.id);
    if (!reg) return next(new NotFoundError('Registration not found'));
    res.json(reg);
  })
  .patch(validate(registrationUpdateSchema), (req, res, next) => {
    // реализуйте update в storage.js
    const updated = updateRegistration(req.params.id, req.body);
    if (!updated) return next(new NotFoundError());
    res.json(updated);
  })
  .delete((req, res, next) => {
    // реализуйте delete в storage.js
    if (!findRegById(req.params.id)) return next(new NotFoundError());
    deleteRegistration(req.params.id);
    res.status(204).send();
  });

module.exports = router;