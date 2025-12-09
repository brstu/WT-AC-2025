const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

const academicGroupsRouter = require('./routes/academicGroups');
const assignmentsRouter = require('./routes/assignments');

console.log('🔧 Routes loaded:', {
  groups: !!academicGroupsRouter,
  assignments: !!assignmentsRouter
});

app.use('/api/groups', academicGroupsRouter);
app.use('/api/assignments', assignmentsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/health', '/api/groups', '/api/assignments']
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🔍 Debug mode activated`);
});