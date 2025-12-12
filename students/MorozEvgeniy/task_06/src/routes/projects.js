import express from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';
import { projectCreateValidator } from '../utils/validators.js';
import { body } from 'express-validator';

const router = express.Router();

router.get('/', authOptional, listProjects);
router.post('/', auth, projectCreateValidator, createProject);
router.get('/:id', authOptional, getProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

export default router;

/**
 * helper: allow route to optionally use auth header.
 * If token present — verify and set req.user, otherwise continue without user.
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function authOptional(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (e) {
    return next();
  }
}
