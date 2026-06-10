import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, MapPin, Clock, ChevronRight, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { ROUTES, FREQUENT_ROUTES, getNextDeparture } from '../data/routes';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const frequentRoutes = FREQUENT_ROUTES.map(fr =>
    ROUTES.find(r => r.id === fr.routeId)
  ).filter(Boolean);

  const timeStr = currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="MiahuaBus" showBack={false} />

      <div className="pt-14">
        {/* Banner de saludo con hora */}
        <div className="bg-[#2E7D32] px-4 py-5">
          <p className="text-green-100 text-xs capitalize mb-0.5">{dateStr}</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-lg">{getGreeting(user?.name || 'Usuario')}</h1>
              <p className="text-green-200 text-xs mt-0.5">¿A dónde vas hoy?</p>
            </div>
            <div className="text-right">
              <p className="text-white text-xl tabular-nums">{timeStr}</p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#F5F5F5] rounded-xl border border-gray-200 hover:border-[#2E7D32] transition-colors"
          >
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500 text-sm">¿A dónde quieres ir?</span>
          </button>
        </div>

        {/* Mapa estático */}
        <div className="relative h-52 bg-gradient-to-br from-green-50 to-emerald-100 border-b border-gray-200">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 430 208">
            {/* Calles de fondo */}
            <line x1="215" y1="0" x2="215" y2="208" stroke="#d1fae5" strokeWidth="6" />
            <line x1="0" y1="104" x2="430" y2="104" stroke="#d1fae5" strokeWidth="6" />
            <line x1="0" y1="50" x2="430" y2="150" stroke="#d1fae5" strokeWidth="3" opacity="0.5" />
            {/* Rutas */}
            <path d="M 215,104 Q 310,40 390,20" stroke="#2E7D32" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 215,104 Q 130,60 50,35" stroke="#1976D2" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 215,104 Q 300,150 390,180" stroke="#F57C00" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 215,104 Q 140,155 60,185" stroke="#7B1FA2" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 215,104 Q 320,104 400,104" stroke="#D32F2F" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            <path d="M 215,104 Q 215,165 215,200" stroke="#00796B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            {/* Punto central con anillo */}
            <circle cx="215" cy="104" r="14" fill="#2E7D32" opacity="0.15" />
            <circle cx="215" cy="104" r="8" fill="white" />
            <circle cx="215" cy="104" r="5" fill="#2E7D32" />
          </svg>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs text-gray-700">
            Centro
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm text-xs text-gray-600">
            {ROUTES.length} rutas activas
          </div>

          {/* Botón ver planificador */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/planner')}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#2E7D32] text-white px-3 py-1.5 rounded-lg shadow-md text-xs"
          >
            <Zap className="w-3 h-3" />
            Planificar viaje
          </motion.button>
        </div>

        {/* Próximas salidas */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 text-sm">Próximas salidas</h2>
            <button
              onClick={() => navigate('/routes')}
              className="text-xs text-[#2E7D32] flex items-center gap-0.5"
            >
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {frequentRoutes.map((route) => {
              const next = getNextDeparture(route!.schedules);
              return (
                <motion.button
                  key={route!.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/route/${route!.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-xl border border-gray-100 hover:border-[#2E7D32] transition-colors text-left"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: route!.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{route!.name}</p>
                    <p className="text-xs text-gray-500 truncate">{route!.destination}</p>
                  </div>
                  {next ? (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[#2E7D32]">{next.time}</p>
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

        {/* Acceso rápido a favoritos */}
        {favorites.length > 0 && (
          <div className="px-4 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-gray-900 text-sm">Tus favoritos</h2>
              <button
                onClick={() => navigate('/favorites')}
                className="text-xs text-[#2E7D32] flex items-center gap-0.5"
              >
                Ver todos <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {favorites.slice(0, 3).map((route) => {
                const next = getNextDeparture(route.schedules);
                return (
                  <motion.button
                    key={route.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/route/${route.id}`)}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#2E7D32] transition-colors text-left"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: route.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{route.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {route.origin} → {route.destination}
                      </p>
                    </div>
                    {next && (
                      <span className="text-xs text-[#2E7D32] flex-shrink-0">
                        {formatMinutesAway(next.minutesAway)}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Acceso rápido a destinos */}
        <div className="px-4 py-4 bg-white">
          <h2 className="text-gray-900 text-sm mb-3">Destinos populares</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'UNSIS', icon: '🎓', q: 'UNSIS' },
              { label: 'Hospital', icon: '🏥', q: 'Hospital' },
              { label: 'Cefereso', icon: '🏢', q: 'Cefereso' },
              { label: 'San Sebastián', icon: '⛪', q: 'San Sebastián' },
            ].map((dest) => (
              <motion.button
                key={dest.label}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate(`/search/results?q=${encodeURIComponent(dest.q)}`)}
                className="flex flex-col items-center gap-1.5 p-3 bg-[#F8F9FA] rounded-xl hover:bg-green-50 hover:border-[#2E7D32] border border-transparent transition-all"
              >
                <span className="text-xl">{dest.icon}</span>
                <span className="text-[10px] text-gray-600 text-center leading-tight">{dest.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
