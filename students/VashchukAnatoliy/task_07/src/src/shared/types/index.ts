/* =======================
   Movie domain
======================= */
export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  rating: number;
  posterUrl: string;
  createdAt: string;
  updatedAt: string;
}

/* =======================
   User & Auth
======================= */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAuthenticated: boolean;
}

/* =======================
   API helpers
======================= */
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

/* =======================
   App UI state
======================= */
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
