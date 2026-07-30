# GBFS MapVX

Visualizador en tiempo real de bicicletas compartidas usando el estándar **GBFS (General Bikeshare Feed Specification)** con el feed público de Citi Bike.

## Intención de este proyecto

Vengo de trabajar en banca y este es mi primer desafío técnico de este estilo, y también mi primera vez usando **MapLibre**. Ha sido una experiencia enriquecedora. Para el diseño de la arquitectura y ciertas decisiones técnicas consulté documentación, referencias en internet y también usé IA como herramienta de apoyo — nada nuevo, creo que hoy es parte del día a día de cualquier desarrollador.

El proyecto quedó con un gusto a "quiero más" y eso creo que es buena señal.

## ¿Qué es GBFS y por qué existe?

**GBFS (General Bikeshare Feed Specification)** es un estándar de datos abierto para movilidad compartida (bicicletas, scooters, etc.). Un visualizador GBFS consume estos feeds públicos y traduce datos crudos en un mapa interactivo.

**Propósito:** Mostrar en tiempo real el estado físico de una flota de vehículos. El usuario sabe dónde hay una bici disponible cerca de su ubicación en este momento.

**Qué soluciona:** Antes de GBFS, cada empresa tenía su propia estructura de datos. El estándar eliminó esa fragmentación.

## Sobre el polling

El feed de Citi Bike (`free_bike_status.json`) es un archivo estático que el servidor sobrescribe cada cierto tiempo. No hay una conexión persistente (WebSocket ni SSE), así que la aplicación usa **polling**: consulta el endpoint cada 10 segundos para detectar cambios. Esto mantiene el mapa sincronizado con la realidad sin saturar la red ni bloquear la UI.

## Requisitos de entorno

- Node.js 22+
- npm 10+
- Angular CLI 22 (`npm install -g @angular/cli@22`)

## Instalación y ejecución

```bash
git clone <repo-url>
cd gbfs-mapvx
npm install
ng serve              # http://localhost:4200
ng build              # build producción en dist/
ng test               # tests unitarios (72 tests)
```

En desarrollo, el proxy redirige `/api/*` a `https://gbfs.citibikenyc.com` para evitar CORS.

## Stack

| Tecnología | Uso |
|---|---|
| **Angular 22** | Framework principal, standalone components |
| **TailwindCSS** | Estilos utilitarios |
| **spartan/ui** | Componentes de UI basados en brn |
| **ng icons** | Iconos |
| **MapLibre GL JS** | Mapa interactivo con capas GeoJSON |
| **Lottie-web** | Animaciones splash (carga lazy) |
| **Capacitor** | Preparado para alcance mobile |
| **Vitest** | Tests unitarios |

## Decisiones de arquitectura y trade-offs

- **Standalone components** — Angular 22 marca standalone como default. Sin NgModules, estructura más plana y treeshakeable.
- **Signal store** — Usamos signals en lugar de RxJS para el estado de vehículos. Menos boilerplate, reactividad fina, sin unsubscribe.
- **Dynamic import de lottie-web** — `lottie-web` (~308 KB) se carga con `import()` lazy solo cuando el splash se inicializa, no en el bundle inicial. Como contraparte, hay un pequeño delay al mostrar la animación.
- **Stubs en tests** — Los tests usan componentes stub en lugar de `CUSTOM_ELEMENTS_SCHEMA` para evitar falsos negativos de Angular (`NG0951`). Esto hace los tests más precisos pero requiere mantener los stubs al día.
- **Proxy en desarrollo** — Se usa `proxy.conf.json` para evitar CORS. No aplica en producción porque el API de Citi Bike no requiere autenticación.
- **Polling vs WebSocket** — La API de Citi Bike expone archivos JSON estáticos, no WebSockets. Polling cada 10s es la opción más simple y confiable; para datos realmente en tiempo real se necesitaría un middleware que consuma GBFS y emita por SSE.

## Limitaciones conocidas

- Los marcadores en el mapa se renderizan todos simultáneamente. Con cientos de vehículos sería necesario clustering.
- El polling cada 10 segundos puede no ser suficiente en horas pico si el feed se actualiza más rápido.
- `lottie-web` es CommonJS, no ESM. Angular lo advierte en build porque impide optimizaciones avanzadas.

## Mejoras futuras

- Agrupar vehículos por clusters de MapLibre para mejor rendimiento con flotas grandes.
- Reemplazar `lottie-web` con `lottie-web-light` o `@lottiefiles/dotlottie` (versiones ESM nativas).
- Agregar geolocalización del usuario con `navigator.geolocation` para centrar el mapa en su ubicación.
- Agregar Capacitor nativo con plugins de GPS y cámara.
- Migrar a WebSocket + Server-Sent Events si el proveedor lo soporta.

## Disclaimer

Usé IA y documentación web como apoyo para explorar alternativas de diseño y buenas prácticas. Todo el código pasó por revisión y pruebas. No tengo problema en defender cada línea.
