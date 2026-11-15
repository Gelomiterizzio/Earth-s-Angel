# T-P2-A · Pistas, portal y resolución de finales

| Campo | Valor |
| --- | --- |
| Integrante | **A · Motor e integración** |
| Revisor | B (reglas de pistas y Tierra) · C (flujo de elección) |
| Fase · hito | P2 · Segunda Oportunidad |
| Dependencia | P1 verificado |
| Estado real | `SCAN`, `ACTIVATE_BEACONS`, transiciones `marte->tierra` y `tierra->marte` y `src/core/earth.ts` implementados (commit `4c969ae`). Pruebas en `tests/core/earth.test.ts` y `tests/core/campaign.test.ts`. **Revisión humana pendiente.** |

## Propiedad única de contratos

| Contrato o archivo | Dueño |
| --- | --- |
| `src/core/types.ts`: `SCAN`, `ACTIVATE_BEACONS`, `EARTH_INVEST`, `EARTH_END_SEASON`, `EarthState`, `EarthData`, `GameState.earth`, errores `ALREADY_FOUND`, `PORTAL_LOCKED`, `NOT_ON_EARTH`, `NO_BUDGET`, `MAX_LEVEL` | A |
| `src/core/progression.ts`, `src/core/earth.ts`, `src/core/save.ts`, `src/core/validate.ts` | A |
| `src/app/flow.ts` (escena `eleccion`, `chooseEnding`) | A |

Los **valores** de la Tierra son de B (`src/data/balance/tierra.json`); A implementa las reglas que los leen.

## Markdown que debes leer

1. [AGENTS.md](../../../AGENTS.md) · [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md)
2. [componentes/objetos-secretos.md](../../componentes/objetos-secretos.md) · [componentes/agujero-de-gusano.md](../../componentes/agujero-de-gusano.md)
3. [componentes/mision-terrestre.md](../../componentes/mision-terrestre.md) · [niveles/tierra-alternativa.md](../../niveles/tierra-alternativa.md)
4. [componentes/progresion.md](../../componentes/progresion.md) · [componentes/persistencia.md](../../componentes/persistencia.md)

## Tareas

### T-P2-A1 · Persistencia de pistas y acción SCAN

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · B |
| Depende de | P1 |
| Archivos | `src/core/{actions,types,validate}.ts`, `tests/core/campaign.test.ts` |
| Contratos | `SCAN { x, y }` (1 PA), eventos `clue/found`, `scan/empty`, `campaign.clues`, banderas `beaconMoon` y `beaconMars` |

**Criterios de aceptación**
- [ ] `SCAN` en la casilla de la baliza pone la bandera; repetir devuelve `ALREADY_FOUND`.
- [ ] `SCAN` en otra casilla solo gasta 1 PA y emite `scan/empty`.
- [ ] Las pistas obtenidas en la Luna siguen en `campaign.clues` en Marte y tras guardar y cargar.
- [ ] Ninguna pista depende del azar.

**Pruebas:** U-SEC-01 a U-SEC-05.

```text
Eres el integrante A de Earth's Angel. Lee AGENTS.md, docs/componentes/objetos-secretos.md y
docs/componentes/persistencia.md.
Tarea T-P2-A1: revisa la acción SCAN y la persistencia de pistas en src/core/actions.ts.
Posiciones fijas desde LevelConfig.secret; nada de azar. Las pistas viven en campaign.clues
y viajan con el manifiesto y el guardado. validateState debe aceptar estados con pistas.
Edita solo src/core/{actions,types,validate}.ts y tests/core. Pruebas U-SEC-01 a 05.
Ejecuta npm test y npm run build. Informa implementado, probado y pendiente.
```

### T-P2-A2 · Contrato de desbloqueo y portal

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · C |
| Depende de | T-P2-A1 |
| Archivos | `src/core/{actions,progression}.ts`, `src/app/flow.ts`, `tests/core/campaign.test.ts` |
| Contratos | `ACTIVATE_BEACONS` → `PORTAL_LOCKED` si falta algo; `applyTransition('marte->tierra')`; `flow.chooseEnding('mars' \| 'portal')` |

**Condiciones del portal (las tres):** banderas `beaconMoon` y `beaconMars`, laboratorio operativo en Marte y victoria marciana.

**Criterios de aceptación**
- [ ] Sin alguna condición el portal sigue cerrado y el mensaje dice cuál falta.
- [ ] Sin balizas, la victoria de Marte lleva directamente al final ordinario.
- [ ] Elegir el portal aplica la transición **una vez** y la guarda antes de la cinemática `wormhole`.
- [ ] Elegir "Terminar en Marte" no cambia el estado.

