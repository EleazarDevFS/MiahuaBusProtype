import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumb } from '../components/Breadcrumb';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { ROUTES } from '../data/routes';

const NOTIF_KEY = 'miahuabus_notifications';

interface NotifSettings {
  routeId: string;
  enabled: boolean;
  minutesBefore: number;
}

function loadSettings(): NotifSettings[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveSettings(settings: NotifSettings[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(settings));
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotifSettings[]>([]);
  const [globalEnabled, setGlobalEnabled] = useState(true);

  useEffect(() => {
    const saved = loadSettings();
    // Init routes not yet configured
    const initialized = ROUTES.map(route => {
      const existing = saved.find(s => s.routeId === route.id);
      return existing || { routeId: route.id, enabled: false, minutesBefore: 10 };
    });
    setSettings(initialized);
  }, []);

  const toggle = (routeId: string) => {
    const updated = settings.map(s =>
      s.routeId === routeId ? { ...s, enabled: !s.enabled } : s
    );
    setSettings(updated);
    saveSettings(updated);
  };

  const setMinutes = (routeId: string, mins: number) => {
    const updated = settings.map(s =>
      s.routeId === routeId ? { ...s, minutesBefore: mins } : s
    );
    setSettings(updated);
    saveSettings(updated);
  };

  const enabledCount = settings.filter(s => s.enabled).length;

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] pb-20">
      <Header title="Notificaciones" />
      <Breadcrumb items={[
        { label: 'Inicio', path: '/home' },
        { label: 'Perfil', path: '/profile' },
        { label: 'Notificaciones', path: '/notifications' }
      ]} />

      <div className="pt-[104px] px-4 py-4">
        {/* Global toggle */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-900">Alertas globales</p>
              <p className="text-xs text-gray-500">
                {enabledCount > 0 ? `${enabledCount} rutas configuradas` : 'Ninguna ruta activa'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGlobalEnabled(v => !v)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              globalEnabled ? 'bg-[#2E7D32]' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
              globalEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Las notificaciones son simuladas. Recibirás recordatorios dentro de la app basados en los horarios.
          </p>
        </div>

        {/* Lista de rutas */}
        <h3 className="text-sm text-gray-700 mb-3">Alertas por ruta</h3>
        <div className="space-y-3">
          {ROUTES.map((route) => {
            const setting = settings.find(s => s.routeId === route.id);
            if (!setting) return null;
            return (
              <motion.div
                key={route.id}
                layout
                className={`bg-white border rounded-xl p-4 transition-all shadow-sm ${
                  setting.enabled ? 'border-[#2E7D32]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                    <p className="text-sm text-gray-900">{route.name}</p>
                  </div>
                  <button
                    onClick={() => toggle(route.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      setting.enabled && globalEnabled ? 'bg-[#2E7D32]' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                      setting.enabled && globalEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {setting.enabled && globalEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-100 pt-3"
                  >
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Avisarme antes de:
                    </p>
                    <div className="flex gap-2">
                      {[5, 10, 15, 20].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setMinutes(route.id, mins)}
                          className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${
                            setting.minutesBefore === mins
                              ? 'bg-[#2E7D32] text-white'
                              : 'bg-[#F5F5F5] text-gray-700 hover:bg-green-50'
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {(!setting.enabled || !globalEnabled) && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <BellOff className="w-3 h-3" />
                    Sin alertas activas para esta ruta
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
