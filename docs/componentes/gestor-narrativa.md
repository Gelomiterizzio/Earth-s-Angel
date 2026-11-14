# Gestor de narrativa

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-08 |
| Prioridad · fase | P0 mínimo · P1 y P2 completo |
| Objetivo | Decidir qué secuencia y qué línea de la guía corresponden a cada momento, sin mezclar historia con reglas. |
| Responsabilidad | `src/ui/cinematics/narrative.ts`, tabla de líneas en `src/data/content/tutorial.json` |
| Depende de | [motor-cinematicas](motor-cinematicas.md), [arranque-y-escenas](arranque-y-escenas.md), [progresion](progresion.md) |
| No incluye | Reproducir escenas. Aplicar transiciones. |
| Responsable · revisor | C · A |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

La narrativa **lee** el estado y **elige presentación**. No cambia la partida.

### Qué secuencia toca

| Momento | Secuencia | Fase |
| --- | --- | --- |
| Tras elegir dificultad | `intro` | P0 |
| Victoria en la Luna, transición aplicada | `moonToMars` | P1 |
| Victoria en Marte sin portal | `marsVictory` | P1 |
| Entrada al portal | `wormhole` | P2 |
| Éxito en la Tierra | `earthVictory` | P2 |
| Fallo en la Tierra | `marsVictory` con la línea "Volvimos a Marte" | P2 |

`narrative.cinematicFor(flowEvent, state)` devuelve el id o `null`. `flow` lo usa para ir a la escena `cinematica`.

### Banderas narrativas

Viven en `campaign.narrativeFlags` y las escribe el núcleo:

| Bandera | La pone | La usa |
| --- | --- | --- |
| `moonWon`, `marsWon` | `advanceDay` al ganar | Elección de secuencia |
| `beaconMoon`, `beaconMars` | Descubrimiento de la baliza | Portal |
| `choseWormhole` | `applyTransition('marte->tierra')` | Final |
| `earthFailed` | `applyTransition('tierra->marte')` | Línea final |

Lo que es solo de presentación, como "ya vio esta línea", vive en memoria de la interfaz.

### ÁNGEL, la guía

Propuesta por confirmar: la asistente de la base, ÁNGEL, comenta en la línea de mensajes del HUD. Frases de una línea, nunca bloquean.

| Evento | Línea de ejemplo |
| --- | --- |
| Primera `building/operational` | "Primer módulo en marcha. Buen comienzo." |
| `harvest/done` | "Cosecha lista. La tripulación come bien hoy." |
| `alert/shortage` | "Falta {recurso}. Revisa qué módulo se detuvo." |
| `event/forecast` de tormenta | "El Sol está activo. Te aviso con tiempo." |
| `streak/changed` a 0 | "La racha se cortó. Mira el informe para saber por qué." |
| `objective/met` | "Objetivo cumplido: {objetivo}." |

Las líneas son claves `content.angel.*`. No repiten la misma dos días seguidos.

## 3. Datos y uso

- La guía no tiene retrato de persona. Se representa con un icono propio: un punto de luz con dos alas simples.
- Las líneas no sustituyen a las alertas: una falta de oxígeno tiene su alerta además del comentario.
- Con el tutorial activo, los pasos del tutorial tienen prioridad sobre los comentarios.
- En P0 basta la secuencia `intro` y las seis líneas de la tabla.

### Casos límite

- Dos eventos el mismo día: se muestra la línea de mayor prioridad (falta de recursos > tormenta > objetivo > resto).
- Bandera desconocida en un guardado antiguo: se ignora.
- Sin clave de texto: no se muestra nada.

## 4. Implementación delegable

**Tarea:** [T-P0-C4](../agentes/tareas/T-P0-C4-cinematica-y-tutorial.md). Secuencias de P1 y P2 en sus fichas.

**Prompt breve:**

```text
Implementa src/ui/cinematics/narrative.ts según docs/componentes/gestor-narrativa.md:
cinematicFor(evento, estado) con la tabla de secuencias, y un suscriptor que escribe en la
línea de mensajes del HUD una línea de ÁNGEL por evento, con prioridad y sin repetir.
```

**Pruebas:** M-CIN-01 y M-NAR-01 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** tras elegir dificultad se reproduce `intro`; una cosecha muestra su línea; ninguna línea tapa una alerta.

**Evidencia:** captura de una línea de la guía en el HUD.

**Terminado cuando:** el recorrido de Media muestra al menos tres líneas distintas.

**Riesgos:** exceso de texto para niños. Mitigación: una línea por día como máximo, además de las alertas.
