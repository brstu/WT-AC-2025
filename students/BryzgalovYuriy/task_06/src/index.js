import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// middleware
app.use(cors());
app.use(express.json());

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ===== AUTH ROUTES =====

// signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hash }
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch {
    res.status(400).json({ error: "User already exists" });
  }
});

// login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// ===== POSTS (PROTECTED) =====

// get own posts
app.get("/api/posts", auth, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { ownerId: req.userId }
  });
  res.json(posts);
});

// create post
app.post("/api/posts", auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });

  const post = await prisma.post.create({
    data: {
      title,
      content: content || "",
      ownerId: req.userId
    }
  });
  res.status(201).json(post);
});

// delete post
app.delete("/api/posts/:id", auth, async (req, res) => {
  const id = Number(req.params.id);

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.ownerId !== req.userId)
    return res.status(404).json({ error: "Post not found" });

  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
