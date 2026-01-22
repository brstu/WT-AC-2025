import { describe, it, expect, vi, beforeEach } from 'vitest'
import { store } from '@/app/store'
import { adsApi } from '@/app/api'

// Мокаем fetch
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('правильно формирует запрос для получения объявлений', async () => {
    const mockResponse = {
      ads: [],
      total: 0,
    }

    // @ts-ignore
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await store.dispatch(
      adsApi.endpoints.getAds.initiate({ page: 1, limit: 10 })
    )

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ads?page=1&limit=10'),
      expect.any(Object)
    )
    expect(result.data).toEqual(mockResponse)
  })

  it('добавляет токен авторизации в заголовки', async () => {
    localStorage.setItem('token', 'test-token-123')

    // @ts-ignore
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    await store.dispatch(
      adsApi.endpoints.getProfile.initiate()
    )

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    )
  })
})
