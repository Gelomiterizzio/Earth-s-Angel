# Entrega

Borrador público en inglés, enlaces y comprobaciones de inscripción, atribuciones y envío. Es la **fuente canónica del texto de entrega**. Responsable: C. Tarea: [T-P0-C7](agentes/tareas/T-P0-C7-entrega.md).

> **Envío: domingo 15-nov antes de las 11:30**, hora de Bolivia. Requisitos verificados en [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md).

> **Estado el 14-nov-2026.** El formulario **no se ha enviado**. Los enlaces siguen en `[POR COMPLETAR]`. La interfaz se puede abrir en local; la partida jugable depende del núcleo de A y del mapa de B. No marques Submit for Judging hasta que la URL pública ejecute el recorrido y una persona grabe la demo.

> **Aviso sobre el borrador.** Este texto se escribió antes de programar el juego. Describe el alcance P0 previsto. **Antes de enviar, borra o corrige toda frase que describa algo que la versión publicada no haga.** No se envía nada que no sea cierto.

## 1. Enlaces

| Campo | Valor |
| --- | --- |
| Link to Project Demo | `[POR COMPLETAR: enlace público al video de 30 s o al PDF de 7 diapositivas]` |
| Link to Final Project | `[POR COMPLETAR: URL pública del juego]` |
| Repositorio | <https://github.com/Gelomiterizzio/Earth-s-Angel> |

Recomendación: el enlace de proyecto final es la **URL jugable**. El repositorio se cita en la descripción y en los créditos del juego. Son dos enlaces distintos y ninguno pide registro.

## 2. Texto del formulario · en inglés

### Project Name

```text
Earth's Angel
```

### High-Level Project Summary

```text
Earth's Angel is a free browser game where kids ages 7–12 run a Moon outpost and discover that
every decision in space has a cost. Players place solar panels, batteries, an ice extractor, a
water recycler, an oxygen generator, a greenhouse and a radiation shelter on a grid, then end
the day and see what happened and why. Power, water, oxygen, food and shielding all compete for
the same limited resources. The key moment is a solar storm driven by a real archived NASA
DONKI space weather record: shelter the crew and lose power and a day of work, or keep building
and take the radiation. There is no free choice. The game needs no download and no account,
plays in English and Spanish, and explains every result in one plain sentence.
```

### Detailed Project Description

```text
WHAT IT DOES
Earth's Angel is a turn-based 2D game. Each day the player checks three gauges (Power, Life
Support, Protection), reads the forecast, spends action points to build, explore or collect,
and ends the day. A report then explains cause and effect: "The greenhouse had no power, so the
harvest is one day late." The Moon mission is won by keeping the base stable for several days
in a row with life support running, food growing, reserves above a threshold and the crew
protected. Three difficulty levels change reserves, deadlines and the storm, not the rules.

HOW IT WORKS
- Power: solar panels generate, batteries store, modules are switched on in priority order.
- Water and oxygen: ice is mined for water, used water is partly recycled, and oxygen is made
  from water with electricity.
- Food: a greenhouse needs power, water and four days. Neglect it for a day and the harvest is
  later and smaller.
- Radiation: a forecast warns of a solar storm two days ahead. The shelter takes two days to
  build. On the storm day the player must decide.
- Communication delay is introduced with an in-game science card. [POR COMPLETAR: confirm it is
  in the build]

THE TRADE-OFF WE TEACH
On Medium difficulty, sheltering during the storm costs 6 power and the day's work, and the
mission is completed on day 9. Working through it keeps the day's actions but puts the crew
under medical observation at half efficiency, and the mission is completed on day 11. Same
storm, two choices, measurable results. [POR COMPLETAR: confirm these figures in the final build]

WHAT IS REAL AND WHAT IS NOT
The storm event (date, flare class, instrument, link) is a real NASA record. Radiation
exposure, resource amounts and thresholds are game units chosen for play, and the game says so.
The story of Project Last Hope is fiction. Every number in our design is labeled as NASA data,
teaching simplification, game balance or fiction.

BENEFITS AND GOALS
A child finishes a 15-minute session able to say: in space everything runs out, everything is
connected, and scientists warn about solar storms using real data from the Sun. The game runs
on a classroom laptop with no install. A built-in question before and after the mission lets a
teacher see whether the player's answer changed, without collecting any personal data.
[POR COMPLETAR: report results only if collected, with sample size]

TOOLS
TypeScript, Vite, Phaser 3 for the map, plain HTML and CSS for menus and HUD, the Web Audio
API, Vitest for tests, GitHub Pages for hosting. No backend, no accounts, no API keys.
[POR COMPLETAR: adjust to what was actually used]

WHAT COMES NEXT
Mars (dust storms, maintenance, logistics, communication delay) and a secret Earth epilogue are
designed and documented in the repository. They are not part of this build.
```

