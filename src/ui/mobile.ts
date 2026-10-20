// Página móvil: se abre al escanear el QR del kiosco y continúa la ruta en el celular.

import { DEFAULT_KIOSK, KIOSKS, type Lang } from '../config';
import { byId } from '../data/destinations';
import { tr } from '../i18n';
import { getNode, routeToDestination, stepText } from '../lib/route';
import { googleMapsUrl, insideMap, latLngToPx } from '../lib/geo';
import logoUrl from '../assets/logo.png';
import { titleOf } from '../lib/labels';
import { MapView } from './mapview';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function startMobile(root: HTMLElement, params: URLSearchParams, debug: boolean) {
  let lang: Lang = params.get('l') === 'en' ? 'en' : navigator.language.toLowerCase().startsWith('en') && !params.get('l') ? 'en' : 'es';
  const kiosk = KIOSKS[params.get('k') ?? DEFAULT_KIOSK] ?? KIOSKS[DEFAULT_KIOSK];
  const dest = byId.get(params.get('to') ?? '');
  const startNode = getNode(kiosk.node);
  const route = dest ? routeToDestination(kiosk.node, dest) : null;

  let msg = '';
  let watchId: number | null = null;

  root.innerHTML = `
    <div class="m">
      <header class="m-top">
        <img src="${logoUrl}" alt="UPB" />
        <div class="lang" role="group"><button data-v="es">ES</button><button data-v="en">EN</button></div>
      </header>
      <section class="m-map" id="mMap"></section>
      <section class="m-sheet" id="mSheet"></section>
    </div>`;

  const map = new MapView(root.querySelector<HTMLElement>('#mMap')!, { debug, markScale: 0.62 });
  const sheet = root.querySelector<HTMLElement>('#mSheet')!;

  const paintMap = (animate: boolean) =>
    map.show({ start: startNode, lang, route, dest: dest ?? null, padding: 92 }, animate);

  function render() {
    root.querySelectorAll<HTMLButtonElement>('.m-top .lang button').forEach((b) => b.classList.toggle('on', b.dataset.v === lang));
    if (!dest || !route) {
      sheet.innerHTML = `<p class="m-bad">${tr('badLink', lang)}</p>`;
      return;
    }
    const badge = dest.num ? `<span class="badge big">${dest.num}</span>` : `<span class="badge big dot"></span>`;
    sheet.innerHTML = `
      <div class="m-dest">${badge}<div class="txt"><h2>${esc(titleOf(dest, lang).title)}</h2>${titleOf(dest, lang).sub ? `<p>${esc(titleOf(dest, lang).sub)}</p>` : ''}</div></div>
      <div class="m-stats"><b>${route.minutes}</b> ${tr('min', lang)} ${tr('walk', lang)} &middot; <b>${route.meters}</b> m <small>(${tr('approx', lang).toLowerCase()})</small></div>
      <div class="m-actions">
        <a class="btn primary" href="${googleMapsUrl(dest)}" target="_blank" rel="noopener">${tr('openMaps', lang)}</a>
        <button class="btn" id="mLoc">${tr('myLocation', lang)}</button>
      </div>
      ${msg ? `<p class="m-msg">${esc(msg)}</p>` : ''}
      <p class="m-from">${tr('routeFrom', lang)}: <b>${esc(kiosk.name[lang])}</b></p>
      <ol class="m-steps">
        ${route.steps.map((s, i) => `<li class="${s.key === 'arrive' ? 'last' : ''}"><span class="n">${s.key === 'arrive' ? '&#10003;' : i + 1}</span><span>${esc(stepText(s, lang))}</span></li>`).join('')}
      </ol>`;
    sheet.querySelector('#mLoc')?.addEventListener('click', locate);
  }

  function locate() {
    if (!('geolocation' in navigator)) {
      msg = tr('locError', lang);
      render();
      return;
    }
    msg = tr('locating', lang);
    render();
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    let first = true;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const p = latLngToPx({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!insideMap(p)) {
          map.setUser(null);
          msg = tr('locOutside', lang);
          render();
          return;
        }
        map.setUser(p, pos.coords.accuracy / 0.36);
        msg = tr('locApprox', lang);
        if (first && route && dest) {
          map.focusOn([p, ...route.points, dest], 92);
          first = false;
        }
        render();
      },
      () => {
        msg = tr('locError', lang);
        render();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }

  root.querySelector('.m-top .lang')!.addEventListener('click', (e) => {
    const v = (e.target as HTMLElement).dataset.v as Lang | undefined;
    if (!v) return;
    lang = v;
    render();
    map.relabel(lang);
  });

  render();
  paintMap(false);
  document.documentElement.lang = lang;
}
