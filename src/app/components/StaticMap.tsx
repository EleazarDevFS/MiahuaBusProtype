import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MIAHUATLAN_CENTER,
  getRouteCoordinates,
  getAllRoutePolylines,
  type LatLng,
} from '../data/mapCoords';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function createStopIcon(
  color: string,
  index: number,
  opts: { selected?: boolean; hasAlert?: boolean; isEndpoint?: boolean } = {}
) {
  const { selected, hasAlert, isEndpoint } = opts;
  const size = selected ? 16 : isEndpoint ? 14 : 11;
  const ring = selected ? `0 0 0 3px ${color}55, 0 0 0 6px white` : '0 1px 4px rgba(0,0,0,0.35)';

  return L.divIcon({
    className: '',
    iconSize: [size + (hasAlert ? 8 : 0), size + (hasAlert ? 8 : 0)],
    iconAnchor: [(size + (hasAlert ? 8 : 0)) / 2, (size + (hasAlert ? 8 : 0)) / 2],
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center">
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${selected ? color : isEndpoint ? color : 'white'};border:2.5px solid ${color};box-shadow:${ring}"></div>
        ${hasAlert ? `<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:#F57F17;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:8px">🔔</div>` : ''}
        <div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;background:white;border:1px solid #ddd;border-radius:4px;padding:1px 4px;font-size:9px;font-weight:600;color:#333;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.15)">${index + 1}</div>
      </div>`,
  });
}

function createBusIcon(color: string) {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:8px;background:${color};border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:14px">🚌</div>`,
  });
}

export interface StaticMapProps {
  routeId?: string;
  stops?: string[];
  color?: string;
  height?: string;
  interactive?: boolean;
  showAllRoutes?: boolean;
  showStopLabels?: boolean;
  selectedStopIndex?: number | null;
  alertStopIndices?: number[];
  onStopSelect?: (index: number) => void;
  simulateBus?: boolean;
  estimatedDuration?: number;
  className?: string;
}

