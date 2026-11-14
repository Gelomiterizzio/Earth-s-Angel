# P1 · Campaña principal

Fichas compactas de las ocho tareas de P1. **Solo se empiezan con P0 verificado** (hito H4). Cada ficha tiene los mismos campos que la [plantilla](../PLANTILLA-TAREA.md), en forma breve. Antes de despachar una, su responsable la amplía si hace falta.

Para todas: base Git, rama `<letra>/p1-<id>` desde `main` · reglas en [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md) · informe final con el formato de la plantilla · condición de integración común: `npm test` y `npm run build` en verde, revisión hecha y los recorridos de la Luna siguen pasando.

**Antes de empezar P1, A hace un único cambio de contrato** que desbloquea a los demás: acciones `REPAIR` y `CLEAN_PANELS`, campos de polvo y de enlace en `MissionState`, y `applyTransition`. Se fusiona antes de despachar tareas en paralelo.

---

## T-P1-A1 · Transición Luna → Marte, manifiesto y bono único

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 · primero |
| Perfil · responsable · revisor | [Motor](../prompts/motor.md) · A · B |
| Estimación | 2,0 h |
| Componentes | [progresion](../../componentes/progresion.md) |
| Contexto | [progresion](../../componentes/progresion.md) · [ARQUITECTURA.md](../../ARQUITECTURA.md) sección 9 · [dificultad-y-balance](../../componentes/dificultad-y-balance.md) |
| Dependencias | P0 verificado |
| Rutas permitidas | `src/core/progression.ts`, `mission.ts`, `types.ts`, `index.ts`, `src/app/flow.ts`, `tests/core/progression.test.ts` |
| Rutas excluidas | Carpetas de B y C |
| Contratos | `applyTransition`, `TransferManifest`, evento `transition/applied` |

**Pasos:** 1) `applyTransition` atómica e idempotente. 2) Manifiesto según la tabla de la ficha. 3) Bono dentro de la transición. 4) `flow`: tras la victoria lunar, aplicar la transición, guardar y entonces ir a la cinemática. 5) Pruebas.

**Entregables:** transición probada y flujo Luna → cinemática → Marte.

**Pruebas:** U-PRO-01 a U-PRO-06, I-CAM-01 e I-CAM-02.

**Criterios de aceptación:** el bono se suma una vez aunque se llame cinco veces; ver, saltar o recargar la cinemática deja el mismo estado; el contador local vuelve a 1 y el plazo terrestre se conserva.

**Evidencia:** salida de pruebas.

---

## T-P1-A2 · Guardado de campaña, Continuar y Reiniciar

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Motor](../prompts/motor.md) · A · C |
| Estimación | 2,0 h |
| Componentes | [persistencia](../../componentes/persistencia.md) |
| Contexto | [persistencia](../../componentes/persistencia.md) completa |
| Dependencias | T-P1-A1 |
| Rutas permitidas | `src/core/save.ts`, `validate.ts`, `src/app/persistence.ts`, `flow.ts`, `tests/core/save.test.ts` |
| Rutas excluidas | Carpetas de B y C |
| Contratos | `SaveData`, `serialize`, `deserialize`, clave `ea.save.v1` |

**Pasos:** 1) `serialize` y `deserialize` con esquema y versión. 2) Tabla de migraciones. 3) Guardar en los cuatro puntos estables. 4) Recuperación ante guardado ausente, corrupto, incompatible o inválido. 5) `flow`: Continuar en el título; confirmación antes de sobrescribir.

**Entregables:** partida que sobrevive a una recarga.

**Pruebas:** U-GUA-01 a U-GUA-06 y manual M-GUA-01.

**Criterios de aceptación:** recargar en cualquier punto estable devuelve el mismo estado; un guardado con texto basura no rompe el arranque y ofrece Nueva partida; la carga valida los mismos invariantes que una partida nueva; cambiar opciones no modifica el guardado.

**Evidencia:** salida de pruebas y recorrido manual.

---

