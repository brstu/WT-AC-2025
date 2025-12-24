require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const { authRouter } = require('./routes/auth.routes')
const { podcastRouter } = require('./routes/podcast.routes')
const { episodeRouter } = require('./routes/episode.routes')
const { publicRouter } = require('./routes/public.routes')

const { auth } = require('./middleware/auth')
const { notFound, errorHandler } = require('./middleware/error')

const app = express()

app.use(helmet())

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: false
}))

app.use(express.json({ limit: process.env.BODY_LIMIT || '64kb' }))

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000)
const max = Number(process.env.RATE_LIMIT_MAX || 30)
const authLimiter = rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false })

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/api/public', publicRouter)

app.use('/api/auth', authLimiter, authRouter)

app.use('/api/podcasts', auth, podcastRouter)
app.use('/api/episodes', auth, episodeRouter)

app.use(notFound)
app.use(errorHandler)

module.exports = { app }