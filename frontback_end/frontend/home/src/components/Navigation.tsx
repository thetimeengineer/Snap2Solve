import { Button } from './ui/button';
import { 
  Home, 
  Plus, 
  List, 
  Shield,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: any;
  onLogout?: () => void;
}

export function Navigation({ currentPage, onNavigate, user, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'report', label: 'Report Issue', icon: Plus },
    { id: 'issues', label: 'Issues', icon: List },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="Snap2Solve" 
                className="h-12 w-auto object-contain"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentPage === id ? "default" : "ghost"}
                onClick={() => onNavigate(id)}
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Button>
            ))}
          </div>

          {/* Citizen indicator & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {user ? (
               <div className="flex items-center space-x-2 mr-2">
                 <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                 {onLogout && (
                   <Button variant="ghost" size="sm" onClick={onLogout}>Logout</Button>
                 )}
               </div>
            ) : (
               <Button
                 variant="outline"
                 size="sm"
                 className="hidden sm:flex"
               >
                 <Shield className="w-4 h-4 mr-1" />
                 Citizen
               </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentPage === id ? "default" : "ghost"}
                onClick={() => {
                  onNavigate(id);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
