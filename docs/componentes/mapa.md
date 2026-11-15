# Mapa

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-11 |
| Prioridad · fase | P0 · H2 |
| Objetivo | Representar el terreno en una cuadrícula, con niebla, exploración y recolección, y dibujarlo desde el estado. |
| Responsabilidad | Modelo de casillas en el núcleo (A), datos del mapa (B), cuadrícula HTML y capas canvas en `src/map/` (B y C) |
| Depende de | [ARQUITECTURA.md](../ARQUITECTURA.md), [construccion](construccion.md), [hud-y-accesibilidad](hud-y-accesibilidad.md) |
| No incluye | Paleta y medidores del HUD. Reglas de producción de los edificios. |
| Responsable · revisor | B · A |
| Estado | Luna integrada y jugable. Marte disponible como muestra de arte de P1. |

## 2. Arquitectura y funcionamiento

- **Datos:** `src/data/content/levels/<nivel>.json`. Formato `LevelConfig`. Mapas concretos en [niveles/luna.md](../niveles/luna.md) y [niveles/marte.md](../niveles/marte.md).
- **Modelo:** `MissionState.map.tiles`, fila por fila. Índice de `(x, y)` = `y × width + x`.
- **Vista:** `src/map/`. Lee el almacén, no guarda estado, despacha acciones.

### Coordenadas

Origen `(0,0)` arriba a la izquierda. `x` crece a la derecha y `y` hacia abajo. En pantalla y en los mensajes accesibles se dice "columna" y "fila".

### Exploración · `EXPLORE`

Validación en orden:

| Orden | Condición | Error |
| --- | --- | --- |
| 1 | Fase `planning` | `WRONG_PHASE` |
| 2 | Casilla dentro del mapa | `TILE_OUT_OF_BOUNDS` |
| 3 | Casilla sin explorar | `ALREADY_EXPLORED` |
| 4 | Toca, también en diagonal, a una casilla explorada | `NOT_ADJACENT` |
| 5 | Al menos 1 punto de acción | `NO_AP` |

Efecto: resta 1 punto de acción y marca como exploradas la casilla y sus vecinas dentro del radio `exploreRevealRadius` (bloque de 3 × 3). Emite `tile/explored` con la lista de casillas reveladas. Si alguna es `misterio`, emite además `discovery/found`.

### Recolección · `COLLECT`

| Orden | Condición | Error |
| --- | --- | --- |
| 1 | Fase `planning` | `WRONG_PHASE` |
| 2 | Casilla dentro del mapa | `TILE_OUT_OF_BOUNDS` |
| 3 | Casilla explorada | `TILE_UNEXPLORED` |
| 4 | Terreno `mineral` y `collected === false` | `NOTHING_TO_COLLECT` |
| 5 | Al menos 1 punto de acción | `NO_AP` |

Efecto: resta 1 punto de acción, suma `mineralYield` a los materiales hasta la capacidad, marca `collected = true` y emite `resource/collected`. Una casilla mineral recolectada pasa a contar como suelo llano para construir (`buildTerrain` en `src/core/terrain.ts`): se puede construir encima y caminar por ella.

**Lo que tiene delante el astronauta.** En la Luna, el panel inferior muestra una línea «Delante» (`describeWalkTarget` en `src/map/walk.ts`) con el terreno o el edificio de la casilla objetivo: su nombre, si está en construcción, averiado, apagado o sin electricidad, y por qué no se puede construir cuando es roca, cráter, hielo, señal misteriosa o la nave. Los textos están en `content.map.look.*` en inglés y español.

### Capas de dibujo

El canvas de terreno pinta suelo, relieves, recursos, edificios y niebla. Un segundo canvas pinta los efectos y queda debajo de los botones reales de la cuadrícula y su cursor. Los edificios usan celdas de 24 × 32, con 8 píxeles sobre la casilla y el pie alineado al borde inferior. Los dos canvas se escalan sin suavizado.

### Interfaz de la vista

```ts
export function createMapView(parent: HTMLElement, ctx: AppContext): MapView;
export interface MapView { setVisible(visible: boolean): void; destroy(): void; }
```

## 3. Datos y uso

