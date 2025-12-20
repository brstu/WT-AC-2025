export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export interface Ad {
  id: string
  title: string
  description: string
  price: number
  category: Category
  images: string[]
  location: string
  user: User
  createdAt: string
  updatedAt: string
  views: number
  isActive: boolean
}

export interface CreateAdRequest {
  title: string
  description: string
  price: number
  categoryId: string
  images: File[]
  location: string
}

export interface UpdateAdRequest extends Partial<CreateAdRequest> {
  isActive?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
