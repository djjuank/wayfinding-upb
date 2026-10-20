import type { Lang } from './config';

const dict = {
  title: { es: '¿A dónde quieres ir?', en: 'Where would you like to go?' },
  subtitle: {
    es: 'Toca un bloque en el mapa o busca tu destino',
    en: 'Tap a block on the map or search for your destination',
  },
  search: { es: 'Buscar bloque, escuela o servicio', en: 'Search block, school or service' },
  services: { es: 'Servicios más cercanos', en: 'Nearest services' },
  blocks: { es: 'Bloques y edificios', en: 'Blocks and buildings' },
  outside: { es: 'Fuera del campus · Circular Primera', en: 'Off campus · Circular Primera' },
  noResults: { es: 'No encontramos resultados', en: 'No results found' },
  noResultsHint: { es: 'Prueba con el número del bloque o el nombre de la escuela.', en: 'Try the block number or the school name.' },
  here: { es: 'Usted está aquí', en: 'You are here' },
  walk: { es: 'a pie', en: 'walk' },
  min: { es: 'min', en: 'min' },
  approx: { es: 'Tiempo y distancia aproximados', en: 'Approximate time and distance' },
  scanTitle: { es: 'Lleva tu ruta en el celular', en: 'Take your route on your phone' },
  scanText: { es: 'Escanea el código con la cámara de tu celular', en: 'Scan the code with your phone camera' },
  newSearch: { es: 'Nueva búsqueda', en: 'New search' },
  back: { es: 'Volver', en: 'Back' },
  steps: { es: 'Cómo llegar', en: 'How to get there' },
  others: { es: 'Otras opciones cercanas', en: 'Other nearby options' },
  nearest: { es: 'Más cercano', en: 'Nearest' },
  idleTitle: { es: '¿Sigues ahí?', en: 'Are you still there?' },
  idleText: { es: 'Esta pantalla se reiniciará en', en: 'This screen will reset in' },
  idleBtn: { es: 'Sigo aquí', en: "I'm still here" },
  outsideNote: {
    es: 'Este destino está fuera del campus: la ruta sale por el acceso peatonal y sigue la acera de la Circular Primera.',
    en: 'This destination is off campus: the route leaves through the pedestrian gate and follows the Circular Primera sidewalk.',
  },
  space: { es: 'espacio', en: 'space' },
  clear: { es: 'Borrar todo', en: 'Clear all' },
  done: { es: 'Listo', en: 'Done' },
  kiosk: { es: 'Está en', en: 'You are at' },
  // móvil
  openMaps: { es: 'Abrir en Google Maps', en: 'Open in Google Maps' },
  myLocation: { es: 'Mostrar mi ubicación', en: 'Show my location' },
  locating: { es: 'Buscando tu ubicación…', en: 'Finding your location…' },
  locOutside: { es: 'Parece que no estás dentro del campus. La ruta parte desde el túnel del Bloque 18.', en: "You don't seem to be inside the campus. The route starts at the Block 18 tunnel." },
  locError: { es: 'No pudimos obtener tu ubicación. Revisa los permisos del navegador.', en: "We couldn't get your location. Check your browser permissions." },
  locApprox: { es: 'Ubicación aproximada', en: 'Approximate location' },
  routeFrom: { es: 'Ruta desde', en: 'Route from' },
  badLink: { es: 'Este enlace no es válido. Escanea de nuevo el código en la pantalla del campus.', en: 'This link is not valid. Scan the code on the campus screen again.' },
  mobileHint: { es: 'Ruta desde la pantalla del campus', en: 'Route from the campus screen' },
} as const;

export type Key = keyof typeof dict;

export function tr(key: Key, lang: Lang): string {
  return dict[key][lang];
}

/** Normaliza texto para búsqueda: minúsculas, sin tildes. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
