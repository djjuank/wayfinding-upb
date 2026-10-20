// Cálculo de rutas: grafo + A* con nodos temporales para puntos que caen sobre una arista.

import { METERS_PER_PX, WALK_SPEED_MPS, type Lang } from '../config';
import { EDGES, NODES, type GNode } from '../data/graph';
import { byId, type Destination } from '../data/destinations';

export interface Pt {
  x: number;
  y: number;
}

const nodeMap = new Map<string, GNode>(NODES.map((n) => [n.id, n]));
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

type Adj = Map<string, Map<string, number>>;

function buildAdj(): Adj {
  const adj: Adj = new Map();
  for (const n of NODES) adj.set(n.id, new Map());
  for (const [a, b] of EDGES) {
    const na = nodeMap.get(a);
    const nb = nodeMap.get(b);
    if (!na || !nb) throw new Error(`Arista con nodo inexistente: ${a} - ${b}`);
    const d = dist(na, nb);
    adj.get(a)!.set(b, d);
    adj.get(b)!.set(a, d);
  }
  return adj;
}
const BASE_ADJ = buildAdj();

export function getNode(id: string): GNode {
  const n = nodeMap.get(id);
  if (!n) throw new Error(`Nodo inexistente: ${id}`);
  return n;
}

interface Snap {
  /** Punto proyectado sobre el sendero. */
  p: Pt;
  edge: [string, string];
  d: number; // distancia desde el punto original
}

/** Proyecta un punto sobre la arista más cercana del grafo. */
export function snapToGraph(pt: Pt): Snap {
  let best: Snap | null = null;
  for (const [a, b] of EDGES) {
    const A = nodeMap.get(a)!;
    const B = nodeMap.get(b)!;
    const vx = B.x - A.x;
    const vy = B.y - A.y;
    const len2 = vx * vx + vy * vy || 1;
    let t = ((pt.x - A.x) * vx + (pt.y - A.y) * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    const p = { x: A.x + vx * t, y: A.y + vy * t };
    const d = dist(pt, p);
    if (!best || d < best.d) best = { p, edge: [a, b], d };
  }
  return best!;
}

export interface RouteResult {
  /** Polilínea completa desde el origen hasta el punto de entrada. */
  points: Pt[];
  /** Ids de nodos reales recorridos (para generar instrucciones). */
  nodeIds: string[];
  /** Longitud en píxeles del plano. */
  px: number;
  meters: number;
  minutes: number;
  /** Punto donde termina el sendero y comienza el tramo final hasta el pin. */
  entry: Pt;
  steps: Step[];
}

export interface Step {
  key: string;
  params: Record<string, string | number>;
  meters: number;
}

function heuristic(a: Pt, b: Pt) {
  return dist(a, b);
}

function astar(adj: Adj, coords: Map<string, Pt>, from: string, to: string): string[] | null {
  const open = new Set<string>([from]);
  const came = new Map<string, string>();
  const g = new Map<string, number>([[from, 0]]);
  const f = new Map<string, number>([[from, heuristic(coords.get(from)!, coords.get(to)!)]]);
  while (open.size) {
    let cur = '';
    let curF = Infinity;
    for (const id of open) {
      const v = f.get(id) ?? Infinity;
      if (v < curF) {
        curF = v;
        cur = id;
      }
    }
    if (cur === to) {
      const path = [cur];
      while (came.has(cur)) {
        cur = came.get(cur)!;
        path.unshift(cur);
      }
      return path;
    }
    open.delete(cur);
    for (const [nb, w] of adj.get(cur) ?? []) {
      const tentative = (g.get(cur) ?? Infinity) + w;
      if (tentative < (g.get(nb) ?? Infinity)) {
        came.set(nb, cur);
        g.set(nb, tentative);
        f.set(nb, tentative + heuristic(coords.get(nb)!, coords.get(to)!));
        open.add(nb);
      }
    }
  }
  return null;
}

/** Punto de entrada de un destino sobre el grafo. */
function entryPoint(dest: Destination): { id?: string; snap?: Snap } {
  if (dest.entry && nodeMap.has(dest.entry)) return { id: dest.entry };
  return { snap: snapToGraph(dest) };
}

/** Calcula la ruta entre dos nodos reales del grafo o hacia un destino. */
export function routeToDestination(fromNode: string, dest: Destination): RouteResult | null {
  const adj: Adj = new Map();
  for (const [k, v] of BASE_ADJ) adj.set(k, new Map(v));
  const coords = new Map<string, Pt>(NODES.map((n) => [n.id, { x: n.x, y: n.y }]));

  const e = entryPoint(dest);
  let target: string;
  let entryPt: Pt;
  if (e.id) {
    target = e.id;
    entryPt = coords.get(e.id)!;
  } else {
    // Inserta un nodo temporal sobre la arista más cercana
    const s = e.snap!;
    target = '__dest';
    entryPt = s.p;
    coords.set(target, s.p);
    const [a, b] = s.edge;
    adj.get(a)!.delete(b);
    adj.get(b)!.delete(a);
    adj.set(target, new Map());
    for (const end of [a, b]) {
      const w = dist(coords.get(end)!, s.p);
      adj.get(end)!.set(target, w);
      adj.get(target)!.set(end, w);
    }
  }

  const ids = astar(adj, coords, fromNode, target);
  if (!ids) return null;

  const points = ids.map((id) => coords.get(id)!);
  let px = 0;
  for (let i = 1; i < points.length; i++) px += dist(points[i - 1], points[i]);
  const finalLeg = dist(entryPt, dest);
  const meters = Math.round((px + finalLeg) * METERS_PER_PX);
  const minutes = Math.max(1, Math.round(meters / WALK_SPEED_MPS / 60));

  return {
    points,
    nodeIds: ids.filter((id) => id !== '__dest'),
    px,
    meters,
    minutes,
    entry: entryPt,
    steps: buildSteps(ids, coords, dest),
  };
}

/** Elige el servicio más cercano (por ruta) de una categoría. */
export function nearestService(fromNode: string, services: Destination[]): { dest: Destination; route: RouteResult } | null {
  let best: { dest: Destination; route: RouteResult } | null = null;
  for (const s of services) {
    const r = routeToDestination(fromNode, s);
    if (!r) continue;
    const total = r.px + dist(r.entry, s);
    if (!best || total < best.route.px + dist(best.route.entry, best.dest)) best = { dest: s, route: r };
  }
  return best;
}

// ---------------------------------------------------------------------------
// Instrucciones paso a paso
// ---------------------------------------------------------------------------

const DIRS_ES = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
const DIRS_EN = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];

