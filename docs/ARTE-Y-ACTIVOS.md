# Arte y activos

Dirección de arte, manifiesto visual y sonoro, y prioridades de producción. Es la **fuente canónica de la lista de activos**: un archivo se carga por la ruta exacta que figura aquí.

## 1. Dirección de arte

**Pixel art 2D de ciencia ficción**, limpio y legible, con viñetas originales para las cinemáticas. Identidad propia: nada que insinúe patrocinio o aval de una agencia espacial.

| Principio | Qué significa |
| --- | --- |
| Legible antes que bonito | Cada edificio se reconoce por su silueta a tamaño real |
| Pocos colores | La paleta de este documento sirve de base. Las viñetas usan tonos intermedios discretos para dar profundidad |
| Luz constante | Desde arriba a la izquierda, en todos los activos |
| Sin rostros | La tripulación lleva casco. No hay personas reales |
| Sin marcas | Ningún logotipo, bandera, insignia ni identificador de misión |
| Calma | La crisis se muestra sin imágenes gráficas |

## 2. Tipografía

| Uso | Fuente | Licencia | Estado |
| --- | --- | --- | --- |
| Títulos y cifras grandes | Pixelify Sans | SIL Open Font License 1.1. Comprobado el 14-nov-2026: tiene ñ, tildes, ¿ y ¡ | Incluida |
| Texto de interfaz y subtítulos | Fuente del sistema: `system-ui, "Segoe UI", Roboto, sans-serif` | No se distribuye ningún archivo | En uso |

El texto corrido no usa fuente de píxeles: a tamaños pequeños cuesta leerla. Antes de aceptar una fuente se comprueba que tiene ñ, tildes, ¿ y ¡. El texto principal del HUD usa 16 unidades en 1280 × 720. La cabecera compacta usa 12 a 14 unidades y los subtítulos usan 24.

## 3. Paleta

### Interfaz, común a todos los entornos

| Nombre | Hex | Uso |
| --- | --- | --- |
| `--bg` | `#0B1026` | Fondo |
| `--panel` | `#141B3A` | Paneles |
| `--border` | `#2E3A6E` | Bordes |
| `--text` | `#F2F4FF` | Texto |
| `--text-dim` | `#B8C0E6` | Texto secundario |
| `--accent` | `#FFD166` | Acento y botón principal |
| `--focus` | `#7DF9FF` | Contorno de foco |
| `--safe` | `#3DDC97` | Estado seguro, con ✔ en círculo |
| `--warn` | `#FFB020` | Estado preventivo, con ▲ |
| `--crit` | `#FF5A5F` | Estado crítico, con ✖ en octágono |

Contraste: **por verificar** con un comprobador que cada texto sobre `--panel` y `--bg` alcanza 4,5:1. Los tres estados se distinguen por forma, no solo por color.

### Por entorno

| Entorno | Base | Sombra | Luz | Acentos |
| --- | --- | --- | --- | --- |
| Luna | `#8E9AAF` | `#4A5568` | `#DDE3EE` | Hielo `#9BE7FF` · mineral `#C9A227` · cráter `#2D3748` |
| Marte | `#B5532A` | `#6E2F1A` | `#E8A87C` | Polvo `#D9A066` · cielo `#C97B4A` |
| Tierra | Océano `#1E6FB8` | Crisis `#8B5E3C` | Recuperación `#7BD389` | Bosque `#2E8B57` · ciudad `#9AA5B1` |

## 4. Medidas

| Elemento | Medida |
| --- | --- |
| Escenario de referencia | 1280 × 720, proporción 16:9 |
| Casilla | 24 × 24 píxeles lógicos, mostrada al doble |
| Edificio | 24 × 32: una casilla más 8 píxeles de altura por arriba |
| Tripulante | 32 × 32 en retrato |
| Icono | 16 × 16 y 32 × 32 |
| Viñeta | 640 × 360 |
| Escalado | Sin suavizado de atlas ni viñetas. El tablero parte de 2× y el escenario conserva 16:9 al ajustarse a la ventana |

**Capas del tablero**, de abajo arriba: terreno, marcas de recurso, edificios, andamios e iconos de estado, resaltados, cursor, niebla.

**Transparencias:** PNG con canal alfa. La niebla es un negro al 70 %. Las sombras son píxeles sólidos de la paleta, no degradados.

**Animaciones:** pocas y cortas. Todas se desactivan con movimiento reducido.

