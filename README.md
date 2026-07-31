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

El feed de Citi Bike (`free_bike_status.json`) devuelve un JSON estático que el servidor actualiza periódicamente. No hay WebSocket ni SSE, así que la aplicación usa **polling**. La implementación está en `VehicleStore.startPolling()`:

- **`timer(0, 30000)`** — primera consulta inmediata, luego cada 30 segundos. El intervalo se basa en el `ttl` que la API suele devolver.
- **`switchMap`** — si una llamada tarda más de 30s, se cancela la anterior y solo queda una activa. Evita acumulación de peticiones.
- **`catchError`** — ante fallo de red, asigna el `error` signal para que la UI muestre el mensaje con botón reintentar.
- **`takeUntilDestroyed`** — la suscripción se limpia automáticamente al destruirse el store.

El consumo se dispara desde el constructor del store (no desde un componente). Como está en `providedIn: 'root'`, arranca al abrir la app y cualquier componente solo lee signals. Esto centraliza el polling y evita duplicar llamadas si dos componentes necesitan vehículos.

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
ng test               # tests unitarios (72 tests, 13 suites)
```

En desarrollo, el proxy redirige `/api/gbfs` a `https://gbfs.citibikenyc.com` para evitar CORS sin extensiones de navegador ni backend propio.

## Build APK con Capacitor

```bash
ng build                        # genera dist/gbfs-mapvx
npx cap sync android            # copia web assets al proyecto Android
npx cap open android            # abre Android Studio para build manual
# o build directo desde CLI:
cd android && ./gradlew assembleDebug  # genera app-debug.apk
```

Para APK firmado de producción:

```bash
cd android && ./gradlew assembleRelease
```

Capacitor permite que esta misma app Angular funcione como web y como app nativa sin cambiar una línea de código de la UI. Las APIs nativas (GPS, cámara) se consumen vía plugins de Capacitor manteniendo el mismo código base.

## Stack

| Tecnología | Uso |
|---|---|
| **Angular 22** | Framework principal, standalone components |
| **TailwindCSS v4** | Estilos utilitarios |
| **spartan/ui** | Componentes de UI basados en brn |
| **ng icons** | Iconos de vehículos |
| **MapLibre GL JS** | Mapa interactivo con capas GeoJSON |
| **Lottie-web** | Animación splash (carga lazy) |
| **Capacitor** | APK nativo Android |
| **Vitest** | Tests unitarios |
| **@types/geojson** | Tipado para FeatureCollection del mapa |

## Decisiones de arquitectura y trade-offs

**Standalone components** — Angular 22 marca standalone como default. Sin NgModules, estructura más plana y treeshakeable.

**Signals para estado** — el store usa `signal`, `computed` y `effect` en lugar de RxJS BehaviorSubjects. Señales son síncronas y no requieren suscripciones ni unsubscribe. RxJS se reserva solo para el polling HTTP donde su ecosistema de operadores sigue siendo superior (`timer`, `switchMap`, `catchError`).

**Effects con Angular** — los `effect()` en `MapComponent` reaccionan a cambios en el store:
- Cuando `store.vehicles()` cambia → `updateMapVehicles()` actualiza la fuente GeoJSON.
- Cuando `store.selectedVehicleId()` cambia → highlight y popup se sincronizan.
- Cuando `store.selectedVehicle()` cambia → `flyTo()` centra el mapa.

Estos effects son la columna vertebral de la sincronización mapa ↔ lista. Se ejecutan automáticamente sin necesidad de eventos manuales ni suscripciones.

**Mapa desacoplado y segmentado** — el mapa no es un monolito. Se dividió en:

| Archivo | Rol |
|---|---|
| `map.ts` | Ciclo de vida, orquestación, interacciones |
| `config-map/index.ts` | Constantes: style URL, centros, zoom, colores, IDs |
| `custom-svg/index.ts` | 3 iconos SDF para símbolos (bike, ebike, scooter) |
| `popup-map/popup-content.ts` | HTML del popup como función pura |

Esto permite cambiar el style URL, reemplazar iconos o probar `popupContent` sin tocar el componente ni instanciar MapLibre.

**Proxy en desarrollo** — `proxy.conf.json` redirige `/api/gbfs` a la API de Citi Bike. En producción no hace falta porque el browser consulta directamente la URL pública. Se eligió proxy en lugar de modificar CORS porque no controlamos la API.

**Mock data** — durante el desarrollo, la API de Citi Bike respondía varias veces con `bikes: []` (array vacío). Sin datos no se podía desarrollar ni testear visualmente. Se creó `mock-vehicles.data.ts` con 40 vehículos en Manhattan variando tipos (bike, ebike, scooter) y estados (disponible, reservada, deshabilitada). El servicio (`VehicleApiService`) usa el mock como fallback: si la API devuelve 0 vehículos, retorna el mock. También permite desarrollo offline.

