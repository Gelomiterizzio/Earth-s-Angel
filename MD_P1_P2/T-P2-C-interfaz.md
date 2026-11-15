# T-P2-C · Portal, interfaz de la Tierra, final alternativo y créditos

| Campo | Valor |
| --- | --- |
| Integrante | **C · Arte, narrativa e interfaz** |
| Revisor | A (flujo) · B (textos y métricas) |
| Fase · hito | P2 · Segunda Oportunidad |
| Dependencia | Contrato de A y simulación de B |
| Estado real | Registro de pistas (`src/ui/hud/clues.ts`), elección, pantalla de la Tierra (`src/ui/screens/earth.ts`), informe de temporada y cinemáticas `wormhole` y `earthVictory` integrados (commit `4c969ae`). **Revisión humana pendiente.** |

## Propiedad de archivos

| Archivo | Dueño |
| --- | --- |
| `src/ui/**` salvo `src/ui/panels/decision.ts` | C |
| `src/styles/**`, `src/audio/**`, `public/assets/**`, `ui.json` | C |
| `docs/IA-Y-CREDITOS.md`, `docs/ARTE-Y-ACTIVOS.md`, `docs/GUION-CINEMATICAS.md` | C |

## Markdown que debes leer

1. [AGENTS.md](../../../AGENTS.md) · [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md)
2. [componentes/agujero-de-gusano.md](../../componentes/agujero-de-gusano.md) · [componentes/mision-terrestre.md](../../componentes/mision-terrestre.md)
3. [GUION-CINEMATICAS.md](../../GUION-CINEMATICAS.md), secuencia 4
4. [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md), manifiesto P2 · [IA-Y-CREDITOS.md](../../IA-Y-CREDITOS.md)

## Tareas

### T-P2-C1 · Señales de pistas y pantalla de elección

| Campo | Valor |
| --- | --- |
| Responsable · revisor | C · A |
| Depende de | T-P2-A1, T-P2-A2 |
| Archivos | `src/ui/hud/clues.ts`, `src/ui/hud/mission-hud.ts`, `src/ui/screens/choice.ts`, `src/styles/screens.css`, `ui.json` |
| Contratos | Herramienta `scan`, `campaign.clues`, `flow.chooseEnding` |

**Criterios de aceptación**
- [ ] El registro de pistas lista cada pista con icono y texto; persiste tras recargar.
- [ ] La herramienta de escaneo se elige desde el HUD y con teclado.
- [ ] La elección muestra dos opciones del mismo tamaño, sin destacar ninguna, con el rótulo de ficción.
- [ ] Antes de entrar al portal aparece el aviso de que un fallo no quita la victoria de Marte.

**Pruebas:** M-SEC-01 a M-SEC-03.

```text
Eres el integrante C de Earth's Angel. Lee docs/agentes/prompts/interfaz.md y
docs/componentes/agujero-de-gusano.md.
Tarea T-P2-C1: revisa el registro de pistas (src/ui/hud/clues.ts), la herramienta scan en el
HUD y la pantalla de elección (src/ui/screens/choice.ts). Dos opciones equivalentes, aviso
antes del portal, rótulo "el viaje en el tiempo es ficción". La interfaz llama a
flow.chooseEnding: no aplica transiciones. Textos solo en ui.json EN/ES.
Prueba con teclado. Ejecuta npm test y npm run build.
```

### T-P2-C2 · Interfaz y audio de la misión terrestre

| Campo | Valor |
| --- | --- |
| Responsable · revisor | C · B |
| Depende de | T-P2-A3, T-P2-B2 |
| Archivos | `src/ui/screens/earth.ts`, `src/ui/panels/earth-report.ts`, `src/audio/**`, `public/assets/cinematics/earth-stage-*.png`, `public/assets/ui/icons-earth.png`, `ui.json` |
| Contratos | `GameState.earth`, `EARTH_INVEST`, `EARTH_END_SEASON`, `EarthSeasonReport` |

**Criterios de aceptación**
- [ ] Muestra temporada, presupuesto, cuatro líneas con nivel y costo, y tres métricas con meta.
- [ ] El fondo cambia de estado cada 20 puntos de avance.
- [ ] Los rótulos de ficción y de indicadores simplificados están siempre visibles.
- [ ] El informe de temporada explica qué subió y qué bajó.
- [ ] Resultado con reintento y regreso al final de Marte; `music-earth` suena.

**Pruebas:** M-SEC-04, M-AUD-02.

```text
Eres el integrante C de Earth's Angel. Lee docs/componentes/mision-terrestre.md y
docs/niveles/tierra-alternativa.md.
Tarea T-P2-C2: revisa src/ui/screens/earth.ts y panels/earth-report.ts. La pantalla lee
GameState.earth y despacha EARTH_INVEST y EARTH_END_SEASON; no calcula reglas.
Rótulos fijos de ficción y simplificación, fondo por etapas, reintento y regreso a Marte.
Todo con teclado y textos en ui.json EN/ES. Ejecuta npm test y npm run build.
```

### T-P2-C3 · Cinemática del final alternativo y créditos

| Campo | Valor |
| --- | --- |
| Responsable · revisor | C · A |
| Depende de | T-P2-C2 |
| Archivos | `src/ui/cinematics/scripts/{wormhole,earthVictory}.json`, `src/ui/credits-data.ts`, `src/ui/screens/credits.ts`, `public/assets/cinematics/{wormhole,earth-victory}-*.png`, `docs/IA-Y-CREDITOS.md` |

**Criterios de aceptación**
- [ ] `wormhole` y `earthVictory` se ven y se saltan con «Saltar (Intro)» y Enter con el mismo resultado.
- [ ] El final cierra con: "El futuro comienza aprendiendo a cuidar nuestro hogar. Todavía estamos a tiempo de proteger la Tierra."
- [ ] Los créditos listan fuentes NASA, herramientas, uso de IA, activos y la frase de no afiliación.
- [ ] Toda viñeta generada está registrada; para la entrega a Space Apps lleva marca de agua visible.

**Pruebas:** M-SEC-05, M-CIN-01 a M-CIN-06, M-RES-04.

```text
Eres el integrante C de Earth's Angel. Lee docs/GUION-CINEMATICAS.md (secuencia 4) y
docs/IA-Y-CREDITOS.md.
Tarea T-P2-C3: revisa las cinemáticas wormhole y earthVictory y la pantalla de créditos.
Salto y fin natural con el mismo cierre; mensaje final de cuidado de la Tierra; créditos
completos con fuentes, licencias, IA y no afiliación. Registra cada viñeta en
docs/IA-Y-CREDITOS.md. Ejecuta npm test y npm run build e informa activos pendientes.
```

## Orden de integración

C1 entra tras el portal de A. C2 y C3 entran con el núcleo terrestre de A y los datos de B. Orden general en [T-P2-A](T-P2-A-motor.md#orden-de-integración-de-p2).

## Registro de autoría

| Tarea | Implementó | Revisó | Fecha |
| --- | --- | --- | --- |
| T-P2-C1 a C3 | Asistentes de IA (commits del equipo y `4c969ae`) | `[POR COMPLETAR: C, revisor A o B]` | 14-nov-2026 |