| Animación | Fotogramas | Duración |
| --- | --- | --- |
| Construcción | 4 | 400 ms |
| Recolección | 4 | 300 ms |
| Edificio en marcha (P2) | 2 | Bucle de 1 s |
| Polvo | 4 | 500 ms en la vista de arte de Marte |
| Alerta de radiación | Borde que late dos veces | 800 ms |

## 5. Manifiesto visual

Esta revisión conserva dimensiones y orden de los atlas. Los activos de interfaz y las viñetas se cargan desde los componentes de C. La muestra de tablero en `tests/ui/preview-map.ts` recorta los atlas a escala de juego. P0 usa los atlas en el mapa lunar real. Marte y Tierra se revisan en la vista de arte. [Créditos y estado de revisión](IA-Y-CREDITOS.md).

Rutas relativas a `public/assets/`.

### P0

| ID | Ruta | Tamaño · formato | Escena | Capas o animación | Transp. | Prompt | Estado | Autoría · licencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tiles-moon` | `sprites/tiles-moon.png` | 168 × 24 · PNG | Luna | 7 casillas: llano, roca, cráter, hielo, mineral, misterio, niebla | Sí | P-TERR | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `buildings` | `sprites/buildings.png` | 216 × 32 · PNG | Luna y Marte | 9 cuadros: nave, panel, batería, generador, reciclador, extractor, invernadero, refugio, andamio | Sí | P-EDIF | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `crew` | `sprites/crew.png` | 128 × 32 · PNG | HUD | 4 retratos: comandante, ingeniera, botánico, médica | Sí | P-TRIP | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `astronauta-lunar` | [`src/map/astronaut-art.ts`](../src/map/astronaut-art.ts) | 24 × 24 · Canvas | Luna | Cuatro orientaciones, reposo y caminata. Gorra de mando, casco con lámpara y llave, sombrero con muestras, botiquín | Sí | Véase registro de IA | cuatro trajes seleccionables con Q | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `nave-lunar` | [`src/map/art.ts`](../src/map/art.ts) | 32 × 41 · Canvas | Luna | Cabina, antena, escalera, tren de aterrizaje y balizas | Sí | Véase registro de IA | compilación local | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `derrota-espacial` | [`src/ui/cinematics/defeat.ts`](../src/ui/cinematics/defeat.ts) | 320 × 180 · Canvas | Derrota en Luna y Marte | Evacuación, nave averiada, explosión y restos | No | Véase registro de IA | compilación local | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `fx-build` | `sprites/fx-build.png` | 96 × 24 · PNG | Tablero | 4 fotogramas | Sí | P-FX | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `fx-collect` | `sprites/fx-collect.png` | 96 × 24 · PNG | Tablero | 4 fotogramas | Sí | P-FX | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `icons-16` | `ui/icons-16.png` | 192 × 16 · PNG | HUD | 12 iconos: energía, oxígeno, agua, alimentos, materiales, radiación, puntos de acción, día, Tierra, seguro, preventivo, crítico | Sí | P-ICON | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `icons-32` | `ui/icons-32.png` | 384 × 32 · PNG | HUD | Los mismos 12 | Sí | P-ICON | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `logo` | `ui/logo.png` | 320 × 120 · PNG | Título | Logotipo propio de Earth's Angel | Sí | P-LOGO | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `menu-bg` | `ui/menu-bg.png` | 640 × 360 · PNG | Título | Paisaje lunar con Tierra, nave Ángel y antena | No | P-FONDO | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `earth` | `ui/earth.png` | 96 × 96 · PNG | Reserva | Ilustración independiente de la Tierra | Sí | P-FONDO | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `angel` | `ui/angel.png` | 32 × 32 · PNG | Reserva | Icono de la guía: punto de luz con dos alas simples | Sí | P-ICON | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `intro-1` a `intro-6` | `cinematics/intro-1.png` … `intro-6.png` | 640 × 360 · PNG | Apertura | Una imagen por escena; capas opcionales `-bg`, `-mid`, `-fg` | No | P-VIN | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `font-title` | `fonts/PixelifySans.woff2` + `fonts/LICENSE.txt` | WOFF2 | Todas | — | — | — | entregado | Pixelify Sans, Google Fonts, SIL Open Font License 1.1 |

### P1

| ID | Ruta | Tamaño · formato | Escena | Capas o animación | Transp. | Prompt | Estado | Autoría · licencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tiles-mars` | `sprites/tiles-mars.png` | 168 × 24 · PNG | Marte | Las mismas 7 casillas | Sí | P-TERR | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `buildings-p1` | `sprites/buildings-p1.png` | 96 × 32 · PNG | Marte | 4 cuadros: depósito, comunicaciones, laboratorio, hábitat | Sí | P-EDIF | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `crew-p1` | `sprites/crew-p1.png` | 64 × 32 · PNG | HUD | Geólogo y especialista en comunicaciones | Sí | P-TRIP | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `fx-dust` | `sprites/fx-dust.png` | 96 × 24 · PNG | Marte | 4 fotogramas | Sí | P-FX | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `moon-to-mars-1` a `-5` | `cinematics/moon-to-mars-N.png` | 640 × 360 · PNG | Luna → Marte | Una por escena | No | P-VIN | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `mars-victory-1` a `-4` | `cinematics/mars-victory-N.png` | 640 × 360 · PNG | Victoria ordinaria | Una por escena | No | P-VIN | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |

