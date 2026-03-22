import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthForm } from './components/AuthForm';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { getToken, clearToken, API_BASE } from './utils/api';
import { 
  MapPin, 
  Settings,
  Phone,
  Mail,
  Globe,
  LogOut,
  Shield
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            setIsAuthenticated(true);
          } else {
            clearToken();
          }
        } catch (err) {
          clearToken();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AuthForm onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-xl font-bold">Snap2Solve Admin</h1>
                <p className="text-sm text-muted-foreground">Government of Maharashtra - Administrative Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated && currentUser && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white font-medium">
                      {(currentUser.name || 'Admin').split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{currentUser.name || 'Admin User'}</div>
                    <div className="text-xs text-muted-foreground">{currentUser.role || 'Administrator'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="ml-2 h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Portal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        <AdminDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Snap2Solve Admin</h3>
              <p className="text-sm text-muted-foreground">
                Administrative portal for managing civic issue reports and municipal 
                operations across Maharashtra state.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Admin Resources</h3>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                  User Management Guide
                </div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                  Report Processing Manual
                </div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                  System Documentation
                </div>
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                  Security Guidelines
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Support Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  admin@s2s.maharashtra.gov.in
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  1800-XXX-XXXX (Admin Support)
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  maharashtra.gov.in
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 Government of Maharashtra. All rights reserved.</p>
            <p className="mt-1">
              Department of Higher and Technical Education | Administrative Systems Division
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
