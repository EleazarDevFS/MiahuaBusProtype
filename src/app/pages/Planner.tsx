import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpDown, MapPin, Search, Clock, ChevronRight, Info, BookmarkPlus } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { SaveRouteModal } from '../components/SaveRouteModal';
import { motion, AnimatePresence } from 'motion/react';
import { ROUTES, findRoutesByStops, getNextDeparture } from '../data/routes';
import PermissionModal from '../components/PermissionModal';
import { getLocationPermission } from '../utils/permissions';
import { useUserRoutes } from '../context/UserRoutesContext';

const ALL_STOPS = Array.from(new Set(
  ROUTES.flatMap(r => [r.origin, r.destination, ...r.stops])
)).sort();

function formatMins(mins: number): string {
  if (mins <= 1) return 'Ahora mismo';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

interface SaveModalState {
  isOpen: boolean;
  routeId?: string;
  origin?: string;
  destination?: string;
}

export default function Planner() {
  const navigate = useNavigate();
  const { isRouteSaved } = useUserRoutes();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
  const [results, setResults] = useState<typeof ROUTES | null>(null);
  const [searched, setSearched] = useState(false);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permission, setPermission] = useState(getLocationPermission());
  const [saveModal, setSaveModal] = useState<SaveModalState>({ isOpen: false });

  React.useEffect(() => {
    const current = getLocationPermission();
    setPermission(current);
    if (current !== 'granted') {
      setShowBlockedMessage(true);
    } else {
      setShowBlockedMessage(false);
    }
  }, []);

  const swapFields = () => {
    setOrigin(destination);
    setDestination(origin);
    setResults(null);
    setSearched(false);
  };

  const handleSearch = () => {
    if (!origin.trim() || !destination.trim()) return;

    const currentPermission = getLocationPermission();
    setPermission(currentPermission);
    if (currentPermission !== 'granted') {
      setShowBlockedMessage(true);
      setResults(null);
      setSearched(false);
      setActiveField(null);
      return;
    }

    const found = findRoutesByStops(origin, destination);
    setResults(found);
    setSearched(true);
    setActiveField(null);
  };

  const openSaveModal = (routeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSaveModal({ isOpen: true, routeId, origin, destination });
  };

  const filteredStops = (query: string) =>
    ALL_STOPS.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Planificar viaje" />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Planificador', path: '/planner' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {/* Selector origen / destino */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4">
          {/* Origen */}
          <div className="relative">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-3 h-3 rounded-full bg-[#2E7D32] flex-shrink-0" />
              <input
                type="text"
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setResults(null); setSearched(false); }}
                onFocus={() => setActiveField('origin')}
                placeholder="Origen (ej. Centro)"
                className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
              />
              {origin && (
                <button onClick={() => { setOrigin(''); setResults(null); setSearched(false); }} className="text-gray-300 hover:text-gray-500 font-bold">
                  ✕
                </button>
              )}
            </div>
            {/* Autocomplete origen */}
            <AnimatePresence>
              {activeField === 'origin' && origin.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-b-xl shadow-lg z-20 max-h-48 overflow-y-auto"
                >
                  {filteredStops(origin).map((stop) => (
                    <button
                      key={stop}
                      onClick={() => { setOrigin(stop); setActiveField(null); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-green-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {stop}
                    </button>
                  ))}
                  {filteredStops(origin).length === 0 && (
                    <p className="px-4 py-3 text-xs text-gray-400">Sin coincidencias</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separador con swap */}
          <div className="flex items-center border-t border-b border-gray-100">
            <div className="flex-1 h-px" />
            <button
              onClick={swapFields}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-green-50 hover:text-[#2E7D32] transition-colors mx-3 my-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <div className="flex-1 h-px" />
          </div>

          {/* Destino */}
          <div className="relative">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-3 h-3 rounded-full border-2 border-[#E53935] flex-shrink-0" />
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setResults(null); setSearched(false); }}
                onFocus={() => setActiveField('destination')}
                placeholder="Destino (ej. Hospital General)"
                className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
              />
              {destination && (
                <button onClick={() => { setDestination(''); setResults(null); setSearched(false); }} className="text-gray-300 hover:text-gray-500 font-bold">
                  ✕
                </button>
              )}
            </div>
            {/* Autocomplete destino */}
            <AnimatePresence>
              {activeField === 'destination' && destination.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-b-xl shadow-lg z-20 max-h-48 overflow-y-auto"
                >
                  {filteredStops(destination).map((stop) => (
                    <button
                      key={stop}
                      onClick={() => { setDestination(stop); setActiveField(null); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-green-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {stop}
                    </button>
                  ))}
                  {filteredStops(destination).length === 0 && (
                    <p className="px-4 py-3 text-xs text-gray-400">Sin coincidencias</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Botón buscar */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          disabled={!origin.trim() || !destination.trim()}
          className="w-full py-3.5 bg-[#2E7D32] text-white rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-5 shadow-md font-medium"
        >
          <Search className="w-4 h-4" />
          Buscar rutas
        </motion.button>

        {/* Destinos sugeridos or blocked message */}
        {showBlockedMessage && permission !== 'granted' && (
          <div className="mt-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-gray-700">
              <p className="mb-3">Para usar esta funcionalidad debes dar permisos.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPermissionModal(true)}
                  className="py-2 px-3 bg-[#2E7D32] text-white rounded-xl text-sm font-medium"
                >
                  Dar permiso
                </button>
                <button
                  onClick={() => navigate('/routes')}
                  className="py-2 px-3 bg-white border border-gray-200 rounded-xl text-sm"
                >
                  Ver Mis rutas
                </button>
              </div>
            </div>
          </div>
        )}

        {!showBlockedMessage && !searched && (
          <div>
            <p className="text-xs text-gray-500 mb-3 font-medium">Rutas comunes</p>
            <div className="space-y-2">
              {[
                { from: 'Centro - Palacio Municipal', to: 'Universidad UNSIS' },
                { from: 'Centro - Palacio Municipal', to: 'Hospital General' },
                { from: 'Centro - Palacio Municipal', to: 'Cefereso' },
              ].map((suggestion, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setOrigin(suggestion.from);
                    setDestination(suggestion.to);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#2E7D32] transition-colors text-left shadow-sm"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{suggestion.from}</p>
                    <p className="text-sm text-gray-900 truncate">→ {suggestion.to}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        <AnimatePresence>
          {searched && results !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {results.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-700 mb-1 font-medium">Sin rutas directas</p>
                  <p className="text-xs text-gray-500">
                    No hay ruta directa entre esos puntos. Intenta con paradas más cercanas.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-3 font-medium">
                    {results.length} {results.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}
                  </p>
                  <div className="space-y-3">
                    {results.map((route) => {
                      const next = getNextDeparture(route.schedules);
                      const alreadySaved = isRouteSaved(route.id, origin, destination);
                      return (
                        <motion.div
                          key={route.id}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                        >
                          <button
                            onClick={() => navigate(`/route/${route.id}`)}
                            className="w-full text-left"
                          >
                            <StaticMap
                              routeId={route.id}
                              color={route.color}
                              height="100px"
                              interactive={false}
                              className="rounded-none rounded-t-xl"
                            />
                            <div className="p-4">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: route.color }} />
                                <span className="text-sm font-medium text-gray-900">{route.name}</span>
                                <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                              </div>
                              <p className="mb-2 truncate text-xs text-gray-500">
                                {route.origin} → {route.destination}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {next
                                    ? <span className="font-medium text-[#2E7D32]">Próximo: {next.time} ({formatMins(next.minutesAway)})</span>
                                    : <span className="text-gray-400">Sin más salidas hoy</span>
                                  }
                                </div>
                                <span>~{route.estimatedDuration} min</span>
                              </div>
                            </div>
                          </button>

                          <div className="border-t border-gray-100 px-4 pb-3">
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={(e) => openSaveModal(route.id, e)}
                              disabled={alreadySaved}
                              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                                alreadySaved
                                  ? 'border border-green-200 bg-green-50 text-[#2E7D32]'
                                  : 'border border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]'
                              }`}
                            >
                              <BookmarkPlus className="h-4 w-4" />
                              {alreadySaved ? 'Ya guardada en Mis rutas' : 'Guardar en Mis rutas'}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      Todas las rutas pasan por el Centro. Puedes transbordar ahí si no hay ruta directa.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {saveModal.isOpen && saveModal.routeId && (
        <SaveRouteModal
          isOpen={saveModal.isOpen}
          onClose={() => setSaveModal({ isOpen: false })}
          routeId={saveModal.routeId}
          origin={saveModal.origin || ''}
          destination={saveModal.destination || ''}
          onSaved={() => navigate('/routes')}
        />
      )}

      <BottomNav />

      <PermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onSuccess={() => {
          setShowPermissionModal(false);
          setPermission('granted');
          if (origin.trim() && destination.trim()) {
            const found = findRoutesByStops(origin, destination);
            setResults(found);
            setSearched(true);
            setShowBlockedMessage(false);
          }
        }}
      />
    </div>
  );
}