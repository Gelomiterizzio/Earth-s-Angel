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
| Flechas | Tablero con foco | Mover el cursor |
| Enter | Tablero con foco | Acción de la herramienta |
| **Enter** | Cinemática | **Saltar** |
| B | Misión | Foco a la paleta de construcción |
| X | Misión | Herramienta explorar |
| C | Misión | Herramienta recolectar |
| M | Misión | Foco al tablero |
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

- Tecla mantenida: las flechas repiten; F, Enter y las letras no.
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
