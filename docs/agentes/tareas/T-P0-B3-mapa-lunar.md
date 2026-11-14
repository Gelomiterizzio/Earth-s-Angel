# T-P0-B3 · Mapa lunar en Phaser

| Campo | Valor |
| --- | --- |
| ID | T-P0-B3 |
| Prioridad · hito | P0 · H2 |
| Perfil recomendado | [Jugabilidad](../prompts/jugabilidad.md) |
| Responsable · revisor | B · A |
| Base Git | Rama `b/p0-b3-mapa` desde `main` |
| Estimación | 2,5 h |
| Estado | propuesto |

## Objetivo

El tablero lunar se dibuja desde el estado del juego: terreno, niebla, nave, edificios y cursor. Se puede recorrer con ratón y con teclado.

## Componentes

[mapa](../../componentes/mapa.md)

## Contexto a leer

1. [mapa](../../componentes/mapa.md)
2. [niveles/luna.md](../../niveles/luna.md)
3. [ARQUITECTURA.md](../../ARQUITECTURA.md): tipos `Tile`, `Building`, `MissionState`; almacén; puntos de entrada
4. [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md#disposición-del-escenario): zona del tablero
5. [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md): tamaño de casilla, paleta lunar y nombres de sprites

## Dependencias

A2. Trabaja con `fixtureState` hasta que A3 esté en `main`. La espera B4.

## Rutas

- **Permitidas:** `src/map/**`.
- **Excluidas:** todo lo demás. Phaser solo se importa dentro de `src/map`.

## Contratos

`createMapView(parent, ctx): MapView` en `src/map/index.ts`. El mapa lee `ctx.store` y `ctx.uiStore`. No guarda estado del juego.

## Pasos de implementación

1. `index.ts`: crea el `Phaser.Game` dentro de `parent` con tamaño lógico 288 × 288, `pixelArt: true`, escala `FIT` y fondo transparente. Devuelve `setVisible` y `destroy`.
2. `MapScene.ts`: una sola escena, sin física.
3. `tiles.ts`: una textura por terreno. Si el sprite del manifiesto no existe, genera un rectángulo de color de la paleta con una letra. El mapa nunca falla por un activo ausente.
4. Dibujo desde el estado: casillas exploradas con su terreno; sin explorar con niebla; minerales recolectados con el terreno vacío.
5. Edificios: sprite por tipo. Si `day < operationalFromDay`, se dibuja con andamio. Si está apagado o sin electricidad, con un icono encima.
6. Suscripción al almacén: se redibuja solo lo que cambió. Suscripción a `uiStore`: cursor y herramienta.
7. Cursor: sigue al ratón; con teclado se mueve con las flechas. Actualiza `uiStore.hover`.
8. Etiqueta accesible: un elemento fuera del lienzo, con `aria-live`, describe la casilla bajo el cursor: "Columna 9, fila 8. Hielo. Libre."
9. `setVisible(false)` pausa la escena y oculta el lienzo.
10. Con `prefers-reduced-motion` o la opción de movimiento reducido, sin animaciones de entrada.

## Entregables

Tablero lunar que refleja cualquier `MissionState` válido.

## Pruebas

Manuales M-MAP-01 a M-MAP-05 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Con `fixtureState('media-dia-1')` se ve la zona de 5 × 5 explorada, la nave en (5,5) y el mineral en (3,7).
- [ ] Con `fixtureState('media-dia-8')` se ven todos los edificios del recorrido en sus casillas.
- [ ] Al cambiar el estado en el almacén, el tablero cambia sin recargar.
- [ ] Las flechas mueven el cursor y la etiqueta accesible lo describe.
- [ ] Sin sprites en `public/assets`, el tablero se ve con rectángulos y letras.
- [ ] Sin errores de consola. Nada fuera de `src/map` importa Phaser.

## Evidencia

Capturas del día 1 y del día 8.

## Condiciones de integración

A cablea `createMapView` en `main.ts`. Fusionado antes de H2 (sábado 17:30).

**Plan B:** si a las 16:30 el tablero no dibuja, cambia a una cuadrícula de 144 botones HTML dentro de `parent`, con la misma interfaz `MapView`. Avisa a A y a C.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
