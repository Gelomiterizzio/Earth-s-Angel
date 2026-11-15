# T-P1-C · Interfaz, arte, música y cinemáticas de Marte

| Campo | Valor |
| --- | --- |
| Integrante | **C · Arte, narrativa e interfaz** |
| Revisor | A (flujo) · B (lectura de datos) |
| Fase · hito | P1 · campaña principal |
| Dependencia | Contrato de A ([T-P1-A1](T-P1-A-motor.md)); arte y música no dependen de nadie |
| Estado real | HUD marciano, manifiesto, cinemáticas `moonToMars` y `marsVictory` y música de Marte integrados (commit `4c969ae`). **Revisión humana pendiente.** |

## Propiedad de archivos

| Archivo | Dueño |
| --- | --- |
| `src/ui/**` salvo `src/ui/panels/decision.ts` | C |
| `src/styles/**`, `src/audio/**`, `public/assets/**` | C |
| `src/data/i18n/*/ui.json` | C |
| `docs/ARTE-Y-ACTIVOS.md`, `docs/GUION-CINEMATICAS.md`, `docs/IA-Y-CREDITOS.md` (integración) | C |

## Markdown que debes leer

1. [AGENTS.md](../../../AGENTS.md) · [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md)
2. [GUION-CINEMATICAS.md](../../GUION-CINEMATICAS.md), secuencias 2 y 3
3. [componentes/hud-y-accesibilidad.md](../../componentes/hud-y-accesibilidad.md) · [componentes/motor-cinematicas.md](../../componentes/motor-cinematicas.md)
4. [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md), manifiesto P1 · [componentes/audio.md](../../componentes/audio.md)

## Tareas

### T-P1-C1 · HUD marciano y opciones completas

| Campo | Valor |
| --- | --- |
| Responsable · revisor | C · B |
| Depende de | T-P1-A2 |
| Archivos | `src/ui/hud/**`, `src/ui/screens/{mission,options,title}.ts`, `src/styles/hud.css`, `ui.json` |
| Contratos | `HudSummary.dust`, `HudSummary.link`, acciones `CLEAN_PANELS` y `REPAIR` |

**Entregables:** "Sol" en lugar de "Día" con explicación; indicador de polvo y botón Limpiar paneles; estado del enlace; botón Reparar; Continuar en el título; pantalla completa en Opciones.

**Criterios de aceptación**
- [ ] El HUD dice "Sol N" en Marte y la pista explica que un sol del juego es un turno.
- [ ] Polvo y enlace se muestran con icono, texto y color.
- [ ] Todo se maneja con teclado; nada nuevo depende solo del color.
- [ ] Pantalla completa entra y sale sin romper el escenario 16:9.

**Pruebas:** M-HUD-09 a M-HUD-12, M-MEN-07.

```text
Eres el integrante C de Earth's Angel. Lee docs/agentes/prompts/interfaz.md,
docs/componentes/hud-y-accesibilidad.md y docs/niveles/marte.md.
Tarea T-P1-C1: revisa el HUD de Marte en src/ui/hud: "Sol" con explicación, polvo y enlace
desde summarizeHud (no recalcules reglas), botones Limpiar paneles y Reparar que despachan
CLEAN_PANELS y REPAIR, Continuar en el título y pantalla completa en Opciones.
Textos solo desde ui.json en inglés y español. No toques src/core, src/map ni decision.ts.
Prueba con teclado y ratón a 1366x768 y 1920x1080. Ejecuta npm test y npm run build.
```

### T-P1-C2 · Cinemáticas Luna → Marte y victoria ordinaria

| Campo | Valor |
| --- | --- |
| Responsable · revisor | C · A |
| Depende de | T-P1-A1, T-P1-A3 |
| Archivos | `src/ui/cinematics/**`, `src/ui/screens/cinematic.ts`, `public/assets/cinematics/{moon-to-mars,mars-victory}-*.png`, `ui.json` |
| Contratos | `CinematicScript`, `flow.completeCinematic(id)` con cerrojo, manifiesto en `campaign.manifest` |

**Entregables:** pantalla del manifiesto antes de partir; secuencias de 5 y 4 escenas con subtítulos EN/ES; botón «Saltar (Intro)» y tecla Enter con la misma salida que el fin natural.

**Criterios de aceptación**
- [ ] Ver la secuencia completa o saltarla deja el mismo estado guardado.
- [ ] Enter cinco veces navega una sola vez.
- [ ] Con movimiento reducido no hay paneos.
- [ ] El bono mostrado sale de `manifest.bonusDaysApplied`.

**Pruebas:** M-CIN-01 a M-CIN-06 para cada secuencia e I-CAM-02.

```text
Eres el integrante C de Earth's Angel. Lee docs/GUION-CINEMATICAS.md (secuencias 2 y 3) y
docs/componentes/motor-cinematicas.md.
Tarea T-P1-C2: revisa moonToMars.json y marsVictory.json, la pantalla del manifiesto y el
salto. La cinemática NO cambia el estado: A aplica la transición antes. Fin natural, botón
«Skip (Enter)» y tecla Enter llaman a la misma función con cerrojo.
Edita solo src/ui/cinematics, src/ui/screens/cinematic.ts, ui.json y las viñetas.
Prueba: saltar vs. ver completa, Enter repetido, movimiento reducido. Ejecuta npm test y build.
```

### T-P1-C3 · Arte y música de Marte

| Campo | Valor |
| --- | --- |
| Responsable · revisor | C · B |
| Depende de | Ninguna |
| Archivos | `public/assets/sprites/{tiles-mars,buildings-p1,crew-p1,fx-dust}.png`, `src/audio/**`, `docs/ARTE-Y-ACTIVOS.md`, `docs/IA-Y-CREDITOS.md` |

**Entregables:** terreno marciano, cuatro edificios P1, dos retratos, efecto de polvo y pista `music-mars` (sintetizada si no hay archivo).

**Criterios de aceptación**
- [ ] Nombres y tamaños exactos del manifiesto.
- [ ] Ningún logotipo, bandera ni identificador de misión.
- [ ] Cada activo con autoría, licencia y, si es generado, herramienta, modelo y prompt.
- [ ] La música cambia con fundido al entrar en Marte.

**Pruebas:** M-ART-01 a M-ART-03, M-AUD-02.

```text
Eres el integrante C de Earth's Angel. Lee docs/agentes/prompts/arte-y-audio.md y el
manifiesto P1 de docs/ARTE-Y-ACTIVOS.md.
Tarea T-P1-C3: revisa los sprites de Marte y la pista music-mars. Respeta nombres, tamaños y
paleta marciana. Registra cada activo en docs/IA-Y-CREDITOS.md. Recuerda: para la entrega a
Space Apps, imágenes y videos generados necesitan marca de agua visible.
No toques código fuera de src/audio. Informa activos entregados y pendientes.
```

## Orden de integración

C1 y C2 se fusionan después del núcleo y el guardado de A. C3 puede fusionarse en cualquier momento. Orden general en [T-P1-A](T-P1-A-motor.md#orden-de-integración-de-p1).

## Registro de autoría

| Tarea | Implementó | Revisó | Fecha |
| --- | --- | --- | --- |
| T-P1-C1 a C3 | Asistentes de IA (commits del equipo y `4c969ae`) | `[POR COMPLETAR: C, revisor A o B]` | 14-nov-2026 |
