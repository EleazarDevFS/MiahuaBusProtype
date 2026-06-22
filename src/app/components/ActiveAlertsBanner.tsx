import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStopAlerts } from '../context/StopAlertsContext';
import { ROUTES, getNextDeparture } from '../data/routes';

export function ActiveAlertsBanner() {
  const navigate = useNavigate();
  const { alerts, globalEnabled, activeAlertCount } = useStopAlerts();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);

  const activeAlerts = alerts.filter(a => a.enabled && globalEnabled);

  const upcoming = activeAlerts
    .map(alert => {
      const route = ROUTES.find(r => r.id === alert.routeId);
      if (!route) return null;
      const next = getNextDeparture(route.schedules);
      if (!next) return null;
      const minsUntilNotify = next.minutesAway - alert.minutesBefore;
      if (minsUntilNotify > 30 || minsUntilNotify < -5) return null;
      return { alert, route, next, minsUntilNotify };
    })
    .filter(Boolean)
    .sort((a, b) => (a!.minsUntilNotify > b!.minsUntilNotify ? 1 : -1));

  const top = upcoming.find(u => !dismissed.includes(u!.alert.id));

  useEffect(() => {
    if (top && top.minsUntilNotify <= 0 && top.minsUntilNotify >= -2) {
      setVisible(true);
    }
  }, [top?.alert.id, top?.minsUntilNotify]);

  if (!top || !visible) return null;

  const { alert, route, next } = top;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="mx-4 mb-3 overflow-hidden rounded-xl border border-[#F57F17] bg-gradient-to-r from-amber-50 to-orange-50 shadow-md"
      >
        <div className="flex items-start gap-3 p-3">
          <div className="flex h-10 w-10 flex-shrink-0 animate-pulse items-center justify-center rounded-full bg-[#F57F17]">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-[#E65100]">
              Alerta de parada
            </p>
            <p className="text-sm font-semibold text-gray-900">
              Camión hacia {alert.stopName}
            </p>
            <p className="text-xs text-gray-600">
              {route.name} · Salida {next.time} ·{' '}
              {top.minsUntilNotify <= 0
                ? '¡Prepárate, está por llegar!'
                : `Te avisamos en ~${top.minsUntilNotify} min`}
            </p>
          </div>
          <button
            onClick={() => {
              setDismissed(d => [...d, alert.id]);
              setVisible(false);
            }}
            className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white/60"
            aria-label="Cerrar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => navigate(`/route/${route.id}`)}
          className="flex w-full items-center justify-center gap-1 border-t border-amber-200 bg-white/50 py-2 text-xs font-medium text-[#2E7D32]"
        >
          Ver en mapa <ChevronRight className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