export function compass(a: Pt, b: Pt): number {
  // 0 = norte, sentido horario; el eje y del mapa crece hacia el sur
  const ang = (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI;
  const idx = Math.round(((ang + 360) % 360) / 45) % 8;
  return idx;
}

export function dirName(idx: number, lang: Lang) {
  return (lang === 'es' ? DIRS_ES : DIRS_EN)[idx];
}

function buildSteps(ids: string[], coords: Map<string, Pt>, dest: Destination): Step[] {
  const steps: Step[] = [];
  if (ids.length < 2) {
    steps.push({ key: 'arrive', params: { dest: dest.id }, meters: 0 });
    return steps;
  }

  // Agrupa segmentos consecutivos con la misma dirección cardinal
  let startIdx = 0;
  let curDir = compass(coords.get(ids[0])!, coords.get(ids[1])!);
  const flush = (endIdx: number, dir: number) => {
    let px = 0;
    for (let i = startIdx + 1; i <= endIdx; i++) px += dist(coords.get(ids[i - 1])!, coords.get(ids[i])!);
    const meters = Math.round(px * METERS_PER_PX);
    // Referencia: el primer nodo con hint dentro o al final del tramo
    let hintId = '';
    for (let i = endIdx; i > startIdx; i--) {
      const n = nodeMap.get(ids[i]);
      if (n?.hint) {
        hintId = n.id;
        break;
      }
    }
    steps.push({ key: steps.length === 0 ? 'start' : 'walk', params: { dir, hint: hintId }, meters });
  };

  for (let i = 1; i < ids.length - 1; i++) {
    const d = compass(coords.get(ids[i])!, coords.get(ids[i + 1])!);
    if (d !== curDir) {
      // ignora desvíos de un solo segmento corto para no saturar de pasos
      const seg = dist(coords.get(ids[i - 1])!, coords.get(ids[i])!);
      const diff = Math.min((d - curDir + 8) % 8, (curDir - d + 8) % 8);
      if (diff >= 2 || seg > 120) {
        flush(i, curDir);
        startIdx = i;
        curDir = d;
      }
    }
  }
  flush(ids.length - 1, curDir);

  // Une pasos muy cortos (< 25 m) con el siguiente
  const merged: Step[] = [];
  for (const s of steps) {
    const prev = merged[merged.length - 1];
    if (prev && s.meters < 25 && s.key === 'walk') {
      prev.meters += s.meters;
      if (s.params.hint) prev.params.hint = s.params.hint;
    } else merged.push({ ...s, params: { ...s.params } });
  }
  merged.push({ key: 'arrive', params: { dest: dest.id }, meters: 0 });
  return merged;
}

export function stepText(step: Step, lang: Lang): string {
  const es = lang === 'es';
  const dir = typeof step.params.dir === 'number' ? dirName(step.params.dir as number, lang) : '';
  const hintNode = step.params.hint ? nodeMap.get(String(step.params.hint)) : undefined;
  const hint = hintNode?.hint?.[lang];
  const m = `${step.meters}\u00A0m`;
  if (step.key === 'arrive') {
    const d = byId.get(String(step.params.dest));
    if (!d || d.kind === 'service') return es ? 'Has llegado a tu destino.' : 'You have arrived at your destination.';
    const name = d.num ? (es ? `Bloque ${d.num}` : `Block ${d.num}`) : d.name[lang];
    return es ? `Has llegado a ${name}.` : `You have arrived at ${name}.`;
  }
  if (step.key === 'start') {
    return es
      ? `Sal del túnel y camina hacia el ${dir} unos ${m}${hint ? ` hasta ${hint}` : ''}.`
      : `Leave the tunnel and walk ${dir} for about ${m}${hint ? ` to ${hint}` : ''}.`;
  }
  return es
    ? `Continúa hacia el ${dir} unos ${m}${hint ? ` hasta ${hint}` : ''}.`
    : `Continue ${dir} for about ${m}${hint ? ` to ${hint}` : ''}.`;
}
