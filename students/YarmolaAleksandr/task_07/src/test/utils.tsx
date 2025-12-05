import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../shared/api';
import authReducer from '../features/auth/authSlice';
import appReducer from '../app/appSlice';

// Test utilities
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      app: appReducer,
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActionPaths: ['meta.requestId', 'meta.requestStatus'],
        },
      }).concat(api.middleware),
  });
};

export const TestWrapper = ({ 
  children, 
  store = createTestStore() 
}: { 
  children: React.ReactNode; 
  store?: ReturnType<typeof createTestStore> 
}) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

export const renderWithProviders = (
  component: React.ReactElement,
  { store = createTestStore(), ...renderOptions } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper store={store}>
      {children}
    </TestWrapper>
  );

  return {
    store,
    ...render(component, { wrapper: Wrapper, ...renderOptions }),
  };
};