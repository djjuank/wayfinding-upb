// Vista del mapa: SVG con la imagen base, ruta animada, marcadores y zoom automático.

import { MAP, type Lang } from '../config';
import { EDGES, NODES } from '../data/graph';
import { BLOCKS, type Destination } from '../data/destinations';
import { tr } from '../i18n';
import type { Pt, RouteResult } from '../lib/route';
import mapUrl from '../assets/map.webp';

const NS = 'http://www.w3.org/2000/svg';

type Attrs = Record<string, string | number>;
function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.appendChild(e);
  return e;
}

interface VB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ShowOptions {
  start: Pt;
  lang: Lang;
  route?: RouteResult | null;
  dest?: Destination | null;
  /** Servicios de la categoría seleccionada (se resaltan con un anillo). */
  highlights?: Destination[];
  nearestId?: string;
  /** Padding alrededor de la ruta, en px de pantalla. */
  padding?: number;
}

export class MapView {
  readonly svg: SVGSVGElement;
  private host: HTMLElement;
  private vb: VB = { x: 0, y: 0, w: MAP.w, h: MAP.h };
  private raf = 0;
  private gRoute: SVGGElement;
  private gMarks: SVGGElement;
  private gDebug: SVGGElement;
  private last: ShowOptions | null = null;

  constructor(host: HTMLElement, private opts: { onPick?: (id: string) => void; debug?: boolean; markScale?: number } = {}) {
    this.host = host;
    this.svg = s('svg', { class: 'map-svg', preserveAspectRatio: 'xMidYMid meet' });
    host.appendChild(this.svg);

    s('image', { href: mapUrl, x: 0, y: 0, width: MAP.w, height: MAP.h }, this.svg);

    // Zonas táctiles sobre el número de cada bloque
    if (opts.onPick) {
      const hits = s('g', { class: 'hits' }, this.svg);
      for (const b of BLOCKS) {
        const c = s('circle', { cx: b.x, cy: b.y, r: 38, class: 'hit' }, hits);
        c.addEventListener('click', () => opts.onPick!(b.id));
      }
    }

    this.gRoute = s('g', { class: 'route-layer' }, this.svg);
    this.gMarks = s('g', { class: 'marks-layer' }, this.svg);
    this.gDebug = s('g', { class: 'debug-layer' }, this.svg);
    if (opts.debug) this.drawDebug();

    new ResizeObserver(() => {
      this.applyVB(this.fit(this.vb));
      this.updateScaled();
    }).observe(host);
    this.applyVB(this.fit({ x: 0, y: 0, w: MAP.w, h: MAP.h }));
  }

  // --- geometría de la vista ------------------------------------------------

  private aspect() {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    return w / h;
  }

  /** Ajusta un rectángulo al aspecto del contenedor, centrado. */
  private fit(r: VB): VB {
    const a = this.aspect();
    let { x, y, w, h } = r;
    const cx = x + w / 2;
    const cy = y + h / 2;
    if (w / h < a) w = h * a;
    else h = w / a;
    x = cx - w / 2;
    y = cy - h / 2;
    return { x, y, w, h };
  }

  private applyVB(v: VB) {
    this.vb = v;
    this.svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  }

  /** Unidades de mapa por píxel de pantalla. */
  private k() {
    return this.vb.w / (this.host.clientWidth || 1);
  }

  private updateScaled() {
    const k = this.k() * (this.opts.markScale ?? 1);
    this.svg.querySelectorAll<SVGGElement>('[data-at]').forEach((g) => {
      const [x, y] = g.getAttribute('data-at')!.split(',');
      g.setAttribute('transform', `translate(${x} ${y}) scale(${k})`);
    });
  }