### Use of Super Intelligence (SI)

La guía de 2026 usa este nombre para las herramientas de IA. Texto de partida; **C lo completa con lo que realmente se usó**, tomándolo de [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md).

```text
Yes. The game concept, story, levels and mechanics were defined by the team.
AI tools were used to speed up execution:
- Claude Code (Anthropic, model claude-fable-5-2): drafting the planning and design documents
  from the team's own brief, and a throwaway script to check game-balance numbers.
- Cursor with Grok 4.7 assisted with the first UI, pixel art and Web Audio synthesis.
- OpenAI Codex (GPT-6) assisted with the pixel-art redraw, UI, cinematic playback,
  Web Audio scores and effects, and integration and browser checks.
PNG metadata, source comments and in-game credits record provenance. The local presentation
omits visual labels. The submitted images and demo video must carry visible watermarks where required.
Generated content avoids NASA logos, flags and mission identifiers.
[POR COMPLETAR: team review and public link to docs/IA-Y-CREDITOS.md]
```

### NASA Data

```text
Space Weather Database Of Notifications, Knowledge, Information (DONKI), NASA CCMC
https://ccmc.gsfc.nasa.gov/tools/DONKI/  (listed in this challenge's Resources)

We use archived Solar Energetic Particle (SEP) records and their linked solar flare records.
Main record: 2017-09-10T16:25:00-SEP-001 (GOES13: SEM/EPS >100 MeV), linked to flare
2017-09-10T15:35:00-FLR-001 (class X8.2, active region 12673).

How it is used: the record decides the storm in the mission. A record in the >100 MeV channel
becomes a "severe" storm in the game; a >10 MeV-only record becomes a "moderate" one. On the
storm day the decision screen shows the event date, flare class, instrument, the minutes
between the flare and the first particles, the record ID and a link to DONKI. The data is a
small curated extract bundled with the game and is labeled as archived, not live.
[POR COMPLETAR: list the other record IDs included in the final extract]
```

### Space Agency Partner Data and Other References

```text
NASA references used for teaching content (not live data):
- Environmental Control and Life Support Systems (ECLSS), NASA
  https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/
- [POR COMPLETAR: other NASA pages actually cited in science cards]

Space Agency Partner resources:
- [POR COMPLETAR: CSA "Food production on the moon and in remote areas", only if used]

Software and tools:
- Phaser 3.90.0 (MIT), Vite (MIT), TypeScript (Apache-2.0), Vitest (MIT)
- [POR COMPLETAR: fonts with license]
- [POR COMPLETAR: any third-party art or audio with author and license]

AI tools: see the "Use of SI" field.
```

## 3. Matriz del reto

`criterio del reto → mecánica y estado → fuente NASA → evidencia → escena de demostración`

