import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { router } from './routes'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './styles/globals.css'

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </Provider>
  )
}
