// Conversión aproximada entre píxeles del plano y latitud/longitud.
import { GEO, MAP } from '../config';
import type { Pt } from './route';

export interface LatLng {
  lat: number;
  lng: number;
}

export function pxToLatLng(p: Pt): LatLng {
  return {
    lat: GEO.refLatLng.lat - (p.y - GEO.refPx.y) * GEO.degPerPxLat,
    lng: GEO.refLatLng.lng + (p.x - GEO.refPx.x) * GEO.degPerPxLng,
  };
}

export function latLngToPx(ll: LatLng): Pt {
  return {
    x: GEO.refPx.x + (ll.lng - GEO.refLatLng.lng) / GEO.degPerPxLng,
    y: GEO.refPx.y - (ll.lat - GEO.refLatLng.lat) / GEO.degPerPxLat,
  };
}

export function insideMap(p: Pt, margin = 120): boolean {
  return p.x > -margin && p.y > -margin && p.x < MAP.w + margin && p.y < MAP.h + margin;
}

export function googleMapsUrl(dest: Pt): string {
  const { lat, lng } = pxToLatLng(dest);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lng.toFixed(6)}&travelmode=walking`;
}