**Pruebas:** U-SEC-06 a U-SEC-09, I-CAM-03.

```text
Eres el integrante A de Earth's Angel. Lee docs/componentes/agujero-de-gusano.md y progresion.md.
Tarea T-P2-A2: revisa ACTIVATE_BEACONS (tres condiciones, PORTAL_LOCKED con el motivo) y
applyTransition('marte->tierra') atómica e idempotente. En src/app/flow.ts, chooseEnding
aplica y guarda la transición ANTES de la cinemática wormhole; 'mars' va a marsVictory.
La victoria ordinaria debe ser alcanzable sin ninguna pista.
Pruebas: portal cerrado por cada condición faltante, transición única, recarga a mitad de
cinemática. Ejecuta npm test y npm run build.
```

### T-P2-A3 · Núcleo terrestre y resolución de ambos finales

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · B |
| Depende de | T-P2-A2, datos de [T-P2-B2](T-P2-B-jugabilidad.md) |
| Archivos | `src/core/earth.ts`, `src/core/progression.ts`, `src/core/save.ts`, `tests/core/earth.test.ts` |
| Contratos | `EARTH_INVEST`, `EARTH_END_SEASON { season }` (protegido contra doble pulsación), `EarthSeasonReport`, `applyTransition('tierra->marte')` |

**Orden de una temporada:** efectos de cada línea → combinaciones → deriva → recorte 0..100 → evaluación.

**Criterios de aceptación**
- [ ] Inversión sin presupuesto: `NO_BUDGET`; en nivel máximo: `MAX_LEVEL`; nada cambia.
- [ ] Dos `EARTH_END_SEASON` con la misma temporada avanzan una sola.
- [ ] Éxito al cerrar la última temporada con las tres metas.
- [ ] Fallo por plazo o por agua en 0 → `tierra->marte` conserva la victoria de Marte con la línea "Volvimos a Marte".
- [ ] Solo enteros; sin azar.

**Pruebas:** U-TIE-01 a U-TIE-06, I-CAM-04.

```text
Eres el integrante A de Earth's Angel. Lee docs/componentes/mision-terrestre.md y
docs/niveles/tierra-alternativa.md.
Tarea T-P2-A3: revisa src/core/earth.ts: EARTH_INVEST y EARTH_END_SEASON con el orden fijo de
la temporada, combinaciones, deriva, recorte, victoria y fallo. Los números salen de
GameData.earth (B). Un fallo aplica tierra->marte y conserva la victoria marciana.
Edita solo src/core/{earth,progression,save}.ts y tests/core/earth.test.ts.
Pruebas U-TIE-01 a 06 e I-CAM-04. Ejecuta npm test y npm run build.
```

### T-P2-A4 · Prueba de campaña completa

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · B y C |
| Depende de | Todo P2 |
| Archivos | `tests/core/campaign.test.ts`, `tests/browser/campaign.mjs`, `docs/PRUEBAS.md` |

**Criterios de aceptación**
- [ ] Luna y Marte con balizas → portal → Tierra → final alternativo, de principio a fin.
- [ ] Fallo del epílogo → final ordinario de Marte.
- [ ] Portal cerrado si falta una condición.
- [ ] Resultados anotados con fecha y navegador.

```text
Eres el integrante A de Earth's Angel en el papel de integración y QA.
Tarea T-P2-A4: ejecuta npm test, npm run build y node tests/browser/campaign.mjs contra
npm run preview. Recorre: primeras pistas, portal bloqueado sin una condición, persistencia de
hallazgos tras recargar, final alternativo y fallo terrestre con regreso a Marte.
Anota resultados medidos en docs/PRUEBAS.md. No cambies valores esperados.
```

## Orden de integración de P2

1. **A:** cambio de contrato de P2 (tipos y errores) fusionado primero.
2. **B:** pistas y datos de la Tierra ([T-P2-B](T-P2-B-jugabilidad.md)).
3. **A:** SCAN, portal y núcleo terrestre (A1 a A3).
4. **C:** registro de pistas, elección, pantalla de la Tierra y cinemáticas ([T-P2-C](T-P2-C-interfaz.md)).
5. **A:** prueba de campaña (A4), etiqueta `p2` y despliegue.

## Registro de autoría

| Tarea | Implementó | Revisó | Fecha |
| --- | --- | --- | --- |
| T-P2-A1 a A4 | Asistente de IA en el commit `4c969ae` | `[POR COMPLETAR: A, revisor B o C]` | 14-nov-2026 |
