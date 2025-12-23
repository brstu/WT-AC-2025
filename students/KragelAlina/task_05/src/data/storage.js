const initialData = {
  galleries: [
    {
      id: 'g1',
      name: 'Modern Art Exhibition 2025',
      artType: 'Painting',
      startDate: '2025-02-01T10:00:00Z',
      endDate: '2025-02-15T22:00:00Z',
      likes: 850000,
      maxArts: 24,
      category: 'modern',
      description: 'Международная выставка современного искусства высшего уровня',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'g2',
      name: 'Digital Dreams 2025',
      artType: 'Digital Art',
      startDate: '2025-08-15T12:00:00Z',
      endDate: '2025-08-30T20:00:00Z',
      likes: 1200000,
      maxArts: 40,
      category: 'digital',
      description: 'Крупнейшая выставка цифрового искусства с работами ведущих художников',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    },
    {
      id: 'g3',
      name: 'Abstract Visions Tokyo',
      artType: 'Painting',
      startDate: '2025-06-10T09:00:00Z',
      endDate: '2025-06-25T18:00:00Z',
      likes: 500000,
      maxArts: 30,
      category: 'abstract',
      description: 'Международная выставка абстрактного искусства в Токио',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    }
  ],
  arts: [
    {
      id: 'a1',
      name: 'Starry Night Remix',
      style: 'VNCT',
      origin: 'Netherlands',
      artType: 'Painting',
      createdYear: '2024-05-20',
      imageUrl: 'https://example.com/starry-night-remix.png',
      likes: 5420,
      isFeatured: true,
      description: 'Современная интерпретация знаменитой картины Ван Гога',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'a2',
      name: 'Cyber Landscape',
      style: 'CYBR',
      origin: 'Japan',
      artType: 'Digital Art',
      createdYear: '2024-11-10',
      imageUrl: 'https://example.com/cyber-landscape.png',
      likes: 8900,
      isFeatured: true,
      description: 'Футуристический цифровой пейзаж в неоновых тонах',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    },
    {
      id: 'a3',
      name: 'Guernica Reimagined',
      style: 'PICA',
      origin: 'Spain',
      artType: 'Painting',
      createdYear: '2023-03-15',
      imageUrl: 'https://example.com/guernica-reimagined.png',
      likes: 3200,
      isFeatured: false,
      description: 'Современное переосмысление шедевра Пикассо',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    }
  ]
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(fileData);
    } catch (err) {
      console.warn('Ошибка чтения storage.json, используются начальные данные');
    }
  }
  return JSON.parse(JSON.stringify(initialData));
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Ошибка сохранения данных:', err);
  }
}

let data = loadData();

const getGalleries = () => data.galleries;

const getGalleryById = (id) => data.galleries.find(g => g.id === id);

const createGallery = (gallery) => {
  const now = new Date().toISOString();
  const newGallery = {
    ...gallery,
    id: `g${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  data.galleries.push(newGallery);
  saveData(data);
  return newGallery;
};

const updateGallery = (id, updates) => {
  const index = data.galleries.findIndex(g => g.id === id);
  if (index === -1) return null;
  
  data.galleries[index] = {
    ...data.galleries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveData(data);
  return data.galleries[index];
};

const deleteGallery = (id) => {
  const index = data.galleries.findIndex(g => g.id === id);
  if (index === -1) return false;
  
  data.galleries.splice(index, 1);
  saveData(data);
  return true;
};

const getArts = () => data.arts;

const getArtById = (id) => data.arts.find(a => a.id === id);

const createArt = (art) => {
  const now = new Date().toISOString();
  const newArt = {
    ...art,
    id: `a${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  data.arts.push(newArt);
  saveData(data);
  return newArt;
};

const updateArt = (id, updates) => {
  const index = data.arts.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  data.arts[index] = {
    ...data.arts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveData(data);
  return data.arts[index];
};

const deleteArt = (id) => {
  const index = data.arts.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  data.arts.splice(index, 1);
  saveData(data);
  return true;
};

const resetData = () => {
  data = JSON.parse(JSON.stringify(initialData));
  saveData(data);
};

module.exports = {
  getGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  getArts,
  getArtById,
  createArt,
  updateArt,
  deleteArt,
  resetData
}