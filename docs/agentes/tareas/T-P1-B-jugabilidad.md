# T-P1-B · Mapa, balance y riesgos de Marte

| Campo | Valor |
| --- | --- |
| Integrante | **B · Jugabilidad y ciencia** |
| Revisor | A (datos que carga el núcleo) · C (lectura en pantalla) |
| Fase · hito | P1 · campaña principal |
| Dependencia | Cambio de contrato de A ([T-P1-A1](T-P1-A-motor.md)) |
| Estado real | Datos en `src/data/balance/marte.json` y `src/data/content/levels/marte.json` (commit `4c969ae`). **Revisión humana y validación de balance pendientes.** |

## Propiedad de archivos

| Archivo | Dueño |
| --- | --- |
| `src/data/content/levels/marte.json`, `src/data/balance/marte.json` | B |
| `src/data/content/{buildings,events,cards}.json`, `src/data/validate.ts`, `src/data/index.ts` | B |
| `src/map/**` | B |
| `src/data/i18n/*/content.json` | B |
| `docs/niveles/marte.md`, `docs/CIENCIA-Y-DATOS.md` (fuentes F-03, F-04, F-05) | B |

No editas `src/core/types.ts`: si te falta un campo, pídeselo a A.

## Markdown que debes leer

1. [AGENTS.md](../../../AGENTS.md) · [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md)
2. [niveles/marte.md](../../niveles/marte.md) — mapa, mecánicas y valores
3. [componentes/dificultad-y-balance.md](../../componentes/dificultad-y-balance.md) — tabla de Marte
4. [componentes/construccion.md](../../componentes/construccion.md) — catálogo P1
5. [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md) — InSight (65 %), Mars24 (sol), tormenta de 2017 en Marte

## Tareas

### T-P1-B1 · Mapa marciano y catálogo P1

| Campo | Valor |
| --- | --- |
| Responsable · revisor | B · A |
| Depende de | T-P1-A1 |
| Archivos | `src/data/content/levels/marte.json`, `src/data/content/buildings.json`, `src/data/validate.ts`, `src/map/**`, `tests/data/campaign.test.ts` |
| Contratos | `LevelConfig` (con `forecastHorizonWithComms` y `secret`), `BuildingDef` |

**Entregables:** mapa de 20 × 20 con nave, hielo cercano y lejano, ocho minerales y casilla de misterio; edificios depósito, comunicaciones, laboratorio y hábitat; tablero con cámara desplazable e indicador de recargo logístico en la vista previa.

**Criterios de aceptación**
- [ ] 20 filas de 20 caracteres, una sola `S`.
- [ ] La validación de datos rechaza un mapa marciano roto con archivo y clave.
- [ ] La vista previa muestra el costo extra de PA lejos de la base.
- [ ] El tablero se recorre con ratón y teclado.

**Pruebas:** D-BAL-06, D-BAL-07, M-MAP-06 a M-MAP-08.

```text
Eres el integrante B de Earth's Angel. Lee AGENTS.md, docs/agentes/prompts/jugabilidad.md,
docs/niveles/marte.md y docs/componentes/construccion.md.
Tarea T-P1-B1: revisa src/data/content/levels/marte.json (20x20, coordenadas de la ficha),
los edificios P1 de buildings.json y su validación en src/data/validate.ts. En src/map,
el tablero de Marte debe desplazarse y la vista previa mostrar el recargo logístico.
No toques src/core ni src/ui. No inventes cifras: copia las de las fichas.
Pruebas: tests/data/campaign.test.ts (forma del mapa, edificios) y prueba manual del tablero.
Ejecuta npm test y npm run build. Informa implementado, probado y pendiente.
```

### T-P1-B2 · Riesgos, objetivos y balance validado

| Campo | Valor |
| --- | --- |
| Responsable · revisor | B · A |
| Depende de | T-P1-B1, T-P1-A2 |
| Archivos | `src/data/balance/marte.json`, `src/data/content/events.json`, `src/data/content/cards.json`, `tests/core/plans/mars.ts`, `docs/niveles/marte.md`, `docs/componentes/dificultad-y-balance.md` |
| Contratos | `DifficultyConfig` con `dustPerDay`, `dustCap`, `linkDays`, `logistics` |

**Entregables:** tormentas de polvo regional (65 %, `transformación didáctica` de InSight) y global (20 %, `balance`), averías, tormenta solar de dos soles, umbrales y rachas; tarjetas `sol`, `dustPanels`, `sameStormMars`; **un recorrido de victoria reproducible por dificultad**, documentado sol a sol en `niveles/marte.md`.

**Criterios de aceptación**
- [ ] Tres recorridos de victoria pasan como pruebas en modo canónico.
- [ ] No hacer nada en Marte termina en derrota con causa documentada.
- [ ] Cada cifra de Marte tiene etiqueta y el 65 % conserva su fuente.
- [ ] Las tablas pasan de "sin validar" a "validado" solo con las pruebas en verde.

**Pruebas:** I-REC-MARTE-FACIL, I-REC-MARTE-MEDIA, I-REC-MARTE-IMPOSIBLE.

```text
Eres el integrante B de Earth's Angel. Lee docs/agentes/prompts/ciencia-y-datos.md,
docs/niveles/marte.md y docs/CIENCIA-Y-DATOS.md (F-03, F-04, F-05).
Tarea T-P1-B2: revisa src/data/balance/marte.json y los eventos de Marte. Encuentra un
recorrido de victoria por dificultad, escríbelo en tests/core/plans/mars.ts y documéntalo
sol a sol en docs/niveles/marte.md. Si un valor impide ganar, propón el cambio a A con el
motivo. Cada cifra lleva etiqueta: dato NASA, transformación didáctica, balance o ficción.
Revisa que las tarjetas sol, dustPanels y sameStormMars citen su fuente con enlace.
Ejecuta npm test y npm run build. Informa qué quedó validado y qué no.
```

## Orden de integración

B fusiona B1 justo después del contrato de A, para que A y C trabajen con datos reales. B2 se fusiona después del núcleo marciano de A. Orden general en [T-P1-A](T-P1-A-motor.md#orden-de-integración-de-p1).

## Registro de autoría

| Tarea | Implementó | Revisó | Fecha |
| --- | --- | --- | --- |
| T-P1-B1, B2 | Asistente de IA en el commit `4c969ae` | `[POR COMPLETAR: B, revisor A]` | 14-nov-2026 |
