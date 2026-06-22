import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Zap,
  BellRing,
  Star,
  TrendingUp,
  Map,
  Navigation,
  Bell,
} from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { ActiveAlertsBanner } from '../components/ActiveAlertsBanner';
import { motion } from 'motion/react';
import { ROUTES, getNextDeparture } from '../data/routes';
import { useAuth } from '../context/AuthContext';
import { useUserRoutes } from '../context/UserRoutesContext';
import { useStopAlerts } from '../context/StopAlertsContext';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `¡Buenos días, ${name.split(' ')[0]}!`;
  if (hour < 19) return `¡Buenas tardes, ${name.split(' ')[0]}!`;
  return `¡Buenas noches, ${name.split(' ')[0]}!`;
}

function formatMinutesAway(mins: number): string {
  if (mins <= 1) return 'Ahora mismo';
  if (mins < 60) return `En ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `En ${h}h ${m}min` : `En ${h}h`;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedRoutes } = useUserRoutes();
  const { alerts, globalEnabled, activeAlertCount } = useStopAlerts();
  const [currentTime, setCurrentTime] = useState(new Date());

  const activeAlerts = alerts.filter(a => a.enabled && globalEnabled).slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = currentTime.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const nextDepartureRoutes = ROUTES.slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="MiahuaBus" showBack={false} />

      <div className="pt-14">
        {/* Banner con mapa interactivo */}
        <div className="relative overflow-hidden bg-[#1a1a2e]">
          <div className="absolute inset-0">
            <StaticMap
              showAllRoutes
              interactive={false}
              height="220px"
              className="rounded-none opacity-90"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

          <div className="relative z-10 px-4 pb-5 pt-4">
            <p className="mb-1 text-xs capitalize text-green-100">{dateStr}</p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  {getGreeting(user?.name || 'Usuario')}
                </h1>
                <p className="mt-1 text-sm text-green-200">¿A dónde necesitas ir hoy?</p>
              </div>
              <div className="rounded-lg bg-white/15 px-3 py-2 text-right backdrop-blur-sm">
                <p className="text-lg font-semibold tabular-nums text-white">{timeStr}</p>
                <p className="text-[10px] text-green-200">Hora actual</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm">
                <Map className="h-3 w-3 text-green-300" />
                <span className="text-[10px] text-white">Miahuatlán, Oaxaca</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-[#2E7D32]/80 px-2.5 py-1">
                <Navigation className="h-3 w-3 text-white" />
                <span className="text-[10px] text-white">{ROUTES.length} rutas activas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative z-20 -mt-4 px-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/search')}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-lg transition-all hover:border-[#2E7D32] hover:shadow-md"
          >
            <Search className="h-5 w-5 text-[#2E7D32]" />
            <span className="text-sm font-medium text-gray-500">Buscar ruta o parada...</span>
            <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
          </motion.button>
        </div>

        <div className="mt-3 px-4">
          <ActiveAlertsBanner />
        </div>

        {/* Acciones rápidas */}
        <div className="mt-2 border-b border-gray-100 bg-white px-4 py-4">
          <div className="grid grid-cols-4 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/planner')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-[#A5D6A7] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] p-2.5 transition-shadow hover:shadow-md"
            >
              <Zap className="h-5 w-5 text-[#2E7D32]" />
              <span className="text-center text-[10px] font-medium text-gray-800">Planificar</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/routes')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-[#90CAF9] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] p-2.5 transition-shadow hover:shadow-md"
            >
              <MapPin className="h-5 w-5 text-[#1976D2]" />
              <span className="text-center text-[10px] font-medium text-gray-800">Mis rutas</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/notifications')}
              className="relative flex flex-col items-center justify-center gap-1.5 rounded-lg border border-[#FFCC80] bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] p-2.5 transition-shadow hover:shadow-md"
            >
              {activeAlertCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F57F17] text-[9px] font-bold text-white">
                  {activeAlertCount}
                </span>
              )}
              <BellRing className="h-5 w-5 text-[#F57F17]" />
              <span className="text-center text-[10px] font-medium text-gray-800">Alertas</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-2.5 transition-shadow hover:shadow-md"
            >
              <Search className="h-5 w-5 text-gray-600" />
              <span className="text-center text-[10px] font-medium text-gray-800">Explorar</span>
            </motion.button>
          </div>
        </div>

        {/* Alertas de parada — sección visible */}
        <div className="border-b border-gray-100 bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#F57F17]" />
              <h2 className="text-sm font-semibold text-gray-900">Alertas de parada</h2>
              {activeAlertCount > 0 && (
                <span className="rounded-full bg-[#F57F17] px-2 py-0.5 text-xs text-white">
                  {activeAlertCount}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="flex items-center gap-0.5 text-xs font-medium text-[#F57F17]"
            >
              Gestionar <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {activeAlerts.length === 0 ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/route/${ROUTES[0].id}`)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 text-left"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F57F17]">
                <BellRing className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Configura tu primera alerta</p>
                <p className="text-xs text-gray-600">
                  Abre una ruta, elige una parada en el mapa y activa avisos antes de que llegue el
                  camión
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-[#F57F17]" />
            </motion.button>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map(alert => {
                const r = ROUTES.find(x => x.id === alert.routeId);
                return (
                  <motion.button
                    key={alert.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/route/${alert.routeId}`)}
                    className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-3 text-left"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#F57F17]">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{alert.stopName}</p>
                      <p className="text-xs text-gray-500">
                        {r?.name} · Aviso {alert.minutesBefore} min antes
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rutas guardadas */}
        {savedRoutes.length > 0 && (
          <div className="border-b border-gray-100 bg-white px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[#F57F17]" />
                <h2 className="text-sm font-semibold text-gray-900">Mis rutas guardadas</h2>
                <span className="rounded-full bg-[#2E7D32] px-2 py-0.5 text-xs text-white">
                  {savedRoutes.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/routes')}
                className="flex items-center gap-0.5 text-xs font-medium text-[#2E7D32] transition-all hover:gap-1"
              >
                Ver todas <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {savedRoutes.slice(0, 3).map(route => (
                <motion.button
                  key={route.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/route/${route.routeId}`)}
                  className="w-full overflow-hidden rounded-xl border border-green-200 bg-white text-left shadow-sm transition-all hover:border-[#2E7D32] hover:shadow-md"
                >
                  <StaticMap
                    routeId={route.routeId}
                    color="#2E7D32"
                    height="80px"
                    interactive={false}
                    className="rounded-none rounded-t-xl"
                  />
                  <div className="flex items-center gap-3 p-3">
                    <div className="h-8 w-2 flex-shrink-0 rounded-full bg-[#2E7D32]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{route.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {route.origin} → {route.destination}
                      </p>
                    </div>
                    {route.isFavorite && (
                      <Star className="h-4 w-4 flex-shrink-0 fill-[#F57F17] text-[#F57F17]" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Estado sin rutas */}
        {savedRoutes.length === 0 && (
          <div className="border-b border-gray-100 bg-white px-4 py-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
                <MapPin className="h-6 w-6 text-[#1976D2]" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">Sin rutas guardadas</h3>
              <p className="mb-3 text-xs text-gray-500">
                Planifica un viaje y usa el botón &quot;Guardar en Mis rutas&quot; para acceder
                rápido
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/planner')}
                className="rounded-lg bg-[#2E7D32] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1B5E20]"
              >
                Planificar viaje
              </motion.button>
            </div>
          </div>
        )}

        {/* Próximas salidas con mini mapas */}
        <div className="border-b border-gray-100 bg-white px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2E7D32]" />
              <h2 className="text-sm font-semibold text-gray-900">Próximas salidas</h2>
            </div>
            <button
              onClick={() => navigate('/routes')}
              className="flex items-center gap-0.5 text-xs font-medium text-[#2E7D32]"
            >
              Ver todas <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {nextDepartureRoutes.map(route => {
              const next = getNextDeparture(route.schedules);
              return (
                <motion.button
                  key={route.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/route/${route.id}`)}
                  className="group w-full overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:border-[#2E7D32] hover:shadow-md"
                >
                  <StaticMap
                    routeId={route.id}
                    color={route.color}
                    height="90px"
                    interactive={false}
                    className="rounded-none rounded-t-xl"
                  />
                  <div className="flex items-center gap-3 p-3">
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full transition-transform group-hover:scale-125"
                      style={{ backgroundColor: route.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{route.name}</p>
                      <p className="truncate text-xs text-gray-500">{route.destination}</p>
                    </div>
                    {next ? (
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-semibold text-[#2E7D32]">{next.time}</p>
                        <p className="flex items-center justify-end gap-0.5 text-[10px] text-gray-400">
                          <Clock className="h-2.5 w-2.5" />
                          {formatMinutesAway(next.minutesAway)}
                        </p>
                      </div>
                    ) : (
                      <span className="flex-shrink-0 text-[10px] text-gray-400">
                        Sin más salidas
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Banner informativo */}
        <div className="bg-white px-4 py-4">
          <div className="flex gap-3 rounded-xl border border-[#F57F17] bg-gradient-to-r from-amber-50 to-orange-50 p-3">
            <BellRing className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F57F17]" />
            <div className="text-sm">
              <p className="font-medium text-gray-800">¿Esperas el camión en una parada?</p>
              <p className="mt-0.5 text-xs text-gray-600">
                Activa alertas de parada y te avisamos minutos antes de que llegue. Toca el botón
                naranja en cualquier parada del mapa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
