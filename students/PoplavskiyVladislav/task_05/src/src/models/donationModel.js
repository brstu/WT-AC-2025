let donations = [];
let currentId = 1;

class Donation {
  constructor(data) {
    this.id = currentId++;
    this.donorName = data.donorName;
    this.amount = data.amount;
    this.currency = data.currency;
    this.projectId = data.projectId;
    this.message = data.message || '';
    this.isAnonymous = data.isAnonymous || false;
    this.donationDate = data.donationDate || new Date().toISOString();
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static getAll(query = {}) {
    let filtered = [...donations];
    const { projectId, minAmount, maxAmount, currency, sortBy, sortOrder } = query;

    // Фильтрация
    if (projectId) {
      filtered = filtered.filter(d => d.projectId === projectId);
    }

    if (currency) {
      filtered = filtered.filter(d => d.currency === currency);
    }

    if (minAmount) {
      filtered = filtered.filter(d => d.amount >= minAmount);
    }

    if (maxAmount) {
      filtered = filtered.filter(d => d.amount <= maxAmount);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'donationDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  static getById(id) {
    return donations.find(d => d.id === id);
  }

  static create(data) {
    const donation = new Donation(data);
    donations.push(donation);
    return donation;
  }

  static update(id, data) {
    const index = donations.findIndex(d => d.id === id);
    if (index === -1) return null;

    const updatedDonation = {
      ...donations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    donations[index] = updatedDonation;
    return updatedDonation;
  }

  static delete(id) {
    const index = donations.findIndex(d => d.id === id);
    if (index === -1) return false;

    donations.splice(index, 1);
    return true;
  }

  static getStats() {
    if (donations.length === 0) {
      return {
        totalDonations: 0,
        totalAmount: 0,
        averageAmount: 0,
        donationsByCurrency: {},
        donationsByProject: {}
      };
    }

    const stats = {
      totalDonations: donations.length,
      totalAmount: 0,
      averageAmount: 0,
      donationsByCurrency: {},
      donationsByProject: {}
    };

    donations.forEach(donation => {
      stats.totalAmount += donation.amount;
      
      stats.donationsByCurrency[donation.currency] = 
        (stats.donationsByCurrency[donation.currency] || 0) + 1;
      
      stats.donationsByProject[donation.projectId] = 
        (stats.donationsByProject[donation.projectId] || 0) + 1;
    });

    stats.averageAmount = stats.totalAmount / stats.totalDonations;

    return stats;
  }
}

// Добавим несколько примеров для начальных данных
donations = [
  new Donation({
    donorName: 'Иван Иванов',
    amount: 5000,
    currency: 'RUB',
    projectId: 'children-help-2024',
    message: 'На лечение детей',
    isAnonymous: false
  }),
  new Donation({
    donorName: 'Аноним',
    amount: 100,
    currency: 'USD',
    projectId: 'animal-shelter',
    message: '',
    isAnonymous: true
  }),
  new Donation({
    donorName: 'Мария Петрова',
    amount: 2500,
    currency: 'RUB',
    projectId: 'children-help-2024',
    message: 'Хочу помочь',
    isAnonymous: false
  })
];

module.exports = Donation;