import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface StopAlert {
  id: string;
  routeId: string;
  stopIndex: number;
  stopName: string;
  minutesBefore: number;
  notifyOnApproach: boolean;
  notifyOnDeparture: boolean;
  enabled: boolean;
  createdAt: number;
}

interface StopAlertsContextType {
  alerts: StopAlert[];
  globalEnabled: boolean;
  setGlobalEnabled: (v: boolean) => void;
  addOrUpdateAlert: (alert: Omit<StopAlert, 'id' | 'createdAt'> & { id?: string }) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  getAlertForStop: (routeId: string, stopIndex: number) => StopAlert | undefined;
  getAlertsForRoute: (routeId: string) => StopAlert[];
  activeAlertCount: number;
  hasAlertOnStop: (routeId: string, stopIndex: number) => boolean;
}

const STORAGE_KEY = 'miahuabus_stop_alerts';
const GLOBAL_KEY = 'miahuabus_alerts_global';

const StopAlertsContext = createContext<StopAlertsContextType | undefined>(undefined);

function loadAlerts(): StopAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function loadGlobal(): boolean {
  try {
    const v = localStorage.getItem(GLOBAL_KEY);
    if (v !== null) return v === 'true';
  } catch {
    // ignore
  }
  return true;
}

export function StopAlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<StopAlert[]>(loadAlerts);
  const [globalEnabled, setGlobalEnabledState] = useState(loadGlobal);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_KEY, String(globalEnabled));
  }, [globalEnabled]);

  const setGlobalEnabled = (v: boolean) => setGlobalEnabledState(v);

  const addOrUpdateAlert = useCallback(
    (alert: Omit<StopAlert, 'id' | 'createdAt'> & { id?: string }) => {
      setAlerts(prev => {
        const existing = prev.find(
          a => a.routeId === alert.routeId && a.stopIndex === alert.stopIndex
        );
        if (existing) {
          return prev.map(a =>
            a.id === existing.id
              ? { ...a, ...alert, id: existing.id, createdAt: existing.createdAt }
              : a
          );
        }
        return [
          ...prev,
          {
            ...alert,
            id: alert.id || Date.now().toString(),
            createdAt: Date.now(),
          },
        ];
      });
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }, []);

  const getAlertForStop = useCallback(
    (routeId: string, stopIndex: number) =>
      alerts.find(a => a.routeId === routeId && a.stopIndex === stopIndex),
    [alerts]
  );

  const getAlertsForRoute = useCallback(
    (routeId: string) => alerts.filter(a => a.routeId === routeId),
    [alerts]
  );

  const hasAlertOnStop = useCallback(
    (routeId: string, stopIndex: number) => {
      const a = alerts.find(x => x.routeId === routeId && x.stopIndex === stopIndex);
      return Boolean(a?.enabled && globalEnabled);
    },
    [alerts, globalEnabled]
  );

  const activeAlertCount = alerts.filter(a => a.enabled && globalEnabled).length;

  return (
    <StopAlertsContext.Provider
      value={{
        alerts,
        globalEnabled,
        setGlobalEnabled,
        addOrUpdateAlert,
        removeAlert,
        toggleAlert,
        getAlertForStop,
        getAlertsForRoute,
        activeAlertCount,
        hasAlertOnStop,
      }}
    >
      {children}
    </StopAlertsContext.Provider>
  );
}

export function useStopAlerts() {
  const ctx = useContext(StopAlertsContext);
  if (!ctx) throw new Error('useStopAlerts must be used within StopAlertsProvider');
  return ctx;
}
