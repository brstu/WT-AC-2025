const express = require('express')
const bcrypt = require('bcryptjs')
const { prisma } = require('../prisma')
const { signToken } = require('../utils/jwt')
const { signupSchema, loginSchema } = require('../validators/auth')

const router = express.Router()

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })

  const { email, password } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ message: 'Email already in use' })

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true }
  })

  const token = signToken({ userId: user.id })
  res.status(201).json({ token, user })
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const token = signToken({ userId: user.id })
  res.json({ token, user: { id: user.id, email: user.email } })
})

module.exports = { authRouter: router }