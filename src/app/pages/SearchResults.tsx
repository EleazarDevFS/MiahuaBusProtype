import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { motion } from 'motion/react';
import { searchRoutes, getNextDeparture } from '../data/routes';

function formatMins(mins: number): string {
  if (mins <= 1) return 'Ahora';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = searchRoutes(query);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Resultados" />
      <Breadcrumb
        items={[
          { label: 'Inicio', path: '/home' },
          { label: 'Buscar', path: '/search' },
          { label: 'Resultados', path: `/search/results?q=${query}` },
        ]}
      />

      <div className="px-4 py-4 pt-[104px]">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {results.length}{' '}
            {results.length === 1 ? 'ruta encontrada' : 'rutas encontradas'} para &quot;{query}
            &quot;
          </p>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <MapPin className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="mb-2 text-gray-900">No se encontraron rutas</h3>
            <p className="mb-4 text-sm text-gray-500">Intenta con otro destino o parada</p>
            <button
              onClick={() => navigate('/planner')}
              className="rounded-lg bg-[#2E7D32] px-4 py-2 text-sm text-white"
            >
              Planificar viaje
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(route => {
              const next = getNextDeparture(route.schedules);
              return (
                <motion.button
                  key={route.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/route/${route.id}`)}
                  className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all hover:border-[#2E7D32] hover:shadow-md"
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
                      <div className="flex-1">
                        <h3 className="mb-1 text-sm font-bold text-gray-900">{route.name}</h3>
                        <p className="text-xs text-gray-500">
                          {route.origin} → {route.destination}
                        </p>
                      </div>
                      <div
                        className="ml-2 mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {route.stops.length} paradas
                        </span>
                        {next ? (
                          <span className="flex items-center gap-1 font-medium text-[#2E7D32]">
                            <Clock className="h-3 w-3" />
                            {next.time} ({formatMins(next.minutesAway)})
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin más salidas hoy</span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
