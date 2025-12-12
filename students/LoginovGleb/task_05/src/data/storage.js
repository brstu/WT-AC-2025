const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'storage.json');

// Начальные данные
const initialData = {
  tournaments: [
    {
      id: 't1',
      name: 'ESL Pro League Season 20',
      game: 'CS2',
      startDate: '2025-02-01T10:00:00Z',
      endDate: '2025-02-15T22:00:00Z',
      prizePool: 850000,
      maxTeams: 24,
      status: 'upcoming',
      description: 'Международный турнир высшего уровня по Counter-Strike 2',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 't2',
      name: 'The International 2025',
      game: 'Dota 2',
      startDate: '2025-08-15T12:00:00Z',
      endDate: '2025-08-30T20:00:00Z',
      prizePool: 15000000,
      maxTeams: 20,
      status: 'upcoming',
      description: 'Главный турнир года по Dota 2 с крупнейшим призовым фондом',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    },
    {
      id: 't3',
      name: 'VCT Masters Tokyo',
      game: 'Valorant',
      startDate: '2025-06-10T09:00:00Z',
      endDate: '2025-06-25T18:00:00Z',
      prizePool: 500000,
      maxTeams: 12,
      status: 'upcoming',
      description: 'Официальный турнир Valorant Champions Tour',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    }
  ],
  teams: [
    {
      id: 'tm1',
      name: 'Natus Vincere',
      tag: 'NAVI',
      country: 'Ukraine',
      game: 'CS2',
      foundedDate: '2009-12-17',
      logoUrl: 'https://example.com/navi-logo.png',
      rating: 2850,
      isActive: true,
      description: 'Легендарная украинская киберспортивная организация',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'tm2',
      name: 'Team Spirit',
      tag: 'Spirit',
      country: 'Russia',
      game: 'Dota 2',
      foundedDate: '2015-12-20',
      logoUrl: 'https://example.com/spirit-logo.png',
      rating: 2700,
      isActive: true,
      description: 'Чемпионы The International 2021',
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    },
    {
      id: 'tm3',
      name: 'Fnatic',
      tag: 'FNC',
      country: 'United Kingdom',
      game: 'Valorant',
      foundedDate: '2004-07-23',
      logoUrl: 'https://example.com/fnatic-logo.png',
      rating: 2500,
      isActive: true,
      description: 'Одна из старейших киберспортивных организаций мира',
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-03T00:00:00Z'
    },
    {
      id: 'tm4',
      name: 'G2 Esports',
      tag: 'G2',
      country: 'Germany',
      game: 'CS2',
      foundedDate: '2013-11-24',
      logoUrl: 'https://example.com/g2-logo.png',
      rating: 2650,
      isActive: true,
      description: 'Европейская киберспортивная организация с командами во многих дисциплинах',
      createdAt: '2025-01-04T00:00:00Z',
      updatedAt: '2025-01-04T00:00:00Z'
    },
    {
      id: 'tm5',
      name: 'Cloud9',
      tag: 'C9',
      country: 'USA',
      game: 'CS2',
      foundedDate: '2013-05-01',
      logoUrl: 'https://example.com/c9-logo.png',
      rating: 2400,
      isActive: true,
      description: 'Американская киберспортивная организация',
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-05T00:00:00Z'
    }
  ]
};

/**
 * Загрузка данных из файла
 */
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    // Если файла нет, создаем его с начальными данными
    saveData(initialData);
    return initialData;
  } catch {
    return initialData;
  }
};

/**
 * Сохранение данных в файл
 */
const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Загружаем данные при старте
let data = loadData();

/**
 * Получение всех турниров
 */
const getTournaments = () => data.tournaments;

/**
 * Получение турнира по ID
 */
const getTournamentById = (id) => data.tournaments.find(t => t.id === id);

/**
 * Создание турнира
 */
const createTournament = (tournament) => {
  const now = new Date().toISOString();
  const newTournament = {
    ...tournament,
    id: `t${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  data.tournaments.push(newTournament);
  saveData(data);
  return newTournament;
};

/**
 * Обновление турнира
 */
const updateTournament = (id, updates) => {
  const index = data.tournaments.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  data.tournaments[index] = {
    ...data.tournaments[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveData(data);
  return data.tournaments[index];
};

/**
 * Удаление турнира
 */
const deleteTournament = (id) => {
  const index = data.tournaments.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  data.tournaments.splice(index, 1);
  saveData(data);
  return true;
};

/**
 * Получение всех команд
 */
const getTeams = () => data.teams;

/**
 * Получение команды по ID
 */
const getTeamById = (id) => data.teams.find(t => t.id === id);

/**
 * Создание команды
 */
const createTeam = (team) => {
  const now = new Date().toISOString();
  const newTeam = {
    ...team,
    id: `tm${Date.now()}`,
    createdAt: now,
    updatedAt: now
  };
  data.teams.push(newTeam);
  saveData(data);
  return newTeam;
};

/**
 * Обновление команды
 */
const updateTeam = (id, updates) => {
  const index = data.teams.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  data.teams[index] = {
    ...data.teams[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveData(data);
  return data.teams[index];
};

/**
 * Удаление команды
 */
const deleteTeam = (id) => {
  const index = data.teams.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  data.teams.splice(index, 1);
  saveData(data);
  return true;
};

/**
 * Сброс данных к начальному состоянию (для тестов)
 */
const resetData = () => {
  data = JSON.parse(JSON.stringify(initialData));
  saveData(data);
};

module.exports = {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  resetData
};
