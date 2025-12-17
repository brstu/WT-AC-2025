const { v4: uuidv4 } = require('uuid');
const dataService = require('../services/dataService');
const { NotFoundError } = require('../middlewares/errorHandler');

const getTasks = async (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;
  let tasks = Object.values(await dataService.getData('tasks'));
  if (q) {
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
  }
  tasks = tasks.slice(offset, offset + parseInt(limit));
  res.status(200).json({ data: tasks });
};

const getTaskById = async (req, res) => {
  const task = await dataService.getDataById('tasks', req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  res.status(200).json({ data: task });
};

const createTask = async (req, res) => {
  const group = await dataService.getDataById('groups', req.body.groupId);
  if (!group) throw new NotFoundError('Group not found');
  const id = uuidv4();
  const task = { id, done: false, ...req.body };
  await dataService.addData('tasks', id, task);
  res.status(201).json({ data: task, message: 'Task created' });
};

const updateTask = async (req, res) => {
  const existing = await dataService.getDataById('tasks', req.params.id);
  if (!existing) throw new NotFoundError('Task not found');
  if (req.body.groupId) {
    const group = await dataService.getDataById('groups', req.body.groupId);
    if (!group) throw new NotFoundError('Group not found');
  }
  const updated = { ...existing, ...req.body };
  await dataService.updateData('tasks', req.params.id, updated);
  res.status(200).json({ data: updated, message: 'Task updated' });
};

const deleteTask = async (req, res) => {
  const existing = await dataService.getDataById('tasks', req.params.id);
  if (!existing) throw new NotFoundError('Task not found');
  await dataService.deleteData('tasks', req.params.id);
  res.status(204).send();
};

const getTaskGrades = async (req, res) => {
  const task = await dataService.getDataById('tasks', req.params.id);
  if (!task) throw new NotFoundError('Task not found');
  const grades = Object.values(await dataService.getData('grades')).filter(
    (g) => g.taskId === req.params.id
  );
  res.status(200).json({ data: grades });
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getTaskGrades };
