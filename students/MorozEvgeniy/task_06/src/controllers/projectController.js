import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
const prisma = new PrismaClient();

export async function createProject(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, isPublic } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        isPublic: !!isPublic,
        ownerId: req.user.userId
      }
    });
    return res.status(201).json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function listProjects(req, res) {
  try {
    const allPublic = await prisma.project.findMany({
      where: { isPublic: true },
      include: { owner: { select: { id: true, email: true } } }
    });

    let ownPrivate = [];
    if (req.user) {
      ownPrivate = await prisma.project.findMany({
        where: { ownerId: req.user.userId, isPublic: false },
        include: { owner: { select: { id: true, email: true } } }
      });
    }

    const map = new Map();
    for (const p of allPublic.concat(ownPrivate)) map.set(p.id, p);
    return res.json(Array.from(map.values()));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getProject(req, res) {
  const id = Number(req.params.id);
  try {
    const p = await prisma.project.findUnique({
      where: { id },
      include: { owner: { select: { id: true, email: true } } }
    });
    if (!p) return res.status(404).json({ message: 'Not found' });

    if (p.isPublic) return res.json(p);

    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (p.ownerId === req.user.userId || req.user.role === 'admin') return res.json(p);
    return res.status(403).json({ message: 'Forbidden' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProject(req, res) {
  const id = Number(req.params.id);
  try {
    const p = await prisma.project.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ message: 'Not found' });

    if (p.ownerId !== req.user.userId && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    const { title, description, isPublic } = req.body;
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: title ?? p.title,
        description: description ?? p.description,
        isPublic: isPublic === undefined ? p.isPublic : !!isPublic
      }
    });
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteProject(req, res) {
  const id = Number(req.params.id);
  try {
    const p = await prisma.project.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ message: 'Not found' });

    if (p.ownerId !== req.user.userId && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    await prisma.project.delete({ where: { id } });
    return res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
