const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError } = require('../utils/errors');

class GadgetModel {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/gadgets.json');
    this.initializeData();
  }

  async initializeData() {
    try {
      await fs.access(this.dataFile);
    } catch (error) {
      // File doesn't exist, create with initial data
      const initialData = [
        {
          id: uuidv4(),
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          category: 'smartphone',
          price: 999.99,
          rating: 4.8,
          description: 'Latest flagship smartphone from Apple with titanium design and advanced A17 Pro chip.',
          releaseDate: '2023-09-22',
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'MacBook Pro M3',
          brand: 'Apple',
          category: 'laptop',
          price: 1599.99,
          rating: 4.9,
          description: 'Powerful laptop with M3 chip, perfect for professional work and creative tasks.',
          releaseDate: '2023-10-30',
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Sony WH-1000XM5',
          brand: 'Sony',
          category: 'headphones',
          price: 399.99,
          rating: 4.7,
          description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
          releaseDate: '2022-05-12',
          inStock: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'Samsung Galaxy S24 Ultra',
          brand: 'Samsung',
          category: 'smartphone',
          price: 1199.99,
          rating: 4.6,
          description: 'Premium Android flagship with S Pen and advanced camera system.',
          releaseDate: '2024-01-17',
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          name: 'iPad Pro 12.9-inch',
          brand: 'Apple',
          category: 'tablet',
          price: 1099.99,
          rating: 4.8,
          description: 'Professional tablet with M2 chip, perfect for creative professionals.',
          releaseDate: '2022-10-18',
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await this.saveData(initialData);
    }
  }

  async loadData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  async saveData(data) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  async findAll(filters = {}) {
    const data = await this.loadData();
    let result = [...data];

    // Search functionality
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase();
      result = result.filter(gadget => 
        gadget.name.toLowerCase().includes(searchTerm) ||
        gadget.brand.toLowerCase().includes(searchTerm) ||
        gadget.description.toLowerCase().includes(searchTerm) ||
        gadget.category.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter(gadget => gadget.category === filters.category);
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter(gadget => 
        gadget.brand.toLowerCase() === filters.brand.toLowerCase()
      );
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      result = result.filter(gadget => gadget.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(gadget => gadget.price <= parseFloat(filters.maxPrice));
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      result = result.filter(gadget => gadget.rating >= parseFloat(filters.minRating));
    }

    // In stock filter
    if (filters.inStock !== undefined) {
      const stockFilter = filters.inStock === 'true' || filters.inStock === true;
      result = result.filter(gadget => gadget.inStock === stockFilter);
    }

    // Sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy;
      const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
      
      result.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * sortOrder;
        if (a[sortField] > b[sortField]) return 1 * sortOrder;
        return 0;
      });
    }

    // Pagination
    const limit = parseInt(filters.limit) || 10;
    const offset = parseInt(filters.offset) || 0;
    const total = result.length;
    
    const paginatedResult = result.slice(offset, offset + limit);

    return {
      data: paginatedResult,
      meta: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    const data = await this.loadData();
    const gadget = data.find(item => item.id === id);
    
    if (!gadget) {
      throw new NotFoundError('Gadget');
    }
    
    return gadget;
  }

  async create(gadgetData) {
    const data = await this.loadData();
    
    const newGadget = {
      id: uuidv4(),
      ...gadgetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.push(newGadget);
    await this.saveData(data);
    
    return newGadget;
  }

  async update(id, updates) {
    const data = await this.loadData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new NotFoundError('Gadget');
    }
    
    data[index] = {
      ...data[index],
      ...updates,
      id, // Preserve ID
      createdAt: data[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    await this.saveData(data);
    return data[index];
  }

  async delete(id) {
    const data = await this.loadData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new NotFoundError('Gadget');
    }
    
    const deletedGadget = data.splice(index, 1)[0];
    await this.saveData(data);
    
    return deletedGadget;
  }

  async getStats() {
    const data = await this.loadData();
    
    const stats = {
      total: data.length,
      inStock: data.filter(g => g.inStock).length,
      outOfStock: data.filter(g => !g.inStock).length,
      categories: {},
      brands: {},
      averagePrice: 0,
      averageRating: 0
    };

    // Calculate category distribution
    data.forEach(gadget => {
      stats.categories[gadget.category] = (stats.categories[gadget.category] || 0) + 1;
      stats.brands[gadget.brand] = (stats.brands[gadget.brand] || 0) + 1;
    });

    // Calculate averages
    if (data.length > 0) {
      stats.averagePrice = data.reduce((sum, g) => sum + g.price, 0) / data.length;
      const ratedGadgets = data.filter(g => g.rating !== undefined);
      if (ratedGadgets.length > 0) {
        stats.averageRating = ratedGadgets.reduce((sum, g) => sum + g.rating, 0) / ratedGadgets.length;
      }
    }

    return stats;
  }
}

module.exports = new GadgetModel();