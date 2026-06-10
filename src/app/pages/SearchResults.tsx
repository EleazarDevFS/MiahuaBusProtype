import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Clock, MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { searchRoutes } from '../data/routes';

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = searchRoutes(query);

  return (
    <div className="min-h-screen w-full bg-white pb-20">
      <Header title="Resultados" />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Buscar', path: '/search' },
        { label: 'Resultados', path: `/search/results?q=${query}` }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {results.length} {results.length === 1 ? 'ruta encontrada' : 'rutas encontradas'} para "{query}"
          </p>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-gray-900 mb-2">No se encontraron rutas</h3>
            <p className="text-sm text-gray-500">
              Intenta con otro destino
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((route) => (
              <motion.button
                key={route.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/route/${route.id}`)}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-[#2E7D32] transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-3">
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

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{route.stops[route.stops.length - 1]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Próxima salida: {route.schedules[0]}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
