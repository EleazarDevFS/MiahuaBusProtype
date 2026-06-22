import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, Clock, MapPin, X, Bus } from 'lucide-react';
import { useStopAlerts } from '../context/StopAlertsContext';

export interface StopAlertSheetProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  routeName: string;
  routeColor: string;
  stopIndex: number;
  stopName: string;
}

export function StopAlertSheet({
  isOpen,
  onClose,
  routeId,
  routeName,
  routeColor,
  stopIndex,
  stopName,
}: StopAlertSheetProps) {
  const { getAlertForStop, addOrUpdateAlert, removeAlert, globalEnabled } = useStopAlerts();
  const existing = getAlertForStop(routeId, stopIndex);

  const [minutesBefore, setMinutesBefore] = useState(10);
  const [notifyOnApproach, setNotifyOnApproach] = useState(true);
  const [notifyOnDeparture, setNotifyOnDeparture] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setMinutesBefore(existing?.minutesBefore ?? 10);
      setNotifyOnApproach(existing?.notifyOnApproach ?? true);
      setNotifyOnDeparture(existing?.notifyOnDeparture ?? false);
      setEnabled(existing?.enabled ?? true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, existing]);

  const handleSave = () => {
    addOrUpdateAlert({
      routeId,
      stopIndex,
      stopName,
      minutesBefore,
      notifyOnApproach,
      notifyOnDeparture,
      enabled: enabled && globalEnabled,
    });
    onClose();
  };

  const handleRemove = () => {
    if (existing) removeAlert(existing.id);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[430px] rounded-t-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-4 pb-24 pt-2">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${routeColor}20` }}
                  >
                    <Bell className="h-5 w-5" style={{ color: routeColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Alerta de parada</h3>
                    <p className="mt-0.5 text-xs text-gray-500">{routeName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-gray-200 bg-[#F8F9FA] p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: routeColor }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stopName}</p>
                    <p className="text-xs text-gray-500">Parada #{stopIndex + 1}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Activar alerta</p>
                  <p className="text-xs text-gray-500">Recibir avisos para esta parada</p>
                </div>
                <button
                  onClick={() => setEnabled(v => !v)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    enabled ? 'bg-[#2E7D32]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="mb-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Clock className="h-3.5 w-3.5" />
                  Avisarme con anticipación de:
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setMinutesBefore(mins)}
                      className={`rounded-lg py-2.5 text-xs font-medium transition-colors ${
                        minutesBefore === mins
                          ? 'bg-[#2E7D32] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5 space-y-2">
                <button
                  onClick={() => setNotifyOnApproach(v => !v)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    notifyOnApproach
                      ? 'border-[#2E7D32] bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Bus className={`h-5 w-5 ${notifyOnApproach ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Camión acercándose</p>
                    <p className="text-xs text-gray-500">
                      Te avisamos {minutesBefore} min antes de que llegue a esta parada
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setNotifyOnDeparture(v => !v)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    notifyOnDeparture
                      ? 'border-[#2E7D32] bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Bell className={`h-5 w-5 ${notifyOnDeparture ? 'text-[#2E7D32]' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Antes de la salida</p>
                    <p className="text-xs text-gray-500">
                      Recordatorio antes de que salga el camión del origen
                    </p>
                  </div>
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  Las alertas son simuladas en este prototipo. En la app final recibirás
                  notificaciones push en tu teléfono.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7D32] py-3.5 text-sm font-medium text-white"
                >
                  <Bell className="h-4 w-4" />
                  {existing ? 'Actualizar alerta' : 'Activar alerta de parada'}
                </motion.button>

                {existing && (
                  <button
                    onClick={handleRemove}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <BellOff className="h-4 w-4" />
                    Eliminar alerta
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
