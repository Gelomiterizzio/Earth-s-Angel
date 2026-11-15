# T-P1-A · Motor, transición y guardado de Marte

| Campo | Valor |
| --- | --- |
| Integrante | **A · Motor e integración** |
| Revisor | B (cifras y transferencia) · C (flujo y pantallas) |
| Fase · hito | P1 · campaña principal |
| Dependencia | P0 verificado (recorridos lunares en verde) |
| Estado real | Implementado en el commit `4c969ae`. **Revisión humana pendiente.** Pruebas en `tests/core/campaign.test.ts` y `tests/data/campaign.test.ts`. |

## Propiedad única de contratos y archivos compartidos

A es el único dueño de estos archivos. B y C piden cambios; no los editan.

| Contrato o archivo | Dueño |
| --- | --- |
| `src/core/types.ts` (acciones, eventos, `TransferManifest`, `TransitionId`, campos `dust`, `linkStreak`, `labDays`) | A |
| `src/core/progression.ts` (`applyTransition`) | A |
| `src/core/save.ts`, `src/core/validate.ts` | A |
| `src/app/flow.ts`, `src/app/context.ts`, `src/app/persistence.ts`, `src/main.ts` | A |
| `src/data/i18n/*/sim.json` | A |

## Markdown que debes leer

1. [AGENTS.md](../../../AGENTS.md) y [CLAUDE.md](../../../CLAUDE.md)
2. [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md) y [PROTOCOLO-INTEGRACION.md](../PROTOCOLO-INTEGRACION.md)
3. [ARQUITECTURA.md](../../ARQUITECTURA.md), secciones 5 a 9
4. [componentes/progresion.md](../../componentes/progresion.md) · [componentes/persistencia.md](../../componentes/persistencia.md)
5. [niveles/marte.md](../../niveles/marte.md) · [componentes/dificultad-y-balance.md](../../componentes/dificultad-y-balance.md)

## Tareas

### T-P1-A1 · Transición Luna → Marte con bono único

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · B |
| Depende de | P0 |
| Archivos | `src/core/progression.ts`, `src/core/types.ts`, `src/core/mission.ts`, `src/core/index.ts`, `tests/core/campaign.test.ts` |
| Contratos | `applyTransition(state, 'luna->marte', data): ActionResult` · `TransferManifest` · evento `transition/applied` |

**Entregables:** transición atómica e idempotente; manifiesto con tripulación (salud 100, mitad de exposición, dos especialistas nuevos), mitad de cada reserva más el equipo de llegada, hallazgos, pistas y `bonusDaysApplied`.

**Criterios de aceptación**
- [ ] Llamar cinco veces a `applyTransition('luna->marte')` suma el bono una sola vez.
- [ ] Sin victoria lunar, la transición devuelve error y el mismo objeto de estado.
- [ ] `mission.day` vuelve a 1 y `earthDaysRemaining` = restante lunar + bono.
- [ ] `validateState` devuelve lista vacía tras la transición.

**Pruebas:** U-PRO-01 a U-PRO-06 e I-CAM-01, I-CAM-02 de [PRUEBAS.md](../../PRUEBAS.md). Ejemplo: Media, victoria lunar el día 9 → 45 + 10 = 55.

```text
Eres el integrante A de Earth's Angel (TypeScript + Vite, núcleo puro en src/core).
Lee AGENTS.md, CLAUDE.md, docs/agentes/REGLAS-DE-TRABAJO.md, docs/ARQUITECTURA.md
(secciones 5-9) y docs/componentes/progresion.md.
Tarea T-P1-A1: revisa o implementa applyTransition('luna->marte') en src/core/progression.ts.
Debe ser atómica e idempotente, aplicar el bono de días una sola vez y armar el
TransferManifest exactamente como dice la ficha de progresión. Solo enteros, sin Math.random.
Edita solo: src/core/{progression,types,mission,index}.ts y tests/core/campaign.test.ts.
Pruebas obligatorias: bono aplicado una vez tras cinco llamadas; error sin victoria;
estado válido tras transición; Media día 9 → 55 días terrestres.
Ejecuta npm test y npm run build y pega la salida. Informa implementado, probado y pendiente.
```

### T-P1-A2 · Núcleo marciano: polvo, logística, averías y enlace

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · B |
| Depende de | T-P1-A1 |
| Archivos | `src/core/{actions,day-cycle,energy,events,objectives}.ts`, `tests/core/campaign.test.ts` |
| Contratos | Acciones `CLEAN_PANELS`, `REPAIR`; eventos `building/damaged`, `building/repaired`, `panels/cleaned`; `HudSummary.dust` y `HudSummary.link` |

**Entregables:** polvo acumulado en la fórmula de generación, limpieza de paneles, recargo de PA por distancia a la nave o a un hábitat, averías programadas y reparación, horizonte de pronóstico según antena, objetivos `comunicaciones` y `autonomia`.

**Criterios de aceptación**
- [ ] `gen = floor(paneles × 8 × solar/100 × (100 − polvo)/100)`.
- [ ] `CLEAN_PANELS` deja el polvo en 0 y cuesta 1 PA; sin polvo devuelve `NOTHING_TO_CLEAN`.
- [ ] `REPAIR` sin edificio averiado devuelve `NOTHING_TO_REPAIR` y no cambia nada.
- [ ] Con seis tripulantes y cuatro plazas de refugio quedan dos fuera.
- [ ] Los tres recorridos lunares siguen dando exactamente las mismas cifras.

