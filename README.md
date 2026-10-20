# Wayfinding Campus UPB (demo)

Aplicación de orientación para pantallas interactivas del campus Laureles de la UPB. Pantalla táctil de 1920 x 1080, español e inglés, ruta animada sobre el plano oficial, servicios más cercanos y un código QR que lleva la ruta al celular.

Todo es de código abierto y se ejecuta sin servidores ni APIs de pago. Una vez cargada, **funciona sin internet** (PWA con caché local).

## Probar en local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # genera dist/ (PWA)
npm run build:single # genera dist-single/index.html, un solo archivo autocontenido (sin service worker)
```

Direcciones útiles:

| URL | Qué muestra |
| --- | --- |
| `/` | Pantalla del kiosco |
| `/?m=1&k=tunel&to=b10&l=es` | Página móvil (es la que abre el QR) con la ruta al bloque 10 |
| `/?debug=1` | Superpone los nodos y senderos sobre el mapa; al hacer clic se imprime la coordenada en la consola |

## Cómo está organizado

| Archivo | Para qué sirve |
| --- | --- |
| `src/data/graph.ts` | **Senderos del campus** (nodos y conexiones). Es lo que hay que validar con alguien que conozca el campus |
| `src/data/destinations.ts` | Directorio: bloques (leyenda del plano) y servicios (baños, comida, cajeros, auditorios, pagos, accesos, piscinas), con textos ES/EN |
| `src/lib/route.ts` | Cálculo de rutas (A*) e instrucciones paso a paso |
| `src/config.ts` | Escala del plano, pantallas (kioscos), tiempos de inactividad, URL base del QR, calibración GPS |
| `src/ui/` | Interfaz del kiosco, página móvil y vista del mapa |
| `src/assets/map.webp` | Plano base, extraído del PDF vectorial de la UPB |

### Agregar o corregir un sendero

1. Abre `/?debug=1`, haz clic sobre el mapa y copia las coordenadas que aparecen en la consola.
2. Agrega el nodo en `NODES` y conéctalo en `EDGES` (`src/data/graph.ts`).
3. Si es una entrada a un edificio, referénciala con `entry` en `src/data/destinations.ts`.

### Agregar otra pantalla

Agrega un nodo de partida en `graph.ts` y una entrada en `KIOSKS` (`src/config.ts`). El QR incluye el id de la pantalla (`k=`), así que la página móvil calcula la ruta desde el punto correcto.

## Publicar el demo

El build es estático y usa rutas relativas, así que funciona en cualquier carpeta.

- **GitHub Pages:** sube el repositorio y en Settings > Pages elige "GitHub Actions". El workflow `.github/workflows/pages.yml` compila y publica en cada push a `main`. En cuentas gratuitas el repositorio debe ser público.
- **Netlify / Cloudflare Pages:** conecta el repositorio con comando `npm run build` y carpeta `dist`, o arrastra la carpeta `dist`.
- Necesita HTTPS (todas las opciones anteriores lo incluyen) para que el celular pueda usar el GPS y para instalar la PWA.

Para producción, define `MOBILE_BASE_URL` en `src/config.ts` con la URL final que debe abrir el QR.

## Instalar en las pantallas

**Windows 11 Pro** (Edge en modo kiosco, abre al iniciar sesión):

```
msedge.exe --kiosk "https://TU-URL/" --edge-kiosk-type=fullscreen --no-first-run
```

Se puede configurar también como "Acceso asignado" (Assigned Access) de Windows para que la pantalla solo ejecute esa app y se reinicie sola. Alternativa: Chrome con `--kiosk --noerrdialogs --disable-infobars --overscroll-history-navigation=0`.

**Android:** abrir la URL en Chrome, "Instalar app" y fijar la pantalla (screen pinning), o usar un navegador de kiosco como Fully Kiosk Browser.

Si más adelante se necesita un instalador (.exe / .apk), la misma app se empaqueta con Tauri o Electron en Windows y con Capacitor en Android sin reescribir nada.

## Funcionamiento sin internet

- Pantalla del campus: mapa, rutas, búsqueda, teclado y QR se generan localmente. Tras la primera carga con internet, el service worker la guarda y arranca aunque no haya red.
- Necesitan internet: el celular del visitante para abrir la página del QR, el botón "Abrir en Google Maps" y las actualizaciones de contenido en la pantalla.

## Pendientes antes de producción

1. **Validar los senderos** con alguien que conozca el campus (están trazados a ojo sobre un plano ilustrativo). Verificar también si los baños y la comida dentro de la Cancha Fundadores (bloque 18) son de acceso público: se dejaron fuera de la lista.
2. **Calibrar el GPS:** `GEO` en `src/config.ts` es provisional. Tomar 4 a 6 puntos de control en Google Maps (satélite) para que el punto azul y el botón "Abrir en Google Maps" sean confiables.
3. **Plano vectorial original** (AI/SVG) para tener máxima nitidez en pantalla completa.
4. **Escala real:** `METERS_PER_PX` (0.36) se estimó con la cancha del bloque 18; los metros y minutos son aproximados.
5. **Interiores:** el demo es solo exterior (llegar a cada bloque). Pisos y salones requieren planos arquitectónicos.
6. **Accesibilidad:** una ruta sin escaleras requiere que el cliente indique rampas, ascensores y pendientes.
7. **Panel de administración y analítica** (destinos, avisos, cierres de rutas, búsquedas más frecuentes) como siguiente fase.
