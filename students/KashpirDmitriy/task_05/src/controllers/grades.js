const { v4: uuidv4 } = require('uuid');
const dataService = require('../services/dataService');
const { NotFoundError } = require('../middlewares/errorHandler');

const getGrades = async (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;
  let grades = Object.values(await dataService.getData('grades'));
  if (q) {
    grades = grades.filter((g) => g.studentId.toLowerCase().includes(q.toLowerCase()));
  }
  grades = grades.slice(offset, offset + parseInt(limit));
  res.status(200).json({ data: grades });
};

const getGradeById = async (req, res) => {
  const grade = await dataService.getDataById('grades', req.params.id);
  if (!grade) throw new NotFoundError('Grade not found');
  res.status(200).json({ data: grade });
};

const createGrade = async (req, res) => {
  const task = await dataService.getDataById('tasks', req.body.taskId);
  if (!task) throw new NotFoundError('Task not found');
  const id = uuidv4();
  const grade = { id, date: new Date().toISOString(), ...req.body };
  await dataService.addData('grades', id, grade);
  res.status(201).json({ data: grade, message: 'Grade created' });
};

const updateGrade = async (req, res) => {
  const existing = await dataService.getDataById('grades', req.params.id);
  if (!existing) throw new NotFoundError('Grade not found');
  if (req.body.taskId) {
    const task = await dataService.getDataById('tasks', req.body.taskId);
    if (!task) throw new NotFoundError('Task not found');
  }
  const updated = { ...existing, ...req.body };
  await dataService.updateData('grades', req.params.id, updated);
  res.status(200).json({ data: updated, message: 'Grade updated' });
};

const deleteGrade = async (req, res) => {
  const existing = await dataService.getDataById('grades', req.params.id);
  if (!existing) throw new NotFoundError('Grade not found');
  await dataService.deleteData('grades', req.params.id);
  res.status(204).send();
};

module.exports = { getGrades, getGradeById, createGrade, updateGrade, deleteGrade };
