export interface Book {
  id: string
  title: string
  author: string
  description: string
  publishedYear: number
  genre: string
  coverImageUrl?: string
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface BookFormData {
  title: string
  author: string
  description: string
  publishedYear: number
  genre: string
  coverImageUrl?: string
}