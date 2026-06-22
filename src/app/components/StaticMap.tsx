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

function createDotIcon(color: string, size = 10) {
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`,
  });
}

export interface StaticMapProps {
  routeId?: string;
  color?: string;
  height?: string;
  interactive?: boolean;
  showAllRoutes?: boolean;
  showStopLabels?: boolean;
  className?: string;
}

export function StaticMap({
  routeId,
  color = '#2E7D32',
  height = '200px',
  interactive = true,
  showAllRoutes = false,
  showStopLabels = false,
  className = '',
}: StaticMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const routeCoords = routeId ? getRouteCoordinates(routeId) : [];
    const allPolylines = showAllRoutes ? getAllRoutePolylines() : [];
    const center = routeCoords.length > 0 ? routeCoords[0] : MIAHUATLAN_CENTER;
    const fitCoords = showAllRoutes
      ? allPolylines.flatMap(p => p.coords)
      : routeCoords;

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

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    ).addTo(map);

    if (showAllRoutes) {
      allPolylines.forEach(({ color: routeColor, coords }) => {
        if (coords.length >= 2) {
          L.polyline(
            coords.map(c => [c.lat, c.lng]),
            { color: routeColor, weight: 4, opacity: 0.75 }
          ).addTo(map);
        }
      });
    } else if (routeCoords.length >= 2) {
      L.polyline(
        routeCoords.map(c => [c.lat, c.lng]),
        { color: 'white', weight: 8, opacity: 0.3 }
      ).addTo(map);
      L.polyline(
        routeCoords.map(c => [c.lat, c.lng]),
        { color, weight: 5, opacity: 0.85 }
      ).addTo(map);

      routeCoords.forEach((coord, i) => {
        const isEndpoint = i === 0 || i === routeCoords.length - 1;
        const marker = L.marker([coord.lat, coord.lng], {
          icon: isEndpoint ? markerIcon : createDotIcon(color, 8),
        }).addTo(map);

        if (showStopLabels) {
          marker.bindPopup(`<span style="font-size:12px;font-weight:500">${i + 1}</span>`);
        }
      });
    }

    if (fitCoords.length >= 2) {
      map.fitBounds(
        fitCoords.map(c => [c.lat, c.lng] as L.LatLngExpression),
        { padding: [24, 24], maxZoom: 15 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [routeId, color, interactive, showAllRoutes, showStopLabels]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{ height, zIndex: 0 }}
    >
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] text-gray-500 shadow-sm backdrop-blur-sm">
        OpenStreetMap
      </div>
    </div>
  );
}
