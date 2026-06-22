import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definir el tipo de una ruta guardada por el usuario
export interface UserRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  routeId: string;
  savedAt: number;
  notes?: string;
  isFavorite: boolean;
}

// Definir el tipo del contexto
interface UserRoutesContextType {
  savedRoutes: UserRoute[];
  addRoute: (route: UserRoute) => void;
  removeRoute: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

// Crear el contexto
const UserRoutesContext = createContext<UserRoutesContextType | undefined>(undefined);

// Provider
export function UserRoutesProvider({ children }: { children: ReactNode }) {
  const [savedRoutes, setSavedRoutes] = useState<UserRoute[]>([]);

  const addRoute = (route: UserRoute) => {
    setSavedRoutes(prev => [...prev, route]);
  };

  const removeRoute = (id: string) => {
    setSavedRoutes(prev => prev.filter(route => route.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setSavedRoutes(prev => 
      prev.map(route => 
        route.id === id ? { ...route, isFavorite: !route.isFavorite } : route
      )
    );
  };

  return (
    <UserRoutesContext.Provider value={{ savedRoutes, addRoute, removeRoute, toggleFavorite }}>
      {children}
    </UserRoutesContext.Provider>
  );
}

// ✅ HOOK - ESTA ES LA FUNCIÓN QUE DEBE ESTAR EXPORTADA
export const useUserRoutes = () => {
  const context = useContext(UserRoutesContext);
  if (context === undefined) {
    throw new Error('useUserRoutes must be used within a UserRoutesProvider');
  }
  return context;
};