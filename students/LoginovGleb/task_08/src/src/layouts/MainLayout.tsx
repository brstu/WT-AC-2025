import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Notification } from '../components/common/Notification';
import './MainLayout.css';

export const MainLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Notification />
    </div>
  );
};
