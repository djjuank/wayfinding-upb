// Configuración general del demo de wayfinding UPB.
// Todas las coordenadas están en píxeles del mapa base (src/assets/map.webp, 2040 x 2010).

export const MAP = { w: 2040, h: 2010 };

/** Escala aproximada del plano ilustrado (calculada con la cancha del bloque 18). */
export const METERS_PER_PX = 0.36;
export const WALK_SPEED_MPS = 1.25;

export type Lang = 'es' | 'en';

export interface Kiosk {
  id: string;
  node: string; // id del nodo del grafo donde está la pantalla
  name: Record<Lang, string>;
}

/** Pantallas instaladas. Para el demo hay una sola: el túnel junto al bloque 18. */
export const KIOSKS: Record<string, Kiosk> = {
  tunel: {
    id: 'tunel',
    node: 'tunel',
    name: { es: 'Túnel · Bloque 18', en: 'Tunnel · Block 18' },
  },
};
export const DEFAULT_KIOSK = 'tunel';

/** Tiempos de inactividad del modo kiosco. */
export const IDLE_HOME_MS = 90_000;
export const IDLE_ROUTE_MS = 150_000;
export const IDLE_WARNING_MS = 15_000;

/**
 * URL base de la página móvil que abre el código QR.
 * Vacío = usa la URL desde donde se está sirviendo la app.
 * Se define al compilar: MOBILE_BASE=https://wayfinding.upb.edu.co/ npm run build
 */
export const MOBILE_BASE_URL: string = __MOBILE_BASE__;

/**
 * Calibración PROVISIONAL píxel <-> latitud/longitud (para el punto azul y el botón de Google Maps).
 * Es una transformación aproximada: el plano es ilustrativo y no está a escala.
 * Para producción: tomar 4 a 6 puntos de control en Google Maps (satélite) y reemplazar estos valores.
 */
export const GEO = {
  // Punto de referencia: centro aproximado del plano (px) y su coordenada
  refPx: { x: 1020, y: 1000 },
  refLatLng: { lat: 6.2425, lng: -75.5897 },
  // Grados por píxel (norte arriba)
  degPerPxLat: 0.36 / 110574,
  degPerPxLng: 0.36 / 110650,
};