## T-P1-A3 · Núcleo marciano: polvo, mantenimiento, logística y comunicaciones

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Motor](../prompts/motor.md) · A · B |
| Estimación | 3,0 h |
| Componentes | [energia](../../componentes/energia.md) · [eventos-ambientales](../../componentes/eventos-ambientales.md) · [objetivos](../../componentes/objetivos.md) · [radiacion-y-refugio](../../componentes/radiacion-y-refugio.md) |
| Contexto | [niveles/marte.md](../../niveles/marte.md) |
| Dependencias | T-P1-A1 |
| Rutas permitidas | `src/core/**`, `tests/core/**`, `src/data/i18n/*/sim.json` |
| Rutas excluidas | Carpetas de B y C |
| Contratos | Acciones `REPAIR`, `CLEAN_PANELS`; objetivos `comunicaciones` y `autonomia` |

**Pasos:** 1) Polvo acumulado en la fórmula de generación. 2) `CLEAN_PANELS` y `REPAIR`. 3) Recargo logístico en el costo de puntos de acción. 4) Horizonte de pronóstico según antena. 5) Refugio con menos plazas que tripulación. 6) Objetivos y derrotas de Marte. 7) Edificios de P1.

**Entregables:** núcleo que juega una misión marciana.

**Pruebas:** U-MAR-01 a U-MAR-08.

**Criterios de aceptación:** una tormenta regional deja los paneles al 65 %; limpiar devuelve el polvo a 0; construir lejos cuesta el recargo de la tabla; con seis tripulantes y cuatro plazas quedan dos fuera; los recorridos de la Luna no cambian.

**Evidencia:** salida de pruebas.

---

## T-P1-B1 · Mapa y datos de Marte

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Jugabilidad](../prompts/jugabilidad.md) · B · A |
| Estimación | 2,0 h |
| Componentes | [mapa](../../componentes/mapa.md) · [construccion](../../componentes/construccion.md) |
| Contexto | [niveles/marte.md](../../niveles/marte.md) |
| Dependencias | T-P1-A3 para probar en juego |
| Rutas permitidas | `src/data/content/levels/marte.json`, `src/data/balance/marte.json`, `buildings.json`, `src/map/**`, `tests/data/**` |
| Rutas excluidas | `src/core`, `src/ui` |
| Contratos | `LevelConfig`, `DifficultyConfig` |

**Pasos:** 1) JSON del mapa de 20 × 20 tal como está en la ficha. 2) Balance marciano. 3) Edificios de P1 en el catálogo. 4) Cámara desplazable y vista general en el tablero. 5) Terreno marciano con respaldo de rectángulos. 6) Indicador de recargo logístico en la vista previa.

**Entregables:** tablero marciano navegable.

**Pruebas:** D-BAL-06 y D-BAL-07, M-MAP-06 a M-MAP-08.

**Criterios de aceptación:** 20 filas de 20 caracteres, una nave y los recursos de la tabla; la cámara se mueve con ratón y teclado; la vista previa muestra el recargo.

**Evidencia:** capturas.

---

## T-P1-B2 · Eventos, objetivos y validación del balance marciano

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Ciencia y datos](../prompts/ciencia-y-datos.md) · B · A |
| Estimación | 3,0 h |
| Componentes | [dificultad-y-balance](../../componentes/dificultad-y-balance.md) · [eventos-ambientales](../../componentes/eventos-ambientales.md) |
| Contexto | [niveles/marte.md](../../niveles/marte.md) · [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md) F-03, F-04, F-05 |
| Dependencias | T-P1-B1 y T-P1-A3 |
| Rutas permitidas | `src/data/**`, `tests/**/mars*.test.ts`, `docs/niveles/marte.md`, `docs/componentes/dificultad-y-balance.md`, `docs/CIENCIA-Y-DATOS.md` |
| Rutas excluidas | `src/core`, `src/ui` |
| Contratos | Programa de eventos por dificultad |

**Pasos:** 1) Programa de tormentas y averías. 2) Tarjetas `sol`, `dustPanels`, `sameStormMars`, comprobando cada fuente. 3) Encontrar y documentar un recorrido de victoria por dificultad. 4) Convertirlos en pruebas. 5) Ajustar los valores hasta que Imposible sea difícil y ganable. 6) Cambiar el estado de las tablas de "sin validar" a "validado" **solo** cuando las pruebas pasen.

**Entregables:** balance marciano validado y documentado.

