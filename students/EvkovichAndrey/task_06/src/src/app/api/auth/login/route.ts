import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { comparePassword, signToken } from '@/utils/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await comparePassword(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken(user.id)

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  })

  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}