const express = require('express');
const groupsRouter = require('./groups');
const tasksRouter = require('./tasks');
const gradesRouter = require('./grades');

const router = express.Router();

router.use('/groups', groupsRouter);
router.use('/tasks', tasksRouter);
router.use('/grades', gradesRouter);

module.exports = router;
