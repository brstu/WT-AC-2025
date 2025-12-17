const { z } = require('zod');

// Auth schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'admin']).optional().default('customer')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Product schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0)
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional()
});

// Cart schemas
const cartItemSchema = z.object({
  productId: z.number().int().positive('Product ID must be positive'),
  quantity: z.number().int().positive('Quantity must be at least 1')
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(422).json({
      error: 'Validation failed',
      details: error.errors,
    });
  }
};

module.exports = { 
  validate, 
  signupSchema, 
  loginSchema, 
  createProductSchema, 
  updateProductSchema, 
  cartItemSchema 
};