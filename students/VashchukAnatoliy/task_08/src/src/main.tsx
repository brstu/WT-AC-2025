import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App';
import { store } from './app/store';
import { NotificationProvider } from './shared/ui/NotificationProvider';

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <React.StrictMode>
    <Provider store={store}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </Provider>
  </React.StrictMode>
);
