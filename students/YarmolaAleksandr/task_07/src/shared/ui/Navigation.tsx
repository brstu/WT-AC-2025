import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Youtube, 
  PlaySquare, 
  Plus, 
  Moon, 
  Sun, 
  User,
  LogOut 
} from 'lucide-react';
import { Button } from './Button';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleTheme } from '../../app/appSlice';
import { logout } from '../../features/auth/authSlice';
import { cn } from '../lib/utils';

const navigationItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/channels', label: 'Channels', icon: Youtube },
  { path: '/playlists', label: 'Playlists', icon: PlaySquare },
];

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { theme } = useAppSelector((state) => state.app);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };

  const handleMobileItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 font-bold text-lg"
          >
            <Youtube className="h-6 w-6 text-red-500" />
            <span>YT Catalog</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.name || user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/login">
                    <User className="h-4 w-4 mr-1" />
                    Login
                  </Link>
                </Button>
              )}
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            <Button size="sm" asChild>
              <Link to="/channels/new">
                <Plus className="h-4 w-4 mr-1" />
                Add Channel
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleMobileItemClick}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="px-3 py-2">
                <div className="h-px bg-border my-2" />
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Theme</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleThemeToggle}
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </>
                    )}
                  </Button>
                </div>

                {isAuthenticated ? (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Signed in as {user?.name || user?.email}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full mt-2" onClick={handleMobileItemClick}>
                    <Link to="/login">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                )}

                <div className="h-px bg-border my-2" />
                
                <Button asChild className="w-full" onClick={handleMobileItemClick}>
                  <Link to="/channels/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Channel
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};