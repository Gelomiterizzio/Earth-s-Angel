# Controles

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-05 |
| Prioridad · fase | P0 · H3 |
| Objetivo | Que todo el juego se pueda manejar con ratón o con teclado, con atajos coherentes. |
| Responsabilidad | `src/app/input.ts` (atajos globales, A), `src/map/map-input.ts` (tablero, B), pantallas (C) |
| Depende de | [arranque-y-escenas](arranque-y-escenas.md), [hud-y-accesibilidad](hud-y-accesibilidad.md), [mapa](mapa.md) |
| No incluye | Mandos de juego. Gestos táctiles. |
| Responsable · revisor | C coordina · A |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

Tres niveles, del más específico al más general. Una tecla la atiende el primero que la reclama:

1. **Diálogo modal abierto:** captura todo. Tab queda atrapado dentro.
2. **Elemento con foco:** un botón atiende Enter y Espacio; el tablero atiende flechas y Enter.
3. **Atajos globales** de `src/app/input.ts`.

Los atajos globales se ignoran si el foco está en un campo de texto o un deslizador, o si hay un diálogo modal abierto.

### Ratón

| Acción | Efecto |
| --- | --- |
| Clic en un botón | Lo activa |
| Mover sobre el tablero | Mueve el cursor de casilla |
| Clic en el tablero | Acción de la herramienta activa |
| Pasar por un control | Muestra su pista |

### Teclado

| Tecla | Dónde | Efecto |
| --- | --- | --- |
| Tab · Mayús + Tab | Siempre | Siguiente o anterior control |
| Enter · Espacio | Control con foco | Activar |
| Esc | Misión | Soltar herramienta; si no hay, abrir pausa |
| Esc | Pausa, opciones, panel | Cerrar o volver |
| Flechas | Luna y Marte | Igual que WASD |
| WASD | Luna y Marte | Al pulsar una dirección nueva, girar en el sitio. Mantener la tecla o pulsar otra vez en la misma dirección para caminar |
| Q | Luna y Marte | Elegir al tripulante y abrir las acciones que puede realizar en la casilla de enfrente. Las construcciones, la reparación y el escaneo se asignan por cargo |
| E | Luna y Marte | Ejecutar la acción rápida para la casilla de enfrente |
| Enter | Tablero con foco | Acción de la herramienta |
| **Enter** | Cinemática | **Saltar** |
| B | Luna y Marte | Abrir o cerrar el panel de la base |
| **X** | **Cualquier pantalla** | **Modo presentación: el juego se juega solo como un jugador (camina con WASD, se gira hacia la casilla y construye, explora o recoge) por la Luna, la tormenta, Marte y el final. X otra vez lo detiene.** En la Luna y Marte se explora con E |
| **Z** | **Cualquier pantalla** | **Demo de derrota: la tripulación ignora el soporte vital, se acaba el aire y la secuencia de fin de partida muestra el mundo estallando. Z otra vez la detiene.** |
| **V** | **Cualquier pantalla** | **Demo del secreto lunar: el astronauta camina a la esquina superior derecha de la Luna y teclea W S D A D A. V otra vez la detiene.** |
| **Rueda del ratón** | **Presentación X o Z** | **Arriba acelera, abajo frena: 0,25× a 4×. Cada presentación empieza a 1×. Las cinemáticas y la secuencia de fin de partida van siempre a su ritmo** |
| C | Misión | Herramienta recolectar |
| M | Misión | Abrir el diario de misión |
| R | Misión | Mostrar u ocultar las reservas actuales |
| F | Misión | Finalizar día |
| H o ? | Misión | Ayuda y tarjetas científicas |
| 1 a 7 | Misión | Elegir el edificio de esa posición |
| P | Misión | Pausa |

Todos los atajos de una letra son opcionales: cada acción tiene también un botón.

### Toque

Fuera del alcance de P0. Los botones del HUD responden al toque por ser botones reales. El tablero no está diseñado para dedos. Si se programa después: tocar una casilla la selecciona y un segundo toque confirma.

## 3. Datos y uso

- **F para finalizar el día** pasa por el mismo botón del HUD: si está deshabilitado, la tecla no hace nada.
- **Enter en cinemática** y el botón «Saltar (Intro)» llaman a la misma función.
- **Lista de controles** visible en Opciones y en el panel de ayuda. Sale de una sola tabla en `src/app/input.ts`, para que nunca se desincronice.
- **Claves de texto:** `ui.controls.*`.

### Casos límite

- Tecla mantenida: los movimientos repiten. Q, E, F y Enter se ejecutan una vez por pulsación.
- Enter con el foco en el botón Finalizar día: avanza un día, una vez.
- Distribución de teclado distinta: los atajos usan `event.key`, así que siguen la letra impresa.
- Foco perdido tras cerrar un diálogo: vuelve al control que lo abrió.

## 4. Implementación delegable

**Tareas:** [T-P0-A5](../agentes/tareas/T-P0-A5-flujo-y-opciones.md) (atajos globales), [T-P0-B4](../agentes/tareas/T-P0-B4-construccion-y-exploracion.md) (tablero), [T-P0-C2](../agentes/tareas/T-P0-C2-hud.md) (HUD).

**Prompt breve:**

```text
Implementa src/app/input.ts con la tabla de atajos de docs/componentes/controles.md como única
fuente: cada atajo dispara el mismo botón o acción que el ratón. Ignora atajos con un diálogo
modal abierto o con el foco en un campo. Exporta la tabla para que Opciones la muestre.
```

**Pruebas:** M-CTL-01 a M-CTL-04 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** el día 1 del recorrido de Media se juega sin tocar el ratón; ningún atajo actúa con un diálogo abierto; la lista de Opciones coincide con los atajos reales.

**Evidencia:** recorrido solo con teclado, descrito paso a paso.

**Terminado cuando:** una partida completa de Media se gana solo con teclado.

**Riesgos:** atajos que chocan con el navegador. Mitigación: no se usan combinaciones con Ctrl ni Alt.
