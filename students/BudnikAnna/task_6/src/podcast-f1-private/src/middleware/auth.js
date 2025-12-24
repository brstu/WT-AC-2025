const { verifyToken } = require('../utils/jwt')
const { prisma } = require('../prisma')

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const [type, token] = header.split(' ')

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized: missing Bearer token' })
    }

    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) return res.status(401).json({ message: 'Unauthorized: user not found' })

    req.user = { id: user.id, email: user.email }
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized: invalid token' })
  }
}

module.exports = { auth }