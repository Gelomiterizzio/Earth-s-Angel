# T-P0-A2 · Contratos, almacén, datos de prueba y cadenas

| Campo | Valor |
| --- | --- |
| ID | T-P0-A2 |
| Prioridad · hito | P0 · H1 |
| Perfil recomendado | [Motor](../prompts/motor.md) |
| Responsable · revisor | A · B |
| Base Git | Rama `a/p0-a2-contratos` desde `main` |
| Estimación | 1,5 h |
| Estado | propuesto |

## Objetivo

B y C pueden programar contra tipos reales y un estado de ejemplo, sin esperar al núcleo.

## Componentes

[arranque-y-escenas](../../componentes/arranque-y-escenas.md) · [localizacion](../../componentes/localizacion.md) · [motor-recursos](../../componentes/motor-recursos.md)

## Contexto a leer

1. [ARQUITECTURA.md](../../ARQUITECTURA.md), secciones 5 a 8
2. [arranque-y-escenas](../../componentes/arranque-y-escenas.md): `AppContext`, `Screen`, `Flow`, `OptionsService`, `AudioApi`
3. [localizacion](../../componentes/localizacion.md)
4. [niveles/luna.md](../../niveles/luna.md): estado del día 8 en Media

## Dependencias

A1. La esperan A3, A5, B3, C1 y C2.

## Rutas

- **Permitidas:** `src/core/types.ts`, `src/core/fixtures.ts`, `src/core/index.ts`, `src/app/store.ts`, `src/app/ui-store.ts`, `src/app/i18n.ts`, `src/app/context.ts`, `src/app/silent-audio.ts`, `src/data/i18n/en/sim.json`, `src/data/i18n/es/sim.json`, `tests/core/store.test.ts`, `tests/core/i18n.test.ts`.
- **Excluidas:** todo lo de B y C.

## Contratos

Esta tarea **crea** los contratos en código. Deben ser copia fiel de la documentación.

## Pasos de implementación

1. `src/core/types.ts`: copia la sección 5 de [ARQUITECTURA.md](../../ARQUITECTURA.md), `GameEvent` de la sección 8, `SimConstants` de [dificultad-y-balance](../../componentes/dificultad-y-balance.md) y `NasaSepRecord` de [adaptador-datos-nasa](../../componentes/adaptador-datos-nasa.md).
2. `src/app/context.ts`: interfaces `AppContext`, `Screen`, `Flow`, `OptionsService`, `Options`, `AudioApi`, `MapView`, `Store`, `UiStore` según [arranque-y-escenas](../../componentes/arranque-y-escenas.md).
3. `src/core/fixtures.ts`:
   - `fixtureGameData()`: `GameData` mínimo con los valores de Media en la Luna, escrito a mano. Se usa hasta que llegue B1.
   - `fixtureState('media-dia-1')` y `fixtureState('media-dia-8')`: estados al abrir esos días del recorrido de Media.
   - `fixtureReport()`: un `DayReport` del día 8.
   - Todo evento de ejemplo lleva `sourceRef: 'SYNTHETIC'` salvo la tormenta, que usa el identificador real.
4. `src/core/index.ts`: exporta las firmas de la sección 7. Las que aún no existen lanzan `Error('no implementado: T-P0-A3')`.
5. `src/app/store.ts`: `getState`, `dispatch`, `subscribe`, `on`, `load`. `dispatch` llama a `applyAction`, reemplaza el estado si `ok`, notifica y reenvía eventos. Si no `ok`, emite `action/rejected`.
6. `src/app/ui-store.ts`: `getState`, `setTool`, `setHover`, `openPanel`, `subscribe`.
7. `src/app/i18n.ts`: `createI18n(getLanguage)` devuelve `t(key, params)`. Carga los catálogos con `import.meta.glob`. Si falta la clave en el idioma activo usa inglés; si tampoco está, devuelve la clave y avisa en desarrollo.
8. `src/app/silent-audio.ts`: `AudioApi` que no hace nada.
9. `sim.json` en inglés y español con una clave por cada `ActionErrorCode`: `sim.error.<CODE>`.
10. Pruebas: suscripción y rechazo en el almacén; sustitución de parámetros y respaldo de idioma en `t`.

## Entregables

Tipos, almacén, estado de interfaz, cadenas, datos de prueba y audio silencioso, todo importable.

## Pruebas

U-ALM-01 a U-ALM-03 y U-LOC-01 a U-LOC-03 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] `types.ts` compila y coincide con la documentación campo por campo.
- [ ] `fixtureState('media-dia-8')` tiene energía 24, oxígeno 20, agua 25, alimentos 28, materiales 14 y exposición 7.
- [ ] Un suscriptor del almacén recibe el estado nuevo tras `load`.
- [ ] `t('sim.error.NO_MATERIALS')` devuelve texto en los dos idiomas.
- [ ] B y C confirman que importan tipos y datos de prueba sin errores.

## Evidencia

Salida de `npm test` y mensaje de B y C confirmando la importación.

## Condiciones de integración

Fusionado antes de H1 (sábado 14:30). Aviso al equipo.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final). Si al copiar los tipos encuentras una incoherencia en la documentación, corrígela en ARQUITECTURA.md en el mismo commit y dilo.
