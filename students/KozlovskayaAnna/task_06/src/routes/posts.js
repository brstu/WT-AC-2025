const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const posts = await prisma.post.findMany({ include: { owner: { select: { id: true, email: true } } } });
  res.json(posts);
});

router.get('/mine', auth, async (req, res) => {
  const posts = await prisma.post.findMany({ where: { ownerId: req.user.id } });
  res.json(posts);
});

router.post('/', auth, async (req, res) => {
  const { title, content, published } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  const post = await prisma.post.create({ data: { title, content, published: !!published, ownerId: req.user.id } });
  res.status(201).json(post);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id }, include: { owner: { select: { id: true, email: true } } } });
  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json(post);
});

router.put('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.ownerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.post.update({ where: { id }, data: req.body });
  res.json(updated);
});

router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ message: 'Not found' });
  if (post.ownerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await prisma.post.delete({ where: { id } });
  res.json({ deleted: true });
});

module.exports = router;
