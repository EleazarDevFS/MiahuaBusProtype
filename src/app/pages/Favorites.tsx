import React from 'react';
import { useNavigate } from 'react-router';
import { Heart, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { useFavorites } from '../context/FavoritesContext';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <Header title="Favoritos" showBack={false} />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Favoritos', path: '/favorites' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-gray-900 mb-2">Aún no tienes rutas favoritas</h3>
            <p className="text-sm text-gray-500 mb-6">
              Guarda tus rutas más frecuentes para acceder rápidamente
            </p>
            <button
              onClick={() => navigate('/routes')}
              className="px-6 py-3 bg-[#2E7D32] text-white rounded-xl hover:bg-[#1B5E20] transition-colors"
            >
              Explorar rutas
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {favorites.length} {favorites.length === 1 ? 'ruta guardada' : 'rutas guardadas'}
            </p>

            <div className="space-y-3">
              {favorites.map((route) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white border border-gray-200 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => navigate(`/route/${route.id}`)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{route.name}</h3>
                          <p className="text-sm text-gray-500">
                            {route.origin} → {route.destination}
                          </p>
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full mt-1" 
                          style={{ backgroundColor: route.color }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {route.firstDeparture} - {route.lastDeparture}
                      </p>
                    </button>

                    <button
                      onClick={() => removeFavorite(route.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Eliminar de favoritos"
                    >
                      <Trash2 className="w-5 h-5 text-[#E53935]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
