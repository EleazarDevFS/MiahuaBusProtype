import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Check, X } from 'lucide-react';
import { useUserRoutes } from '../context/UserRoutesContext';

export interface SaveRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  origin: string;
  destination: string;
  defaultName?: string;
  onSaved?: () => void;
}

export function SaveRouteModal({
  isOpen,
  onClose,
  routeId,
  origin,
  destination,
  defaultName,
  onSaved,
}: SaveRouteModalProps) {
  const { addRoute, isRouteSaved } = useUserRoutes();
  const [routeName, setRouteName] = useState('');
  const [routeNotes, setRouteNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const alreadySaved = isRouteSaved(routeId, origin, destination);

  useEffect(() => {
    if (isOpen) {
      setRouteName(defaultName || `${origin} → ${destination}`);
      setRouteNotes('');
      setSavedSuccess(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultName, origin, destination]);

  const handleSave = async () => {
    if (!routeName.trim() || alreadySaved) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      addRoute({
        id: Date.now().toString(),
        name: routeName.trim(),
        origin,
        destination,
        routeId,
        savedAt: Date.now(),
        notes: routeNotes.trim() || undefined,
        isFavorite: false,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 1200);
    } finally {
      setIsSaving(false);
    }
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
          aria-labelledby="save-route-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

            <div className="max-h-[75vh] overflow-y-auto px-4 pb-24 pt-2">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 id="save-route-title" className="text-lg font-bold text-gray-900">
                    Guardar en Mis rutas
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Guarda este trayecto para acceder rápido desde el inicio
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {alreadySaved && !savedSuccess ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-[#2E7D32]" />
                  </div>
                  <p className="font-bold text-gray-900">Ya tienes esta ruta guardada</p>
                  <p className="mt-1 text-xs text-gray-500">Puedes verla en la sección Mis rutas</p>
                  <button
                    onClick={onClose}
                    className="mt-4 rounded-lg bg-[#2E7D32] px-6 py-2.5 text-sm font-medium text-white"
                  >
                    Entendido
                  </button>
                </div>
              ) : !savedSuccess ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Nombre de la ruta
                    </label>
                    <input
                      type="text"
                      value={routeName}
                      onChange={e => setRouteName(e.target.value)}
                      placeholder="Ej. Mi viaje al trabajo"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={routeNotes}
                      onChange={e => setRouteNotes(e.target.value)}
                      placeholder="Ej. Salgo lunes a viernes a las 8am"
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#2E7D32] focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-xs text-green-800">
                      <strong>Trayecto:</strong> {origin} → {destination}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={isSaving || !routeName.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2E7D32] py-3 text-sm font-medium text-white hover:bg-[#1B5E20] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar ruta
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
                  >
                    <Check className="h-6 w-6 text-[#2E7D32]" />
                  </motion.div>
                  <p className="font-bold text-gray-900">¡Ruta guardada!</p>
                  <p className="text-xs text-gray-500">Ya está disponible en Mis rutas</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
