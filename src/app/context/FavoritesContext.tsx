import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  firstDeparture: string;
  lastDeparture: string;
  stops: string[];
  schedules: string[];
  color: string;
  frequency?: string;
  estimatedDuration?: number;
}

interface FavoritesContextType {
  favorites: Route[];
  addFavorite: (route: Route) => void;
  removeFavorite: (routeId: string) => void;
  isFavorite: (routeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Route[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('miahuabus_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const addFavorite = (route: Route) => {
    const newFavorites = [...favorites, route];
    setFavorites(newFavorites);
    localStorage.setItem('miahuabus_favorites', JSON.stringify(newFavorites));
  };

  const removeFavorite = (routeId: string) => {
    const newFavorites = favorites.filter(r => r.id !== routeId);
    setFavorites(newFavorites);
    localStorage.setItem('miahuabus_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (routeId: string) => {
    return favorites.some(r => r.id === routeId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
