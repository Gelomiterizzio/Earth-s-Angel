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

### Sección de B · datos, mapa y ciencia

| Fecha | Herramienta y modelo | Tarea | Archivos | Revisado y probado por |
| --- | --- | --- | --- | --- |
| 14-nov-2026 | Cursor Agent (Composer) | T-P0-B1 a B6. Datos de balance y contenido, extracto DONKI, adaptador, mapa HTML, decisión solar, tarjetas y tutorial | `src/data/balance/**`, `src/data/content/**`, `src/data/nasa/**`, `src/data/i18n/*/content.json`, `src/map/**`, `src/ui/panels/decision.ts` y `tests/data/**` | Revisión humana de B pendiente según el paquete original |

### Sección de C · interfaz, arte y audio

| Fecha | Herramienta y modelo | Tarea | Archivos | Revisado y probado por |
| --- | --- | --- | --- | --- |
| 14-nov-2026 | Cursor, Grok 4.7 | Tareas C de P0, y las pantallas, guiones y activos de C en P1 y P2 que no cambian contratos | `src/ui/**`, `src/styles/**`, `src/audio/**`, `src/data/i18n/*/ui.json`, `public/assets/**`, `tests/ui/**` | Pendiente de revisión humana del equipo. Recorrido local del título, la dificultad, la apertura y el HUD con un arnés de previsualización, no con el núcleo real |
| 14-nov-2026 | OpenAI Codex, GPT-6 | Redibujo 2D, interfaz, integración P0, terreno y efectos de mapa, reproducción de cinemáticas y música sintetizada | `public/assets/**`, `tools/{gen-pixels,sprite-art,gen-cinematic-art,write-scripts}.mjs`, `src/ui/**`, `src/styles/**`, `src/data/i18n/*/ui.json`, `tests/ui/**`, `src/map/**`, `src/audio/**` y Markdown de esta revisión | Comprobación técnica en Chrome. Revisión humana de la entrega pendiente |

## 5. Activos generados con IA

Se agrupan los archivos que comparten una instrucción de producción y un exportador. El manifiesto da el nombre, tamaño y uso de cada activo. El proyecto incluye licencia MIT. Los PNG y el código de audio conservan su procedencia.

| Activo | Ruta | Herramienta y modelo | Prompt | Fecha | Retoques a mano | Marca de agua | Revisado por |
| --- | --- | --- | --- | --- | --- | --- | --- |
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
| — | — | — | — | — | — |

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
