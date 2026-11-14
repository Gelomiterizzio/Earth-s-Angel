# T-P0-B1 · Datos de contenido y balance lunar

| Campo | Valor |
| --- | --- |
| ID | T-P0-B1 |
| Prioridad · hito | P0 · H1 |
| Perfil recomendado | [Jugabilidad](../prompts/jugabilidad.md) |
| Responsable · revisor | B · A |
| Base Git | Rama `b/p0-b1-datos` desde `main` |
| Estimación | 1,5 h |
| Estado | propuesto |

## Objetivo

Todos los datos de la Luna existen como JSON, coinciden con la documentación y se cargan en un `GameData` validado.

## Componentes

[dificultad-y-balance](../../componentes/dificultad-y-balance.md) · [construccion](../../componentes/construccion.md) · [mapa](../../componentes/mapa.md) · [eventos-ambientales](../../componentes/eventos-ambientales.md)

## Contexto a leer

1. [dificultad-y-balance](../../componentes/dificultad-y-balance.md)
2. [construccion](../../componentes/construccion.md), catálogo P0
3. [niveles/luna.md](../../niveles/luna.md), mapa y eventos
4. [ARQUITECTURA.md](../../ARQUITECTURA.md), tipos `BuildingDef`, `DifficultyConfig`, `LevelConfig`, `GameData` y sección 10

## Dependencias

Ninguna para escribir los JSON. `src/data/index.ts` necesita los tipos de A2. La espera A3.

## Rutas

- **Permitidas:** `src/data/content/buildings.json`, `src/data/content/events.json`, `src/data/content/levels/luna.json`, `src/data/balance/constants.json`, `difficulty.json`, `luna.json`, `src/data/index.ts`, `src/data/validate.ts`, `tests/data/**`.
- **Excluidas:** `src/core`, `src/app`, `src/ui`, `package.json`.

## Contratos

`loadGameData(): GameData`. Lanza `Error` con archivo y clave si un dato es inválido.

## Pasos de implementación

1. `buildings.json`: los siete edificios de P0 y la nave, con costo, puntos de acción, días de obra, energía, terreno, niveles, prioridad, capacidad y claves de texto (`content.building.<tipo>.name`, `.desc`, `.why`).
2. `levels/luna.json`: el bloque JSON de [niveles/luna.md](../../niveles/luna.md), más `baseCaps`, `availableBuildings` y `objectives`.
3. `constants.json`: la tabla de constantes de simulación.
4. `difficulty.json`: plazo terrestre y bono por dificultad.
5. `luna.json`: un bloque por dificultad con reservas, umbrales, racha, energía del refugio y eventos, incluido `jitterDays`.
6. `events.json`: tipos de evento con claves de texto e icono.
7. `validate.ts`: las reglas de [dificultad-y-balance](../../componentes/dificultad-y-balance.md#validación-de-datos-al-arrancar) y de la sección 10 de la arquitectura.
8. `index.ts`: importa los JSON, los une y valida.
9. Pruebas: comparar cada valor con la documentación y romper un dato por regla para ver el error.

## Entregables

JSON completos, cargador y validador, pruebas de datos.

## Pruebas

D-BAL-01 a D-BAL-05 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] `loadGameData()` devuelve un objeto que cumple el tipo `GameData`.
- [ ] Cada cifra de las tablas de Luna aparece igual en los JSON.
- [ ] El mapa tiene 12 filas de 12 caracteres, una sola `S`, tres `i`, cinco `m` y una `?`.
- [ ] Un dato roto produce un error que nombra el archivo y la clave.
- [ ] A confirma que el núcleo carga estos datos en lugar de los de prueba.

## Evidencia

Salida de `npm test` y un ejemplo del mensaje de error.

## Condiciones de integración

Fusionado antes de H1 (sábado 14:30). Si los tipos de A2 aún no están, se fusionan primero los JSON y después el cargador.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final). Si alguna cifra de la documentación es ambigua, pregúntala; no la interpretes.
