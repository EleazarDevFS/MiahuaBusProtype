import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Heart, Clock, MapPin, Share2, Timer, Info, BookmarkPlus, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { SaveRouteModal } from '../components/SaveRouteModal';
import { motion } from 'motion/react';
import { ROUTES, isPeakHour, getNextDeparture, getLastDeparted } from '../data/routes';
import { useFavorites } from '../context/FavoritesContext';
import { useUserRoutes } from '../context/UserRoutesContext';

function formatMinutesAway(mins: number): string {
  if (mins <= 1) return 'Saliendo ahora';
  if (mins < 60) return `En ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `En ${h}h ${m}min` : `En ${h}h`;
}

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const route = ROUTES.find(r => r.id === id);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isRouteSaved } = useUserRoutes();
  const [activeTab, setActiveTab] = useState<'map' | 'schedule'>('map');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  if (!route) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white">
        <p className="text-gray-500">Ruta no encontrada</p>
      </div>
    );
  }

  const favorite = isFavorite(route.id);
  const savedInMyRoutes = isRouteSaved(route.id, route.origin, route.destination);
  const next = getNextDeparture(route.schedules);
  const lastDeparted = getLastDeparted(route.schedules);

  const handleToggleFavorite = () => {
    if (favorite) removeFavorite(route.id);
    else addFavorite(route);
  };

  const handleShare = async () => {
    const text = `🚌 ${route.name}\n📍 ${route.origin} → ${route.destination}\n🕐 ${route.firstDeparture} – ${route.lastDeparture}\nParadas: ${route.stops.join(' → ')}\n\nVía MiahuaBus`;
    try {
      if (navigator.share) {
        await navigator.share({ title: route.name, text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="min-h-screen w-full bg-white pb-44">
      <Header title={route.name} />
      <Breadcrumb
        items={[
          { label: 'Inicio', path: '/home' },
          { label: 'Rutas', path: '/routes' },
          { label: route.name, path: `/route/${id}` },
        ]}
      />

      <div className="pt-[104px]">
        {/* Mapa principal */}
        <div className="mx-4 mt-4 overflow-hidden rounded-xl shadow-md">
          <StaticMap
            routeId={route.id}
            color={route.color}
            height="220px"
            interactive
            showStopLabels
          />
        </div>

        {/* Banner de próxima salida */}
        {next && (
          <div className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#2E7D32]" />
              <div>
                <p className="text-xs text-gray-600">Próxima salida</p>
                <p className="text-sm text-[#2E7D32]">
                  {next.time} — {formatMinutesAway(next.minutesAway)}
                </p>
              </div>
            </div>
            {lastDeparted && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Último salió</p>
                <p className="text-xs text-gray-600">{lastDeparted}</p>
              </div>
            )}
          </div>
        )}

        {!next && (
          <div className="mx-4 mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs text-orange-700">
              ⚠️ No hay más salidas hoy. El servicio reinicia mañana a las{' '}
              {route.firstDeparture}.
            </p>
          </div>
        )}

        {/* Info rápida */}
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[#F8F9FA] p-3 text-center">
            <Clock className="mx-auto mb-1 h-4 w-4 text-gray-500" />
            <p className="text-[10px] text-gray-500">Primera</p>
            <p className="text-xs text-gray-900">{route.firstDeparture}</p>
          </div>
          <div className="rounded-xl bg-[#F8F9FA] p-3 text-center">
            <MapPin className="mx-auto mb-1 h-4 w-4 text-gray-500" />
            <p className="text-[10px] text-gray-500">Paradas</p>
            <p className="text-xs text-gray-900">{route.stops.length}</p>
          </div>
          <div className="rounded-xl bg-[#F8F9FA] p-3 text-center">
            <Timer className="mx-auto mb-1 h-4 w-4 text-gray-500" />
            <p className="text-[10px] text-gray-500">Duración</p>
            <p className="text-xs text-gray-900">~{route.estimatedDuration} min</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[104px] z-10 mt-4 flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-sm transition-colors ${
              activeTab === 'map'
                ? 'border-b-2 border-[#2E7D32] text-[#2E7D32]'
                : 'text-gray-500'
            }`}
          >
            Paradas
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 text-sm transition-colors ${
              activeTab === 'schedule'
                ? 'border-b-2 border-[#2E7D32] text-[#2E7D32]'
                : 'text-gray-500'
            }`}
          >
            Horarios
          </button>
        </div>

        {/* Contenido */}
        <div className="px-4 py-4">
          {activeTab === 'map' ? (
            <div>
              <h3 className="mb-3 text-sm text-gray-900">Paradas del recorrido</h3>
              <div className="space-y-0">
                {route.stops.map((stop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-start gap-3"
                  >
                    <div className="relative mt-1 flex-shrink-0">
                      <div
                        className="h-3 w-3 rounded-full border-2 border-white shadow-sm"
                        style={{
                          backgroundColor:
                            index === 0 || index === route.stops.length - 1
                              ? route.color
                              : 'white',
                          borderColor: route.color,
                        }}
                      />
                      {index < route.stops.length - 1 && (
                        <div
                          className="absolute left-1/2 top-3 h-8 w-0.5 -translate-x-1/2"
                          style={{ backgroundColor: route.color, opacity: 0.25 }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-5">
                      <p className="text-sm text-gray-900">{stop}</p>
                      {index === 0 && (
                        <span
                          className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] text-white"
                          style={{ backgroundColor: route.color }}
                        >
                          Origen
                        </span>
                      )}
                      {index === route.stops.length - 1 && (
                        <span
                          className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] text-white"
                          style={{ backgroundColor: route.color }}
                        >
                          Destino final
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-5 rounded-xl bg-[#F8F9FA] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Primera salida</span>
                  <span className="text-sm text-gray-900">{route.firstDeparture}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Última salida</span>
                  <span className="text-sm text-gray-900">{route.lastDeparture}</span>
                </div>
                {route.frequency && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Frecuencia</span>
                    <span className="text-sm text-gray-900">{route.frequency}</span>
                  </div>
                )}
              </div>

              <h3 className="mb-3 text-sm text-gray-900">Horarios del día</h3>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {route.schedules.map((time, index) => {
                  const isNext = next?.time === time;
                  const isPeak = isPeakHour(time);
                  return (
                    <div
                      key={index}
                      className={`rounded-lg border p-2.5 text-center text-xs transition-all ${
                        isNext
                          ? 'border-[#2E7D32] bg-green-100 ring-1 ring-[#2E7D32]'
                          : isPeak
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-gray-200 bg-[#F5F5F5]'
                      }`}
                    >
                      <Clock
                        className={`mx-auto mb-0.5 h-3 w-3 ${
                          isNext
                            ? 'text-[#2E7D32]'
                            : isPeak
                              ? 'text-orange-600'
                              : 'text-gray-400'
                        }`}
                      />
                      <span className={isNext ? 'text-[#2E7D32]' : 'text-gray-900'}>
                        {time}
                      </span>
                      {isNext && (
                        <span className="mt-0.5 block text-[9px] text-[#2E7D32]">Próximo</span>
                      )}
                      {!isNext && isPeak && (
                        <span className="mt-0.5 block text-[9px] text-orange-600">Pico</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded border border-[#2E7D32] bg-green-100" />
                  Próximo camión
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded border border-orange-200 bg-orange-50" />
                  Hora pico
                </div>
              </div>

              <div className="flex gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <p className="text-xs text-blue-800">
                  Horarios aproximados, pueden variar según condiciones de tráfico y clima.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones fijos abajo */}
      <div className="fixed bottom-20 left-0 right-0 z-30 mx-auto max-w-[430px] bg-gradient-to-t from-white via-white to-transparent px-4 pb-3 pt-4">
        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowSaveModal(true)}
            disabled={savedInMyRoutes}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium shadow-md transition-all ${
              savedInMyRoutes
                ? 'border border-green-200 bg-green-50 text-[#2E7D32]'
                : 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]'
            }`}
          >
            {savedInMyRoutes ? (
              <>
                <Check className="h-4 w-4" />
                Guardada en Mis rutas
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" />
                Guardar en Mis rutas
              </>
            )}
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-3 text-gray-700 transition-all hover:border-[#2E7D32]"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">{shareSuccess ? '¡Copiado!' : 'Compartir'}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleFavorite}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm transition-all ${
                favorite
                  ? 'border-2 border-[#E53935] bg-red-50 text-[#E53935]'
                  : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-[#2E7D32]'
              }`}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
              {favorite ? 'Favorito' : 'Favorito'}
            </motion.button>
          </div>
        </div>
      </div>

      <SaveRouteModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        routeId={route.id}
        origin={route.origin}
        destination={route.destination}
        defaultName={route.name}
        onSaved={() => navigate('/routes')}
      />

      <BottomNav />
    </div>
  );
}
