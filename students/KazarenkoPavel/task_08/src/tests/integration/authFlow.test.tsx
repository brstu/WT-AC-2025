import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { adsApi } from '@/app/api'

describe('Auth Flow Integration', () => {
  const mockStore = configureStore({
    reducer: {
      [adsApi.reducerPath]: adsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(adsApi.middleware),
  })

  it('показывает ошибку при неверных учетных данных', async () => {
    // Мокаем неудачный запрос
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    )

    // Заполняем форму
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@email.com' },
    })
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrongpass' },
    })

    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    // Ждем появления ошибки
    await waitFor(() => {
      expect(screen.getByText(/ошибка входа/i)).toBeInTheDocument()
    })
  })
})
