import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface UserRoutesContextType {
  savedRoutes: UserRoute[];
  addRoute: (route: UserRoute) => void;
  removeRoute: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isRouteSaved: (routeId: string, origin: string, destination: string) => boolean;
}

const STORAGE_KEY = 'miahuabus_user_routes';

const UserRoutesContext = createContext<UserRoutesContextType | undefined>(undefined);

function loadSavedRoutes(): UserRoute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserRoute[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

export function UserRoutesProvider({ children }: { children: ReactNode }) {
  const [savedRoutes, setSavedRoutes] = useState<UserRoute[]>(loadSavedRoutes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  const addRoute = (route: UserRoute) => {
    setSavedRoutes(prev => {
      const exists = prev.some(
        r =>
          r.routeId === route.routeId &&
          r.origin.toLowerCase() === route.origin.toLowerCase() &&
          r.destination.toLowerCase() === route.destination.toLowerCase()
      );
      if (exists) return prev;
      return [...prev, route];
    });
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

  const isRouteSaved = (routeId: string, origin: string, destination: string) =>
    savedRoutes.some(
      r =>
        r.routeId === routeId &&
        r.origin.toLowerCase() === origin.toLowerCase() &&
        r.destination.toLowerCase() === destination.toLowerCase()
    );

  return (
    <UserRoutesContext.Provider
      value={{ savedRoutes, addRoute, removeRoute, toggleFavorite, isRouteSaved }}
    >
      {children}
    </UserRoutesContext.Provider>
  );
}

export const useUserRoutes = () => {
  const context = useContext(UserRoutesContext);
  if (context === undefined) {
    throw new Error('useUserRoutes must be used within a UserRoutesProvider');
  }
  return context;
};
