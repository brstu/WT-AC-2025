import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_PODCASTS,
})

export const searchPodcasts = (term = 'podcast') =>
  api.get('/search', { params: { term, media: 'podcast', limit: 20 } })

export const getPodcastDetail = (id: string) =>
  api.get('/lookup', { params: { id, entity: 'podcast' } })