import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Clock, MapPin, SlidersHorizontal, ChevronDown, Heart, Trash2, Edit2, Plus, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { motion, AnimatePresence } from 'motion/react';
import { useUserRoutes } from '../context/UserRoutesContext';
import { ROUTES, getNextDeparture } from '../data/routes';

type SortOption = 'date' | 'name' | 'favorite';

export default function Routes() {
  const navigate = useNavigate();
  const { savedRoutes, removeRoute, toggleFavorite } = useUserRoutes();
  const [sort, setSort] = useState<SortOption>('date');
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const sortedRoutes = useMemo(() => {
    const list = [...savedRoutes];
    if (sort === 'date') return list.sort((a, b) => b.savedAt - a.savedAt);
    if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
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
    favorite: 'Favoritas primero',
  };

  const handleDeleteRoute = (id: string) => {
    removeRoute(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Mis rutas" showBack={false} />
      <Breadcrumb
        items={[
          { label: 'Inicio', path: '/home' },
          { label: 'Mis rutas', path: '/routes' },
        ]}
      />

      <div className="px-4 py-4 pt-[104px]">
        {savedRoutes.length === 0 ? (
          <div className="flex min-h-96 flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]">
              <MapPin className="h-10 w-10 text-[#2E7D32]" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Sin rutas guardadas</h2>
            <p className="mb-6 max-w-xs text-center text-gray-600">
              Planifica un viaje y usa &quot;Guardar en Mis rutas&quot; para tenerlo siempre a mano
            </p>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/planner')}
                className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1B5E20]"
              >
                <Plus className="h-4 w-4" />
                Planificar viaje
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 rounded-lg border border-[#2E7D32] bg-white px-6 py-3 font-medium text-[#2E7D32] transition-colors hover:bg-green-50"
              >
                <Clock className="h-4 w-4" />
                Explorar
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{savedRoutes.length}</span> ruta
                  {savedRoutes.length !== 1 ? 's' : ''} guardada
                  {savedRoutes.length !== 1 ? 's' : ''}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {savedRoutes.filter(r => r.isFavorite).length} favorita
                  {savedRoutes.filter(r => r.isFavorite).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowFilter(v => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  showFilter
                    ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#2E7D32]'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Ordenar
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showFilter ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-gray-200 bg-white p-3">
                    {(Object.keys(sortLabels) as SortOption[]).map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setSort(option);
                          setShowFilter(false);
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
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
              {sortedRoutes.map(route => {
                const allRoute = ROUTES.find(r => r.id === route.routeId);
                const next = allRoute ? getNextDeparture(allRoute.schedules) : null;

                return (
                  <motion.div
                    key={route.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <AnimatePresence>
                      {showDeleteConfirm === route.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-red-900">¿Eliminar ruta?</p>
                            <p className="text-xs text-red-700">Esta acción no se puede deshacer</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="rounded border border-red-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-red-50"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDeleteRoute(route.id)}
                              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => navigate(`/route/${route.routeId}`)}
                      className="w-full text-left"
                    >
                      <StaticMap
                        routeId={route.routeId}
                        color={allRoute?.color || '#2E7D32'}
                        height="90px"
                        interactive={false}
                        className="rounded-none rounded-t-xl"
                      />
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="text-sm font-bold text-gray-900">{route.name}</h3>
                              {route.isFavorite && (
                                <Star className="h-3.5 w-3.5 fill-[#F57F17] text-[#F57F17]" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">{route.origin}</span>
                              <span className="mx-1 text-gray-400">→</span>
                              <span className="font-medium">{route.destination}</span>
                            </p>
                          </div>
                          {next && (
                            <div className="ml-2 flex-shrink-0 rounded-lg bg-green-50 px-2 py-1">
                              <p className="text-xs font-bold text-[#2E7D32]">{next.time}</p>
                              <p className="text-[10px] text-green-700">
                                {next.minutesAway <= 1 ? 'Ahora' : `${next.minutesAway} min`}
                              </p>
                            </div>
                          )}
                        </div>

                        {route.notes && (
                          <p className="mb-2 line-clamp-2 text-xs italic text-gray-500">
                            &quot;{route.notes}&quot;
                          </p>
                        )}

                        <p className="border-t border-gray-100 pt-2 text-[10px] text-gray-500">
                          Guardado{' '}
                          {new Date(route.savedAt).toLocaleDateString('es-MX', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </button>

                    <div className="flex gap-1 border-t border-gray-100 px-3 py-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(route.id);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs text-gray-600 hover:bg-yellow-50"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            route.isFavorite
                              ? 'fill-[#F57F17] text-[#F57F17]'
                              : 'text-gray-400'
                          }`}
                        />
                        Favorita
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/route/${route.routeId}`);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs text-gray-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                        Ver ruta
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowDeleteConfirm(route.id);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs text-gray-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/planner')}
              className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white shadow-lg transition-shadow hover:shadow-xl"
              aria-label="Planificar nueva ruta"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
