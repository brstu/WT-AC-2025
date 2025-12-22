const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = require('./database');
const { authenticate, requireRole, validateBody } = require('./middlewares');
const { 
  signupSchema, 
  loginSchema, 
  reviewSchema, 
  updateReviewSchema, 
  moderationSchema,
  querySchema 
} = require('./validators');

const JWT_SECRET = 'your_super_secret_jwt_key_for_development';
const JWT_REFRESH_SECRET = 'your_super_secret_refresh_key_for_development';
const BCRYPT_SALT_ROUNDS = 12;

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

router.post('/auth/signup', validateBody(signupSchema), async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER'
      },
      select: { id: true, email: true, username: true, role: true, createdAt: true }
    });
    
    const tokens = generateTokens(user);
    
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    res.status(201).json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, role: true, password: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    delete user.password;
    
    const tokens = generateTokens(user);
    
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    res.json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
    
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: tokenRecord.user.email, role: tokenRecord.user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
});

router.get('/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

router.post('/reviews', authenticate, validateBody(reviewSchema), async (req, res, next) => {
  try {
    const review = await prisma.review.create({
      data: {
        ...req.body,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });
    
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

router.get('/reviews', authenticate, async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const isAdmin = req.user.role === 'ADMIN';
    
    const where = {
      OR: []
    };
    
    where.OR.push({ userId: req.user.id });
    
    if (!isAdmin) {
      where.OR.push({ status: 'APPROVED' });
    }
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.search) {
      where.OR = [
        { placeName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    if (query.userOnly) {
      where.userId = req.user.id;
    }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: query.offset,
        take: query.limit
      }),
      prisma.review.count({ where })
    ]);
    
    res.json({
      reviews,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const canAccess = (
      review.userId === req.user.id || 
      review.status === 'APPROVED' || 
      req.user.role === 'ADMIN'
    );
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(review);
  } catch (error) {
    next(error);
  }
});

router.put('/reviews/:id', authenticate, validateBody(updateReviewSchema), async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const canEdit = (review.userId === req.user.id || req.user.role === 'ADMIN');
    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (review.status === 'APPROVED' && req.user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Cannot edit approved review' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        status: req.user.role === 'ADMIN' ? req.body.status || review.status : 'PENDING'
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });
    
    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
});

router.delete('/reviews/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const canDelete = (review.userId === req.user.id || req.user.role === 'ADMIN');
    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await prisma.review.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.patch('/reviews/:id/moderate', 
  authenticate, 
  requireRole('ADMIN'), 
  validateBody(moderationSchema), 
  async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        rejectionReason: req.body.rejectionReason
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });
    
    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
});

router.get('/admin/stats', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [totalReviews, pendingReviews, approvedReviews, rejectedReviews, totalUsers] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'APPROVED' } }),
      prisma.review.count({ where: { status: 'REJECTED' } }),
      prisma.user.count()
    ]);
    
    res.json({
      reviews: { 
        total: totalReviews, 
        pending: pendingReviews, 
        approved: approvedReviews, 
        rejected: rejectedReviews 
      },
      users: totalUsers
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;