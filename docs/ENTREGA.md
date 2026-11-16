# Entrega

Borrador público en inglés, enlaces y comprobaciones de inscripción, atribuciones y envío. Es la **fuente canónica del texto de entrega**. Responsable: C. Tarea: [T-P0-C7](agentes/tareas/T-P0-C7-entrega.md).

> **Envío: domingo 15-nov antes de las 11:30**, hora de Bolivia. Requisitos verificados en [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md).

> **Estado el 14-nov-2026.** El formulario **no se ha enviado**. Los enlaces siguen en `[POR COMPLETAR]`. La interfaz se puede abrir en local; la partida jugable depende del núcleo de A y del mapa de B. No marques Submit for Judging hasta que la URL pública ejecute el recorrido y una persona grabe la demo.

> **Aviso sobre el borrador.** Este texto se escribió antes de programar el juego. Describe el alcance P0 previsto. **Antes de enviar, borra o corrige toda frase que describa algo que la versión publicada no haga.** No se envía nada que no sea cierto.

## 1. Enlaces

| Campo | Valor |
| --- | --- |
| Link to Project Demo | `[POR COMPLETAR: enlace público al video de 30 s o al PDF de 7 diapositivas]` |
| Link to Final Project | <https://earths-angel.vercel.app> |
| Repositorio | <https://github.com/Gelomiterizzio/Earth-s-Angel> |

Recomendación: el enlace de proyecto final es la **URL jugable**. El repositorio se cita en la descripción y en los créditos del juego. Son dos enlaces distintos y ninguno pide registro.

## 2. Texto del formulario · en inglés

Revisado el 15-nov-2026 para el reto *Space Mission Design Game*. Copiar cada bloque tal cual en el campo del mismo nombre de la pestaña **Project**.

### Project Name

```text
Earth's Angel
```

### High-Level Project Summary

```text
Earth's Angel is a free browser game where players design, launch and run a complete space
mission. On Earth they choose a mission objective, a launch vehicle, a trajectory and a payload
(supplies, science instruments, crew equipment, spacecraft module and antenna) within a budget
and the rocket's mass limit. Then they operate the mission on the Moon and on Mars: building
power, water, oxygen, food and radiation protection with limited resources and action points,
and facing a solar storm taken from a real NASA DONKI space weather record. At the end the game
compares the original design with what happened: objective met or not, cost, mass and payload.
It turns abstract engineering trade-offs into decisions with visible consequences, needs no
download or account, and plays in English and Spanish.
```

### Detailed Project Description

```text
WHO WE ARE AND WHY
We are team Los Bersercker from Santa Cruz de la Sierra, Bolivia. We chose this challenge because we believe kids learn best by playing, and because exploring space is also a way to learn how to take care of our own planet. Earth's Angel is made for kids aged 8 to 12, and it is fun for families, classrooms and anyone curious about space.

WHAT IT DOES
Earth's Angel covers a whole space mission, from concept to operation:
1. Design (on Earth): pick an objective (self-sufficient base, ice science or space weather watch), a rocket (light, medium or heavy: mass capacity vs. cost), a trajectory (cheap and slow vs. expensive and fast, with a launch window), and a payload of supplies, science instruments (orbital spectrometer, radiation sensor), crew equipment (tool kit, sampling drill, shielded suits), a spacecraft cabin module and an antenna. Budget and mass bars block the launch until the design is valid.
2. Launch and operation (Moon, then Mars): the astronaut explores the map on foot, builds solar panels, batteries, ice extractors, water recyclers, oxygen generators, greenhouses and radiation shelters, and ends each day. A daily report explains cause and effect and shows a chart of what was made and used.
3. Evaluation: the result screen shows the design next to the outcome (objective achieved or not, cost vs. budget, mass vs. capacity) plus learning badges.
Every design choice changes the mission: supplies arrive at landing, the spectrometer maps more ground, the sensor warns of storms earlier, the drill yields more minerals, the suits reduce radiation exposure, and the trajectory changes the time left on Earth's countdown. A Moon mission takes about 15 minutes, so it fits in one class.

HOW IT WORKS
- Power: solar panels generate (less in shadow or dust), batteries store, modules switch on by priority.
- Life support: ice is mined for water, used water is recycled, oxygen is made from water with electricity, and greenhouses grow food if they stay powered.
- Radiation: a forecast warns of a solar storm; on the storm day the player decides between sheltering the crew (costs power and a day of work) or keeping working (costs radiation exposure).
- Mars adds dust on the panels, sols, a larger crew and a communications link with Earth.
- Mission control warns when air, water or food are about to run out and says what to build.

REAL NASA DATA
The solar storm comes from a real archived NASA DONKI record (10 September 2017, linked to an X8.2 flare). The decision screen shows the record, flare class, instrument and a link to DONKI. Science cards cite NASA sources: ISS life support and water recovery, the Mars solar day, InSight and Curiosity. Costs, masses, resource amounts and thresholds are game balance values, and the game labels them so. The story is fiction.

WHAT PLAYERS TOLD US
Visitors at our Space Apps venue in Santa Cruz played it. They learned that oxygen runs out and has to be planned for, they loved the pixel art, and when they lost their base they wanted to try again with a better strategy. That replay is exactly how the game teaches: a failed design becomes a lesson for the next one.

BENEFITS AND IMPACT
Kids who rarely get to plan a full mission experience the trade-offs between budget, mass, power, life support, communications and timing, and see how each choice shapes success. It runs on any laptop or classroom computer with no install, no account and no data collection.

WHAT MAKES IT CREATIVE
The mission design is not a menu before the game: it carries through the whole mission and is judged at the end against what really happened. The player walks the Moon and Mars like an explorer instead of filling in a spreadsheet, a real NASA space weather record decides the key moment, and a presentation mode (key X) plays a full mission by itself while a defeat demo (key Z) shows what happens when life support is ignored.

FACTORS WE CONSIDERED
Accessibility (full keyboard play, reduced-motion option, colour plus text for every status), two languages (English and Spanish), honesty about data (every number is labeled as NASA data, simplification, game balance or fiction), replay value (an optional random map), and no images or voices of minors.

WHAT COMES NEXT
New missions to other worlds, more real NASA data inside the game, and more languages so more kids can play it.

TOOLS
TypeScript, Vite, HTML5 Canvas pixel art drawn by code, plain HTML and CSS for the interface, the Web Audio API for synthesized music, Vitest (229 automated tests) and Vercel for hosting. No backend, no accounts, no API keys.
```