| Dato | Valor |
| --- | --- |
| Tamaño de casilla | 24 × 24 píxeles lógicos |
| Luna | [Mapa ampliado y sector inicial](../niveles/luna.md#mapa), con cámara de seguimiento |
| Marte | [Mapa ampliado y sector de aterrizaje](../niveles/marte.md#mapa), con cámara de seguimiento |
| Caracteres del mapa | `.` llano · `#` roca · `o` cráter · `i` hielo · `m` mineral · `?` misterio · `S` nave |

### Controles

| Entrada | Efecto |
| --- | --- |
| Mover el ratón | Cursor sobre la casilla |
| Clic | Acción de la herramienta activa |
| Flechas | Mueven el cursor |
| Enter o Espacio | Acción de la herramienta activa |
| Esc | Vuelve a inspeccionar |
| En Marte: arrastrar o Mayús + flechas | Desplaza la cámara (P1) |

### Reacciones

- Casilla válida para la herramienta: borde con ✔. Inválida: borde con ✖ y motivo.
- La etiqueta accesible describe la casilla bajo el cursor: columna, fila, terreno, edificio y estado.
- Construcción (400 ms) y exploración (320 ms) responden a eventos del almacén. Recolección (300 ms) usa la casilla de la acción aceptada. El polvo marciano (500 ms) tiene prueba visual y queda conectado a un futuro evento de Marte.
- Movimiento reducido usa un cuadro fijo y desactiva el desplazamiento del polvo.

### Recuperación de errores

- Sprite ausente: rectángulo de color con una letra.
- Estado con un edificio de tipo desconocido: se dibuja un marcador y se avisa en consola en desarrollo.

### Rendimiento

El mapa lunar renderiza las casillas al cambiar el estado. Los efectos usan un lienzo separado, sin redibujar el terreno en cada fotograma. La vista de arte marciana muestra un recorte de 12 × 12.

### Casos límite

- Explorar en el borde del mapa: revela solo las casillas que existen.
- Explorar una casilla cuyo bloque ya estaba revelado en parte: no hay costo extra ni reembolso.
- Recolectar con los materiales al máximo: se acepta, el exceso se pierde y el informe lo anota.

### Control de misión y ambiente del mapa

Las dos capas son solo visuales: leen el estado y nunca lo cambian.

- **Aviso de soporte vital** (`src/map/advisor.ts`). Cuando la reserva de oxígeno, agua o comida cubre 3 días o menos (soles en Marte), aparece un globo sobre el astronauta con lo que queda. Con 1 día o menos el aviso pasa a crítico. Si falta el edificio que produce esa reserva, o está apagado, averiado o sin energía, la línea «Control de misión» del panel inferior dice qué hacer. No da consejo mientras el edificio está en obra. Pruebas: `tests/core/advisor.test.ts`.
- **Ambiente** (`src/map/ambience.ts`, capa `.map-ambience`):
  - polvo que levantan las botas al caminar (cae más lento en la Luna);
  - destellos en los paneles solares que funcionan con luz de al menos 50 %;
  - brillos en el hielo explorado;
  - remolinos de polvo en Marte, y polvo arrastrado por el viento los días de tormenta de polvo.

  - chispas de soldadura sobre los andamios y un destello cuando el edificio empieza a funcionar.

  Se apaga con «Reducir movimiento». Solo dibuja la zona que rodea al astronauta.
- En Marte el indicador del HUD dice «soles de margen».

## 4. Implementación delegable

**Tareas:** [T-P0-B1](../agentes/tareas/T-P0-B1-datos-y-balance-lunar.md), [T-P0-B3](../agentes/tareas/T-P0-B3-mapa-lunar.md), [T-P0-B4](../agentes/tareas/T-P0-B4-construccion-y-exploracion.md); validaciones en [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md).

**Prompt breve:**

```text
Implementa el mapa según docs/componentes/mapa.md. Núcleo: EXPLORE y COLLECT con sus
validaciones en ese orden. Vista: src/map dibuja las capas desde MissionState y despacha
acciones según uiStore.tool. Phaser no sale de src/map.
```

**Pruebas:** U-EXP-01 a U-EXP-05, M-MAP-01 a M-MAP-05 y M-EXP-01 a M-EXP-03 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** explorar (8,8) en la Luna revela nueve casillas, entre ellas el hielo de (9,8) y (9,9); recolectar dos veces la misma casilla falla la segunda con `NOTHING_TO_COLLECT`; el tablero refleja cualquier estado válido.

**Evidencia:** pruebas en verde y capturas.

**Terminado cuando:** el día 1 del recorrido de Media se ejecuta en el tablero con teclado.

**Riesgos:** integración de Phaser con el escalado del escenario. Mitigación: Phaser usa escala `FIT` dentro de `#map`; plan B con botones HTML.
