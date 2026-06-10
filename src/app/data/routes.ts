// Route type re-exported for use across the app
export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  firstDeparture: string;
  lastDeparture: string;
  stops: string[];
  schedules: string[];
  color: string;
  frequency?: string;
  estimatedDuration?: number; // minutos
}

// Datos estáticos de rutas de Miahuatlán
export const ROUTES: Route[] = [
  {
    id: '1',
    name: 'Ruta UNSIS',
    origin: 'Centro',
    destination: 'Universidad UNSIS',
    firstDeparture: '6:00 AM',
    lastDeparture: '9:00 PM',
    color: '#2E7D32',
    frequency: 'Cada 30 min',
    estimatedDuration: 20,
    stops: [
      'Centro - Palacio Municipal',
      'Mercado Municipal',
      'Clínica del IMSS',
      'Secundaria Técnica',
      'Preparatoria',
      'Universidad UNSIS'
    ],
    schedules: [
      '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
      '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM',
      '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
    ]
  },
  {
    id: '2',
    name: 'Ruta Centro-Hospital',
    origin: 'Centro',
    destination: 'Hospital General',
    firstDeparture: '6:00 AM',
    lastDeparture: '10:00 PM',
    color: '#1976D2',
    frequency: 'Cada 20 min',
    estimatedDuration: 15,
    stops: [
      'Centro - Palacio Municipal',
      'Iglesia del Carmen',
      'Plaza Cívica',
      'Jardín de Niños',
      'Clínica Rural',
      'Hospital General'
    ],
    schedules: [
      '6:00 AM', '6:20 AM', '6:40 AM', '7:00 AM', '7:20 AM', '7:40 AM',
      '8:00 AM', '8:30 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
      '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
    ]
  },
  {
    id: '3',
    name: 'Ruta Cefereso',
    origin: 'Centro',
    destination: 'Cefereso',
    firstDeparture: '7:00 AM',
    lastDeparture: '6:00 PM',
    color: '#F57C00',
    frequency: 'Cada 60 min',
    estimatedDuration: 25,
    stops: [
      'Centro - Palacio Municipal',
      'Gasolinera',
      'Entrada a San José',
      'Curva del Panteón',
      'Cefereso'
    ],
    schedules: [
      '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
    ]
  },
  {
    id: '4',
    name: 'Ruta Reclusorio',
    origin: 'Centro',
    destination: 'Reclusorio Municipal',
    firstDeparture: '8:00 AM',
    lastDeparture: '5:00 PM',
    color: '#7B1FA2',
    frequency: 'Cada 60 min',
    estimatedDuration: 18,
    stops: [
      'Centro - Palacio Municipal',
      'Mercado Municipal',
      'Colonia Juárez',
      'Panteón Municipal',
      'Reclusorio Municipal'
    ],
    schedules: [
      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ]
  },
  {
    id: '5',
    name: 'Ruta San Sebastián',
    origin: 'Centro',
    destination: 'San Sebastián',
    firstDeparture: '6:30 AM',
    lastDeparture: '8:00 PM',
    color: '#D32F2F',
    frequency: 'Cada 60 min',
    estimatedDuration: 22,
    stops: [
      'Centro - Palacio Municipal',
      'Iglesia Principal',
      'Colonia Centro',
      'Cruce San Sebastián',
      'San Sebastián'
    ],
    schedules: [
      '6:30 AM', '7:30 AM', '8:30 AM', '9:30 AM', '10:30 AM', '11:30 AM',
      '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:30 PM', '5:30 PM',
      '6:30 PM', '7:30 PM', '8:00 PM'
    ]
  },
  {
    id: '6',
    name: 'Ruta Moctezuma',
    origin: 'Centro',
    destination: 'Colonia Moctezuma',
    firstDeparture: '6:00 AM',
    lastDeparture: '9:00 PM',
    color: '#00796B',
    frequency: 'Cada 60 min',
    estimatedDuration: 12,
    stops: [
      'Centro - Palacio Municipal',
      'Avenida Principal',
      'Parque Central',
      'Escuela Primaria',
      'Colonia Moctezuma'
    ],
    schedules: [
      '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
      '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
    ]
  }
];

export const POPULAR_DESTINATIONS = [
  { id: '1', name: 'UNSIS', icon: '🎓' },
  { id: '2', name: 'Centro', icon: '🏛️' },
  { id: '3', name: 'Cefereso', icon: '🏢' },
  { id: '4', name: 'Hospital', icon: '🏥' },
  { id: '5', name: 'Reclusorio', icon: '🏛️' },
  { id: '6', name: 'San Sebastián', icon: '⛪' },
  { id: '7', name: 'Moctezuma', icon: '🏘️' }
];

export const FREQUENT_ROUTES = [
  { routeId: '1', destination: 'UNSIS' },
  { routeId: '2', destination: 'Hospital' },
  { routeId: '3', destination: 'Cefereso' }
];

export function isPeakHour(time: string): boolean {
  const hour = parseInt(time.split(':')[0]);
  const period = time.includes('PM') ? 'PM' : 'AM';
  if (period === 'AM' && hour >= 7 && hour <= 9) return true;
  if (period === 'PM' && hour >= 6 && hour <= 8) return true;
  return false;
}

export function searchRoutes(query: string): Route[] {
  const lowerQuery = query.toLowerCase();
  return ROUTES.filter(route =>
    route.name.toLowerCase().includes(lowerQuery) ||
    route.destination.toLowerCase().includes(lowerQuery) ||
    route.origin.toLowerCase().includes(lowerQuery) ||
    route.stops.some(stop => stop.toLowerCase().includes(lowerQuery))
  );
}

// Convierte "6:30 AM" a minutos desde medianoche
function timeToMinutes(time: string): number {
  const [timePart, period] = time.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);
  let h = hours % 12;
  if (period === 'PM') h += 12;
  return h * 60 + (minutes || 0);
}

// Retorna el próximo horario desde ahora, o null si ya pasó el último
export function getNextDeparture(schedules: string[]): { time: string; minutesAway: number } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const schedule of schedules) {
    const scheduleMinutes = timeToMinutes(schedule);
    if (scheduleMinutes > currentMinutes) {
      return {
        time: schedule,
        minutesAway: scheduleMinutes - currentMinutes
      };
    }
  }
  return null;
}

// Retorna el último horario pasado (camión reciente)
export function getLastDeparted(schedules: string[]): string | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let last: string | null = null;
  for (const schedule of schedules) {
    if (timeToMinutes(schedule) <= currentMinutes) {
      last = schedule;
    }
  }
  return last;
}

// Encuentra rutas que conecten un origen y destino (por paradas)
export function findRoutesByStops(origin: string, destination: string): Route[] {
  const lowerOrigin = origin.toLowerCase();
  const lowerDest = destination.toLowerCase();
  return ROUTES.filter(route => {
    const hasOrigin = route.stops.some(s => s.toLowerCase().includes(lowerOrigin)) ||
      route.origin.toLowerCase().includes(lowerOrigin);
    const hasDest = route.stops.some(s => s.toLowerCase().includes(lowerDest)) ||
      route.destination.toLowerCase().includes(lowerDest);
    return hasOrigin && hasDest;
  });
}