**Pruebas:** I-REC-MARTE-FACIL, I-REC-MARTE-MEDIA, I-REC-MARTE-IMPOSIBLE.

**Criterios de aceptación:** tres recorridos de victoria reproducibles; cada cifra tiene su etiqueta; el 65 % conserva su fuente.

**Evidencia:** tablas de recorrido en `niveles/marte.md` y pruebas en verde.

---

## T-P1-C1 · Cinemáticas Luna → Marte y victoria ordinaria

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Interfaz](../prompts/interfaz.md) · C · A |
| Estimación | 2,0 h |
| Componentes | [motor-cinematicas](../../componentes/motor-cinematicas.md) · [gestor-narrativa](../../componentes/gestor-narrativa.md) |
| Contexto | [GUION-CINEMATICAS.md](../../GUION-CINEMATICAS.md), secuencias 2 y 3 |
| Dependencias | T-P1-A1 |
| Rutas permitidas | `src/ui/cinematics/**`, `public/assets/cinematics/**`, `src/data/i18n/*/ui.json` |
| Rutas excluidas | `src/core`, `src/app` |
| Contratos | `CinematicScript`, `completeCinematic` |

**Pasos:** 1) Guiones `moonToMars.json` y `marsVictory.json`. 2) Viñetas con marca de agua si son generadas. 3) Subtítulos en dos idiomas. 4) Pantalla del manifiesto antes de partir.

**Entregables:** dos secuencias saltables.

**Pruebas:** M-CIN-01 a M-CIN-06 repetidas para cada secuencia, e I-CAM-02.

**Criterios de aceptación:** saltar o ver da el mismo estado; mismo tema musical que la apertura; subtítulos correctos.

**Evidencia:** capturas.

---

## T-P1-C2 · Opciones completas y HUD marciano

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Interfaz](../prompts/interfaz.md) · C · B |
| Estimación | 2,0 h |
| Componentes | [menu-opciones](../../componentes/menu-opciones.md) · [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md) |
| Contexto | [niveles/marte.md](../../niveles/marte.md) |
| Dependencias | T-P1-A3 |
| Rutas permitidas | `src/ui/**` salvo `decision.ts`, `src/styles/**`, `src/data/i18n/*/ui.json` |
| Rutas excluidas | `src/core`, `src/map` |
| Contratos | `HudSummary` ampliado con polvo y enlace |

**Pasos:** 1) Pantalla completa. 2) "Sol" en lugar de "Día". 3) Indicador de polvo y botón Limpiar paneles. 4) Estado del enlace. 5) Botón Reparar. 6) Botón Continuar en el título.

**Entregables:** HUD y opciones de la campaña completa.

**Pruebas:** M-HUD-09 a M-HUD-12 y M-MEN-07.

**Criterios de aceptación:** el HUD dice "Sol" en Marte y lo explica; el polvo se ve y se limpia; pantalla completa entra y sale sin romper el escenario.

**Evidencia:** capturas.

---

## T-P1-C3 · Arte y música de Marte

| Campo | Valor |
| --- | --- |
| Prioridad · hito | P1 |
| Perfil · responsable · revisor | [Arte y audio](../prompts/arte-y-audio.md) · C · B |
| Estimación | 2,0 h |
| Componentes | [proceso-de-activos](../../componentes/proceso-de-activos.md) · [audio](../../componentes/audio.md) |
| Contexto | [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md), paleta y manifiesto de Marte |
| Dependencias | Ninguna |
| Rutas permitidas | `public/assets/**`, `docs/ARTE-Y-ACTIVOS.md`, `docs/IA-Y-CREDITOS.md` |
| Rutas excluidas | Código |
| Contratos | Nombres y tamaños del manifiesto |

**Pasos:** 1) Terreno marciano. 2) Edificios de P1. 3) Efecto de tormenta de polvo. 4) `music-mars`. 5) Registro de autoría, licencia y uso de IA.

**Entregables:** activos de Marte registrados.

**Pruebas:** M-ART-01 a M-ART-03 para los activos nuevos.

**Criterios de aceptación:** cada activo tiene nombre, tamaño, autoría y licencia; lo generado lleva su identificación; ninguna marca de agencia.

**Evidencia:** hoja de sprites y manifiesto.