**Pruebas:** U-MAR-01 a U-MAR-08 y todos los I-REC lunares.

```text
Eres el integrante A de Earth's Angel. Lee AGENTS.md, docs/niveles/marte.md,
docs/componentes/energia.md, eventos-ambientales.md y objetivos.md.
Tarea T-P1-A2: revisa el núcleo marciano en src/core/{actions,day-cycle,energy,events,objectives}.ts:
polvo acumulado con tope, CLEAN_PANELS, REPAIR con costo de materiales, averías programadas,
recargo logístico por distancia, horizonte de pronóstico con antena, objetivos comunicaciones
y autonomia. Ningún número de balance en el código: todo sale de GameData.
No toques src/map, src/ui ni src/data salvo sim.json.
Pruebas: las del bloque U-MAR de docs/PRUEBAS.md, y que los recorridos lunares no cambien.
Ejecuta npm test y npm run build. Informa implementado, probado y pendiente.
```

### T-P1-A3 · Guardado de campaña, Continuar y reinicio

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · C |
| Depende de | T-P1-A1 |
| Archivos | `src/core/save.ts`, `src/core/validate.ts`, `src/app/persistence.ts`, `src/app/flow.ts`, `src/main.ts`, `tests/core/campaign.test.ts` |
| Contratos | `serialize` / `deserialize` con `schema: 'earths-angel/save'`, clave `ea.save.v1`, `ea.save.corrupt` |

**Entregables:** guardado en los cuatro puntos estables (crear misión, abrir día, tras transición antes de la cinemática, fin de misión); Continuar en el título; recuperación ante guardado ausente, corrupto, incompatible o inválido; `RESTART_MISSION` en Marte con el plazo terrestre del inicio de esa misión.

**Criterios de aceptación**
- [ ] Recargar en Marte y pulsar Continuar devuelve el mismo estado.
- [ ] Texto basura en `ea.save.v1` no rompe el arranque y se copia a `ea.save.corrupt`.
- [ ] Una partida cargada pasa los mismos invariantes que una nueva.
- [ ] Cambiar idioma o volumen no modifica el guardado.
- [ ] Reintentar Marte no vuelve a sumar el bono.

**Pruebas:** U-GUA-01 a U-GUA-06 y M-GUA-01.

```text
Eres el integrante A de Earth's Angel. Lee docs/componentes/persistencia.md y progresion.md.
Tarea T-P1-A3: revisa el guardado de campaña. serialize/deserialize en src/core/save.ts con
validación completa; persistence.ts guarda en los cuatro puntos estables; flow.ts ofrece
Continuar y aplica la transición y guarda ANTES de reproducir la cinemática moonToMars;
RESTART_MISSION en Marte restaura el plazo del inicio de la misión sin repetir el bono.
Edita solo src/core/{save,validate}.ts, src/app/{persistence,flow}.ts, src/main.ts y tests/core.
Pruebas: guardar/cargar en Marte, guardado corrupto, recarga durante la cinemática,
reintento sin bono repetido. Ejecuta npm test y npm run build. Informa resultados reales.
```

### T-P1-A4 · Prueba de campaña e integración

| Campo | Valor |
| --- | --- |
| Responsable · revisor | A · B y C |
| Depende de | T-P1-A1 a A3, T-P1-B, T-P1-C |
| Archivos | `tests/core/campaign.test.ts`, `tests/browser/campaign.mjs`, `docs/PRUEBAS.md` (resultados) |

**Criterios de aceptación**
- [ ] Recorrido automático Luna → Marte → victoria ordinaria en Media pasa.
- [ ] Ver la cinemática completa y saltarla con «Saltar (Intro)» dan el mismo estado guardado.
- [ ] Ganar, perder e iniciar nueva partida en Marte funcionan en el navegador.

```text
Eres el integrante A de Earth's Angel, en el papel de integración y QA.
Lee docs/agentes/prompts/integracion-y-qa.md y docs/PRUEBAS.md.
Tarea T-P1-A4: ejecuta npm test, npm run build y node tests/browser/campaign.mjs contra
npm run preview. Comprueba Luna → cinemática → Marte → victoria ordinaria, guardar y continuar
en Marte, derrota en Marte y nueva partida. No cambies valores esperados para que pasen.
Anota en docs/PRUEBAS.md fecha, navegador y resultado medido. Informa fallos con dueño.
```

## Orden de integración de P1

1. **A:** cambio de contrato (T-P1-A1) fusionado primero en `main`.
2. **B:** datos y mapa de Marte ([T-P1-B](T-P1-B-jugabilidad.md)).
3. **A:** núcleo marciano y guardado (T-P1-A2, A3).
4. **C:** HUD, cinemáticas y música ([T-P1-C](T-P1-C-interfaz.md)).
5. **A:** prueba de campaña (T-P1-A4) y etiqueta `p1`.

## Registro de autoría

| Tarea | Implementó | Revisó | Fecha |
| --- | --- | --- | --- |
| T-P1-A1 a A4 | Asistente de IA en el commit `4c969ae` | `[POR COMPLETAR: A, revisor B o C]` | 14-nov-2026 |
