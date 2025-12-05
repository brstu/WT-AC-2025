export interface Channel {
  id: string;
  name: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  channelId: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  theme: Theme;
  isLoading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}