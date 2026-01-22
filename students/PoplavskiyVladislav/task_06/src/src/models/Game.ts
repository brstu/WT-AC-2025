export interface Game {
  id: string;
  title: string;
  description: string | null;
  genre: string;
  platform: string;
  releaseYear: number;
  rating: number | null;
  imageUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGameDto {
  title: string;
  description?: string | null;
  genre: string;
  platform: string;
  releaseYear: number;
  rating?: number | null;
  imageUrl?: string | null;
}

export interface UpdateGameDto {
  title?: string;
  description?: string | null;
  genre?: string;
  platform?: string;
  releaseYear?: number;
  rating?: number | null;
  imageUrl?: string | null;
}

export interface GameQuery {
  genre?: string;
  platform?: string;
  minRating?: number;
  maxRating?: number;
  minYear?: number;
  maxYear?: number;
  search?: string;
}

// Вспомогательный тип для ответа API (без null значений)
export interface GameResponse {
  id: string;
  title: string;
  description?: string;
  genre: string;
  platform: string;
  releaseYear: number;
  rating?: number;
  imageUrl?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}