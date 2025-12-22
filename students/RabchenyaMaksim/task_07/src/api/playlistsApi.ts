import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_PLAYLISTS,
})

export const getPlaylists = () => api.get('/posts') // Симуляция плейлистов
export const getPlaylist = (id: string) => api.get(`/posts/${id}`)
export const createPlaylist = (data: any) => api.post('/posts', data)
export const updatePlaylist = (id: string, data: any) => api.put(`/posts/${id}`, data)
export const deletePlaylist = (id: string) => api.delete(`/posts/${id}`)