const DonationService = require('../services/donationService');

const donationController = {
  // Получить все пожертвования
  getAll: async (req, res, next) => {
    try {
      const { donations, meta } = DonationService.getAllDonations(req.validatedQuery);
      
      res.status(200).json({
        status: 'success',
        data: donations,
        meta
      });
    } catch (error) {
      next(error);
    }
  },

  // Получить пожертвование по ID
  getById: async (req, res, next) => {
    try {
      const donation = DonationService.getDonationById(parseInt(req.params.id));
      
      res.status(200).json({
        status: 'success',
        data: donation
      });
    } catch (error) {
      next(error);
    }
  },

  // Создать новое пожертвование
  create: async (req, res, next) => {
    try {
      const donation = DonationService.createDonation(req.validatedData);
      
      res.status(201).json({
        status: 'success',
        data: donation
      });
    } catch (error) {
      next(error);
    }
  },

  // Обновить пожертвование
  update: async (req, res, next) => {
    try {
      const donation = DonationService.updateDonation(
        parseInt(req.params.id),
        req.validatedData
      );
      
      res.status(200).json({
        status: 'success',
        data: donation
      });
    } catch (error) {
      next(error);
    }
  },

  // Удалить пожертвование
  delete: async (req, res, next) => {
    try {
      DonationService.deleteDonation(parseInt(req.params.id));
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // Получить статистику
  getStats: async (req, res, next) => {
    try {
      const stats = DonationService.getDonationStats();
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = donationController;