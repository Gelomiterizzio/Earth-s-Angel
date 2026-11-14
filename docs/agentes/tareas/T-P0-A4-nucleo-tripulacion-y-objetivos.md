# T-P0-A4 · Núcleo II: tripulación, radiación, objetivos y resultado

| Campo | Valor |
| --- | --- |
| ID | T-P0-A4 |
| Prioridad · hito | P0 · H3 |
| Perfil recomendado | [Motor](../prompts/motor.md) |
| Responsable · revisor | A · B |
| Base Git | Rama `a/p0-a4-tripulacion` desde `main` |
| Estimación | 2,0 h |
| Estado | propuesto |

## Objetivo

La misión lunar se puede ganar y perder. La decisión de la tormenta cambia el resultado de forma medible.

## Componentes

[tripulacion](../../componentes/tripulacion.md) · [radiacion-y-refugio](../../componentes/radiacion-y-refugio.md) · [objetivos](../../componentes/objetivos.md) · [soporte-vital](../../componentes/soporte-vital.md) · [resultados-y-finales](../../componentes/resultados-y-finales.md) · [ciclo-de-dias](../../componentes/ciclo-de-dias.md)

## Contexto a leer

1. [ciclo-de-dias](../../componentes/ciclo-de-dias.md): pasos 6, 7 y 9, precedencia del resultado, ejemplo del día 8 y tabla de dos decisiones
2. [tripulacion](../../componentes/tripulacion.md), [radiacion-y-refugio](../../componentes/radiacion-y-refugio.md), [objetivos](../../componentes/objetivos.md)
3. [resultados-y-finales](../../componentes/resultados-y-finales.md): tabla de principio y sugerencia por causa
4. [niveles/luna.md](../../niveles/luna.md): derrotas

## Dependencias

A3. La esperan A6, B5 y C3.

## Rutas

- **Permitidas:** `src/core/crew.ts`, `radiation.ts`, `objectives.ts`, `validate.ts`, `day-cycle.ts`, `actions.ts`, `index.ts`, `tests/core/**`, `src/data/i18n/*/sim.json`.
- **Excluidas:** `types.ts` salvo cambio de contrato. Todo lo de B y C.

## Contratos

`DECIDE_SHELTER`, `RESTART_MISSION`, `evaluateObjectives`, `computeForecast`, `previewEnergy`, `validateState`, `MissionResult`.

## Pasos de implementación

1. `crew.ts`: consumo en el orden oxígeno, agua, alimentos. Reparto de faltas: se quedan sin ración primero quienes tienen más salud; a igual salud, el de menor `id`. Penalizaciones y recuperación de [tripulacion](../../componentes/tripulacion.md). Cálculo de puntos de acción.
2. `radiation.ts`: exposición de fondo y de evento. Plazas del refugio: entran primero quienes tienen más exposición.
3. `actions.ts`: `DECIDE_SHELTER` con sus dos errores y el efecto sobre los puntos de acción. `RESTART_MISSION`.
4. `day-cycle.ts`: completa los pasos 6, 7 y 9. `startDay` abre en `decision` cuando hay radiación.
5. `objectives.ts`: estabilidad del día, racha y los seis objetivos de [objetivos](../../componentes/objetivos.md).
6. Resultado con la precedencia: salud 0 → exposición ≥ 100 → victoria → plazo.
7. `MissionResult`: márgenes, incidentes, `principleKey` y `suggestionKey` según la causa.
8. `causeEffectKeys` del informe: una clave por cada hecho relevante del día. Lista en [resultados-y-finales](../../componentes/resultados-y-finales.md).
9. `computeForecast`, `previewEnergy` y `summarizeHud` (umbrales de los tres medidores en [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md#tres-medidores)).
10. `validateState`: invariantes de [persistencia](../../componentes/persistencia.md).
11. Cadenas `sim.cause.*`, `sim.principle.*`, `sim.suggestion.*` en inglés y español.

## Entregables

Núcleo completo de la Luna. El ejemplo del día 8 y la tabla de dos decisiones pasan como pruebas.

## Pruebas

U-TRI-01 a U-TRI-06 · U-RAD-01 a U-RAD-07 · U-OBJ-01 a U-OBJ-08 · U-DIA-05 a U-DIA-08 · U-VAL-01 a U-VAL-04 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] El día 8 de Media reproduce todas las filas del ejemplo numérico.
- [ ] Refugiar: victoria el día 9 con exposición 14. Trabajar: victoria el día 11 con exposición 61 y 2 puntos de acción por día.
- [ ] Sin hacer nada en Media: primera falta el día 7 y derrota por soporte vital el día 8.
- [ ] En Imposible, trabajar los dos días de tormenta: derrota por exposición el día 9.
- [ ] Victoria y plazo el mismo día: gana la victoria. Salud 0 y objetivos cumplidos el mismo día: gana la derrota.
- [ ] `validateState` devuelve lista vacía para una misión nueva y para todos los estados de los recorridos.

## Evidencia

Salida de `npm test`.

## Condiciones de integración

B confirma las cifras. Fusionado antes de H3 (sábado 21:00).

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