export function StaticMap({
  routeId,
  stops = [],
  color = '#2E7D32',
  height = '200px',
  interactive = true,
  showAllRoutes = false,
  showStopLabels = false,
  selectedStopIndex = null,
  alertStopIndices = [],
  onStopSelect,
  simulateBus = false,
  estimatedDuration = 20,
  className = '',
}: StaticMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const routeCoordsRef = useRef<LatLng[]>([]);
  const onStopSelectRef = useRef(onStopSelect);
  onStopSelectRef.current = onStopSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const routeCoords = routeId ? getRouteCoordinates(routeId) : [];
    routeCoordsRef.current = routeCoords;
    const allPolylines = showAllRoutes ? getAllRoutePolylines() : [];
    const center = routeCoords.length > 0 ? routeCoords[0] : MIAHUATLAN_CENTER;
    const fitCoords = showAllRoutes ? allPolylines.flatMap(p => p.coords) : routeCoords;

    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom: 14,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: false,
    });

    mapRef.current = map;
    markersRef.current = [];

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    ).addTo(map);

    if (showAllRoutes) {
      allPolylines.forEach(({ color: routeColor, coords }) => {
        if (coords.length >= 2) {
          L.polyline(coords.map(c => [c.lat, c.lng]), {
            color: routeColor,
            weight: 4,
            opacity: 0.75,
          }).addTo(map);
        }
      });
    } else if (routeCoords.length >= 2) {
      L.polyline(routeCoords.map(c => [c.lat, c.lng]), {
        color: 'white',
        weight: 10,
        opacity: 0.35,
      }).addTo(map);
      L.polyline(routeCoords.map(c => [c.lat, c.lng]), {
        color,
        weight: 6,
        opacity: 0.9,
      }).addTo(map);

      routeCoords.forEach((coord, i) => {
        const isEndpoint = i === 0 || i === routeCoords.length - 1;
        const stopName = stops[i] || `Parada ${i + 1}`;
        const marker = L.marker([coord.lat, coord.lng], {
          icon: createStopIcon(color, i, {
            selected: selectedStopIndex === i,
            hasAlert: alertStopIndices.includes(i),
            isEndpoint,
          }),
        }).addTo(map);

        const popupContent = `
          <div style="min-width:140px">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px;color:#111">${stopName}</p>
            <p style="font-size:11px;color:#666;margin:0">Parada ${i + 1} de ${routeCoords.length}</p>
            ${alertStopIndices.includes(i) ? '<p style="font-size:11px;color:#F57F17;margin:4px 0 0">🔔 Alerta activa</p>' : ''}
            ${interactive && onStopSelectRef.current ? '<p style="font-size:10px;color:#2E7D32;margin:4px 0 0">Toca para seleccionar</p>' : ''}
          </div>`;
        marker.bindPopup(popupContent, { closeButton: true, maxWidth: 220 });

        if (interactive && onStopSelectRef.current) {
          marker.on('click', () => onStopSelectRef.current?.(i));
        }

        markersRef.current.push(marker);
      });

      if (simulateBus && routeCoords.length >= 2) {
        const bus = L.marker([routeCoords[0].lat, routeCoords[0].lng], {
          icon: createBusIcon(color),
          zIndexOffset: 1000,
        }).addTo(map);
        bus.bindPopup('<p style="font-size:12px;margin:0">🚌 Camión en ruta</p>');
        busMarkerRef.current = bus;
      }
    }

    if (fitCoords.length >= 2) {
      map.fitBounds(
        fitCoords.map(c => [c.lat, c.lng] as L.LatLngExpression),
        { padding: [28, 28], maxZoom: 15 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      busMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, color, interactive, showAllRoutes, stops.length]);

  useEffect(() => {
    const map = mapRef.current;
    const coords = routeCoordsRef.current;
    if (!map || coords.length === 0 || showAllRoutes) return;

    markersRef.current.forEach((marker, i) => {
      const isEndpoint = i === 0 || i === coords.length - 1;
      marker.setIcon(
        createStopIcon(color, i, {
          selected: selectedStopIndex === i,
          hasAlert: alertStopIndices.includes(i),
          isEndpoint,
        })
      );
    });

    if (selectedStopIndex !== null && coords[selectedStopIndex]) {
      const c = coords[selectedStopIndex];
      map.flyTo([c.lat, c.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
      markersRef.current[selectedStopIndex]?.openPopup();
    }
  }, [selectedStopIndex, alertStopIndices, color, showAllRoutes]);

  useEffect(() => {
    if (!simulateBus || !busMarkerRef.current || routeCoordsRef.current.length < 2) return;

    const coords = routeCoordsRef.current;
    const updateBus = () => {
      const now = new Date();
      const cycleMin = estimatedDuration + 5;
      const posInCycle = (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60) % cycleMin;
      const progress = Math.min(posInCycle / estimatedDuration, 0.95);
      const totalSegments = coords.length - 1;
      const rawPos = progress * totalSegments;
      const segIndex = Math.min(Math.floor(rawPos), totalSegments - 1);
      const segProgress = rawPos - segIndex;
      const a = coords[segIndex];
      const b = coords[segIndex + 1];
      const lat = a.lat + (b.lat - a.lat) * segProgress;
      const lng = a.lng + (b.lng - a.lng) * segProgress;
      busMarkerRef.current?.setLatLng([lat, lng]);
    };

    updateBus();
    const interval = setInterval(updateBus, 5000);
    return () => clearInterval(interval);
  }, [simulateBus, estimatedDuration, routeId]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ height, zIndex: 0 }}
    >
      <div ref={containerRef} className="h-full w-full" />
      {interactive && !showAllRoutes && onStopSelect && (
        <div className="pointer-events-none absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium text-[#2E7D32] shadow-sm backdrop-blur-sm">
          Toca una parada en el mapa
        </div>
      )}
      {simulateBus && (
        <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] text-gray-700 shadow-sm backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E7D32]" />
          Camión en vivo
        </div>
      )}
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-gray-500 shadow-sm backdrop-blur-sm">
        OpenStreetMap
      </div>
    </div>
  );
}
