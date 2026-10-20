import type { Lang } from '../config';
import { BLOCKS, CATEGORIES, type Destination } from '../data/destinations';

/** Número del bloque más cercano a un punto (para describir servicios: "cerca del Bloque 17"). */
export function nearBlock(d: { x: number; y: number }): string | null {
  let best: Destination | null = null;
  let bd = 260;
  for (const b of BLOCKS) {
    if (b.outside) continue;
    const dd = Math.hypot(b.x - d.x, b.y - d.y);
    if (dd < bd) {
      bd = dd;
      best = b;
    }
  }
  return best?.num ?? null;
}

export function nearText(d: { x: number; y: number }, l: Lang): string {
  const n = nearBlock(d);
  return n ? (l === 'es' ? `Cerca del Bloque ${n}` : `Near Block ${n}`) : '';
}

/** Título y subtítulo para mostrar un destino (bloques o servicios). */
export function titleOf(d: Destination, l: Lang): { title: string; sub: string } {
  if (d.kind === 'service') {
    const cat = CATEGORIES.find((c) => c.id === d.cat);
    return { title: cat ? cat.hint[l] : d.name[l], sub: nearText(d, l) };
  }
  return { title: d.name[l], sub: d.sub?.[l] ?? '' };
}
