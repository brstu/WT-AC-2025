require('dotenv').config();
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'dev_secret_for_tests';
const express = require('express');
const cors = require('cors');

const app = express();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');

app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

module.exports = app;
