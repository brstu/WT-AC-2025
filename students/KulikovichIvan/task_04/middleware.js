module.exports = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        if (!token.startsWith('demo-token-')) {
            return res.status(403).json({ error: 'Неверный токен' });
        }
        
        res.setHeader('x-auth-token', token);
    }
    
    next();
};