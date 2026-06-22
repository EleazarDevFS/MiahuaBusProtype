import React from 'react';
import { useNavigate } from 'react-router';
import { Bell, BellOff, BellRing, Clock, Info, MapPin, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { StaticMap } from '../components/StaticMap';
import { motion } from 'motion/react';
import { ROUTES } from '../data/routes';
import { useStopAlerts } from '../context/StopAlertsContext';

export default function Notifications() {
  const navigate = useNavigate();
  const {
    alerts,
    globalEnabled,
    setGlobalEnabled,
    toggleAlert,
    removeAlert,
    activeAlertCount,
  } = useStopAlerts();

  const alertsByRoute = ROUTES.map(route => ({
    route,
    items: alerts.filter(a => a.routeId === route.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Alertas de parada" />
      <Breadcrumb
        items={[
          { label: 'Inicio', path: '/home' },
          { label: 'Alertas', path: '/notifications' },
        ]}
      />

      <div className="px-4 py-4 pt-[104px]">
        {/* Hero */}
        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#F57F17] to-[#E65100] p-4 text-white shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">Tus alertas de parada</p>
              <p className="mt-0.5 text-sm text-orange-100">
                {activeAlertCount > 0
                  ? `${activeAlertCount} alerta${activeAlertCount > 1 ? 's' : ''} activa${activeAlertCount > 1 ? 's' : ''}`
                  : 'Ninguna alerta configurada aún'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/route/${ROUTES[0].id}`)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[#E65100]"
          >
            <MapPin className="h-4 w-4" />
            Elegir parada en el mapa
          </button>
        </div>

        {/* Global toggle */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Alertas globales</p>
              <p className="text-xs text-gray-500">
                {globalEnabled ? 'Recibirás avisos simulados' : 'Todas las alertas pausadas'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGlobalEnabled(!globalEnabled)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              globalEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                globalEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            Las alertas son simuladas en este prototipo. Configúralas desde el detalle de cualquier
            ruta tocando el botón naranja en una parada.
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="py-8 text-center">
            <BellOff className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="mb-1 font-medium text-gray-900">Sin alertas configuradas</p>
            <p className="mb-4 text-sm text-gray-500">
              Abre una ruta, selecciona una parada en el mapa y activa tu alerta
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertsByRoute.map(({ route, items }) => (
              <div key={route.id}>
                <button
                  onClick={() => navigate(`/route/${route.id}`)}
                  className="mb-2 flex w-full items-center gap-2 text-left"
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                  <span className="text-sm font-semibold text-gray-900">{route.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <StaticMap
                    routeId={route.id}
                    stops={route.stops}
                    color={route.color}
                    height="100px"
                    interactive={false}
                    alertStopIndices={items.filter(a => a.enabled).map(a => a.stopIndex)}
                    className="rounded-none rounded-t-xl"
                  />

                  <div className="divide-y divide-gray-100">
                    {items.map(alert => (
                      <motion.div
                        key={alert.id}
                        layout
                        className={`flex items-center gap-3 p-3 ${
                          alert.enabled && globalEnabled ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F57F17] text-xs font-bold text-white">
                          {alert.stopIndex + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {alert.stopName}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {alert.minutesBefore} min antes
                            {alert.notifyOnApproach && ' · Acercándose'}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className={`relative h-6 w-10 flex-shrink-0 rounded-full transition-colors ${
                            alert.enabled && globalEnabled ? 'bg-[#2E7D32]' : 'bg-gray-200'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              alert.enabled && globalEnabled ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          aria-label="Eliminar alerta"
                        >
                          <BellOff className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
