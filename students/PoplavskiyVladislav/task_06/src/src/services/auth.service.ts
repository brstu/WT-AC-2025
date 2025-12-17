import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { RegisterData, LoginCredentials, UserResponse } from '../models/User';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async register(data: RegisterData): Promise<UserResponse> {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new AppError(
        existingUser.email === data.email
          ? 'Email уже используется'
          : 'Имя пользователя уже используется',
        400
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(credentials: LoginCredentials): Promise<{ token: string; user: UserResponse }> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new AppError('Неверный email или пароль', 401);
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      throw new AppError('Неверный email или пароль', 401);
    }

    // Явно указываем типы для JWT
    const jwtSecret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.JWT_EXPIRES_IN as string;

    if (!jwtSecret) {
      throw new AppError('JWT секрет не настроен', 500);
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn } as SignOptions
    );

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { token, user: userResponse };
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }
}