### P2

| ID | Ruta | Tamaño · formato | Escena | Capas o animación | Transp. | Prompt | Estado | Autoría · licencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `objects` | `sprites/objects.png` | 72 × 24 · PNG | Tablero | Baliza, fragmento, anillo del portal | Sí | P-FX | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `wormhole-1` a `-4` | `cinematics/wormhole-N.png` | 640 × 360 · PNG | Ruta secreta | Una por escena | No | P-VIN | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `earth-victory-1` a `-4` | `cinematics/earth-victory-N.png` | 640 × 360 · PNG | Victoria terrestre | Una por escena | No | P-VIN | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `earth-stage-0` a `-4` | `cinematics/earth-stage-N.png` | 640 × 360 · PNG | Tierra, reservado | Cinco estados del paisaje | No | P-VIN | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |
| `icons-earth` | `ui/icons-earth.png` | 224 × 32 · PNG | Tierra, reservado | 7 iconos: cuatro líneas y tres indicadores | Sí | P-ICON | entregado | Equipo Earth’s Angel, arte original asistido por Codex. MIT |

### Uso y exportación

- El menú carga el fondo y el logotipo. El HUD carga `icons-16.png`, edificios y retratos. `icons-32.png`, `icons-earth.png`, `earth.png` y `angel.png` quedan disponibles para futuras pantallas.
- El terreno, los objetos y los efectos están integrados en la muestra de arte del navegador. El canvas de 288 × 288 usa celdas de 24 × 24 y dibuja los cuadros de edificio de 24 × 32 alineados al borde inferior de cada celda, con 8 píxeles de altura extra.
- Construcción, recolección y polvo avanzan por cuatro cuadros con el mismo anclaje. La Luna dispara los efectos al aceptar las acciones. La vista marciana permite reproducir el polvo. Movimiento reducido muestra un solo cuadro.
- Los PNG se reproducen con `node tools/gen-pixels.mjs`. Para regenerar solo los atlas y los iconos, usa `node tools/gen-pixels.mjs --sprites`. Para las ilustraciones, usa `node tools/gen-cinematic-art.mjs`.
- El terreno lunar combina grava gris, cráteres y rayos de impacto. Marte tiene mesetas erosionadas, capas diagonales y vetas de arena, con polvo en movimiento durante la muestra. La apertura, la transición a Marte, el portal y ambos finales usan 23 viñetas. Los cinco paisajes `earth-stage-0.png` a `earth-stage-4.png` están preparados para la progresión visual de Tierra.

## 6. Manifiesto sonoro

Música original y efectos sintetizados con Web Audio. Los temas se definen y mezclan en `src/audio/synth.ts`. Las rutas de audio opcional y los eventos están en `src/audio/manifest.ts`. Los archivos OGG son opcionales y esta versión funciona sin ellos.

