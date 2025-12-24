const { z } = require('zod')

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

module.exports = { signupSchema, loginSchema }