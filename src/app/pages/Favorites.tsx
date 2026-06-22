import React from 'react';
import { useNavigate } from 'react-router';
import { Heart, Trash2, Clock, BookmarkPlus } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { motion } from 'motion/react';
import { useFavorites } from '../context/FavoritesContext';
import { getNextDeparture } from '../data/routes';

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Favoritos" showBack={false} />
      <Breadcrumb
        items={[
          { label: 'Inicio', path: '/home' },
          { label: 'Favoritos', path: '/favorites' },
        ]}
      />

      <div className="px-4 py-4 pt-[104px]">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50">
              <Heart className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="mb-2 text-gray-900">Aún no tienes rutas favoritas</h3>
            <p className="mb-6 text-sm text-gray-500">
              Marca tus líneas frecuentes como favorito al ver el detalle de una ruta
            </p>
            <button
              onClick={() => navigate('/search')}
              className="rounded-xl bg-[#2E7D32] px-6 py-3 text-white transition-colors hover:bg-[#1B5E20]"
            >
              Explorar rutas
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'línea favorita' : 'líneas favoritas'}
            </p>

            <div className="space-y-3">
              {favorites.map(route => {
                const next = getNextDeparture(route.schedules);
                return (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <button
                      onClick={() => navigate(`/route/${route.id}`)}
                      className="w-full text-left"
                    >
                      <StaticMap
                        routeId={route.id}
                        color={route.color}
                        height="90px"
                        interactive={false}
                        className="rounded-none rounded-t-xl"
                      />
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="mb-1 text-sm font-bold text-gray-900">{route.name}</h3>
                            <p className="text-xs text-gray-500">
                              {route.origin} → {route.destination}
                            </p>
                          </div>
                          <div
                            className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                            style={{ backgroundColor: route.color }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {route.firstDeparture} – {route.lastDeparture}
                          </span>
                          {next && (
                            <span className="font-medium text-[#2E7D32]">
                              Próximo: {next.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="flex border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/route/${route.id}`)}
                        className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs text-[#2E7D32] hover:bg-green-50"
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        Ver detalle
                      </button>
                      <button
                        onClick={() => removeFavorite(route.id)}
                        className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2.5 text-xs text-[#E53935] hover:bg-red-50"
                        aria-label="Eliminar de favoritos"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Quitar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
