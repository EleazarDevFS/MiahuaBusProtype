import React from 'react';
import { Home, Map, Route, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Inicio' },
  { path: '/routes', icon: Map, label: 'Mis rutas' },
  { path: '/planner', icon: Route, label: 'Planificar ruta' },
  { path: '/favorites', icon: Heart, label: 'Favoritos' },
  { path: '/profile', icon: User, label: 'Perfil' }
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[430px] border-t border-gray-200 bg-white">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-[#2E7D32]' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
