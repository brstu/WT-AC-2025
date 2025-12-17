const { v4: uuidv4 } = require('uuid');
const dataService = require('../services/dataService');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

const getGroups = async (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;
  let groups = Object.values(await dataService.getData('groups'));
  if (q) {
    groups = groups.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()));
  }
  groups = groups.slice(offset, offset + parseInt(limit));
  res.status(200).json({ data: groups });
};

const getGroupById = async (req, res) => {
  const group = await dataService.getDataById('groups', req.params.id);
  if (!group) throw new NotFoundError('Group not found');
  res.status(200).json({ data: group });
};

const createGroup = async (req, res) => {
  const id = uuidv4();
  const group = { id, ...req.body };
  await dataService.addData('groups', id, group);
  res.status(201).json({ data: group, message: 'Group created' });
};

const updateGroup = async (req, res) => {
  const existing = await dataService.getDataById('groups', req.params.id);
  if (!existing) throw new NotFoundError('Group not found');
  const updated = { ...existing, ...req.body };
  await dataService.updateData('groups', req.params.id, updated);
  res.status(200).json({ data: updated, message: 'Group updated' });
};

const deleteGroup = async (req, res) => {
  const existing = await dataService.getDataById('groups', req.params.id);
  if (!existing) throw new NotFoundError('Group not found');
  await dataService.deleteData('groups', req.params.id);
  res.status(204).send();
};

const getGroupTasks = async (req, res) => {
  const group = await dataService.getDataById('groups', req.params.id);
  if (!group) throw new NotFoundError('Group not found');
  const tasks = Object.values(await dataService.getData('tasks')).filter(
    (t) => t.groupId === req.params.id
  );
  res.status(200).json({ data: tasks });
};

module.exports = { getGroups, getGroupById, createGroup, updateGroup, deleteGroup, getGroupTasks };
