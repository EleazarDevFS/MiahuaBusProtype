import { ROUTES } from './routes';

export interface LatLng {
  lat: number;
  lng: number;
}

export const MIAHUATLAN_CENTER: LatLng = { lat: 16.0328, lng: -96.5961 };

/** Coordenadas aproximadas de paradas en Miahuatlán de Porfirio Díaz, Oaxaca */
export const STOP_COORDS: Record<string, LatLng> = {
  'Centro - Palacio Municipal': { lat: 16.0328, lng: -96.5961 },
  'Centro': { lat: 16.0328, lng: -96.5961 },
  'Mercado Municipal': { lat: 16.0335, lng: -96.5955 },
  'Clínica del IMSS': { lat: 16.0350, lng: -96.5940 },
  'Secundaria Técnica': { lat: 16.0365, lng: -96.5925 },
  'Preparatoria': { lat: 16.0380, lng: -96.5910 },
  'Universidad UNSIS': { lat: 16.0400, lng: -96.5890 },
  'Iglesia del Carmen': { lat: 16.0315, lng: -96.5945 },
  'Plaza Cívica': { lat: 16.0305, lng: -96.5935 },
  'Jardín de Niños': { lat: 16.0295, lng: -96.5920 },
  'Clínica Rural': { lat: 16.0280, lng: -96.5905 },
  'Hospital General': { lat: 16.0265, lng: -96.5890 },
  'Gasolinera': { lat: 16.0340, lng: -96.5980 },
  'Entrada a San José': { lat: 16.0290, lng: -96.6010 },
  'Curva del Panteón': { lat: 16.0250, lng: -96.6040 },
  'Cefereso': { lat: 16.0220, lng: -96.6070 },
  'Colonia Juárez': { lat: 16.0300, lng: -96.5990 },
  'Panteón Municipal': { lat: 16.0285, lng: -96.6005 },
  'Reclusorio Municipal': { lat: 16.0270, lng: -96.6020 },
  'Iglesia Principal': { lat: 16.0330, lng: -96.5975 },
  'Colonia Centro': { lat: 16.0345, lng: -96.5985 },
  'Cruce San Sebastián': { lat: 16.0310, lng: -96.6030 },
  'San Sebastián': { lat: 16.0260, lng: -96.6080 },
  'Avenida Principal': { lat: 16.0318, lng: -96.5970 },
  'Parque Central': { lat: 16.0308, lng: -96.5985 },
  'Escuela Primaria': { lat: 16.0298, lng: -96.6000 },
  'Colonia Moctezuma': { lat: 16.0288, lng: -96.6015 },
};

export function getStopCoordinate(stopName: string): LatLng | null {
  if (STOP_COORDS[stopName]) return STOP_COORDS[stopName];

  const lower = stopName.toLowerCase();
  const match = Object.entries(STOP_COORDS).find(([name]) =>
    name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase())
  );
  return match ? match[1] : null;
}

export function getRouteCoordinates(routeId: string): LatLng[] {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return [];

  return route.stops
    .map(stop => getStopCoordinate(stop))
    .filter((coord): coord is LatLng => coord !== null);
}

export function getAllRoutePolylines(): { routeId: string; color: string; coords: LatLng[] }[] {
  return ROUTES.map(route => ({
    routeId: route.id,
    color: route.color,
    coords: getRouteCoordinates(route.id),
  })).filter(r => r.coords.length >= 2);
}
