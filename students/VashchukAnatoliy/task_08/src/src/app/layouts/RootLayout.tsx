import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div>
      <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <h1>Movies App</h1>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