  private animateTo(target: VB, ms = 800) {
    cancelAnimationFrame(this.raf);
    const from = { ...this.vb };
    const t0 = performance.now();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = ease(p);
      this.applyVB({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      });
      this.updateScaled();
      if (p < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private boundsOf(points: Pt[], padPx: number): VB {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    // padding en px de pantalla -> unidades de mapa (iterativo, 2 pasadas)
    let r = this.fit({ x: minX, y: minY, w: Math.max(maxX - minX, 360), h: Math.max(maxY - minY, 360) });
    for (let i = 0; i < 2; i++) {
      const pad = (padPx * r.w) / (this.host.clientWidth || 1);
      r = this.fit({ x: minX - pad, y: minY - pad, w: Math.max(maxX - minX, 360) + pad * 2, h: Math.max(maxY - minY, 360) + pad * 2 });
    }
    return r;
  }

  // --- API pública -----------------------------------------------------------

  show(o: ShowOptions, animate = true) {
    this.last = o;
    this.gRoute.replaceChildren();
    this.gMarks.replaceChildren();

    const pts: Pt[] = [o.start];
    if (o.route && o.dest) {
      this.drawRoute(o.route, o.dest);
      pts.push(...o.route.points, o.dest);
    }
    for (const h of o.highlights ?? []) this.drawRing(h, h.id === o.nearestId, o.lang);
    if (o.dest) this.drawPin(o.dest);
    this.drawStart(o.start, o.lang);

    const target = o.route && o.dest ? this.boundsOf(pts, o.padding ?? 170) : this.fit({ x: 0, y: 0, w: MAP.w, h: MAP.h });
    if (animate) this.animateTo(target);
    else this.applyVB(target);
    this.updateScaled();
  }

  /** Redibuja con otro idioma sin mover la cámara. */
  relabel(lang: Lang) {
    if (!this.last) return;
    const keep = { ...this.vb };
    this.show({ ...this.last, lang }, false);
    this.applyVB(keep);
    this.updateScaled();
  }

  setUser(p: Pt | null, accuracyPx = 0) {
    this.gMarks.querySelectorAll('.user-dot').forEach((n) => n.remove());
    if (!p) return;
    const g = s('g', { class: 'user-dot', 'data-at': `${p.x},${p.y}` }, this.gMarks);
    const accR = Math.min(Math.max(accuracyPx, 10), 120);
    s('circle', { r: accR / this.k(), class: 'user-acc' }, g).setAttribute('data-acc', String(accuracyPx));
    s('circle', { r: 11, class: 'user-core' }, g);
    this.updateScaled();
  }

  focusOn(points: Pt[], padPx = 140) {
    this.animateTo(this.boundsOf(points, padPx));
  }

  // --- dibujo ----------------------------------------------------------------

  private drawRoute(r: RouteResult, dest: Destination) {
    const d = r.points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
    s('path', { d, class: 'route-casing' }, this.gRoute);
    s('path', { d, class: 'route-line' }, this.gRoute);
    s('path', { d, class: 'route-flow' }, this.gRoute);
    // tramo final hasta el pin (del sendero al edificio)
    if (Math.hypot(r.entry.x - dest.x, r.entry.y - dest.y) > 6) {
      s('path', { d: `M${r.entry.x} ${r.entry.y} L${dest.x} ${dest.y}`, class: 'route-last' }, this.gRoute);
    }
  }

  private drawStart(p: Pt, lang: Lang) {
    const g = s('g', { class: 'start', 'data-at': `${p.x},${p.y}` }, this.gMarks);
    s('circle', { r: 16, class: 'start-pulse' }, g);
    s('circle', { r: 16, class: 'start-pulse delay' }, g);
    s('circle', { r: 12, class: 'start-core' }, g);
    const label = tr('here', lang);
    const w = label.length * 13.5 + 40;
    const pill = s('g', { class: 'pill', transform: 'translate(0 -48)' }, g);
    s('rect', { x: -w / 2, y: -22, width: w, height: 44, rx: 22, class: 'pill-bg' }, pill);
    s('path', { d: 'M-9 21 L0 33 L9 21 Z', class: 'pill-tail' }, pill);
    const t = s('text', { x: 0, y: 8, 'text-anchor': 'middle', class: 'pill-text' }, pill);
    t.textContent = label;
  }

  private drawPin(d: Destination) {
    const lift = d.num ? 30 : 26; // la punta del pin queda justo encima del número impreso en el plano
    const g = s('g', { class: 'pin', 'data-at': `${d.x},${d.y - lift}` }, this.gMarks);
    const body = s('g', { class: 'pin-body' }, g);
    s('path', { d: 'M0 0 C-10 -16 -26 -30 -26 -50 A26 26 0 1 1 26 -50 C26 -30 10 -16 0 0 Z', class: 'pin-shape' }, body);
    if (d.num) {
      const t = s('text', { x: 0, y: -42, 'text-anchor': 'middle', class: 'pin-num' }, body);
      t.textContent = d.num;
      if (d.num.length > 1) t.setAttribute('font-size', '24');
    } else {
      s('circle', { cx: 0, cy: -50, r: 9, class: 'pin-dot' }, body);
    }
  }

  private drawRing(d: Destination, nearest: boolean, lang: Lang) {
    const g = s('g', { class: `ring${nearest ? ' nearest' : ''}`, 'data-at': `${d.x},${d.y}` }, this.gMarks);
    s('circle', { r: nearest ? 30 : 24, class: 'ring-halo' }, g);
    s('circle', { r: nearest ? 30 : 24, class: 'ring-line' }, g);
    if (nearest) {
      const label = tr('nearest', lang);
      const w = label.length * 12.5 + 34;
      s('rect', { x: -w / 2, y: 38, width: w, height: 38, rx: 19, class: 'pill-bg' }, g);
      const t = s('text', { x: 0, y: 64, 'text-anchor': 'middle', class: 'pill-text small' }, g);
      t.textContent = label;
    }
  }

  private drawDebug() {
    for (const [a, b] of EDGES) {
      const A = NODES.find((n) => n.id === a)!;
      const B = NODES.find((n) => n.id === b)!;
      s('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: 'dbg-edge' }, this.gDebug);
    }
    for (const n of NODES) {
      s('circle', { cx: n.x, cy: n.y, r: 5, class: 'dbg-node' }, this.gDebug);
      const t = s('text', { x: n.x + 7, y: n.y - 6, class: 'dbg-label' }, this.gDebug);
      t.textContent = n.id;
    }
    this.svg.addEventListener('click', (ev) => {
      const pt = this.svg.createSVGPoint();
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      const m = this.svg.getScreenCTM();
      if (!m) return;
      const p = pt.matrixTransform(m.inverse());
      console.log(`map px: ${Math.round(p.x)}, ${Math.round(p.y)}`);
      (window as unknown as { __lastClick: Pt }).__lastClick = { x: Math.round(p.x), y: Math.round(p.y) };
    });
  }
}
