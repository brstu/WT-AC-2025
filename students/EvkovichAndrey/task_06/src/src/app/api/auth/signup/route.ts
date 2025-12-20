import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { hashPassword, signToken } from '@/utils/auth'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'User exists' }, { status: 400 })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, password: passwordHash, name },
  })

  const token = signToken(user.id)

  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}