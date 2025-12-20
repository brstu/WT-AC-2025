import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { router } from './router/router'


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <HashRouter>
      <RouterProvider router={router} />
    </HashRouter>
  </Provider>
)
