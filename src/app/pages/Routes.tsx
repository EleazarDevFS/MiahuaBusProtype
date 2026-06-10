import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Clock, MapPin, SlidersHorizontal, ChevronDown, Heart } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { ROUTES, getNextDeparture } from '../data/routes';
import { useFavorites } from '../context/FavoritesContext';

type SortOption = 'default' | 'next' | 'stops' | 'name';

export default function Routes() {
  const navigate = useNavigate();
  const { isFavorite } = useFavorites();
  const [sort, setSort] = useState<SortOption>('default');
  const [showFilter, setShowFilter] = useState(false);

  const sortedRoutes = useMemo(() => {
    const list = [...ROUTES];
    if (sort === 'next') {
      return list.sort((a, b) => {
        const na = getNextDeparture(a.schedules);
        const nb = getNextDeparture(b.schedules);
        if (!na && !nb) return 0;
        if (!na) return 1;
        if (!nb) return -1;
        return na.minutesAway - nb.minutesAway;
      });
    }
    if (sort === 'stops') return list.sort((a, b) => a.stops.length - b.stops.length);
    if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sort]);

  const sortLabels: Record<SortOption, string> = {
    default: 'Por defecto',
    next: 'Próxima salida',
    stops: 'Menos paradas',
    name: 'Nombre A–Z'
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Mis rutas" showBack={false} />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Mis rutas', path: '/routes' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {/* Encabezado con filtro */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="text-gray-900">{ROUTES.length}</span> rutas disponibles
          </p>
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

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-3 grid grid-cols-2 gap-2">
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSort(option); setShowFilter(false); }}
                    className={`py-2 px-3 rounded-lg text-xs text-left transition-colors ${
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
            const next = getNextDeparture(route.schedules);
            const fav = isFavorite(route.id);
            return (
              <motion.button
                key={route.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/route/${route.id}`)}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-[#2E7D32] transition-colors text-left shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: route.color }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm text-gray-900">{route.name}</h3>
                      <p className="text-xs text-gray-500 truncate">
                        {route.origin} → {route.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {fav && <Heart className="w-3.5 h-3.5 text-[#E53935] fill-[#E53935]" />}
                    {next ? (
                      <div className="text-right">
                        <p className="text-xs text-[#2E7D32]">{next.time}</p>
                        <p className="text-[10px] text-gray-400">
                          {next.minutesAway <= 1 ? 'Ahora' : `${next.minutesAway} min`}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">Sin más salidas</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{route.firstDeparture} – {route.lastDeparture}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{route.stops.length} paradas</span>
                  </div>
                  {route.frequency && (
                    <span className="text-gray-400">{route.frequency}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
