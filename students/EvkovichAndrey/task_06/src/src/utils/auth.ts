import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {cookies} from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod'

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}

export const signToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export async function getUserId(): Promise<string | null> {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('token')?.value;

  if (!token) {
    return null;
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
    return decode.userId;
  } catch (error) {
    console.error('Invalid or expired token:', error);
    return null;
  }
}