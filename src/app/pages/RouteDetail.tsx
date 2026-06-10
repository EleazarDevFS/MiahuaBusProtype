import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Heart, Clock, MapPin, Share2, Timer, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { ROUTES, isPeakHour, getNextDeparture, getLastDeparted } from '../data/routes';
import { useFavorites } from '../context/FavoritesContext';

function formatMinutesAway(mins: number): string {
  if (mins <= 1) return 'Saliendo ahora';
  if (mins < 60) return `En ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `En ${h}h ${m}min` : `En ${h}h`;
}

export default function RouteDetail() {
  const { id } = useParams();
  const route = ROUTES.find(r => r.id === id);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<'map' | 'schedule'>('map');
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!route) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <p className="text-gray-500">Ruta no encontrada</p>
      </div>
    );
  }

  const favorite = isFavorite(route.id);
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
    <div className="min-h-screen w-full bg-white pb-36">
      <Header title={route.name} />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Rutas', path: '/routes' },
        { label: route.name, path: `/route/${id}` }
      ]} />

      <div className="pt-[104px]">
        {/* Banner de próxima salida */}
        {next && (
          <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#2E7D32]" />
              <div>
                <p className="text-xs text-gray-600">Próxima salida</p>
                <p className="text-sm text-[#2E7D32]">{next.time} — {formatMinutesAway(next.minutesAway)}</p>
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
          <div className="mx-4 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-xs text-orange-700">⚠️ No hay más salidas hoy. El servicio reinicia mañana a las {route.firstDeparture}.</p>
          </div>
        )}

        {/* Info rápida */}
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          <div className="bg-[#F8F9FA] rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Primera</p>
            <p className="text-xs text-gray-900">{route.firstDeparture}</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-3 text-center">
            <MapPin className="w-4 h-4 text-gray-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Paradas</p>
            <p className="text-xs text-gray-900">{route.stops.length}</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-xl p-3 text-center">
            <Timer className="w-4 h-4 text-gray-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Duración</p>
            <p className="text-xs text-gray-900">~{route.estimatedDuration} min</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white sticky top-[104px] z-10 mt-4">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-sm transition-colors ${
              activeTab === 'map'
                ? 'text-[#2E7D32] border-b-2 border-[#2E7D32]'
                : 'text-gray-500'
            }`}
          >
            Recorrido
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 text-sm transition-colors ${
              activeTab === 'schedule'
                ? 'text-[#2E7D32] border-b-2 border-[#2E7D32]'
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
              {/* Mapa mejorado */}
              <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl mb-5 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 176">
                  <line x1="30" y1="140" x2="330" y2="36" stroke={route.color} strokeWidth="3" strokeLinecap="round" opacity="0.25" strokeDasharray="6,4" />
                  <path
                    d={`M 30,140 C 80,100 ${180 - 20},${88 - 20} 180,88 S 280,60 330,36`}
                    stroke={route.color}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {route.stops.map((_, i) => {
                    const total = route.stops.length - 1;
                    const x = 30 + (300 / total) * i;
                    const y = 140 - (104 / total) * i;
                    return (
                      <circle key={i} cx={x} cy={y} r={i === 0 || i === total ? 7 : 4}
                        fill={i === 0 || i === total ? route.color : 'white'}
                        stroke={route.color} strokeWidth="2"
                      />
                    );
                  })}
                </svg>
                <div className="absolute top-3 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs text-gray-700">
                  {route.origin}
                </div>
                <div className="absolute bottom-3 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs text-gray-700">
                  {route.destination}
                </div>
              </div>

              {/* Lista de paradas */}
              <h3 className="text-sm text-gray-900 mb-3">Paradas del recorrido</h3>
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
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: index === 0 || index === route.stops.length - 1 ? route.color : 'white', borderColor: route.color }}
                      />
                      {index < route.stops.length - 1 && (
                        <div
                          className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-8"
                          style={{ backgroundColor: route.color, opacity: 0.25 }}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-5">
                      <p className="text-sm text-gray-900">{stop}</p>
                      {index === 0 && (
                        <span className="inline-block text-[10px] text-white px-1.5 py-0.5 rounded mt-0.5" style={{ backgroundColor: route.color }}>
                          Origen
                        </span>
                      )}
                      {index === route.stops.length - 1 && (
                        <span className="inline-block text-[10px] text-white px-1.5 py-0.5 rounded mt-0.5" style={{ backgroundColor: route.color }}>
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
              {/* Info general */}
              <div className="bg-[#F8F9FA] rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Primera salida</span>
                  <span className="text-sm text-gray-900">{route.firstDeparture}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
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

              {/* Horarios del día */}
              <h3 className="text-sm text-gray-900 mb-3">Horarios del día</h3>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {route.schedules.map((time, index) => {
                  const isNext = next?.time === time;
                  const isPeak = isPeakHour(time);
                  return (
                    <div
                      key={index}
                      className={`p-2.5 rounded-lg text-center text-xs border transition-all ${
                        isNext
                          ? 'bg-green-100 border-[#2E7D32] ring-1 ring-[#2E7D32]'
                          : isPeak
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-[#F5F5F5] border-gray-200'
                      }`}
                    >
                      <Clock className={`w-3 h-3 mx-auto mb-0.5 ${
                        isNext ? 'text-[#2E7D32]' : isPeak ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                      <span className={isNext ? 'text-[#2E7D32]' : 'text-gray-900'}>{time}</span>
                      {isNext && <span className="block text-[9px] text-[#2E7D32] mt-0.5">Próximo</span>}
                      {!isNext && isPeak && <span className="block text-[9px] text-orange-600 mt-0.5">Pico</span>}
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-100 border border-[#2E7D32]" />
                  Próximo camión
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-50 border border-orange-200" />
                  Hora pico
                </div>
              </div>

              {/* Aclaración */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Horarios aproximados, pueden variar según condiciones de tráfico y clima.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones fijos abajo */}
      <div className="fixed bottom-20 left-0 right-0 max-w-[430px] mx-auto px-4 pb-3 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-[#2E7D32] transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{shareSuccess ? '¡Copiado!' : 'Compartir'}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleFavorite}
            className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-sm ${
              favorite
                ? 'bg-[#E53935] text-white'
                : 'bg-[#2E7D32] text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            {favorite ? 'Quitar favorito' : 'Guardar favorito'}
          </motion.button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
