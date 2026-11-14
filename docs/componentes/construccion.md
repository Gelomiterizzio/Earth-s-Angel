# Construcción

Fuente canónica del **catálogo de edificios**.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-12 |
| Prioridad · fase | P0 · Hito 2 |
| Objetivo | Que el jugador coloque módulos en el tablero y entienda qué paga y qué gana con cada uno. |
| Responsabilidad | Definición de edificios, validación de `BUILD`, colocación desde el mapa, vista previa de costo. |
| Depende de | [mapa](mapa.md), [motor-recursos](motor-recursos.md), [ARQUITECTURA.md](../ARQUITECTURA.md) |
| No incluye | Paleta de construcción del HUD ([hud-y-accesibilidad](hud-y-accesibilidad.md)). Efecto diario de cada módulo (fichas de simulación). |
| Responsable · revisor | B (datos y mapa) con A (validación en el núcleo) · A |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

- Datos: `src/data/content/buildings.json` (B), un `BuildingDef` por tipo.
- Validación y efecto: `src/core/actions.ts` (A), caso `BUILD`.
- Interacción: `src/map/map-input.ts` (B) despacha `BUILD` al hacer clic con la herramienta `build`.

### Flujo

1. El jugador elige un edificio en la paleta. El HUD pone `uiStore.tool = { kind: 'build', building }`.
2. Al pasar el cursor, el mapa pinta la casilla en verde con ✔ si se puede y en rojo con ✖ y el motivo si no.
3. Al hacer clic o pulsar Enter, el mapa despacha `{ type: 'BUILD', building, x, y }`.
4. El núcleo valida en este orden y devuelve el primer error:

| Orden | Condición | Error |
| --- | --- | --- |
| 1 | Fase `planning` | `WRONG_PHASE` |
| 2 | Tipo de edificio conocido | `UNKNOWN_BUILDING` |
| 3 | Disponible en este nivel | `NOT_AVAILABLE_IN_LEVEL` |
| 4 | Casilla dentro del mapa | `TILE_OUT_OF_BOUNDS` |
| 5 | Casilla explorada | `TILE_UNEXPLORED` |
| 6 | Terreno igual a `requiresTerrain` | `TILE_BLOCKED` si la casilla es `roca`, `crater`, `nave` o `misterio`; `WRONG_TERRAIN` en los demás casos, por ejemplo un panel sobre hielo o un extractor sobre llano |
| 7 | Casilla sin edificio | `TILE_OCCUPIED` |
| 8 | Materiales suficientes | `NO_MATERIALS` |
| 9 | PA suficientes | `NO_AP` |

5. Si todo se cumple: descuenta materiales y PA, crea el `Building` con `operationalFromDay = day + buildDays`, `enabled = true`, y emite `building/placed`.
6. **Una colocación inválida no cambia nada.** El inventario se conserva.

Todos los edificios ocupan una casilla. No se pueden mover ni demoler en P0.

## 3. Datos y uso

### Catálogo P0 · valores de balance

| Edificio | Costo | PA | Días de obra | Energía por día | Insumos | Salidas | Capacidad | Prioridad eléctrica | Terreno |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Panel solar `panel` | 6 | 1 | 1 | 0 | Luz | 8 de energía × factor solar | — | — | llano |
| Batería `bateria` | 5 | 1 | 1 | 0 | — | — | +20 de energía | — | llano |
| Generador de oxígeno `generador` | 8 | 2 | 1 | 4 | 2 de agua | 6 de oxígeno | — | 1 | llano |
| Reciclador de agua `reciclador` | 8 | 2 | 1 | 3 | Agua usada ayer | 75 % de esa agua | — | 2 | llano |
| Extractor de hielo `extractor` | 8 | 2 | 1 | 3 | — | 6 de agua | — | 3 | **hielo** |
| Invernadero `invernadero` | 10 | 2 | 1 | 4 | 2 de agua por día | 24 raciones cada 4 días | — | 4 | llano |
| Refugio radiativo `refugio` | 14 | 3 | 2 | 0, y `shelterEnergy` el día que se usa | — | Protección | 4 plazas | 0 cuando se usa | llano |

