import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { BottomSheet } from './BottomSheet';
import { useCallback } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
}

export function Header({ title, showBack = true, showNotifications = true }: HeaderProps) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [enabledCount, setEnabledCount] = React.useState(0);

  const loadEnabledCount = useCallback(() => {
    try {
      const raw = localStorage.getItem('miahuabus_notifications') || '[]';
      const arr = JSON.parse(raw);
      const count = Array.isArray(arr) ? arr.filter((s: any) => s.enabled).length : 0;
      setEnabledCount(count);
    } catch {
      setEnabledCount(0);
    }
  }, []);

  React.useEffect(() => {
    loadEnabledCount();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'miahuabus_notifications') loadEnabledCount();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadEnabledCount]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 max-w-[390px] mx-auto">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="w-10">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Regresar"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
        
        <h1 className="flex-1 text-center text-gray-900 truncate px-2">
          {title}
        </h1>
        
        <div className="w-10">
          {showNotifications && (
            <>
              <button
                onClick={() => setOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {enabledCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{enabledCount}</span>
                )}
              </button>

              <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
                <div className="p-4">
                  <h3 className="text-sm text-gray-900 mb-2">Notificaciones</h3>
                  <p className="text-xs text-gray-500 mb-3">Accede a tus alertas y recordatorios.</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setOpen(false); navigate('/notifications'); }}
                      className="w-full py-3 bg-[#2E7D32] text-white rounded-xl"
                    >
                      Ver notificaciones
                    </button>
                    <button
                      onClick={() => { setOpen(false); navigate('/home'); }}
                      className="w-full py-3 bg-white border border-gray-200 rounded-xl"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </BottomSheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
