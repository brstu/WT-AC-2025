const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');

let data = {};

const initData = async () => {
  if (!(await fs.pathExists(dataPath))) {
    data = {
      groups: {
        group1: {
          id: 'group1',
          name: 'Math Class',
          description: 'Basic math group',
          students: ['student1', 'student2'],
        },
        group2: {
          id: 'group2',
          name: 'Science Class',
          description: 'Intro to science',
          students: ['student3'],
        },
      },
      tasks: {
        task1: {
          id: 'task1',
          title: 'Homework 1',
          description: 'Solve equations',
          dueDate: '2025-12-20T00:00:00.000Z',
          done: false,
          groupId: 'group1',
        },
        task2: {
          id: 'task2',
          title: 'Lab Report',
          description: 'Write up experiment',
          dueDate: '2025-12-25T00:00:00.000Z',
          done: false,
          groupId: 'group2',
        },
        task3: {
          id: 'task3',
          title: 'Quiz Prep',
          description: 'Review chapters',
          dueDate: '2025-12-15T00:00:00.000Z',
          done: true,
          groupId: 'group1',
        },
      },
      grades: {
        grade1: {
          id: 'grade1',
          studentId: 'student1',
          taskId: 'task1',
          score: 85,
          comment: 'Good work',
          date: '2025-12-10T00:00:00.000Z',
        },
        grade2: {
          id: 'grade2',
          studentId: 'student2',
          taskId: 'task1',
          score: 90,
          comment: 'Excellent',
          date: '2025-12-11T00:00:00.000Z',
        },
        grade3: {
          id: 'grade3',
          studentId: 'student3',
          taskId: 'task2',
          score: 75,
          comment: 'Needs improvement',
          date: '2025-12-12T00:00:00.000Z',
        },
        grade4: {
          id: 'grade4',
          studentId: 'student1',
          taskId: 'task3',
          score: 95,
          comment: 'Outstanding',
          date: '2025-12-13T00:00:00.000Z',
        },
      },
    };
    await fs.writeJson(dataPath, data);
  } else {
    data = await fs.readJson(dataPath);
  }
};

const saveData = async () => {
  await fs.writeJson(dataPath, data);
};

const getData = async (resource) => data[resource] || {};

const getDataById = async (resource, id) => (await getData(resource))[id];

const addData = async (resource, id, item) => {
  if (!data[resource]) data[resource] = {};
  data[resource][id] = item;
  await saveData();
};

const updateData = async (resource, id, item) => {
  if (!data[resource][id]) return;
  data[resource][id] = item;
  await saveData();
};

const deleteData = async (resource, id) => {
  if (!data[resource][id]) return;
  delete data[resource][id];
  await saveData();
};

module.exports = { initData, getData, getDataById, addData, updateData, deleteData };
