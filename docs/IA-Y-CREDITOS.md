# IA y créditos

Registro de modelos, herramientas, usos, revisión humana, datos, código y activos, con autores, licencias y créditos. Es la **fuente canónica de los créditos**. C lo integra; **cada persona escribe solo en su sección** para evitar conflictos.

Reglas del evento que este registro cumple: [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md), bloque de IA, datos y derechos.

## 1. Reglas de registro

1. Todo uso de IA se anota: herramienta, modelo efectivamente usado, para qué, sobre qué archivos y quién lo revisó.
2. Todo recurso de terceros se anota: autor, origen, licencia y dónde se usa.
3. Toda fuente de datos o de contenido científico se anota con su enlace.
4. Lo que no esté aquí no se fusiona.
5. Lo que figure aquí debe coincidir con los campos "Use of SI", "NASA Data" y de referencias del formulario.

## 2. Equipo

| Rol | Nombre | Qué aportó |
| --- | --- | --- |
| A · Simulación y arquitectura | `[POR COMPLETAR]` | `[POR COMPLETAR]` |
| B · Jugabilidad y ciencia | `[POR COMPLETAR]` | `[POR COMPLETAR]` |
| C · Interfaz, arte y entrega | `[POR COMPLETAR]` | `[POR COMPLETAR]` |

Nombre del equipo: `[POR COMPLETAR]`.

