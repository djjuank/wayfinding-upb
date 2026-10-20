// Interfaz del kiosco: pantalla táctil 1920 x 1080.

import QRCode from 'qrcode';
import {
  DEFAULT_KIOSK,
  IDLE_HOME_MS,
  IDLE_ROUTE_MS,
  IDLE_WARNING_MS,
  KIOSKS,
  MOBILE_BASE_URL,
  type Lang,
} from '../config';
import { BLOCKS, CATEGORIES, SERVICES, byId, type Destination } from '../data/destinations';
import { norm, tr } from '../i18n';
import { getNode, nearestService, routeToDestination, stepText, type RouteResult } from '../lib/route';
import logoUrl from '../assets/logo.png';
import { nearBlock, nearText } from '../lib/labels';
import { MapView } from './mapview';

interface Alt {
  dest: Destination;
  route: RouteResult;
}

interface State {
  lang: Lang;
  query: string;
  kb: boolean;
  cat: string | null;
  destId: string | null;
  route: RouteResult | null;
  alts: Alt[];
}

const initial = (): State => ({ lang: 'es', query: '', kb: false, cat: null, destId: null, route: null, alts: [] });

const KB_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function startKiosk(root: HTMLElement, debug: boolean) {
  const kiosk = KIOSKS[DEFAULT_KIOSK];
  const startNode = getNode(kiosk.node);
  let st = initial();
  let lastTouch = Date.now();
  let warnUntil = 0;

  root.innerHTML = `
    <div class="stage" id="stage">
      <section class="map-pane" id="mapPane"></section>
      <aside class="panel" id="panel"></aside>
      <div class="idle" id="idle" hidden></div>
    </div>`;
  const stage = root.querySelector<HTMLElement>('#stage')!;
  const panel = root.querySelector<HTMLElement>('#panel')!;
  const idle = root.querySelector<HTMLElement>('#idle')!;

  const map = new MapView(root.querySelector<HTMLElement>('#mapPane')!, {
    debug,
    onPick: (id) => selectDest(id),
  });

  // Escala la escena 1920x1080 al tamaño real de la pantalla
  const fitStage = () => {
    const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  };
  window.addEventListener('resize', fitStage);
  fitStage();

  // --- acciones ---------------------------------------------------------------

  function selectDest(id: string) {
    const dest = byId.get(id);
    if (!dest) return;
    const route = routeToDestination(startNode.id, dest);
    if (!route) return;
    st = { ...st, kb: false, cat: null, destId: id, route, alts: [] };
    render();
    syncMap(true);
  }

  function selectCategory(catId: string) {
    const list = SERVICES.filter((x) => x.cat === catId);
    const ranked: Alt[] = [];
    let pool = [...list];
    // ordena por distancia real de ruta
    while (pool.length) {
      const n = nearestService(startNode.id, pool);
      if (!n) break;
      ranked.push(n);
      pool = pool.filter((p) => p.id !== n.dest.id);
    }
    if (!ranked.length) return;
    st = { ...st, kb: false, cat: catId, destId: ranked[0].dest.id, route: ranked[0].route, alts: ranked };
    render();
    syncMap(true);
  }

  function pickAlt(id: string) {
    const a = st.alts.find((x) => x.dest.id === id);
    if (!a) return;
    st = { ...st, destId: a.dest.id, route: a.route };
    render();
    syncMap(true);
  }

  function reset() {
    st = initial();
    warnUntil = 0;
    idle.hidden = true;
    render();
    syncMap(true);
  }

  function syncMap(animate: boolean) {
    const dest = st.destId ? byId.get(st.destId) ?? null : null;
    map.show(
      {
        start: startNode,
        lang: st.lang,
        route: st.route,
        dest,
        highlights: st.cat ? st.alts.map((a) => a.dest) : [],
        nearestId: st.cat ? st.alts[0]?.dest.id : undefined,
      },
      animate,
    );
  }

  // --- búsqueda -----------------------------------------------------------------

  function matches(d: Destination, q: string): boolean {
    if (!q) return true;
    const words = norm(
      [d.num ?? '', d.num ? `bloque ${d.num} block ${d.num}` : '', d.name.es, d.name.en, d.sub?.es ?? '', d.sub?.en ?? '', d.keywords ?? ''].join(' '),
    ).split(' ');
    // cada palabra buscada debe ser el comienzo de alguna palabra del destino ("arq" -> "arquitectura", no "parqueadero")
    return q.split(' ').every((tok) => words.some((w) => w.startsWith(tok)));
  }

  // --- render -------------------------------------------------------------------

  function render() {
    const keep = panel.querySelector<HTMLElement>('.scroll')?.scrollTop ?? 0;
    panel.classList.toggle('kb-open', st.kb && !st.route);
    panel.innerHTML = st.route ? routeView() : homeView();
    const sc = panel.querySelector<HTMLElement>('.scroll');
    if (sc && !st.route) sc.scrollTop = keep;
    if (st.route) renderQR();
  }

  function header(back: boolean) {
    const l = st.lang;
    return `
      <header class="top">
        ${back ? `<button class="btn ghost back" data-act="reset"><span class="chev">&#8249;</span>${tr('back', l)}</button>` : `<img class="logo" src="${logoUrl}" alt="Universidad Pontificia Bolivariana" />`}
        <div class="lang" role="group" aria-label="Idioma / Language">
          <button class="${l === 'es' ? 'on' : ''}" data-act="lang" data-v="es">ES</button>
          <button class="${l === 'en' ? 'on' : ''}" data-act="lang" data-v="en">EN</button>
        </div>
      </header>`;
  }

  function homeView() {
    const l = st.lang;
    const q = norm(st.query);
    const inCampus = BLOCKS.filter((b) => !b.outside && matches(b, q));
    const outside = BLOCKS.filter((b) => b.outside && matches(b, q));
    const catMatches = CATEGORIES.filter((c) => q && norm(`${c.name.es} ${c.name.en} ${c.hint.es} ${c.hint.en}`).includes(q));
    const row = (b: Destination) => `
      <button class="row" data-act="dest" data-id="${b.id}">
        <span class="badge">${b.num}</span>
        <span class="txt"><b>${esc(b.name[l])}</b>${b.sub ? `<small>${esc(b.sub[l])}</small>` : ''}</span>
        <span class="go">&#8250;</span>
      </button>`;
    const none = !inCampus.length && !outside.length && !catMatches.length;
    return `
      ${header(false)}
      <div class="intro">
        <h1>${tr('title', l)}</h1>
        <p>${tr('subtitle', l)}</p>
      </div>
      <button class="search ${st.kb ? 'focus' : ''}" data-act="kb">
        <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        <span class="q ${st.query ? '' : 'ph'}">${st.query ? esc(st.query) : tr('search', l)}${st.kb ? '<i class="caret"></i>' : ''}</span>
        ${st.query ? '<span class="x" data-act="clearq">&times;</span>' : ''}
      </button>
      <div class="chips-wrap">
        <div class="label">${tr('services', l)}</div>
        <div class="chips">
          ${CATEGORIES.map((c) => `<button class="chip" data-act="cat" data-id="${c.id}">${c.name[l]}</button>`).join('')}
        </div>
      </div>
      <div class="scroll">
        ${catMatches.length ? `<div class="group">${tr('services', l)}</div>${catMatches.map((c) => `<button class="row svc" data-act="cat" data-id="${c.id}"><span class="badge dot"></span><span class="txt"><b>${c.nearest[l]}</b><small>${c.hint[l]}</small></span><span class="go">&#8250;</span></button>`).join('')}` : ''}
        ${inCampus.length ? `<div class="group">${tr('blocks', l)}</div>${inCampus.map(row).join('')}` : ''}
        ${outside.length ? `<div class="group">${tr('outside', l)}</div>${outside.map(row).join('')}` : ''}
        ${none ? `<div class="empty"><b>${tr('noResults', l)}</b><span>${tr('noResultsHint', l)}</span></div>` : ''}
      </div>
      ${st.kb ? keyboard() : ''}`;
  }

  function keyboard() {
    const l = st.lang;
    const key = (k: string) => `<button class="k" data-act="key" data-v="${k}">${k}</button>`;
    return `
      <div class="kb">
        ${KB_ROWS.map((r, i) => `<div class="kr">${[...r].map(key).join('')}${i === 3 ? '<button class="k wide" data-act="bksp" aria-label="Borrar">&#9003;</button>' : ''}</div>`).join('')}
        <div class="kr">
          <button class="k action" data-act="clearq">${tr('clear', l)}</button>
          <button class="k space" data-act="key" data-v=" ">${tr('space', l)}</button>
          <button class="k action primary" data-act="kbclose">${tr('done', l)}</button>
        </div>
      </div>`;
  }

  function routeView() {
    const l = st.lang;
    const r = st.route!;
    const dest = byId.get(st.destId!)!;
    const cat = st.cat ? CATEGORIES.find((c) => c.id === st.cat) : null;
    const title = cat ? cat.nearest[l] : dest.name[l];
    const sub = cat ? [cat.hint[l], nearText(dest, l)].filter(Boolean).join(' · ') : dest.sub?.[l] ?? '';
    const badge = dest.num ? `<span class="badge big">${dest.num}</span>` : `<span class="badge big dot"></span>`;
    const alts = st.alts.filter((a) => a.dest.id !== dest.id).slice(0, 3);
    const altLabel = (d: Destination) => {
      const n = nearBlock(d);
      return n ? `${l === 'es' ? 'Bloque' : 'Block'} ${n}` : d.name[l];
    };
    return `
      ${header(true)}
      <div class="dest">
        ${badge}
        <div class="txt"><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
      </div>
      <div class="stats">
        <div><b>${r.minutes}</b><span>${tr('min', l)} ${tr('walk', l)}</span></div>
        <div><b>${r.meters}</b><span>m</span></div>
        <small>${tr('approx', l)}</small>
      </div>
      ${alts.length ? `<div class="alts"><span class="label">${tr('others', l)}</span>${alts.map((a) => `<button class="chip small" data-act="alt" data-id="${a.dest.id}">${esc(altLabel(a.dest))} &middot; ${a.route.meters}&nbsp;m</button>`).join('')}</div>` : ''}
      <div class="scroll steps">
        <div class="group">${tr('steps', l)}</div>
        <ol>
          ${r.steps.map((s, i) => `<li class="${s.key === 'arrive' ? 'last' : ''}"><span class="n">${s.key === 'arrive' ? '&#10003;' : i + 1}</span><span>${esc(stepText(s, l))}</span></li>`).join('')}
        </ol>
        ${dest.outside ? `<p class="note">${tr('outsideNote', l)}</p>` : ''}
      </div>
      <div class="qr-card">
        <div class="qr" id="qr" aria-label="QR"></div>
        <div class="qr-txt">
          <b>${tr('scanTitle', l)}</b>
          <span>${tr('scanText', l)}</span>
          <button class="btn primary" data-act="reset">${tr('newSearch', l)}</button>
        </div>
      </div>`;
  }

  async function renderQR() {
    const el = panel.querySelector<HTMLElement>('#qr');
    if (!el || !st.destId) return;
    const base = MOBILE_BASE_URL || `${location.origin}${location.pathname}`;
    // En la versión de un solo archivo (vista previa alojada) los parámetros viajan en el hash
    const url = __SINGLE__ ? `${base}#m.${kiosk.id}.${st.destId}.${st.lang}` : `${base}?m=1&k=${kiosk.id}&to=${st.destId}&l=${st.lang}`;
    const svg = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1b1b1b', light: '#ffffff' } });
    // evita pintar un QR viejo si el usuario ya cambió de destino
    if (panel.querySelector('#qr') === el) el.innerHTML = svg;
    el.setAttribute('data-url', url);
  }

  // --- eventos ------------------------------------------------------------------

  panel.addEventListener('click', (ev) => {
    const t = (ev.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!t) return;
    const act = t.dataset.act;
    const v = t.dataset.v ?? '';
    const id = t.dataset.id ?? '';
    switch (act) {
      case 'lang':
        st = { ...st, lang: v as Lang };
        if (st.cat) {
          // los nombres de servicio no cambian la ruta: solo se vuelve a pintar
        }
        render();
        map.relabel(st.lang);
        break;
      case 'kb':
        if (!st.kb) {
          st = { ...st, kb: true };
          render();
        }
        break;
      case 'kbclose':
        st = { ...st, kb: false };
        render();
        break;
      case 'key':
        if (st.query.length < 40) st = { ...st, query: st.query + v };
        render();
        break;
      case 'bksp':
        st = { ...st, query: st.query.slice(0, -1) };
        render();
        break;
      case 'clearq':
        ev.stopPropagation();
        st = { ...st, query: '' };
        render();
        break;
      case 'dest':
        selectDest(id);
        break;
      case 'cat':
        selectCategory(id);
        break;
      case 'alt':
        pickAlt(id);
        break;
      case 'reset':
        reset();
        break;
    }
  });

  // --- inactividad ----------------------------------------------------------------

  const touch = () => {
    lastTouch = Date.now();
    if (warnUntil) {
      warnUntil = 0;
      idle.hidden = true;
    }
  };
  ['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, touch, true));
  ['contextmenu', 'selectstart', 'dragstart'].forEach((e) => document.addEventListener(e, (x) => x.preventDefault()));

  idle.addEventListener('click', () => touch());

  setInterval(() => {
    const dirty = !!st.route || !!st.query || st.kb || st.lang !== 'es';
    if (!dirty) return;
    const limit = st.route ? IDLE_ROUTE_MS : IDLE_HOME_MS;
    const idleFor = Date.now() - lastTouch;
    if (!warnUntil && idleFor > limit) {
      warnUntil = Date.now() + IDLE_WARNING_MS;
    }
    if (warnUntil) {
      const left = Math.ceil((warnUntil - Date.now()) / 1000);
      if (left <= 0) {
        reset();
        return;
      }
      idle.hidden = false;
      idle.innerHTML = `<div class="idle-card"><h3>${tr('idleTitle', st.lang)}</h3><p>${tr('idleText', st.lang)} <b>${left}</b> s</p><button class="btn primary">${tr('idleBtn', st.lang)}</button></div>`;
    }
  }, 500);

  render();
  syncMap(false);

  // Utilidades para pruebas desde la consola / Playwright
  (window as unknown as { __kiosk: unknown }).__kiosk = { selectDest, selectCategory, reset };
}