La nave (`nave`) viene colocada. Da las capacidades base y no gasta energía.

"Prioridad eléctrica" es el orden por defecto de `energyPriority`. El jugador puede cambiarlo.

### Por qué construir uno u otro

Texto que el juego muestra en la paleta (`whyKey`). Versión corta para niños; la tarjeta científica amplía.

| Edificio | Te da | Te cuesta | Compite con |
| --- | --- | --- | --- |
| Panel solar | Electricidad cada día con sol | Materiales | Batería: el panel produce, la batería guarda |
| Batería | Guarda energía para los días con poca luz | Materiales | Panel |
| Generador de oxígeno | Aire para respirar | Electricidad y agua | Invernadero: los dos beben agua |
| Reciclador | Recupera parte del agua usada | Electricidad | Extractor |
| Extractor de hielo | Agua nueva del hielo lunar | Electricidad y encontrar hielo | Reciclador |
| Invernadero | Comida fresca cada cuatro días | Electricidad, agua y paciencia | Generador |
| Refugio | Protege de la radiación | Muchos materiales y dos días de obra | Todo lo demás: blindaje o expansión |

### Catálogo P1 · propuestas sin validar

| Edificio | Costo | PA | Obra | Energía | Efecto |
| --- | --- | --- | --- | --- | --- |
| Depósito `deposito` | 8 | 1 | 1 | 0 | +30 de capacidad de oxígeno, agua, alimentos y materiales |
| Comunicaciones `comunicaciones` | 12 | 2 | 2 | 3 | Pronóstico de 3 días en vez de 1. En Marte, objetivo de enlace |
| Laboratorio `laboratorio` | 12 | 2 | 2 | 4 | Registro científico, pistas de la ruta secreta, activa balizas |
| Hábitat `habitat` | 16 | 3 | 2 | 2 | +2 plazas de refugio y punto de logística en Marte |

### Reacciones al jugador

- Vista previa: costo, PA, días de obra y cuándo empieza a funcionar ("Listo el día 6").
- Colocación válida: efecto de construcción, sonido `sfx-build`, el edificio aparece con andamio hasta su día operativo.
- Colocación inválida: sacudida corta de la casilla, sonido `sfx-error`, mensaje con el motivo junto al cursor y en la región `aria-live`.
- Con movimiento reducido no hay sacudida; el borde de la casilla cambia a rojo con ✖.

### Casos límite

- Clic repetido muy rápido en la misma casilla: el segundo se rechaza con `TILE_OCCUPIED`.
- Materiales justos: `materiales === cost` se acepta.
- Edificio en obra: ocupa la casilla, no consume ni produce.
- Extractor sobre hielo ya ocupado: `TILE_OCCUPIED`.

### Referencias científicas

ECLSS para generador y reciclador; hielo lunar para el extractor. Clasificación y enlaces en [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md).

## 4. Implementación delegable

**Tareas:** [T-P0-B1](../agentes/tareas/T-P0-B1-datos-y-balance-lunar.md) (datos), [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md) (validación), [T-P0-B4](../agentes/tareas/T-P0-B4-construccion-y-exploracion.md) (mapa).

**Prompt breve:**

```text
Implementa la colocación de edificios según docs/componentes/construccion.md.
Núcleo: caso BUILD en src/core/actions.ts con las nueve validaciones en ese orden.
Mapa: herramienta build en src/map/map-input.ts con vista previa válida o inválida y motivo.
Datos: src/data/content/buildings.json con el catálogo P0 exacto.
No cambies src/core/types.ts.
```

**Pruebas:** U-CON-01 a U-CON-10 y M-CON-01 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:**

- Cada fila de la tabla de validación tiene una prueba que comprueba el código de error y que materiales y PA no cambian.
- Colocar un panel en una casilla válida resta 6 materiales y 1 PA y el panel genera al día siguiente.
- El extractor solo se coloca sobre hielo.

**Evidencia:** pruebas en verde y un GIF o captura de una colocación válida y una inválida.

**Terminado cuando:** se puede levantar la base del recorrido de Media solo con ratón y solo con teclado.

**Riesgos:** desalineación entre el catálogo de esta ficha y el JSON. La prueba D-BAL-02 lo detecta.
