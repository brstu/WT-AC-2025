const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../utils/errors');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { signupSchema, loginSchema, refreshTokenSchema } = require('../validators/authValidator');

const prisma = new PrismaClient();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       422:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      throw new AppError(error.message, 422);
    }

    const { email, password, name } = value;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      message: 'User registered successfully',
    });
  })
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation error
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.message, 422);
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Delete old refresh tokens for this user (optional: keep last N tokens)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    });
  })
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    // Validate input
    const { error, value } = refreshTokenSchema.validate(req.body);
    if (error) {
      throw new AppError(error.message, 422);
    }

    const { refreshToken } = value;

    // Verify refresh token
    try {
      const decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Invalid refresh token', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if token expired
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new AppError('Refresh token expired', 401);
    }

    // Generate new access token
    const accessToken = generateAccessToken(storedToken.user);

    res.json({
      success: true,
      data: {
        accessToken,
      },
      message: 'Token refreshed successfully',
    });
  })
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (invalidate refresh token)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

module.exports = router;
