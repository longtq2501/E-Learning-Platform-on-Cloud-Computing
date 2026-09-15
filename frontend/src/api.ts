import axios from 'axios'
import type { ApiEnvelope, AuthData, Book, Category, FeedbackRequest, Video } from './types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cloud-campus-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login: (email: string, password: string) => api.post<ApiEnvelope<AuthData>>('/auth/login', { email, password }),
  register: (fullName: string, email: string, password: string) => api.post<ApiEnvelope<AuthData>>('/auth/register', { fullName, email, password }),
}

export const catalogApi = {
  categories: () => api.get<ApiEnvelope<Category[]>>('/categories'),
  books: (categoryId?: number, query?: string) => query ? api.get<ApiEnvelope<Book[]>>('/books/search', { params: { q: query } }) : api.get<ApiEnvelope<Book[]>>('/books', { params: categoryId ? { categoryId } : {} }),
  book: (id: number) => api.get<ApiEnvelope<Book>>(`/books/${id}`),
  videos: (categoryId?: number, query?: string) => query ? api.get<ApiEnvelope<Video[]>>('/videos/search', { params: { q: query } }) : api.get<ApiEnvelope<Video[]>>('/videos', { params: categoryId ? { categoryId } : {} }),
  video: (id: number) => api.get<ApiEnvelope<Video>>(`/videos/${id}`),
  bookDownloadUrl: (id: number) => api.get<ApiEnvelope<{ downloadUrl: string }>>(`/books/${id}/download-url`),
  bookDownloaded: (id: number) => api.post(`/books/${id}/download`),
  videoStreamUrl: (id: number) => api.get<ApiEnvelope<{ streamingUrl: string }>>(`/videos/${id}/stream-url`),
  videoViewed: (id: number) => api.post(`/videos/${id}/view`),
  feedback: (payload: FeedbackRequest) => api.post('/feedbacks', payload),
}