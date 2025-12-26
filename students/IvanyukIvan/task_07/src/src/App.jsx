import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout.jsx';
import StartupsList from './pages/StartupsList.jsx';
import StartupDetail from './pages/StartupDetail.jsx';
import StartupForm from './pages/StartupForm.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const client = new QueryClient();

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<StartupsList />} />
            <Route path="startups/new" element={<StartupForm mode="create" />} />
            <Route path="startups/:id" element={<StartupDetail />} />
            <Route path="startups/:id/edit" element={<StartupForm mode="edit" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