**Autoría de la idea.** El concepto del juego, la historia, los niveles, las mecánicas y el título son del equipo. La tabla que separa esas decisiones de las propuestas hechas por la IA al documentar está en [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md#4-decisiones-creativas). El equipo debe revisarla: `[POR COMPLETAR: revisada por, fecha]`.

## 3. Uso de IA en la planificación

| Fecha | Herramienta y modelo | Uso | Resultado | Revisión humana |
| --- | --- | --- | --- | --- |
| 14-nov-2026 | Claude Code, aplicación de escritorio. Modelo `claude-fable-5-2` | Redactar la documentación de planificación y diseño a partir del prompt maestro del equipo | Todos los Markdown de `docs/`, `README.md`, `CLAUDE.md` y los tres `INTEGRANTE_*.md` | `[POR COMPLETAR: quién y cuándo]` |
| 14-nov-2026 | El mismo | Leer y resumir fuentes oficiales: páginas de Space Apps, discusiones del repositorio oficial, DONKI y páginas de NASA | Tablas de [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md) y [CIENCIA-Y-DATOS.md](CIENCIA-Y-DATOS.md) | `[POR COMPLETAR]`. Conviene volver a abrir cada enlace marcado como confirmado |
| 14-nov-2026 | El mismo | Escribir y ejecutar un modelo de referencia en Python para comprobar los valores de balance de la Luna. Es desechable y **no está en el repositorio** | Tablas de recorridos de [niveles/luna.md](niveles/luna.md) y vectores de [PRUEBAS.md](PRUEBAS.md) | `[POR COMPLETAR]`. El núcleo real debe reproducirlos |
| `[POR COMPLETAR]` | `[POR COMPLETAR: herramienta con la que se redactó MOONBASE_MASTER_PROMPT.md, si se usó alguna]` | Redacción del prompt maestro | `MOONBASE_MASTER_PROMPT.md` | `[POR COMPLETAR]` |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Redactar el encargo de mecánicas del RPG y su traspaso a diseño | [Ficha T-RPG-A1](agentes/tareas/T-RPG-A1-mecanicas-de-campana.md) | Pendiente |

Fechas de los archivos: el prompt maestro tiene fecha de modificación 14-nov-2026 11:20. La documentación se generó el 14-nov-2026 entre las 11:30 y las 13:00, hora de Bolivia, según el reloj del equipo de trabajo. `[POR COMPLETAR: el equipo anota cuándo empezó a redactar el prompt maestro.]`

## 4. Uso de IA en el desarrollo

Cada archivo de código asistido por IA lleva en su primera línea un comentario como:

```ts
// AI-assisted: Claude Code (claude-fable-5-2), reviewed by A
```

### Sección de A · núcleo y aplicación

| Fecha | Herramienta y modelo | Tarea | Archivos | Revisado y probado por |
| --- | --- | --- | --- | --- |
| 14-nov-2026 | Antigravity (Gemini) | T-P0-A1 a A6 y T-P0-X1. Andamiaje, contratos, almacén, simulación lunar, flujo de escenas, opciones, persistencia y pruebas | Configuración de la raíz, `src/main.ts`, `src/core/**`, `src/app/**`, `src/data/i18n/*/sim.json`, `tests/core/**` y `tests/smoke.test.ts` | El paquete original registra revisión de A y 129 pruebas en verde |
| 14-nov-2026 | Antigravity (Gemini) | T-RPG-A1 (Hito 1). Movimiento del astronauta y colisiones en la Luna, interacción contextual con `E` y previsualización de costos/bloqueos, decisión Día 1 (energía vs. materiales) en el informe diario, diario de misión con `M` y pruebas de recorrido y persistencia | `src/map/walk.ts`, `src/map/map-input.ts`, `src/map/index.ts`, `src/map/map.css`, `src/app/input.ts`, `src/ui/hud/mission-hud.ts`, `src/ui/panels/{day-report,learning-check,tutorial}.ts`, `src/data/i18n/*/{content,ui}.json` y `tests/core/rpg-hito1.test.ts` | Revisión de Codex y del equipo pendiente (165 pruebas en verde y `npm run build` limpio) |
| 15-nov-2026 | Antigravity (Gemini) | Diseño de misión completo y equilibrio: módulo de cabina de la nave (almacén extra en Luna y Marte), antena de comunicaciones (pronóstico lunar y activación temprana en Marte), restricción orbital visible (ventana de lanzamiento y días de viaje como ficción didáctica), ajuste de balance (`espectrometro`, `exotraje`, `hielo`), pruebas de 4 arquetipos en Media y actualización de guion y diapositivas | `src/core/design.ts`, `src/core/day-cycle.ts`, `src/core/progression.ts`, `src/data/balance/mission-design.json`, `src/ui/screens/design.ts`, `src/styles/screens.css`, `src/data/i18n/*/ui.json`, `tests/core/design.test.ts`, `docs/componentes/diseno-de-mision.md`, `docs/presentacion/{DIAPOSITIVAS,GUION-DEMO}.md` | Revisión humana del equipo pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Unificar el cálculo de días ahorrados al lanzar y reintentar. Verificar guardados nuevos y anteriores y que el diseño completo se restaure al reintentar | `src/core/design.ts`, `tests/core/design.test.ts` | Revisión humana de A pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Hacer explícitas las selecciones de cabina y antena en X y Z | `src/app/presentation.ts` | Revisión humana de A pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Mantener abierto el paso hacia el extractor que se repara en el sol 16 de la presentación X y ampliar la prueba de recorrido | `src/app/presentation-script.ts`, `tests/core/presentation-walk.test.ts` | Revisión humana de A pendiente |

### Sección de B · datos, mapa y ciencia

| Fecha | Herramienta y modelo | Tarea | Archivos | Revisado y probado por |
| --- | --- | --- | --- | --- |
| 14-nov-2026 | Cursor Agent (Composer) | T-P0-B1 a B6. Datos de balance y contenido, extracto DONKI, adaptador, mapa HTML, decisión solar, tarjetas y tutorial | `src/data/balance/**`, `src/data/content/**`, `src/data/nasa/**`, `src/data/i18n/*/content.json`, `src/map/**`, `src/ui/panels/decision.ts` y `tests/data/**` | Revisión humana de B pendiente según el paquete original |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Prototipo de salida lunar con astronauta dibujado en Canvas, movimiento, cámara e interacciones; ajuste del espacio del HUD | `src/map/**`, `src/data/i18n/*/content.json`, `src/styles/hud.css` | Revisión del equipo pendiente |

### Sección de C · interfaz, arte y audio

| Fecha | Herramienta y modelo | Tarea | Archivos | Revisado y probado por |
| --- | --- | --- | --- | --- |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Integrar cabina y antena en el aviso lunar, el diario, el pronóstico y el resultado. Mostrar valores del catálogo de balance y distinguir el margen de la meta de los días de consumo | `src/ui/design-copy.ts`, pantallas de diseño y resultado, HUD, paneles de carga, catálogos y `tests/core/visible-journal.test.ts` | Revisión humana de C pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Sincronizar la estimación de exposición de la decisión solar con los trajes y la disponibilidad del refugio que usa el núcleo | `src/ui/panels/decision.ts` | Revisión humana de C pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Validar claves y marcadores de los catálogos bilingües y retirar la tabla de atajos sin consumidores que apuntaba a claves retiradas | `tests/core/i18n.test.ts`, `src/app/input.ts` | Revisión humana de C pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Contrastar la documentación del diseño y el material de defensa con la compilación integrada | `AGENTS.md`, `docs/componentes/diseno-de-mision.md`, `docs/presentacion/{DIAPOSITIVAS,GUION-DEMO}.md` | Revisión humana de C pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Aviso de carga y objetivo al aterrizar en la Luna, coordinado con los diálogos de misión y las presentaciones X y Z | `src/ui/panels/onboard-arrival.ts`, `src/ui/hud/mission-hud.ts`, `src/app/presentation.ts` y catálogos de interfaz | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Equipo a bordo y progreso del objetivo de diseño en el diario de misión bilingüe | `src/ui/panels/onboard-journal.ts`, `src/map/walk.ts`, `src/map/map.css`, catálogos de contenido y `tests/core/visible-journal.test.ts` | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Avisos del taladro, las herramientas, el sensor y los trajes, y días ahorrados por la trayectoria en el resultado lunar | `src/map/{map-input,walk}.ts`, HUD, informe diario, resumen de diseño, estilos, catálogos de interfaz y `tests/core/visible-effects.test.ts` | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Llegada a Marte animada en Canvas con los sprites del juego. Encargo: los cuatro tripulantes originales aterrizan y dos refuerzos bajan de otra nave y se presentan con «Venimos a ayudarles» | `src/ui/cinematics/mars-arrival-art.ts`, reproductor, guion, catálogos y prueba de navegador | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Propuesta y posterior integración del final marciano, con celebración de los seis tripulantes y comunicación con la Tierra. Composición y animación en Canvas con trajes y nave del juego | Vistas previas locales, `src/ui/cinematics/mars-victory-art.ts`, guion, estilos y catálogos de interfaz | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Integración de la apertura aprobada con el guion existente, los nombres revisados, un lienzo de mayor resolución y subtítulos como texto legible del navegador | `src/ui/cinematics/animated-cinematic.ts`, `src/ui/cinematics/intro-art.ts`, `src/ui/screens/cinematic.ts`, estilos y catálogos de interfaz | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Propuestas independientes de apertura animada en Canvas. La segunda conserva las seis escenas y sus tiempos, con los nombres del proyecto y de la nave revisados por el usuario. Ambas reutilizan la nave, la Tierra, el logotipo y los trajes del juego | Vistas previas locales en HTML y GIF. La revisión conserva la atribución en sus metadatos | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Parche circular en pixel art con las letras NASA, órbita y estela roja, elaborado en Canvas a partir de la referencia visual aportada. Acompaña el crédito como participante | `src/ui/components/space-apps.ts` y `src/styles/screens.css` | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Ampliación de Luna y Marte, migración de guardados, encuadre de la cámara, animación del manifiesto y crédito textual como participante de Space Apps | `src/data/content/levels/`, `src/app/persistence.ts`, `src/map/`, `src/ui/`, `src/styles/screens.css` y pruebas | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Integración del MP3 ambiental aportado por el usuario en el servidor local, con reproducción continua y controles de volumen | `src/audio/audio-manager.ts` | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Celebración lunar, repaso con dos astronautas y embarque rumbo a Marte. Animación por código con los sprites existentes. Integración visual y controles del RPG marciano | `src/ui/{screens,panels,cinematics,hud}/`, `src/styles/`, `src/map/`, `src/app/input.ts` y catálogos `ui.json` | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Preguntas opcionales y burbujas de explicación con los sprites de astronautas existentes. Contenido contrastado con las referencias de NASA sobre [energía](https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/), [soporte vital](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) y [radiación](https://srag.jsc.nasa.gov/spaceradiation/how/how.cfm) | `src/ui/panels/{science-card,tutorial}.ts`, `src/styles/screens.css` y catálogos `ui.json` | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Panel de reservas con R, nombres al pasar el ratón y aviso en la guía inicial. Reutiliza los iconos del HUD | `src/ui/hud/mission-hud.ts`, `src/styles/hud.css`, `src/ui/shortcuts.ts`, tutorial y catálogos de traducción | Revisión humana pendiente |
| 15-nov-2026 | OpenAI Codex, GPT-6 | Guion del usuario: el astronauta encuentra dos ojos en la oscuridad, acepta salvar la Tierra a cambio de convertirse en gallina y vuelve al día del lanzamiento. OpenAI Codex adaptó los diálogos, dibujó la escena en arte de píxeles, compuso la partitura y conectó la secuencia con el mapa lunar | `src/ui/cinematics/lunar-secret{,-art,-score}.ts`, `src/map/walk.ts` y catálogos bilingües de interfaz. La compilación local conserva la procedencia en el código y este registro | Revisión humana pendiente |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Acciones lunares exclusivas por cargo en Q, E y selección directa del mapa | `src/map/{walk,index}.ts`, `src/data/i18n/*/content.json` y pruebas del RPG lunar | Revisión humana pendiente |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Ajustar el foco de apertura del informe diario para empezar en su encabezado | `src/ui/panels/day-report.ts` | Revisión humana pendiente |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Hacer legibles los números del informe y sincronizar el día visible en el HUD mientras se lee | `src/styles/screens.css` y `src/ui/hud/mission-hud.ts` | Revisión humana pendiente |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Las casillas de misterio («?») ya no se dibujan en la Luna ni en Marte: el mapa muestra suelo normal y la ruta secreta a la Tierra sigue funcionando | `src/map/index.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Revisión del secreto lunar: el lienzo auxiliar ya no depende de `ownerDocument` (la prueba del secreto vuelve a pasar) | `src/ui/cinematics/lunar-secret-art.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | EARTH'S ANGEL 2: fase de diseño de misión (objetivo, lanzador, trayectoria, presupuesto, masa, carga, instrumentos y equipo de la tripulación), resumen del diseño en el resultado y presentaciones X/Z que pasan por esa pantalla | `src/core/design.ts`, `src/data/balance/mission-design.json`, `src/ui/screens/design.ts`, `src/ui/screens/design-summary.ts`, `src/app/flow.ts`, `src/app/presentation*.ts`, núcleo (`actions`, `day-cycle`, `radiation`, `progression`, `types`), catálogos, pruebas | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Revisión: el subtítulo de las presentaciones baja al pie en resultados y créditos para no tapar sus títulos | `src/app/presentation.ts`, `src/styles/presentation.css` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Créditos y Opciones abren arriba: el foco va al botón final sin desplazar la pantalla | `src/ui/screens/credits.ts`, `src/ui/screens/options.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Pantalla de resultados: siempre abre arriba (espaciadores flexibles en lugar de `safe center` y desplazamiento a 0 al pintar) | `src/styles/screens.css`, `src/ui/screens/result.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Nave de apoyo pequeña en el mapa de Marte (pixel art en Canvas a partir del módulo de aterrizaje, en la roca (9,10), solo visual) con su descripción «Delante»; subtítulo del aterrizaje con la segunda nave en la presentación X | `src/map/art.ts`, `src/map/index.ts`, `src/map/walk.ts`, `src/app/presentation.ts`, catálogos, `tests/core/support-ship.test.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Presentación X: el astronauta llega a pie a cada objetivo (vecino diagonal incluido); base de Marte del guion reordenada con un pasillo libre y minerales alcanzables; limpieza en el panel accesible; prueba de alcance a pie de los guiones X y Z | `src/app/presentation.ts`, `src/app/presentation-script.ts`, `tests/core/presentation-walk.test.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | La capa de tormenta de polvo de Marte ya no desliza bandas por la pantalla (parecía que el mapa se movía solo); solo cambia su opacidad | `src/map/map.css` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | La presentación X pulsa «Continuar» en el manifiesto y muestra la animación de embarque y despegue hacia Marte, con subtítulos sincronizados | `src/app/presentation.ts`, catálogos `ui.json` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Control de velocidad con la rueda del ratón en las presentaciones X y Z (0,25× a 4×, siempre empieza a 1×) | `src/app/presentation.ts`, `src/styles/presentation.css`, catálogos `ui.json` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Modo presentación X con el astronauta caminando, girando y actuando como un jugador; demo de derrota con la tecla Z que termina en la secuencia de fin de partida | `src/app/presentation.ts`, `src/app/presentation-script.ts`, `src/main.ts`, `src/ui/shortcuts.ts`, `src/styles/presentation.css`, catálogos `ui.json`, `tests/core/presentation.test.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Modo presentación con la tecla X (guion Luna → Marte con subtítulos EN/ES; restaura guardado y opciones), chispas de obra y destello al terminar un edificio, gráfico de balance en el informe del día, insignias de aprendizaje en el resultado, recuadros «En la vida real» con datos NASA comprobados | `src/app/presentation.ts`, `src/app/presentation-script.ts`, `src/styles/presentation.css`, `src/main.ts`, `src/app/input.ts`, `src/map/ambience.ts`, `src/ui/panels/day-report.ts`, `src/ui/screens/badges.ts`, `src/ui/screens/result.ts`, `src/ui/panels/science-card.ts`, `src/data/content/cards.json`, `src/styles/screens.css`, catálogos, pruebas `presentation`, `badges` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Aviso de soporte vital sobre el astronauta y consejo de «Control de misión»; efectos pixel en Canvas (polvo al caminar, destellos en paneles y hielo, remolinos y viento de polvo en Marte); «soles de margen» en el HUD de Marte | `src/map/advisor.ts`, `src/map/ambience.ts`, `src/map/walk.ts`, `src/map/index.ts`, `src/map/map.css`, `src/ui/hud/mission-hud.ts`, catálogos `content.json` y `ui.json`, `tests/core/advisor.test.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Revisión general: ligaduras desactivadas (la fuente pixel mostraba «conArm» por «confirm»), consejos de derrota válidos en Luna y Marte, preguntas rápidas sin repetirse al cargar y reiniciadas por partida | `src/styles/base.css`, catálogos `sim.json`, `src/ui/panels/day-quiz.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Preguntas rápidas tras el informe del día según lo vivido (energía, agua, oxígeno, tormenta), una por día y una vez por partida, respetando la opción «Pregunta de aprendizaje» | `src/ui/panels/day-quiz.ts`, `src/ui/hud/mission-hud.ts`, `tests/core/day-quiz.test.ts` | `[POR COMPLETAR: revisión humana]` |
| 15-nov-2026 | Claude Code (`claude-opus-5-5`) | Escena de la tripulación en el refugio (pixel art dibujado en Canvas con los sprites del juego) y borrado del mensaje a pie al cambiar de día | `src/ui/panels/shelter-scene.ts`, `src/ui/hud/mission-hud.ts`, `src/map/walk.ts`, `src/styles/screens.css`, catálogos `ui.json` | `[POR COMPLETAR: revisión humana]` |
| 14-nov-2026 | Claude Code (`claude-opus-5-5`) | Línea «Delante» con la información de lo que mira el astronauta; construir sobre minerales ya recogidos | `src/core/terrain.ts`, `src/core/actions.ts`, `src/core/validate.ts`, `src/map/walk.ts`, `src/map/map.css`, catálogos `content.json`, pruebas | `[POR COMPLETAR: revisión humana]` |
| 14-nov-2026 | Claude Code (`claude-opus-5-5`) | Mapa lunar de 51 × 51 con la nave centrada, migración de guardados, terreno sin explorar visible, aviso al chocar y actividades variadas de la tripulación en la portada | `src/data/content/levels/luna.json`, `src/app/persistence.ts`, `src/map/index.ts`, `src/map/walk.ts`, `src/map/map.css`, `src/ui/screens/title-crew.ts`, `src/ui/screens/title.ts`, `src/styles/screens.css`, catálogos `content.json`, pruebas | `[POR COMPLETAR: revisión humana]` |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Revisión de T-RPG-A1. Diario modal, barra de interacción, cantidad real recolectada y correcciones del informe diario | `src/map/{walk,map-input,index}.ts`, `src/map/map.css`, `src/data/i18n/*/content.json`, `src/ui/panels/day-report.ts` y `tests/core/rpg-hito1.test.ts` | Verificación del recorrido en Edge por Codex. Revisión del equipo pendiente |
| 14-nov-2026 | Cursor, Grok 4.7 | Tareas C de P0, y las pantallas, guiones y activos de C en P1 y P2 que no cambian contratos | `src/ui/**`, `src/styles/**`, `src/audio/**`, `src/data/i18n/*/ui.json`, `public/assets/**`, `tests/ui/**` | Pendiente de revisión humana del equipo. Recorrido local del título, la dificultad, la apertura y el HUD con un arnés de previsualización, no con el núcleo real |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Redibujo 2D, interfaz, integración P0, terreno y efectos de mapa, reproducción de cinemáticas y música sintetizada | `public/assets/**`, `tools/{gen-pixels,sprite-art,gen-cinematic-art,write-scripts}.mjs`, `src/ui/**`, `src/styles/**`, `src/data/i18n/*/ui.json`, `tests/ui/**`, `src/map/**`, `src/audio/**` y Markdown de esta revisión | Comprobación técnica en Chrome. Revisión humana de la entrega pendiente |

## 5. Activos generados con IA

Se agrupan los archivos que comparten una instrucción de producción y un exportador. El manifiesto da el nombre, tamaño y uso de cada activo. El proyecto incluye licencia MIT. Los PNG y el código de audio conservan su procedencia.

| Activo | Ruta | Herramienta y modelo | Prompt | Fecha | Retoques a mano | Marca de agua | Revisado por |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Cajas de suministros y antena pequeña del sensor | `src/map/art.ts`, `src/map/index.ts`, `tests/core/visible-cargo.test.ts` | OpenAI Codex, GPT-6. Pixel art estático dibujado por código en Canvas | Dibujar cajas y antena junto al módulo lunar cuando se elijan suministros y sensor. Usar rocas existentes para conservar las rutas y las reglas de construcción. | 15-nov-2026 | — | Procedencia en código y créditos | Revisión humana pendiente |
| Cinemática de derrota espacial | `src/ui/cinematics/defeat.ts` y `src/ui/cinematics/defeat.css` | OpenAI Codex, GPT-6. Animación en Canvas con el globo y los sprites de la tripulación del juego | Usar las imágenes aportadas como referencia visual. Mostrar la Tierra agrietándose y estallando, los cuatro astronautas a la deriva y el mensaje GAME OVER | 15-nov-2026 | — | Procedencia en código y créditos. Muestra de verificación marcada | Revisión humana pendiente |
| Tripulación animada de la portada | `src/ui/screens/title.ts`, `src/ui/screens/title-crew.ts` y `src/styles/screens.css` | OpenAI Codex, GPT-6, y Claude Code. Reutilización de sprites originales en Canvas y animación CSS | Mostrar a la comandante caminando, a la ingeniera y al botánico trabajando y a la médica flotando. Separar las zonas de los astronautas y moverlos con el encuadre lunar. | 14-nov-2026 | — | Procedencia en código y créditos | Revisión humana pendiente |
| Módulo de aterrizaje lunar y portada animada | `src/map/art.ts` y `src/styles/screens.css` | OpenAI Codex, GPT-6. Dibujo original por código en Canvas y animación CSS del fondo existente | Dibujar una nave lunar con cabina, luces, escalera y antena. Dar movimiento al fondo pixel art de la portada. | 14-nov-2026 | — | Procedencia en código y créditos | Revisión humana pendiente |
| Astronauta lunar y animación a pie | `src/map/astronaut-art.ts`, integrado en `src/map/walk.ts` y `src/map/map.css` | OpenAI Codex, GPT-6. Dibujo original por código en Canvas | Diseñar trajes con visor, animar el paso en cuatro direcciones y diferenciar los roles con gorra de mando, casco con lámpara y llave en la mochila, sombrero de ala ancha con muestras y botiquín. Las imágenes del usuario sirvieron de referencia visual. | 14-nov-2026 | — | Procedencia en código y créditos. Marca visible en la muestra animada | Revisión humana pendiente |
| Atlas de terreno, edificios, retratos, objetos, efectos e iconos; guía Ángel | `public/assets/sprites/*.png`, `public/assets/ui/icons-*.png` y `public/assets/ui/angel.png` | OpenAI Codex, GPT-6. Dibujo por código y exportación en Node.js con `tools/gen-pixels.mjs` y `tools/sprite-art.mjs` | «Prioriza tamaños y alineación a la escala del tablero, siluetas distintas, contraste con Luna y Marte y continuidad entre fotogramas. Conserva el orden de los atlas y la dirección de arte del equipo.» | 14-nov-2026 | — | Comentario PNG. La compilación local omite rótulos en los visuales | Revisión humana pendiente |
| 23 viñetas, cinco paisajes de Tierra, fondo lunar, logotipo y Tierra independiente | `public/assets/cinematics/*.png` y `public/assets/ui/{logo,menu-bg,earth}.png` | OpenAI Codex, GPT-6. Composiciones de píxel dibujadas por código y exportadas con `tools/gen-cinematic-art.mjs` | «Redibuja viñetas, fondo, logotipo y Tierra según docs/GUION-CINEMATICAS.md y docs/ARTE-Y-ACTIVOS.md. Pixel art propio de ciencia ficción; conserva rutas y tamaños; reutiliza nave, Tierra y tripulación; sin insignias ni rostros; incluye marca AI-generated visible y metadatos.» | 14-nov-2026 | — | Comentario PNG. La compilación local omite rótulos en los visuales | Revisión humana pendiente |
| Audio sintetizado de menú, Luna, cinemática, Marte, Tierra, victoria, derrota y efectos de P0 | `src/audio/synth.ts`. No hay archivos OGG | Cursor, Grok 4.7 y OpenAI Codex, GPT-6. Síntesis original por código con Web Audio | «Añade música propia de título, cinematografías, Luna, Marte, Tierra y resultados. Refuerza acciones y transiciones con efectos breves.» | 14-nov-2026 | No | No aplica a audio. Reconocido en este registro y en los créditos del juego | Pendiente |

El equipo organizador describe la identificación de imágenes, audio, código y datos en su [respuesta sobre el uso de IA](https://github.com/nasa/spaceapps/discussions/1849). En esta revisión se usó dibujo por código, sin material gráfico de terceros. El equipo debe aplicar la identificación visible al material de Space Apps antes del envío.

Cómo se identifica cada tipo de contenido generado: [componentes/proceso-de-activos.md](componentes/proceso-de-activos.md).

## 6. Datos

| Fuente | Qué se usa | Identificadores | Fecha de consulta | Términos y crédito | Dónde aparece |
| --- | --- | --- | --- | --- | --- |
| NASA CCMC DONKI · <https://ccmc.gsfc.nasa.gov/tools/DONKI/> | Cinco registros archivados de eventos de partículas solares y sus fulguraciones | `2017-09-10T16:25:00-SEP-001` (FLR X8.2) · `2021-10-28T16:35:00-SEP-001` · `2024-05-11T02:10:00-SEP-001` · `2024-05-13T14:00:00-SEP-001` · `2024-05-10T13:35:00-SEP-001` | 14-nov-2026 | Datos «tal cual», información experimental de investigación. Texto de reconocimiento en el campo `ccmcAcknowledgement` del extracto. | `src/data/nasa/donki-sep.json`, tarjeta de decisión y créditos |

Procedencia completa de cada cifra: [CIENCIA-Y-DATOS.md](CIENCIA-Y-DATOS.md).

## 7. Fuentes de contenido científico

Páginas consultadas para tarjetas y modelo. No son datos empaquetados.

| Fuente | Enlace | Uso | Estado |
| --- | --- | --- | --- |
| ECLSS, NASA | <https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/> | Tarjetas de agua y de oxígeno | Leída el 14-nov-2026 |
| InSight y la tormenta de polvo, NASA/JPL | <https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm/> | Factor de polvo en Marte (P1) | Leída |
| Mars24, NASA GISS | <https://www.giss.nasa.gov/tools/mars24/help/notes.html> | Tarjeta del sol marciano (P1) | Leída |
| Tormenta solar de 2017 en Marte, NASA/JPL | <https://www.jpl.nasa.gov/news/large-solar-storm-sparks-global-aurora-and-doubles-radiation-levels-on-the-martian-surface/> | Tarjeta de Marte (P1) | Leída |
| Enunciado, recursos y guías de Space Apps 2026 | Enlaces en [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md) | Requisitos | Leídos |

## 8. Código y herramientas de terceros

Versiones fijadas en `package-lock.json`.

| Componente | Versión | Licencia | Uso | Estado |
| --- | --- | --- | --- | --- |
| Phaser | 3.90.0 | MIT | Dependencia del andamiaje. El tablero P0 usa HTML. | Disponible |
| Vite | 8.3.8 | MIT | Desarrollo y compilación | En uso |
| TypeScript | 5.9.3 | Apache-2.0 | Lenguaje | En uso |
| Vitest | 5.1.0 | MIT | Pruebas | En uso |
| FNV-1a y `mulberry32` | — | Según el registro de A, dominio público | Azar con semilla en `src/core/rng.ts` | Implementado y probado |
| GitHub Pages y GitHub Actions | — | Servicio | Flujo en `.github/workflows/deploy.yml` | Configuración incluida, publicación pendiente |

## 9. Tipografías, arte y audio de terceros

| Activo | Autor | Origen | Licencia | Uso | Estado |
| --- | --- | --- | --- | --- | --- |
| Pixelify Sans | Google Fonts, diseñada por Daniel Calderón | <https://fonts.google.com/specimen/Pixelify+Sans> | SIL Open Font License 1.1. El archivo `public/assets/fonts/LICENSE.txt` es el texto de la licencia. Comprobado el 14-nov-2026: incluye ñ, tildes, ¿ y ¡ | Títulos | Incluida |
| Música Ambiente Interstellar · Ambiente Estrellado | Mundo Ambiente (publicación), Hans Zimmer (composición según la descripción) | MP3 aportado por el usuario. [Publicación con el mismo título](https://www.youtube.com/watch?v=Gx1yaSHwx2Q) | Redistribución sin verificar | Música de fondo en el entorno de desarrollo local | Copia local excluida del repositorio y de la compilación |

Regla: solo material propio, generado y revisado, o de terceros de libre disposición sin restricciones o con licencia OSI.

## 10. Licencia del proyecto

La licencia del proyecto está en [LICENSE](../LICENSE). Pixelify Sans conserva su licencia OFL.

Los términos de Space Apps indican que, si no se especifica una licencia compatible con OSI, NASA distribuye el contenido original bajo Apache 2.0.

## 11. Texto de créditos del juego · en inglés

Borrador para `src/ui/credits-data.ts`. Se completa con este registro.

```text
EARTH'S ANGEL
A project for the 2026 NASA International Space Apps Challenge
Challenge: Build a Junior Astronaut Mission Trainer
Local event: Santa Cruz de la Sierra, Bolivia

TEAM
[POR COMPLETAR]

NASA DATA
Space weather event records: NASA CCMC DONKI. Archived data, not a live feed.
https://ccmc.gsfc.nasa.gov/tools/DONKI/

SCIENCE REFERENCES
[POR COMPLETAR: pages cited in the science cards]

BUILT WITH
Phaser 3 (MIT) · Vite (MIT) · TypeScript (Apache-2.0) · Vitest (MIT)

USE OF AI
Claude Code assisted with planning. Antigravity and Cursor assisted with the simulation,
data, interface and early audio and art. OpenAI Codex assisted with the visual redraw,
integration and scoring. The project documentation records how each tool was used.

Radiation exposure, resource amounts and thresholds in this game are game units,
not real measurements. The story of Project Last Hope is fiction.

Earth's Angel is not affiliated with, sponsored by, or endorsed by NASA.
```

## 12. Comprobación antes de enviar

- [ ] Cada archivo de `public/assets` tiene fila en la sección 5 o en la 9.
- [ ] Cada archivo de código asistido por IA tiene su comentario y su fila en la sección 4.
- [ ] Cada registro del extracto DONKI está en la sección 6.
- [ ] Los modelos anotados son los que de verdad se usaron.
- [ ] La revisión humana de cada fila tiene nombre.
- [ ] El texto de créditos del juego coincide con este registro.
- [ ] Los campos del formulario coinciden con este registro.

## Implementación de la campaña P1 y P2

OpenAI Codex coordinó contratos, transiciones, guardado, validación de campaña y despliegue (A). Pascal, subagente de Codex, implementó datos y mapa de Marte, integración de escaneo y simulación terrestre (B). Darwin, subagente de Codex, integró las vistas bilingües, cinemáticas, estilos y audio (C). Se reutilizaron los activos acreditados arriba. La revisión de los integrantes A, B y C sigue pendiente. Codex hizo la integración y la verificación automatizada y en navegador.
