const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A record with this value already exists'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Record not found'
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Token is not valid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Token has expired'
    });
  }

  // Validation errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // Custom errors
  if (err.message === 'Invalid credentials') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (err.message === 'Access denied') {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (err.message === 'Product not found') {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (err.message === 'Cart not found') {
    return res.status(404).json({ error: 'Cart not found' });
  }

  if (err.message === 'Order not found') {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (err.message === 'Insufficient stock') {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;