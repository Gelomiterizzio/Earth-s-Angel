# Esquema de diapositivas

Esquema de **siete diapositivas como máximo**, contando título e introducción. Límite oficial: una octava deja al proyecto fuera de la evaluación global.

Dos usos:

- **Demo del formulario**, si no hay video: exportar a PDF, en inglés, con enlace público.
- **Apoyo para la defensa presencial** del domingo a las 14:00.

Requisitos de la guía: letra legible, pocas palabras, imágenes del proyecto, y que aparezcan **nombre del equipo, nombres de los integrantes y reto elegido**. Las diapositivas van en inglés y recorren el ciclo completo del reto *Space Mission Design Game*: **concepto → lanzamiento → operación → evaluación**.

## Diapositiva 1 · Título

| | |
| --- | --- |
| Título | **Earth's Angel** |
| Subtítulo | Design, launch, operate and evaluate a space mission where nothing is free |
| Texto | Team: [TEAM NAME] · [MEMBER A], [MEMBER B], [MEMBER C] · Santa Cruz de la Sierra, Bolivia |
| Texto | Challenge: Space Mission Design Game · NASA Space Apps Challenge 2026 |
| Imagen | Logotipo propio y captura de la portada / base lunar |

## Diapositiva 2 · El problema y el ciclo de misión

| | |
| --- | --- |
| Título | Space is taught as facts. Missions are built from trade-offs. |
| Cuatro fases | **1. Concept:** objective, launcher, orbital window, cabin, comms & payload · **2. Launch:** budget (M) & mass (t) constraints · **3. Operation:** turn-based Moon & Mars survival · **4. Evaluation:** did your design meet its goal? |
| Imagen | Diagrama o captura de la pantalla de diseño de misión (`Mission design`) con las barras de presupuesto y masa |

## Diapositiva 3 · Fase 1 y 2: Concepto y Lanzamiento

| | |
| --- | --- |
| Título | Concept & Launch: every tonne and credit counts |
| Tres elecciones | **Vehicle & Orbit:** Light (6 t), Medium (10 t) or Heavy (16 t) rocket, launch window (1–4 days) and transit (1–5 days) · **Spacecraft:** Cabin storage (+0/+6/+12) and high-gain antenna (+1 Moon forecast day, 3-sol forecast on arrival at Mars) · **Payload:** Supplies, orbital spectrometer, radiation sensor, drill and shielded suits |
| Imagen | Captura de la pantalla `Mission design` mostrando objetivo, cohete, restricción orbital, cabina, antena y carga útil |
| Pie | Game balance & didactic orbital fiction clearly separated from NASA data |

## Diapositiva 4 · Fase 3: Operación día a día y tormenta solar real

| | |
| --- | --- |
| Título | Operation: a real NASA solar storm, a real trade-off |
| Imagen | Captura del HUD (Power, Life Support, Protection) y de la tarjeta de decisión del día 8 (`2017-09-10T16:25:00-SEP-001`) |
| Dos columnas | **Shelter:** −6 power, no work today, +5 storm exposure · **Keep working:** +50 storm exposure (+35 with shielded suits) · Both choices add background exposure |
| Pie | Grounded in archived NASA CCMC DONKI records (X8.2 flare, active region 12673) |

## Diapositiva 5 · Fase 4: Evaluación y aprendizaje

| | |
| --- | --- |
| Título | Evaluation: compare your mission design against reality |
| Tres bloques | **Daily cause & effect:** balance chart and one-sentence explanation · **Mission design review:** objective achieved or missed, cabin, antenna, cost, mass and Earth days saved · **Demo modes:** press `X` for a victory (Moon → Mars) or `Z` to see how a flawed design fails |
| Imagen | Captura de la pantalla de resultados con el bloque `Your mission design` y las insignias de aprendizaje |
| Pie | Browser · no download · no account · English and Spanish |

## Diapositiva 6 · Cómo está hecho

| | |
| --- | --- |
| Título | Deterministic, testable, accessible |
| Texto | TypeScript · Vite · HTML5 Canvas & CSS · no backend |
| Texto | Pure integer simulation: same seed and design, same mission. 210+ automated tests across 4 mission archetypes |
| Texto | Walkable RPG exploration (`WASD`/`E`/`Q`/`M`/`R`) · keyboard-only play · status shown with icon and text · subtitles · reduced motion |
| Texto | AI use disclosed: [TOOLS]. Generated assets carry provenance and watermarks |

`[TOOLS]` se rellena con los datos reales de [IA-Y-CREDITOS.md](../IA-Y-CREDITOS.md).

## Diapositiva 7 · De la Luna a Marte y de vuelta a casa

| | |
| --- | --- |
| Título | Next stop: Mars. Final stop: Earth. |
| Texto | Half your Moon reserves transfer to Mars: 6 crew members, dust storms, equipment breakdowns and deep-space comms · A secret epilogue applies closed-loop thinking to restore Earth |
| Frase final | "The future begins by learning to care for our home. We still have time to protect Earth." |
| Enlaces | Play: [URL] · Code: github.com/Gelomiterizzio/Earth-s-Angel |

## Reglas de diseño

- Fondo oscuro del juego, texto claro. Contraste de 4,5:1 o más.
- Tamaño de letra mínimo de 24 puntos.
- Una captura real por diapositiva de la 2 a la 6.
- **Sin logotipos de NASA.** Uso del logotipo de Space Apps: por verificar en la guía de marca; mientras tanto, no se usa.
- Sin fotos de menores ni de público.
- Las imágenes generadas con IA llevan marca de agua.

## Antes de exportar

- [ ] Siete diapositivas o menos.
- [ ] Todo en inglés.
- [ ] Nombre del equipo, integrantes y reto en la primera.
- [ ] Cifras y capturas de la versión publicada.
- [ ] PDF con enlace público probado en ventana privada.