El servidor de desarrollo reproduce en bucle el MP3 local `src/audio/soundtrack.local/interstellar.mp3` cuando está disponible, con los mismos controles de música y silencio. La copia local está excluida del repositorio y de la compilación. [Procedencia de la pista](IA-Y-CREDITOS.md#9-tipografías-arte-y-audio-de-terceros).

| ID | Uso | Duración aprox. | Bucle |
| --- | --- | --- | --- |
| `music-menu` | Título, dificultad y créditos | 21 s | Sí |
| `music-cinematic` | Apertura | 25 s | Sí |
| `music-moon` | Misión lunar | 29 s | Sí |
| `music-transit` | Luna → Marte | 23 s | Sí |
| `music-mars` | Muestra de misión marciana | 24 s | Sí |
| `music-portal` | Portal | 28 s | Sí |
| `music-earth` | Pantalla de Tierra | 22 s | Sí |
| `music-ending` | Cinemáticas «Victoria en Marte» y «Victoria terrestre» | 26 s | Sí |
| `music-victory` / `music-defeat` | Resultados | 10 s / 14 s | Una vez |

Hay efectos de interfaz, construcción, módulos que entran en funcionamiento, exploración, minería, cosecha, alertas, radio, despegue, aterrizaje y portal. [Implementación y controles](componentes/audio.md). [Procedencia](IA-Y-CREDITOS.md).

## 7. Prioridades de producción

Lo que más se ve en la demo, primero:

1. `buildings` · 2. `tiles-moon` · 3. `icons-32` e `icons-16` · 4. `logo` y `menu-bg` · 5. `intro-6`, que sirve sola para la apertura recortada · 6. `crew` · 7. resto de viñetas · 8. efectos · 9. música compuesta.

Si el tiempo no alcanza: formas de la paleta con el icono del edificio, y audio sintetizado. La mecánica manda sobre el pulido.

## 8. Producción

### Reglas

- Tres orígenes permitidos: hecho por el equipo, generado con IA y revisado, o de terceros de libre disposición sin restricciones o con licencia OSI.
- La presentación local usa arte sin rótulos. Para la entrega de Space Apps, aplica la identificación visible que exige el evento y conserva el crédito en el formulario.
- Cada activo aceptado se anota en [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md) con herramienta, modelo, prompt exacto, fecha y quién lo revisó.
- Proceso completo: [componentes/proceso-de-activos.md](componentes/proceso-de-activos.md).

### Prompts de producción

Base común, que se antepone a todos:

```text
Pixel art, 2D, science fiction, clean and readable for children. Limited palette:
#0B1026 #141B3A #2E3A6E #F2F4FF #FFD166 #8E9AAF #4A5568 #DDE3EE #9BE7FF #C9A227.
Hard pixel edges, no anti-aliasing, no gradients. Light from the top-left.
No text, no letters, no logos, no flags, no agency insignia, no mission patches,
no real people, no faces.
```

| ID | Añadir a la base |
| --- | --- |
| P-TERR | `Top-down terrain tiles, 24x24 pixels each, in one horizontal strip: flat regolith, rock, crater, ice patch, mineral deposit, mysterious glowing spot, dark fog. Seamless edges.` |
| P-EDIF | `Top-down base modules, 24x32 pixels each, one horizontal strip, transparent background, each with a distinct silhouette: landed ship, solar panel, battery, oxygen generator, water recycler, ice extractor, greenhouse dome, radiation shelter half-buried in regolith, scaffolding.` |
| P-TRIP | `Four astronaut portraits, 32x32 pixels each, helmets on with reflective visors, no visible faces, each with a different suit color stripe.` |
| P-ICON | `Interface icons, 32x32 pixels each, one horizontal strip, transparent background, flat and bold: lightning bolt, air bubble, water drop, leaf, crate, radiation shield, action dot, sun over horizon, small Earth, check in circle, triangle, cross in octagon.` |
| P-LOGO | `Game logo for "Earth's Angel": a small Earth held between two simple abstract wings made of light. Original design, 320x120, transparent background. Add the title text by hand afterwards, not in the generator.` |
| P-FONDO | `Space background, 640x360, deep navy with sparse stars and a distant Earth. Calm, no spacecraft.` |
| P-VIN | `Cinematic panel, 640x360, wide composition with clear foreground, middle and background. Scene: <descripción de la escena del guion>. Human figures only as suited silhouettes seen from behind.` |
| P-FX | `Four-frame effect animation, 24x24 pixels per frame, one horizontal strip, transparent background: <efecto>.` |

Para Marte se cambia la paleta de entorno por la marciana de la sección 3.

### Revisión humana antes de aceptar

- [ ] No aparece ningún logotipo, bandera, insignia ni texto.
- [ ] No hay rostros ni personas reales.
- [ ] Respeta la paleta y la dirección de la luz.
- [ ] Tiene el tamaño exacto del manifiesto.
- [ ] Si es ilustración generada, lleva la marca de agua.
- [ ] Está anotado en créditos.
