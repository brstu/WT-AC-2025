const { verifyToken } = require('../utils/crypto');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Токен доступа не предоставлен',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Срок действия токена истек',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      message: 'Невалидный токен доступа',
      code: 'INVALID_TOKEN'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Недостаточно прав. Требуется роль администратора',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

module.exports = { auth, admin };