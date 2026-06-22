import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Clock, ChevronRight, Zap, Briefcase, AlertCircle, Star, TrendingUp } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { ROUTES, getNextDeparture } from '../data/routes';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useUserRoutes } from '../context/UserRoutesContext';

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
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const { savedRoutes } = useUserRoutes();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  const nextDepartureRoutes = ROUTES.slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="MiahuaBus" showBack={false} />

      <div className="pt-14">
        {/* Banner principal de saludo */}
        <div className="relative bg-gradient-to-br from-[#2E7D32] via-[#1E5A2B] to-[#0D3B1A] px-4 py-6 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <path d="M0,50 Q25,25 50,50 T100,50" stroke="white" strokeWidth="2" fill="none" />
              <path d="M0,30 Q25,5 50,30 T100,30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M0,70 Q25,45 50,70 T100,70" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
            </svg>
          </div>

          <div className="relative z-10">
            <p className="text-green-100 text-xs capitalize mb-1">{dateStr}</p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-white text-2xl font-bold">{getGreeting(user?.name || 'Usuario')}</h1>
                <p className="text-green-200 text-sm mt-1">¿A dónde necesitas ir?</p>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                <p className="text-white text-lg font-semibold tabular-nums">{timeStr}</p>
                <p className="text-green-200 text-[10px]">Hora actual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 -mt-5 relative z-20">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/search')}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-[#F5F5F5] to-[#FAFAFA] rounded-xl border border-gray-200 hover:border-[#2E7D32] hover:shadow-md transition-all"
          >
            <Search className="w-5 h-5 text-[#2E7D32]" />
            <span className="text-gray-500 text-sm font-medium">Buscar ruta...</span>
            <div className="ml-auto">
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </motion.button>
        </div>

        {/* Acciones rápidas */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/planner')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-lg border border-[#A5D6A7] hover:shadow-md transition-shadow"
            >
              <Zap className="w-6 h-6 text-[#2E7D32]" />
              <span className="text-xs text-gray-800 font-medium text-center">Planificar</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/routes')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-lg border border-[#90CAF9] hover:shadow-md transition-shadow"
            >
              <MapPin className="w-6 h-6 text-[#1976D2]" />
              <span className="text-xs text-gray-800 font-medium text-center">Mis rutas</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] rounded-lg border border-[#FFCC80] hover:shadow-md transition-shadow"
            >
              <Briefcase className="w-6 h-6 text-[#F57C00]" />
              <span className="text-xs text-gray-800 font-medium text-center">Perfil</span>
            </motion.button>
          </div>
        </div>

        {/* Rutas guardadas */}
        {savedRoutes.length > 0 && (
          <div className="px-4 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F57F17]" />
                <h2 className="text-gray-900 text-sm font-semibold">Mis rutas guardadas</h2>
                <span className="text-xs bg-[#2E7D32] text-white px-2 py-0.5 rounded-full">
                  {savedRoutes.length}
                </span>
              </div>
              <button
                onClick={() => navigate('/routes')}
                className="text-xs text-[#2E7D32] font-medium flex items-center gap-0.5 hover:gap-1 transition-all"
              >
                Ver todas <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {savedRoutes.slice(0, 3).map((route) => (
                <motion.button
                  key={route.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/route/${route.routeId}`)}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-[#F0F9FF] to-[#F8F9FA] rounded-xl border border-green-200 hover:border-[#2E7D32] hover:shadow-sm transition-all text-left"
                >
                  <div className="w-2 h-8 rounded-full bg-[#2E7D32]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">{route.origin}</p>
                    <p className="text-xs text-gray-500 truncate">→ {route.destination}</p>
                  </div>
                  {route.isFavorite && (
                    <Star className="w-4 h-4 text-[#F57F17] fill-[#F57F17] flex-shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Estado sin rutas */}
        {savedRoutes.length === 0 && (
          <div className="px-4 py-6 bg-white border-b border-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-[#1976D2]" />
              </div>
              <h3 className="text-gray-900 text-sm font-semibold mb-1">Sin rutas guardadas</h3>
              <p className="text-gray-500 text-xs mb-3">
                Planifica tu primera ruta y guárdala para acceder rápidamente
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/planner')}
                className="text-xs bg-[#2E7D32] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1B5E20] transition-colors"
              >
                Crear ruta
              </motion.button>
            </div>
          </div>
        )}

        {/* Próximas salidas */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2E7D32]" />
              <h2 className="text-gray-900 text-sm font-semibold">Próximas salidas</h2>
            </div>
            <button
              onClick={() => navigate('/routes')}
              className="text-xs text-[#2E7D32] font-medium flex items-center gap-0.5"
            >
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {nextDepartureRoutes.map((route) => {
              const next = getNextDeparture(route.schedules);
              return (
                <motion.button
                  key={route.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/route/${route.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-xl border border-gray-100 hover:border-[#2E7D32] hover:bg-white transition-all text-left group"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: route.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">{route.name}</p>
                    <p className="text-xs text-gray-500 truncate">{route.destination}</p>
                  </div>
                  {next ? (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-[#2E7D32]">{next.time}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-0.5 justify-end">
                        <Clock className="w-2.5 h-2.5" />
                        {formatMinutesAway(next.minutesAway)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">Sin más salidas</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Banner informativo */}
        <div className="px-4 py-4 bg-white">
          <div className="flex gap-3 p-3 bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] rounded-xl border border-[#FFB74D]">
            <AlertCircle className="w-5 h-5 text-[#E65100] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-800 font-medium">Consejo: Ahorra tiempo</p>
              <p className="text-gray-600 text-xs mt-0.5">
                Guarda tus rutas frecuentes para acceder a ellas en un toque
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}