### Use of Super Intelligence (SI)

Texto de partida tomado de [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md). **Revisadlo como equipo antes de enviar.** Los jueces no ven este campo, pero sí las marcas de IA dentro del proyecto.

```text
Yes. The game concept, story, levels and mechanics were defined by the team. SI tools were used
to speed up execution, never to come up with the solution:
- Claude Code (Anthropic): planning documents from the team's brief, mission design phase,
  map exploration, interface, tests, reviews and deployment.
- OpenAI Codex (GPT-6) and ChatGPT: pixel art drawn with code, cinematics, interface, Web Audio
  music and integration checks.
- Antigravity (Gemini): simulation core, balance and tests.
- Cursor (Grok 4.7): first interface, pixel art and audio synthesis.
All pixel art is drawn by code; source comments, PNG metadata, the in-game credits and the
repository file docs/IA-Y-CREDITOS.md record where SI was used. Images in the demo carry a
visible "SI-assisted" mark. Generated content uses no NASA logos, flags or mission identifiers.
```

### NASA Data

```text
Space Weather Database Of Notifications, Knowledge, Information (DONKI), NASA CCMC
https://ccmc.gsfc.nasa.gov/tools/DONKI/

We use archived Solar Energetic Particle (SEP) records and their linked solar flare records.
Main record: 2017-09-10T16:25:00-SEP-001, linked to flare 2017-09-10T15:35:00-FLR-001.
The record decides the solar storm in the Moon mission: its channel sets how severe the storm
is, and the decision screen shows the event date, flare class, instrument, the record ID and a
link to DONKI. The extract is bundled with the game and labeled as archived, not live data.

NASA pages cited in the in-game science cards ("In real life"):
- ECLSS, ISS life support: https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/
- ISS water recovery milestone: https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/
- Mars24, Mars solar day: https://www.giss.nasa.gov/tools/mars24/help/notes.html
- InSight waits out a dust storm: https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm/
- Solar storm doubles radiation on Mars: https://www.jpl.nasa.gov/news/large-solar-storm-sparks-global-aurora-and-doubles-radiation-levels-on-the-martian-surface/
```

### Space Agency Partner Data and Other References

```text
Software and tools: TypeScript (Apache-2.0), Vite (MIT), Vitest (MIT), Phaser 3 (MIT, listed
dependency), Vercel hosting.
Font: Pixelify Sans (SIL Open Font License), Google Fonts.
Art and audio: original, drawn and synthesized by code in the repository.
Source code: https://github.com/Gelomiterizzio/Earth-s-Angel
Full credits and SI log: docs/IA-Y-CREDITOS.md in the repository.
Space Agency Partner data: not used.
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
