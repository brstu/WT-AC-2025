export interface Podcast {
  id: string
  title: string
  description: string
  host: string
  category: string
  duration: number
  releaseDate: string
  episodes: Episode[]
}

export interface Episode {
  id: string
  title: string
  description: string
  duration: number
  publishDate: string
}

export interface CreatePodcastDto {
  title: string
  description: string
  host: string
  category: string
  duration: number
  releaseDate: string
}

export type UpdatePodcastDto = Partial<CreatePodcastDto>