| Criterio del reto | Mecánica | Estado | Fuente NASA | Evidencia | Escena de demostración |
| --- | --- | --- | --- | --- | --- |
| Soporte vital | Extractor, reciclador y generador; reservas y consumo por tripulante | Propuesto | ECLSS, apoyo conceptual | Pruebas U-AGU y recorridos | Día 3: se colocan generador e invernadero |
| Blindaje contra la radiación | Refugio con costo de energía y de trabajo; exposición acumulada | Propuesto | **DONKI** | Tabla de dos decisiones, prueba I-REC-MEDIA-B | **Día 8: tarjeta de decisión** |
| Presupuesto de energía | Paneles, baterías y prioridad de módulos | Propuesto | — | Prueba U-ENE-02 | Día 4: sombra, paneles al 25 % |
| Producción de alimentos | Invernadero con ciclo de cuatro días y estrés | Propuesto | Recurso de CSA, por integrar | Prueba I-REC-MEDIA-C | Día 7: primera cosecha |
| Retraso de comunicaciones | Tarjeta en la Luna; pronóstico más corto sin antena en Marte | Tarjeta: propuesto. Mecánica: P1 | Por verificar | Tarjeta `signalDelay` | Panel de ayuda |
| Decisiones con costo real | Ninguna opción es gratis | Propuesto | — | Tabla de compromisos de [PROYECTO.md](PROYECTO.md) | Día 8 |
| Público de 7 a 12 años | Tres medidores, tutorial por pasos, frases cortas | Propuesto | — | Tutorial y tarjetas | Día 1 |
| Sin descarga ni cuenta | Sitio estático | Propuesto | — | URL pública en ventana privada | Apertura de la demo |
| Datos reales atribuidos en la herramienta | Tarjeta de decisión y créditos | Propuesto | **DONKI** | Captura del panel | Día 8 |
| Rejugabilidad | Semilla: cambia el evento real mostrado | Propuesto | **DONKI** | Prueba U-EVE-03 | Resultado, con la semilla |

La columna Estado se actualiza con el estado real antes de enviar.

## 4. Comprobaciones

### Inscripción

- [ ] Los tres integrantes están registrados en la web de Space Apps.
- [ ] Los tres eligieron la sede **Santa Cruz de la Sierra** y no están en lista de espera.
- [ ] Los tres aparecen en la pestaña **Members** del equipo.
- [ ] El reto del equipo es *Space Mission Design Game* (comprobar en My Team).
- [ ] La pestaña **Project** es accesible.

### Atribuciones

- [ ] [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md) está al día.
- [ ] Cada recurso externo aparece en el campo de referencias.
- [ ] Cada fuente NASA aparece con su enlace.
- [ ] Imágenes y videos generados llevan marca de agua visible.
- [ ] Audio, código y datos generados están reconocidos en texto y metadatos.
- [ ] Nada generado usa marca de NASA.
- [ ] El repositorio tiene `LICENSE`.

### Envío

- [ ] Todo el texto del formulario está en inglés.
- [ ] El juego abre en inglés.
- [ ] Demo de 30 s o menos, o de 7 diapositivas o menos. Si el video se habla en español, lleva subtítulos en inglés.
- [ ] Los dos enlaces abren en ventana privada y en un teléfono.
- [ ] Ningún material muestra a menores ni datos personales.
- [ ] No queda ningún `[POR COMPLETAR]` en lo que se pega.
- [ ] Ninguna frase describe algo que el juego no hace.
- [ ] Casillas de términos y de trabajo original marcadas.
- [ ] **Submit for Judging** pulsado antes de las 11:30.
- [ ] Aviso de confirmación capturado.

## 5. Presentación

- Pitch para la defensa local: [presentacion/PITCH.md](presentacion/PITCH.md)
- Guion del video de 30 segundos: [presentacion/GUION-DEMO.md](presentacion/GUION-DEMO.md)
- Esquema de siete diapositivas: [presentacion/DIAPOSITIVAS.md](presentacion/DIAPOSITIVAS.md)

## 6. Resultados que se pueden contar

Solo lo que exista y se haya medido. Hoy no hay ninguno.

| Resultado | Estado |
| --- | --- |
| Pruebas automáticas que pasan | `[POR COMPLETAR: número y fecha]` |
| Navegadores probados | `[POR COMPLETAR]` |
| Comprobación de aprendizaje | `[POR COMPLETAR: recuentos y tamaño de muestra, o "no results collected"]` |
| Tamaño y tiempo de carga | `[POR COMPLETAR: solo si se midieron]` |

## 7. Registro del envío

| Dato | Valor |
| --- | --- |
| Hora de envío | `[POR COMPLETAR]` |
| Quién envió | `[POR COMPLETAR]` |
| Etiqueta de Git | `entrega-2026-11-15` |
| Confirmaciones de la sede | `[POR COMPLETAR: límite de las 12:00, formato de la defensa, reenvío]` |
