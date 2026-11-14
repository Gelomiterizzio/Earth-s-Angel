# Progresión

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-14 |
| Prioridad · fase | P1 (transiciones). P0 solo usa el reinicio de misión. |
| Objetivo | Pasar de un nivel al siguiente una sola vez, conservando lo que debe conservarse y aplicando el bono una única vez. |
| Responsabilidad | `src/core/progression.ts` |
| Depende de | [ARQUITECTURA.md](../ARQUITECTURA.md), [persistencia](persistencia.md), [motor-cinematicas](motor-cinematicas.md) |
| No incluye | Las cinemáticas. Las reglas de cada nivel. |
| Responsable · revisor | A · B |
| Estado | Implementado y probado. |

## 2. Arquitectura y funcionamiento

### Dos relojes

| Reloj | Campo | Se reinicia | Se detiene en |
| --- | --- | --- | --- |
| Día o sol de la misión | `mission.day` | Al empezar cada nivel | Menús, pausa, cinemáticas, informes |
| Plazo terrestre | `campaign.earthDaysRemaining` | Nunca. Baja 1 por día jugado | Lo mismo |

El tiempo solo avanza con `END_DAY`, así que el reloj está detenido en todo lo demás sin hacer nada especial.

### `applyTransition(state, id, data)`

Es **atómica e idempotente**.

```text
si appliedTransitions contiene id → devolver el mismo estado, sin eventos
comprobar la precondición → si falla, error y estado intacto
construir el estado nuevo completo
validateState(nuevo) → si falla, error y estado intacto
añadir id a appliedTransitions
devolver estado nuevo + evento transition/applied
```

| Transición | Precondición | Efecto |
| --- | --- | --- |
| `luna->marte` | Victoria en la Luna | Arma el manifiesto. `earthDaysRemaining += bonusDays`. Crea la misión de Marte con `day = 1`. |
| `marte->tierra` | Victoria en Marte, dos balizas, elección del jugador | Crea la misión terrestre. Guarda el resultado de Marte. |
| `tierra->marte` | Derrota en la Tierra | Vuelve al desenlace marciano. No reabre la misión de Marte. |

### El bono se aplica una vez

El bono vive dentro de `luna->marte`. Como la transición se aplica y se guarda **antes** de la cinemática, y repetirla no hace nada:

- ver la escena completa,
- saltarla con Enter o con el botón,
- pulsar varias veces,
- que el fin natural llegue justo después de saltar,
- recargar a mitad de la escena,

dan exactamente el mismo estado.

### Manifiesto de transferencia

| Qué | Regla |
| --- | --- |
| Tripulación | Los cuatro de la Luna, con salud 100 y la mitad de su exposición. Se suman dos especialistas con exposición 0. |
| Suministros | La mitad de oxígeno, agua, alimentos y materiales (redondeada hacia abajo), más el equipo de llegada y con el límite de capacidad de Marte. La energía llega con el equipo de Marte. |
| Hallazgos y pistas | Todos. |
| Bono | `bonusDays` de la dificultad: 12, 10 u 8. |

El manifiesto aparece al inicio de la cinemática Luna → Marte. La explicación del tiempo ganado es `ficción`: los avances de la base lunar dan margen a la Tierra.

### Reinicio de misión · `RESTART_MISSION`

Crea de nuevo la misión del nivel actual con la misma dificultad, semilla y modo. El plazo terrestre vuelve al valor que tenía al empezar esa misión. No toca `appliedTransitions`.

## 3. Datos y uso

Plazos y bonos en [dificultad-y-balance](dificultad-y-balance.md).

### Ejemplo

Media. Victoria lunar el día 9: plazo 54 − 9 = 45. Transición: 45 + 10 = **55** soles disponibles para Marte. Una segunda llamada a `applyTransition('luna->marte')` devuelve el mismo estado con 55.

### Casos límite

- Victoria lunar con el plazo terrestre en 1: la transición suma el bono y Marte empieza con margen.
- Transición pedida sin victoria: error, sin cambios.
- Fallo en la Tierra: se reproduce la victoria ordinaria de Marte con una frase adicional.

## 4. Implementación delegable

**Tarea:** T-P1-A1 en [P1-campana-principal.md](../agentes/tareas/P1-campana-principal.md). `RESTART_MISSION` en [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md).

**Prompt breve:**

```text
Implementa src/core/progression.ts según docs/componentes/progresion.md: applyTransition
atómica e idempotente, manifiesto de transferencia y bono dentro de la transición.
Prueba que llamar dos veces a la misma transición devuelve el mismo estado.
```

**Pruebas:** U-PRO-01 a U-PRO-06 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** el bono se suma una vez aunque se llame cinco veces; una transición sin precondición no cambia nada; el reinicio devuelve el plazo del inicio de la misión.

**Evidencia:** pruebas en verde.

**Terminado cuando:** saltar o ver la cinemática Luna → Marte deja el mismo estado guardado.

**Riesgos:** aplicar el bono desde la interfaz. Mitigación: la interfaz no tiene forma de cambiar `earthDaysRemaining`.
