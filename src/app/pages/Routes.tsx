import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Clock, MapPin, SlidersHorizontal, ChevronDown, Heart, Trash2, Edit2, Plus, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useUserRoutes } from '../context/UserRoutesContext';
import { ROUTES, getNextDeparture } from '../data/routes';

type SortOption = 'date' | 'name' | 'favorite';

// ✅ CORRECTO: Export default directamente en la función
export default function Routes() {
  const navigate = useNavigate();
  const { savedRoutes, removeRoute, toggleFavorite } = useUserRoutes();
  const [sort, setSort] = useState<SortOption>('date');
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const sortedRoutes = useMemo(() => {
    const list = [...savedRoutes];
    if (sort === 'date') {
      return list.sort((a, b) => b.savedAt - a.savedAt);
    }
    if (sort === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === 'favorite') {
      return list.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return b.savedAt - a.savedAt;
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      });
    }
    return list;
  }, [sort, savedRoutes]);

  const sortLabels: Record<SortOption, string> = {
    date: 'Más reciente',
    name: 'Nombre A–Z',
    favorite: 'Favoritas primero'
  };

  const handleDeleteRoute = (id: string) => {
    removeRoute(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Mis rutas" showBack={false} />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Mis rutas', path: '/routes' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {savedRoutes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96 py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-[#2E7D32]" />
            </div>
            <h2 className="text-xl text-gray-900 font-bold mb-2">Sin rutas guardadas</h2>
            <p className="text-gray-600 text-center mb-6 max-w-xs">
              Planifica tu primer viaje y guárdalo aquí para acceder rápidamente en el futuro
            </p>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/planner')}
                className="flex items-center gap-2 bg-[#2E7D32] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1B5E20] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear ruta
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 bg-white text-[#2E7D32] border border-[#2E7D32] px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                <Clock className="w-4 h-4" />
                Explorar
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="text-gray-900 font-semibold">{savedRoutes.length}</span> ruta{savedRoutes.length !== 1 ? 's' : ''} guardada{savedRoutes.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {savedRoutes.filter(r => r.isFavorite).length} favorita{savedRoutes.filter(r => r.isFavorite).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  showFilter
                    ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#2E7D32]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Ordenar
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-white border border-gray-200 rounded-xl p-3 grid grid-cols-3 gap-2">
                    {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => { setSort(option); setShowFilter(false); }}
                        className={`py-2 px-3 rounded-lg text-xs transition-colors font-medium ${
                          sort === option
                            ? 'bg-[#2E7D32] text-white'
                            : 'bg-[#F5F5F5] text-gray-700 hover:bg-green-50'
                        }`}
                      >
                        {sortLabels[option]}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {sortedRoutes.map((route) => {
                const allRoute = ROUTES.find(r => r.id === route.routeId);
                const next = allRoute ? getNextDeparture(allRoute.schedules) : null;

                return (
                  <motion.div
                    key={route.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="group relative"
                  >
                    <AnimatePresence>
                      {showDeleteConfirm === route.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-red-50 border border-red-200 rounded-xl z-10 flex items-center justify-between px-4 py-3"
                        >
                          <div>
                            <p className="text-sm text-red-900 font-medium">¿Eliminar ruta?</p>
                            <p className="text-xs text-red-700">Esta acción no se puede deshacer</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="text-xs px-3 py-1 bg-white text-gray-700 border border-red-200 rounded hover:bg-red-50 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDeleteRoute(route.id)}
                              className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/route/${route.routeId}`)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-[#2E7D32] hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{route.name}</h3>
                            {route.isFavorite && (
                              <Star className="w-3.5 h-3.5 text-[#F57F17] fill-[#F57F17]" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">{route.origin}</span> 
                            <span className="text-gray-400 mx-1">→</span> 
                            <span className="font-medium">{route.destination}</span>
                          </p>
                        </div>
                        {next && (
                          <div className="text-right ml-2 flex-shrink-0 bg-green-50 px-2 py-1 rounded-lg">
                            <p className="text-xs font-bold text-[#2E7D32]">{next.time}</p>
                            <p className="text-[10px] text-green-700">
                              {next.minutesAway <= 1 ? 'Ahora' : `${next.minutesAway} min`}
                            </p>
                          </div>
                        )}
                      </div>

                      {route.notes && (
                        <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">
                          "{route.notes}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-gray-500">
                          Guardado {new Date(route.savedAt).toLocaleDateString('es-MX', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </motion.button>

                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(route.id);
                        }}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-yellow-50 hover:border-[#F57F17] transition-colors shadow-sm"
                        title="Favorita"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            route.isFavorite
                              ? 'text-[#F57F17] fill-[#F57F17]'
                              : 'text-gray-400 hover:text-[#F57F17]'
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Editar:', route.id);
                        }}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-[#1976D2] transition-colors shadow-sm"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400 hover:text-[#1976D2]" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(route.id);
                        }}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-red-50 hover:border-[#E53935] transition-colors shadow-sm"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-[#E53935]" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/planner')}
              className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}