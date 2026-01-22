const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash: hash, role: role || 'user' } });
    res.json({ id: user.id, email: user.email });
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ message: 'Email already exists' });
    console.error(e);
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ accessToken: token });
});

module.exports = router;
