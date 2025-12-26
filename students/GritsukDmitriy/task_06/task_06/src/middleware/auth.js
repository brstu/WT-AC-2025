const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Неверный или истекший токен' });
  }

  req.user = payload;
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};