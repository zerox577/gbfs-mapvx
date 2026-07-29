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

## Stack

| Tecnología | Uso |
|---|---|
| **Angular 22** | Framework principal, standalone components |
| **TailwindCSS** | Estilos utilitarios |
| **spartan/ui** | Componentes de UI basados en brn |
| **ng icons** | Iconos |
| **MapLibre GL JS** | Mapa interactivo con capas GeoJSON |
| **Lottie-web** | Animaciones splash (detalle de fina coquetería) |
| **Capacitor** | Preparado para alcance mobile |
| **Vitest** | Tests unitarios |

## Comandos

```bash
ng serve              # dev en http://localhost:4200
ng build              # build producción
ng test               # tests unitarios (72 tests)
```

## Disclaimer

Usé IA y documentación web como apoyo para explorar alternativas de diseño y buenas prácticas. Todo el código pasó por revisión y pruebas. No tengo problema en defender cada línea.
