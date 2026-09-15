import { describe, expect, it, vi } from 'vitest'
import { api, catalogApi } from './api'

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