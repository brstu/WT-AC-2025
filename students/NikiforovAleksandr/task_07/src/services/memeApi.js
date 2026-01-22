import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Mock data for development
const mockMemes = [
  {
    id: '1',
    title: 'Programmer Meme',
    imageUrl: 'https://i.imgflip.com/7v5e7s.jpg',
    description: 'When you finally fix a bug after 5 hours of debugging',
    likes: 42,
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['programming', 'funny', 'bug'],
    author: 'DevUser'
  },
  {
    id: '2',
    title: 'Monday Mood',
    imageUrl: 'https://i.imgflip.com/7j7zab.jpg',
    description: 'That Monday feeling...',
    likes: 28,
    createdAt: '2024-01-14T14:20:00Z',
    tags: ['monday', 'work', 'funny'],
    author: 'MemeLover'
  },
  {
    id: '3',
    title: 'React vs Vue',
    imageUrl: 'https://i.imgflip.com/7j7zcd.jpg',
    description: 'The eternal debate continues',
    likes: 35,
    createdAt: '2024-01-13T09:15:00Z',
    tags: ['react', 'vue', 'javascript'],
    author: 'FrontendDev'
  }
]

const getMemeById = (id) => mockMemes.find(meme => meme.id === id)

export const memeApi = {
  // Get all memes
  getMemes: async () => {
    try {
      // For demo, return mock data
      return { data: mockMemes }
      // Real API call:
      // const response = await api.get('/memes')
      // return response.data
    } catch (error) {
      console.error('Error fetching memes:', error)
      throw error
    }
  },

  // Get single meme
  getMeme: async (id) => {
    try {
      const meme = getMemeById(id)
      if (!meme) throw new Error('Meme not found')
      return { data: meme }
      // Real API call:
      // const response = await api.get(`/memes/${id}`)
      // return response.data
    } catch (error) {
      console.error('Error fetching meme:', error)
      throw error
    }
  },

  // Create meme
  createMeme: async (memeData) => {
    try {
      const newMeme = {
        id: String(Date.now()),
        ...memeData,
        likes: 0,
        createdAt: new Date().toISOString(),
        author: 'CurrentUser'
      }
      mockMemes.unshift(newMeme)
      return { data: newMeme }
      // Real API call:
      // const response = await api.post('/memes', memeData)
      // return response.data
    } catch (error) {
      console.error('Error creating meme:', error)
      throw error
    }
  },

  // Update meme
  updateMeme: async (id, memeData) => {
    try {
      const index = mockMemes.findIndex(meme => meme.id === id)
      if (index === -1) throw new Error('Meme not found')
      
      mockMemes[index] = {
        ...mockMemes[index],
        ...memeData,
        updatedAt: new Date().toISOString()
      }
      
      return { data: mockMemes[index] }
      // Real API call:
      // const response = await api.put(`/memes/${id}`, memeData)
      // return response.data
    } catch (error) {
      console.error('Error updating meme:', error)
      throw error
    }
  },

  // Delete meme
  deleteMeme: async (id) => {
    try {
      const index = mockMemes.findIndex(meme => meme.id === id)
      if (index === -1) throw new Error('Meme not found')
      
      mockMemes.splice(index, 1)
      return { data: { success: true } }
      // Real API call:
      // const response = await api.delete(`/memes/${id}`)
      // return response.data
    } catch (error) {
      console.error('Error deleting meme:', error)
      throw error
    }
  },

  // Like meme
  likeMeme: async (id) => {
    try {
      const meme = getMemeById(id)
      if (!meme) throw new Error('Meme not found')
      
      meme.likes += 1
      return { data: meme }
      // Real API call:
      // const response = await api.post(`/memes/${id}/like`)
      // return response.data
    } catch (error) {
      console.error('Error liking meme:', error)
      throw error
    }
  }
}