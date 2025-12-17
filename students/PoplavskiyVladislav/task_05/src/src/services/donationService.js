const Donation = require('../models/donationModel');
const AppError = require('../utils/AppError');

class DonationService {
  static getAllDonations(query) {
    const { limit, offset, ...filters } = query;
    const allDonations = Donation.getAll(filters);
    
    const total = allDonations.length;
    const paginatedDonations = allDonations.slice(offset, offset + limit);
    
    return {
      donations: paginatedDonations,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  static getDonationById(id) {
    const donation = Donation.getById(id);
    if (!donation) {
      throw new AppError('Пожертвование не найдено', 404);
    }
    return donation;
  }

  static createDonation(data) {
    return Donation.create(data);
  }

  static updateDonation(id, data) {
    const donation = Donation.update(id, data);
    if (!donation) {
      throw new AppError('Пожертвование не найдено', 404);
    }
    return donation;
  }

  static deleteDonation(id) {
    const success = Donation.delete(id);
    if (!success) {
      throw new AppError('Пожертвование не найдено', 404);
    }
  }

  static getDonationStats() {
    return Donation.getStats();
  }
}

module.exports = DonationService;