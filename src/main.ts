import './style.css';
import { startKiosk } from './ui/kiosk';
import { startMobile } from './ui/mobile';

let params = new URLSearchParams(location.search);
// Enlace móvil alterno: #m.<pantalla>.<destino>.<idioma>
const hm = location.hash.match(/^#m\.([\w~-]+)\.([\w~-]+)\.(es|en)$/);
if (hm) params = new URLSearchParams({ m: '1', k: hm[1], to: hm[2], l: hm[3] });
const debug = params.get('debug') === '1';
const root = document.getElementById('app')!;
const mobile = params.get('m') === '1';

// El kiosco siempre usa el tema claro; la página móvil sigue el tema del teléfono.
document.documentElement.dataset.mode = mobile ? 'mobile' : 'kiosk';
if (!mobile) document.documentElement.dataset.theme = 'light';

if (mobile) startMobile(root, params, debug);
else startKiosk(root, debug);

// PWA: cachea la app para que siga funcionando sin internet (no aplica a la versión de un solo archivo).
if (!__SINGLE__ && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    /* sin service worker la app funciona igual, solo requiere internet */
  });
}
