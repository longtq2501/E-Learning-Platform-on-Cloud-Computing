export type Role = 'ADMIN' | 'STUDENT'
export type ContentType = 'BOOK' | 'VIDEO'

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
}

export interface AuthData {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface Category {
  id: number
  name: string
  semester?: string
  major?: string
  description?: string
}

export interface Book {
  id: number
  title: string
  author?: string
  categoryId: number
  categoryName?: string
  description?: string
  fileSize?: number
  contentType?: string
  viewCount: number
  downloadCount: number
}

export interface Video {
  id: number
  title: string
  categoryId: number
  categoryName?: string
  description?: string
  durationSeconds?: number
  fileSize?: number
  contentType?: string
  viewCount: number
}

export interface FeedbackRequest {
  targetType: ContentType
  targetId: number
  rating: number
  content: string
}