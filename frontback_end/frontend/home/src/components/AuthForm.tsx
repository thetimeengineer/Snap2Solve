import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { login as apiLogin, register as apiRegister } from '../utils/api';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Shield,
  Layout,
  Globe,
  ArrowRight,
  Mail,
  Lock,
  User,
  Chrome,
  Apple,
  Facebook
} from 'lucide-react';

export function AuthForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();

      if (mode === 'login') {
        const res = await apiLogin(email, password);
        if (res.user) onLogin(res.user);
      } else {
        const res = await apiRegister(formData.name.trim(), email, password);
        if (res.user) onLogin(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 font-medium">
              {mode === 'login' 
                ? 'Sign in to access your citizen dashboard' 
                : 'Join the community to start reporting issues'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-semibold">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                      type="text"
                      placeholder="Enter your name"
                      className="h-12 bg-gray-50 border-gray-100 rounded-xl pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="email"
                  placeholder="      name@example.com"
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</Label>
                {mode === 'login' && (
                  <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="      ••••••••"
                  className="h-12 bg-gray-50 border-gray-100 rounded-xl pl-12 pr-12 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center space-x-2 py-1 ml-1">
                <Checkbox id="keep-login" className="rounded border-gray-200 h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-colors" />
                <label htmlFor="keep-login" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-300 bg-white px-4">
                or use social
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[Chrome, Apple, Facebook].map((Icon, idx) => (
                <button key={idx} type="button" className="flex items-center justify-center h-12 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:border-blue-100 transition-all group">
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>

            <p className="text-center mt-8 text-sm font-medium text-gray-500">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setErrorMsg("");
                }}
                className="text-blue-600 font-bold hover:underline underline-offset-4"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
        
        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Official Snap2Solve Portal</p>
        </div>
      </div>
    </div>
  );
}