**Personalización del mapa con SVGs** — los iconos del mapa no son los default de MapLibre. Se crearon 3 SVGs a medida:
- `BIKE_SVG`: bicicleta clásica (sin caballete final).
- `EBIKE_SVG`: ciclomotor/moped.
- `SCOOTER_SVG`: scooter de pie.

Se renderizan como SDF (Signed Distance Field), lo que permite a MapLibre aplicarles `icon-color` por tipo de vehículo en tiempo real, reutilizando una sola imagen por tipo sin importar el color.

**Lottie splash** — `lottie-web` se carga con `import()` dinámico lazy (~65 KB gzipped) solo cuando el splash se muestra. Como contraparte, hay un pequeño delay inicial y `lottie-web` es CommonJS (genera warning de optimization bailout). Alternativas futuras: `@lottiefiles/dotlottie` (ESM nativo).

**Dynamic import de lottie-web** — `lottie-web` (~308 KB) se carga con `import()` lazy solo cuando el splash se inicializa, no en el bundle inicial. Como contraparte, hay un pequeño delay al mostrar la animación.

**Stubs en tests** — Los tests usan componentes stub en lugar de `CUSTOM_ELEMENTS_SCHEMA` para evitar falsos negativos de Angular (`NG0951`). Esto hace los tests más precisos pero requiere mantener los stubs al día.

**CartoDB Voyager como style del mapa** — `https://demotiles.maplibre.org/style.json` es funcional pero muy básico (sin nombres de calles). CartoDB Voyager es gratuito, liviano y con nomenclatura urbana, similar a Google Maps. Alternativas como MapTiler o Stadia requieren API key.

**Web worker de MapLibre** — MapLibre v6 usa un worker (`maplibre-gl-worker.mjs`) para renderizado paralelo. Angular/Vite no lo copia automáticamente al output. Sin él, el mapa se ve en blanco. Se configuró en `angular.json`:
```json
{ "glob": "maplibre-gl-worker.mjs", "input": "node_modules/maplibre-gl/dist", "output": "/" }
```

## Atribuciones

- **Map tiles:** [CartoDB Voyager](https://carto.com/attributions) — © CARTO, © OpenStreetMap contributors
- **Datos de vehículos:** [Citi Bike GBFS](https://gbfs.citibikenyc.com/gbfs/2/gbfs) — © Lyft / Citi Bike
- **Iconos:** SVGs personalizados generados como SDF para MapLibre
- **Animación splash:** Archivo Lottie de dominio público (modificado para colores del tema oscuro)

## Limitaciones conocidas

- **API devuelve array vacío**: en ocasiones Citi Bike responde con `bikes: []`. El mock data es un parche; una solución definitiva sería consumir múltiples feeds GBFS o tener un middleware que normalice.
- **Sin soporte offline**: la app requiere conexión para cargar tiles del mapa (CartoDB) y datos GBFS.
- **Polling fijo**: el intervalo es fijo a 30s. Idealmente debería respetar el `ttl` que devuelve cada respuesta.
- **Sin clustering**: todos los vehículos se renderizan como puntos individuales. Con >500 vehículos visibles el rendimiento puede degradarse.
- **Cobertura de tests en templates**: las `.html` de Angular tienen cobertura parcial porque el template engine escapa al análisis de v8.
- **`lottie-web` no es ESM**: CommonJS, genera warning de build. Alternativa: `@lottiefiles/dotlottie`.
- **Sin geolocalización**: el mapa no se centra automáticamente en la ubicación del usuario.

## Mejoras futuras

- Clustering de MapLibre para flotas grandes.
- Geolocalización del usuario con `navigator.geolocation`.
- Respetar `ttl` dinámico de la API en lugar de intervalo fijo.
- Migrar a `@lottiefiles/dotlottie` (ESM nativo).
- PWA + service worker para cachear tiles y datos recientes.
- WebSocket/SSE si el proveedor lo soporta.
- Tests e2e con Cypress o Playwright.
- CI/CD con GitHub Actions.

## Disclaimer

Usé IA y documentación web como apoyo para explorar alternativas de diseño y buenas prácticas. Todo el código pasó por revisión y pruebas. No tengo problema en defender cada línea. Siendo mi primera vez con MapLibre, consulté a la IA para: elegir un style de mapa similar a Google Maps, generar los SVGs personalizados, obtener la animación Lottie para el splash, y ayuda con tests unitarios repetitivos. La arquitectura general, el uso de signals, la estructura de directorios y el boceto del layout fueron decisiones autónomas. Y ayudarme con la creacion de este readme.md veo que resalta Migrar a `@lottiefiles/dotlottie` (ESM nativo) cuando siempre vengo de usar lottie-web lo cual tendre en cuenta si continuo en el proceso de seleccion, Tambien debo reconocer que IA me ayudo mucho con la clases de tailwindcss a usar en este desafio y mejorar mis estilos. Esa funcion de dark/ligh aprendi con ia a implementarla.
