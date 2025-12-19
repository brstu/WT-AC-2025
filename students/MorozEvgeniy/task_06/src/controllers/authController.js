import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
dotenv.config();

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

export async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already used' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash }
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

    return res.json({ accessToken: token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
