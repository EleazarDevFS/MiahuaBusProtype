import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial de usuario desde localStorage
    const savedUser = localStorage.getItem('miahuabus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simular login - en producción esto sería una llamada al backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email && password) {
      const newUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        provider: 'email'
      };
      setUser(newUser);
      localStorage.setItem('miahuabus_user', JSON.stringify(newUser));
    } else {
      throw new Error('Correo o contraseña incorrectos');
    }
  };

  const loginWithGoogle = async () => {
    // Simular login con Google
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: '2',
      name: 'Usuario Google',
      email: 'usuario@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      provider: 'google'
    };
    setUser(newUser);
    localStorage.setItem('miahuabus_user', JSON.stringify(newUser));
  };

  const register = async (name: string, email: string, password: string) => {
    // Simular registro
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      provider: 'email'
    };
    setUser(newUser);
    localStorage.setItem('miahuabus_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('miahuabus_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
