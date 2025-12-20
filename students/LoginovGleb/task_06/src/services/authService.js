const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../middleware/errors');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Генерация access токена
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

/**
 * Генерация refresh токена
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Регистрация нового пользователя
 */
const signup = async (data) => {
  const { email, password, firstName, lastName } = data;

  // Проверяем, существует ли уже пользователь с таким email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Пользователь с таким email уже существует');
  }

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

  // Создаем пользователя
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'USER',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Генерируем токены
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Сохраняем refresh токен в БД
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/**
 * Вход пользователя
 */
const login = async (data) => {
  const { email, password } = data;

  // Находим пользователя
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  // Проверяем активность аккаунта
  if (!user.isActive) {
    throw new UnauthorizedError('Аккаунт деактивирован');
  }

  // Проверяем пароль
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  // Генерируем токены
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Сохраняем refresh токен в БД
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Обновление access токена с помощью refresh токена
 */
const refreshAccessToken = async (refreshToken) => {
  // Верифицируем refresh токен
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Недействительный refresh токен');
  }

  // Проверяем существование токена в БД
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new UnauthorizedError('Refresh токен не найден');
  }

  // Проверяем срок действия токена
  if (new Date() > tokenRecord.expiresAt) {
    // Удаляем просроченный токен
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
    throw new UnauthorizedError('Refresh токен истек');
  }

  // Проверяем активность пользователя
  if (!tokenRecord.user.isActive) {
    throw new UnauthorizedError('Аккаунт деактивирован');
  }

  // Генерируем новый access токен
  const accessToken = generateAccessToken(tokenRecord.userId);

  return {
    accessToken,
  };
};

/**
 * Logout - удаление refresh токена
 */
const logout = async (refreshToken) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

/**
 * Запрос сброса пароля
 */
const forgotPassword = async (email) => {
  // Проверяем существование пользователя
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Не раскрываем информацию о том, существует ли пользователь
    return {
      message: 'Если пользователь с таким email существует, ему будет отправлено письмо',
    };
  }

  // Генерируем токен сброса пароля
  const resetToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Токен действителен 1 час

  // Сохраняем токен в БД
  await prisma.passwordResetToken.create({
    data: {
      email,
      token: resetToken,
      expiresAt,
    },
  });

  // В реальном приложении здесь бы отправлялось письмо
  // Для демонстрации показываем токен только в development режиме
  if (process.env.NODE_ENV === 'development') {
    console.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║  EMAIL ЗАГЛУШКА - Сброс пароля                            ║
    ╠════════════════════════════════════════════════════════════╣
    ║  Кому: ${email.padEnd(48)}║
    ║  Тема: Сброс пароля                                       ║
    ║                                                            ║
    ║  Ваш токен для сброса пароля:                             ║
    ║  ${resetToken.padEnd(56)}║
    ║                                                            ║
    ║  Используйте этот токен для сброса пароля.                ║
    ║  Токен действителен в течение 1 часа.                     ║
    ╚════════════════════════════════════════════════════════════╝
    `);
  } else {
    // В production логируем только факт отправки, без чувствительной информации
    console.log(`Password reset token generated for user (email hidden for security)`);
  }

  return {
    message: 'Если пользователь с таким email существует, ему будет отправлено письмо',
    // В development режиме показываем токен для тестирования
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  };
};

/**
 * Сброс пароля
 */
const resetPassword = async (token, newPassword) => {
  // Находим токен в БД
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    throw new NotFoundError('Токен не найден или уже был использован');
  }

  // Проверяем, не был ли токен уже использован
  if (resetToken.used) {
    throw new UnauthorizedError('Токен уже был использован');
  }

  // Проверяем срок действия токена
  if (new Date() > resetToken.expiresAt) {
    throw new UnauthorizedError('Токен истек');
  }

  // Находим пользователя
  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  // Хешируем новый пароль
  const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

  // Обновляем пароль пользователя
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Помечаем токен как использованный
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  // Удаляем все refresh токены пользователя (принудительный logout)
  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  return {
    message: 'Пароль успешно изменен',
  };
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
