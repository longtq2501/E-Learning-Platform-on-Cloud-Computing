import { describe, expect, it, vi } from 'vitest'
import { api, authApi, catalogApi } from './api'
import { feedbackApi } from './services/api'

describe('catalog API', () => {
  it('uses the backend search contract for books and videos', () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { data: [] } } as never)
    catalogApi.books(undefined, 'cloud')
    catalogApi.videos(undefined, 'cloud')
    expect(get).toHaveBeenNthCalledWith(1, '/books/search', { params: { q: 'cloud' } })
    expect(get).toHaveBeenNthCalledWith(2, '/videos/search', { params: { q: 'cloud' } })
    get.mockRestore()
  })
})

describe('auth API', () => {
  it('uses the backend auth request contract', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { data: { accessToken: 'token' } } } as never)

    await authApi.login('admin@example.com', 'secret123')

    expect(post).toHaveBeenCalledWith('/auth/login', { email: 'admin@example.com', password: 'secret123' })
    post.mockRestore()
  })
})

describe('admin feedback API', () => {
  it('unwraps a Spring Page response into a feedback list', async () => {
    const get = vi.spyOn((await import('./services/api')).default, 'get').mockResolvedValue({
      data: { data: { content: [{ id: 1 }] } },
    } as never)

    await expect(feedbackApi.getAll()).resolves.toEqual([{ id: 1 }])
    expect(get).toHaveBeenCalledWith('/feedbacks/admin')
    get.mockRestore()
  })
})