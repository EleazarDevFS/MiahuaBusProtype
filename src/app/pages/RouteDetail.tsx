import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Heart,
  Clock,
  MapPin,
  Share2,
  Timer,
  Info,
  BookmarkPlus,
  Check,
  Bell,
  BellRing,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { SaveRouteModal } from '../components/SaveRouteModal';
import { StopAlertSheet } from '../components/StopAlertSheet';
import { motion } from 'motion/react';
import { ROUTES, isPeakHour, getNextDeparture, getLastDeparted } from '../data/routes';
import { useFavorites } from '../context/FavoritesContext';
import { useUserRoutes } from '../context/UserRoutesContext';
import { useStopAlerts } from '../context/StopAlertsContext';

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
  const { getAlertsForRoute, hasAlertOnStop, globalEnabled } = useStopAlerts();

  const [activeTab, setActiveTab] = useState<'stops' | 'schedule' | 'alerts'>('stops');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);
  const [alertSheetStop, setAlertSheetStop] = useState<number | null>(null);
  const stopListRef = useRef<HTMLDivElement>(null);

  const routeAlerts = useMemo(
    () => (route ? getAlertsForRoute(route.id) : []),
    [route, getAlertsForRoute]
  );

  const alertStopIndices = useMemo(
    () =>
      routeAlerts.filter(a => a.enabled && globalEnabled).map(a => a.stopIndex),
    [routeAlerts, globalEnabled]
  );

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
  const routeAlertCount = routeAlerts.filter(a => a.enabled && globalEnabled).length;

  const handleSelectStop = (index: number) => {
    setSelectedStopIndex(index);
    setActiveTab('stops');
    setTimeout(() => {
      document.getElementById(`stop-row-${index}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  const openAlertSheet = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAlertSheetStop(index);
    setSelectedStopIndex(index);
  };

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
      // cancelled
    }
  };

  const modalOpen = showSaveModal || alertSheetStop !== null;

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-44">
      <Header title={route.name} />
      <Breadcrumb
        items={[
          { label: 'Inicio', path: '/home' },
          { label: 'Rutas', path: '/routes' },
          { label: route.name, path: `/route/${id}` },
        ]}
      />

      <div className="pt-[104px]">
        {/* Mapa interactivo */}
        <div className="mx-4 mt-4 overflow-hidden rounded-xl shadow-md ring-1 ring-gray-200">
          <StaticMap
            routeId={route.id}
            stops={route.stops}
            color={route.color}
            height="280px"
            interactive
            showStopLabels
            selectedStopIndex={selectedStopIndex}
            alertStopIndices={alertStopIndices}
            onStopSelect={handleSelectStop}
            simulateBus
            estimatedDuration={route.estimatedDuration}
          />
        </div>

        {/* CTA alertas — muy visible */}
        <div className="mx-4 mt-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveTab('stops');
              if (selectedStopIndex === null) {
                setSelectedStopIndex(0);
                openAlertSheet(0);
              } else {
                openAlertSheet(selectedStopIndex);
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-[#F57F17] bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 shadow-sm"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#F57F17]">
              <BellRing className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-gray-900">
                {routeAlertCount > 0
                  ? `${routeAlertCount} alerta${routeAlertCount > 1 ? 's' : ''} activa${routeAlertCount > 1 ? 's' : ''}`
                  : 'Activar alerta de parada'}
              </p>
              <p className="text-xs text-gray-600">
                Toca una parada en el mapa o en la lista para recibir avisos
              </p>
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#F57F17]" />
          </motion.button>
        </div>

        {next && (
          <div className="mx-4 mt-3 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
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
          <div className="mx-4 mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs text-orange-700">
              No hay más salidas hoy. Reinicia mañana a las {route.firstDeparture}.
            </p>
          </div>
        )}

        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <Clock className="mx-auto mb-1 h-4 w-4 text-gray-500" />
            <p className="text-[10px] text-gray-500">Primera</p>
            <p className="text-xs font-medium text-gray-900">{route.firstDeparture}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <MapPin className="mx-auto mb-1 h-4 w-4 text-gray-500" />
            <p className="text-[10px] text-gray-500">Paradas</p>
            <p className="text-xs font-medium text-gray-900">{route.stops.length}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <Bell className="mx-auto mb-1 h-4 w-4 text-[#F57F17]" />
            <p className="text-[10px] text-gray-500">Alertas</p>
            <p className="text-xs font-medium text-gray-900">{routeAlertCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[104px] z-10 mt-4 flex border-b border-gray-200 bg-white">
          {(
            [
              { id: 'stops' as const, label: 'Paradas' },
              { id: 'schedule' as const, label: 'Horarios' },
              { id: 'alerts' as const, label: `Alertas${routeAlertCount ? ` (${routeAlertCount})` : ''}` },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-medium transition-colors sm:text-sm ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#2E7D32] text-[#2E7D32]'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-4" ref={stopListRef}>
          {activeTab === 'stops' && (
            <div>
              <p className="mb-3 text-xs text-gray-500">
                <Navigation className="mr-1 inline h-3 w-3" />
                Selecciona una parada para verla en el mapa o activar alertas
              </p>
              <div className="space-y-2">
                {route.stops.map((stop, index) => {
                  const isSelected = selectedStopIndex === index;
                  const hasAlert = hasAlertOnStop(route.id, index);
                  return (
                    <motion.div
                      key={index}
                      id={`stop-row-${index}`}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelectStop(index)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-[#2E7D32] bg-green-50 shadow-sm ring-1 ring-[#2E7D32]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: route.color }}
                          >
                            {index + 1}
                          </div>
                          {hasAlert && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F57F17] text-[8px]">
                              🔔
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{stop}</p>
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {index === 0 && (
                              <span
                                className="rounded px-1.5 py-0.5 text-[10px] text-white"
                                style={{ backgroundColor: route.color }}
                              >
                                Origen
                              </span>
                            )}
                            {index === route.stops.length - 1 && (
                              <span
                                className="rounded px-1.5 py-0.5 text-[10px] text-white"
                                style={{ backgroundColor: route.color }}
                              >
                                Destino
                              </span>
                            )}
                            {hasAlert && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-[#E65100]">
                                Alerta activa
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={e => openAlertSheet(index, e)}
                          className={`flex flex-shrink-0 flex-col items-center gap-0.5 rounded-lg px-2.5 py-2 transition-colors ${
                            hasAlert
                              ? 'bg-[#F57F17] text-white'
                              : 'border border-amber-200 bg-amber-50 text-[#E65100] hover:bg-amber-100'
                          }`}
                        >
                          <Bell className="h-4 w-4" />
                          <span className="text-[9px] font-medium">
                            {hasAlert ? 'Editar' : 'Alerta'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
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
                      className={`rounded-lg border p-2.5 text-center text-xs ${
                        isNext
                          ? 'border-[#2E7D32] bg-green-100 ring-1 ring-[#2E7D32]'
                          : isPeak
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Clock
                        className={`mx-auto mb-0.5 h-3 w-3 ${
                          isNext ? 'text-[#2E7D32]' : isPeak ? 'text-orange-600' : 'text-gray-400'
                        }`}
                      />
                      <span className={isNext ? 'text-[#2E7D32]' : 'text-gray-900'}>{time}</span>
                      {isNext && (
                        <span className="mt-0.5 block text-[9px] text-[#2E7D32]">Próximo</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <p className="text-xs text-blue-800">
                  Horarios aproximados. Activa alertas en la pestaña Paradas para no perder tu camión.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              {routeAlerts.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <Bell className="h-7 w-7 text-[#F57F17]" />
                  </div>
                  <p className="mb-1 font-medium text-gray-900">Sin alertas en esta ruta</p>
                  <p className="mb-4 text-xs text-gray-500">
                    Ve a Paradas y toca el botón naranja &quot;Alerta&quot; en cualquier parada
                  </p>
                  <button
                    onClick={() => setActiveTab('stops')}
                    className="rounded-lg bg-[#F57F17] px-4 py-2 text-sm text-white"
                  >
                    Elegir parada
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {routeAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`rounded-xl border p-3 ${
                        alert.enabled && globalEnabled
                          ? 'border-[#F57F17] bg-amber-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{alert.stopName}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Aviso {alert.minutesBefore} min antes
                            {alert.notifyOnApproach && ' · Camión acercándose'}
                            {alert.notifyOnDeparture && ' · Antes de salida'}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            alert.enabled && globalEnabled
                              ? 'bg-[#F57F17] text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {alert.enabled && globalEnabled ? 'Activa' : 'Pausada'}
                        </span>
                      </div>
                      <button
                        onClick={() => openAlertSheet(alert.stopIndex)}
                        className="mt-2 text-xs font-medium text-[#2E7D32]"
                      >
                        Editar alerta →
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/notifications')}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Ver todas las alertas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!modalOpen && (
        <div className="fixed bottom-20 left-0 right-0 z-30 mx-auto max-w-[430px] bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent px-4 pb-3 pt-4">
          <div className="flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSaveModal(true)}
              disabled={savedInMyRoutes}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium shadow-md ${
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm text-gray-700"
              >
                <Share2 className="h-4 w-4" />
                {shareSuccess ? '¡Copiado!' : 'Compartir'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleFavorite}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm ${
                  favorite
                    ? 'border border-red-200 bg-red-50 text-[#E53935]'
                    : 'border border-gray-200 bg-white text-gray-700'
                }`}
              >
                <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
                Favorito
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => openAlertSheet(selectedStopIndex ?? 0)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs text-gray-600"
              >
                <Bell className={`h-3.5 w-3.5 ${routeAlertCount > 0 ? 'text-[#F57F17]' : 'text-gray-400'}`} />
                Alertas
                {routeAlertCount > 0 && (
                  <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-medium text-[#E65100]">
                    {routeAlertCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <SaveRouteModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        routeId={route.id}
        origin={route.origin}
        destination={route.destination}
        defaultName={route.name}
        onSaved={() => navigate('/routes')}
      />

      {alertSheetStop !== null && (
        <StopAlertSheet
          isOpen={alertSheetStop !== null}
          onClose={() => setAlertSheetStop(null)}
          routeId={route.id}
          routeName={route.name}
          routeColor={route.color}
          stopIndex={alertSheetStop}
          stopName={route.stops[alertSheetStop]}
        />
      )}

      <BottomNav />
    </div>
  );
}
