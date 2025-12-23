const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');

let data = {};

const initData = async () => {
  if (!(await fs.pathExists(dataPath))) {
    data = {
      museums: {
        museum1: {
          id: 'museum1',
          name: 'The Metropolitan Museum of Art',
          description: 'World-class art museum with a vast collection',
          location: 'New York, USA',
          hours: '10 AM - 5 PM',
          website: 'https://www.metmuseum.org',
        },
        museum2: {
          id: 'museum2',
          name: 'Louvre Museum',
          description: 'The most visited art museum in the world',
          location: 'Paris, France',
          hours: '9 AM - 6 PM',
          website: 'https://www.louvre.fr',
        },
        museum3: {
          id: 'museum3',
          name: 'British Museum',
          description: 'A museum of human history and culture',
          location: 'London, UK',
          hours: '10 AM - 5:30 PM',
          website: 'https://www.britishmuseum.org',
        },
      },
      reviews: {
        review1: {
          id: 'review1',
          museumId: 'museum1',
          rating: 5,
          text: 'Amazing collection of art from around the world!',
          author: 'John Doe',
          createdAt: '2025-12-10T00:00:00.000Z',
        },
        review2: {
          id: 'review2',
          museumId: 'museum1',
          rating: 4,
          text: 'Great experience, but can be crowded',
          author: 'Jane Smith',
          createdAt: '2025-12-11T00:00:00.000Z',
        },
        review3: {
          id: 'review3',
          museumId: 'museum2',
          rating: 5,
          text: 'Incredible masterpieces including the Mona Lisa',
          author: 'Bob Johnson',
          createdAt: '2025-12-12T00:00:00.000Z',
        },
        review4: {
          id: 'review4',
          museumId: 'museum3',
          rating: 4,
          text: 'Well organized with lots of history to explore',
          author: 'Alice Williams',
          createdAt: '2025-12-13T00:00:00.000Z',
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
