const API_URL = import.meta.env.VITE_API_URL
import { mockGames } from './mockData'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let nextId = Math.max(...mockGames.map(game => game.id)) + 1

export const gamesAPI = {
  async getAllGames() {
    await delay(500)
    return [...mockGames]
  },

  async getGameById(id) {
    await delay(300)
    const game = mockGames.find(game => game.id === parseInt(id))
    if (!game) throw new Error('Игра не найдена')
    return { ...game }
  },

  async createGame(gameData) {
    await delay(400)
    const newGame = {
      id: nextId++,
      ...gameData,
      createdAt: new Date().toISOString()
    }
    mockGames.push(newGame)
    return { ...newGame }
  },

  async updateGame(id, gameData) {
    await delay(400)
    const index = mockGames.findIndex(game => game.id === parseInt(id))
    if (index === -1) throw new Error('Игра не найдена')
    
    mockGames[index] = { ...mockGames[index], ...gameData }
    return { ...mockGames[index] }
  },

  async deleteGame(id) {
    await delay(300)
    const index = mockGames.findIndex(game => game.id === parseInt(id))
    if (index === -1) throw new Error('Игра не найдена')
    
    mockGames.splice(index, 1)
    return { success: true }
  },
}