const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const database = require('./database');
const routes = require('./routes');
const { errorHandler, limiter } = require('./middlewares');

const app = express();

const PORT = 3000;

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(limiter);

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

process.on('SIGINT', async () => {
  await database.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await database.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Database: SQLite (src/database.db)');
  console.log('📖 API Documentation:');
  console.log('  POST   /api/auth/signup');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/auth/refresh');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/reviews');
  console.log('  GET    /api/reviews');
  console.log('  GET    /api/reviews/:id');
  console.log('  PUT    /api/reviews/:id');
  console.log('  DELETE /api/reviews/:id');
  console.log('  PATCH  /api/reviews/:id/moderate (admin only)');
  console.log('  GET    /api/admin/stats (admin only)');
});