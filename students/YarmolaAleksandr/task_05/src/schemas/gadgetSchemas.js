const { z } = require('zod');

// Valid gadget categories
const GADGET_CATEGORIES = [
  'smartphone',
  'laptop', 
  'tablet',
  'smartwatch',
  'headphones',
  'camera',
  'gaming',
  'other'
];

// Create Gadget Schema
const createGadgetSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string'
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

    brand: z.string({
      required_error: 'Brand is required',
      invalid_type_error: 'Brand must be a string'
    })
    .min(1, 'Brand cannot be empty')
    .max(50, 'Brand must be less than 50 characters')
    .trim(),

    category: z.enum(GADGET_CATEGORIES, {
      required_error: 'Category is required',
      invalid_type_error: `Category must be one of: ${GADGET_CATEGORIES.join(', ')}`
    }),

    price: z.number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number'
    })
    .positive('Price must be greater than 0')
    .max(99999.99, 'Price must be less than $100,000'),

    rating: z.number({
      invalid_type_error: 'Rating must be a number'
    })
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),

    description: z.string({
      invalid_type_error: 'Description must be a string'
    })
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),

    releaseDate: z.string({
      invalid_type_error: 'Release date must be a string'
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Release date must be in YYYY-MM-DD format')
    .optional(),

    inStock: z.boolean({
      invalid_type_error: 'InStock must be a boolean'
    })
    .optional()
    .default(true)
  })
});

// Update Gadget Schema (all fields optional except validation rules still apply)
const updateGadgetSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'Name must be a string'
    })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),

    brand: z.string({
      invalid_type_error: 'Brand must be a string'
    })
    .min(1, 'Brand cannot be empty')
    .max(50, 'Brand must be less than 50 characters')
    .trim()
    .optional(),

    category: z.enum(GADGET_CATEGORIES, {
      invalid_type_error: `Category must be one of: ${GADGET_CATEGORIES.join(', ')}`
    }).optional(),

    price: z.number({
      invalid_type_error: 'Price must be a number'
    })
    .positive('Price must be greater than 0')
    .max(99999.99, 'Price must be less than $100,000')
    .optional(),

    rating: z.number({
      invalid_type_error: 'Rating must be a number'
    })
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),

    description: z.string({
      invalid_type_error: 'Description must be a string'
    })
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),

    releaseDate: z.string({
      invalid_type_error: 'Release date must be a string'
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Release date must be in YYYY-MM-DD format')
    .optional(),

    inStock: z.boolean({
      invalid_type_error: 'InStock must be a boolean'
    })
    .optional()
  })
});

// Query Parameters Schema
const queryParamsSchema = z.object({
  query: z.object({
    // Search
    q: z.string().optional(),
    
    // Filters
    category: z.enum([...GADGET_CATEGORIES, 'all']).optional(),
    brand: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    minRating: z.string().regex(/^[1-5](\.\d)?$/).optional(),
    inStock: z.enum(['true', 'false']).optional(),
    
    // Sorting
    sortBy: z.enum(['name', 'brand', 'category', 'price', 'rating', 'releaseDate', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    
    // Pagination
    limit: z.string().regex(/^\d+$/).optional(),
    offset: z.string().regex(/^\d+$/).optional(),
    page: z.string().regex(/^\d+$/).optional()
  })
});

// ID Parameter Schema
const idParamSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'ID is required',
      invalid_type_error: 'ID must be a string'
    })
    .uuid('ID must be a valid UUID')
  })
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      // Convert Zod error to our custom format
      const details = error.errors.map(err => ({
        field: err.path.slice(1).join('.'), // Remove the first 'body'/'query'/'params' 
        message: err.message,
        code: err.code,
        received: err.received
      }));

      return res.status(422).json({
        success: false,
        error: 'Validation Error',
        details
      });
    }
  };
};

module.exports = {
  createGadgetSchema,
  updateGadgetSchema,
  queryParamsSchema,
  idParamSchema,
  validate,
  GADGET_CATEGORIES
};