# T-P0-A3 · Núcleo I: acciones, recursos, energía y ciclo de días

| Campo | Valor |
| --- | --- |
| ID | T-P0-A3 |
| Prioridad · hito | P0 · H2 |
| Perfil recomendado | [Motor](../prompts/motor.md) |
| Responsable · revisor | A · B |
| Base Git | Rama `a/p0-a3-nucleo` desde `main` |
| Estimación | 2,5 h |
| Estado | propuesto |

## Objetivo

Se puede crear una misión lunar, construir, explorar, recolectar y cerrar días. Energía, agua, oxígeno y alimentos se calculan con los números exactos de la documentación.

## Componentes

[ciclo-de-dias](../../componentes/ciclo-de-dias.md) · [motor-recursos](../../componentes/motor-recursos.md) · [energia](../../componentes/energia.md) · [agua-y-alimentos](../../componentes/agua-y-alimentos.md) · [soporte-vital](../../componentes/soporte-vital.md) · [construccion](../../componentes/construccion.md) · [mapa](../../componentes/mapa.md) · [eventos-ambientales](../../componentes/eventos-ambientales.md)

## Contexto a leer

1. [ciclo-de-dias](../../componentes/ciclo-de-dias.md) completo
2. [ARQUITECTURA.md](../../ARQUITECTURA.md), secciones 5 a 8 y 11
3. [dificultad-y-balance](../../componentes/dificultad-y-balance.md) y [construccion](../../componentes/construccion.md)
4. [niveles/luna.md](../../niveles/luna.md)
5. [PRUEBAS.md](../../PRUEBAS.md), bloques U-CON, U-EXP, U-ENE, U-AGU y U-DIA

## Dependencias

A2. Usa los datos de B1 si ya están en `main`; si no, `fixtureGameData()`. La esperan A4, B4 y C2.

## Rutas

- **Permitidas:** `src/core/rng.ts`, `actions.ts`, `day-cycle.ts`, `energy.ts`, `water-food.ts`, `life-support.ts`, `events.ts`, `mission.ts`, `index.ts`, `fixtures.ts`, `tests/core/**`.
- **Excluidas:** `src/core/types.ts` salvo por el procedimiento de cambio de contrato. Todo lo de B y C.

## Contratos

`createCampaign`, `applyAction`, `advanceDay`, `previewAction` y los eventos de [ARQUITECTURA.md](../../ARQUITECTURA.md#7-api-del-núcleo).

## Pasos de implementación

1. `rng.ts`: `xmur3` y `mulberry32`. Prueba: misma semilla, misma secuencia.
2. `mission.ts`: `createMission(level, difficulty, seed, canonical, data)`. Construye las casillas desde `LevelConfig.rows`, marca exploradas las del radio inicial, coloca la nave, fija reservas y capacidades, crea la tripulación y genera `schedule`. En modo canónico copia los eventos de la tabla sin variación.
3. `actions.ts`: `applyAction` con `BUILD`, `EXPLORE`, `COLLECT`, `TOGGLE_BUILDING`, `SET_ENERGY_PRIORITY`, `END_DAY`, `ACK_REPORT`. Validaciones en el orden de [construccion](../../componentes/construccion.md) y [mapa](../../componentes/mapa.md). `previewAction` reutiliza las mismas validaciones.
4. `energy.ts`: capacidad, generación y asignación por prioridad.
5. `water-food.ts` y `life-support.ts`: extractor, reciclador, generador e invernadero, en ese orden, con la reserva de agua de la tripulación.
6. `day-cycle.ts`: `startDay` y `advanceDay` con los pasos 1 a 5, 8 y 10. Los pasos 6, 7 y 9 quedan con una versión mínima: la tripulación consume y no hay faltas ni resultado. A4 los completa.
7. Construye el `DayReport` con todos los campos que ya se pueden calcular.
8. Pruebas con números exactos.

## Entregables

Núcleo jugable sin salud, exposición ni victoria. Pruebas unitarias.

## Pruebas

U-RNG-01 · U-CON-01 a U-CON-10 · U-EXP-01 a U-EXP-05 · U-ENE-01 a U-ENE-06 · U-AGU-01 a U-AGU-07 · U-DIA-01 a U-DIA-04 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Los días 1 a 7 del recorrido de Media dan la energía, el oxígeno, el agua, los alimentos y los materiales de la tabla de [niveles/luna.md](../../niveles/luna.md).
- [ ] Cada error de construcción deja materiales y puntos de acción intactos.
- [ ] Con sol al 25 % y dos paneles se generan 4 de energía.
- [ ] Un invernadero sin electricidad suma estrés y retrasa la cosecha.
- [ ] `END_DAY` repetido con el mismo `day` se rechaza con `STALE_DAY`.
- [ ] Ningún número de balance aparece en `src/core`.

## Evidencia

Salida de `npm test` con el recuento de pruebas.

## Condiciones de integración

`npm test` y `npm run build` en verde. B revisa las cifras contra las tablas. Fusionado antes de H2 (sábado 17:30).

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final). Lista qué pasos del día quedaron en versión mínima para A4.
