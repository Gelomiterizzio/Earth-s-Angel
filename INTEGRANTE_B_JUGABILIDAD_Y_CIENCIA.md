# Integrante B · Jugabilidad y ciencia

Paquete de trabajo de **Earth's Angel** para el NASA Space Apps Challenge 2026.
Repositorio del equipo: <https://github.com/Gelomiterizzio/Earth-s-Angel>

> **Fechas que mandan (hora de Bolivia):** congelación de código el **domingo 09:30** · envío a las **11:30** · límite de la sede 12:00 · defensa 14:00.

## 1. Tu papel

Eres quien hace que el juego **se pueda jugar y sea creíble**. Preparas los datos y el balance, traes el dato real de NASA, construyes el tablero lunar, la construcción y la exploración, y la pantalla donde el jugador decide qué hacer ante la tormenta solar. Esa decisión es **el corazón de la demo**.

| Eres dueño de | No tocas |
| --- | --- |
| `src/data/` · contenido, balance, extracto NASA | `src/core/`, `src/app/`, `src/main.ts`, `package.json` (A) |
| `src/map/` · tablero en Phaser | `src/ui/` salvo tu panel, `src/styles/`, `src/audio/`, `public/assets/` (C) |
| `src/ui/panels/decision.ts` · panel de la tormenta | |
| `tests/data/` | |
| `src/data/i18n/en/content.json` y `es/content.json` | |
| Procedencia en `docs/CIENCIA-Y-DATOS.md` | |

**No cambias contratos.** Si necesitas un tipo, un campo o una función del núcleo, se lo pides a A.

Revisas el trabajo de **A** (que las cifras del núcleo coincidan con las tablas) y el HUD de **C**. A ti te revisan **A** y, en el panel de decisión y las tarjetas, **C**.

## 2. Antes de empezar (una sola vez)

1. Acepta la invitación al repositorio que te llegará por correo o en GitHub.
2. Comprueba que tienes Git y Node.js 22.12 o posterior (recomendado 24):

```bash
node --version
```

3. Clona en una ruta corta, **sin espacios ni apóstrofos**:

```bash
git clone https://github.com/Gelomiterizzio/Earth-s-Angel.git earths-angel
```

```bash
cd earths-angel
```

4. Cuando A avise de que el andamiaje está en `main`:

```bash
git pull origin main
```

```bash
npm install
```

### Qué leer (20 minutos)

1. [docs/PLAN-EQUIPO.md](docs/PLAN-EQUIPO.md) · horarios y cortes
2. [docs/niveles/luna.md](docs/niveles/luna.md) · **tu nivel**: mapa, eventos y recorridos
3. [docs/componentes/dificultad-y-balance.md](docs/componentes/dificultad-y-balance.md) y [construccion.md](docs/componentes/construccion.md) · los números que vas a convertir en JSON
4. [docs/CIENCIA-Y-DATOS.md](docs/CIENCIA-Y-DATOS.md) · el registro DONKI y qué es dato real y qué no
5. [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md), secciones 3 a 8 · cómo hablas con el núcleo

## 3. Tu prompt para Claude Code

Abre una terminal en la carpeta del repositorio, inicia `claude` y pega esto.

```text
Soy el integrante B (jugabilidad y ciencia) del equipo de Earth's Angel, un juego educativo 2D
por turnos para el NASA Space Apps Challenge 2026, reto "Build a Junior Astronaut Mission
Trainer". Entregamos el domingo 15-nov a las 11:30, hora de Bolivia, y la congelación de código
es a las 09:30.

Lee, en este orden: CLAUDE.md, INTEGRANTE_B_JUGABILIDAD_Y_CIENCIA.md,
docs/agentes/REGLAS-DE-TRABAJO.md, docs/agentes/prompts/jugabilidad.md,
docs/agentes/prompts/ciencia-y-datos.md, docs/niveles/luna.md y docs/CIENCIA-Y-DATOS.md.

Trabajas con dos perfiles según la tarea: "jugabilidad" para B1, B3 y B4, y "ciencia y datos"
para B2, B5 y B6. Te pediré las tareas una por una. Para cada una:
1. Lee su ficha en docs/agentes/tareas/ y los documentos que la ficha lista.
2. Dime en cinco líneas qué vas a hacer y qué archivos vas a crear o tocar. Espera mi "adelante".
3. Trabaja solo en las rutas permitidas de la ficha.
4. Ejecuta npm test y npm run build y pégame la salida.
5. Termina con el informe final de docs/agentes/PLANTILLA-TAREA.md, separando lo implementado,
   lo probado y lo pendiente.

Reglas que no se rompen:
- No cambies src/core/types.ts ni nada de src/core o src/app. Si necesitas algo, dímelo y se lo
  pido al integrante A.
- El mapa no guarda estado ni calcula reglas: lee el almacén y despacha acciones.
- Los JSON coinciden cifra por cifra con las tablas de la documentación. No inventes números.
- Cada dato científico lleva etiqueta: dato NASA, transformación didáctica, balance o ficción.
  "dato NASA" solo si lo leíste en la fuente con enlace y fecha. Nunca de memoria.
- Los datos de NASA van empaquetados y se presentan como archivados, no como en vivo.
- Ningún texto visible en el código: todo al catálogo, en inglés y español.
- No añadas dependencias. Phaser solo se importa dentro de src/map.
- Puedes hacer commits en mi rama con el ID de la tarea. No hagas push ni fusiones: eso lo hago yo.

Empieza por la tarea T-P0-B1: docs/agentes/tareas/T-P0-B1-datos-y-balance-lunar.md
```

Para las siguientes:

```text
Siguiente tarea: docs/agentes/tareas/T-P0-B2-extracto-donki.md. Perfil: ciencia y datos. Mismo procedimiento.
```

## 4. Tus tareas, en orden

| Cuándo | Tarea | Ficha | Qué queda hecho |
| --- | --- | --- | --- |
| Sáb 12:45 – 14:00 | **B1** Datos y balance | [T-P0-B1](docs/agentes/tareas/T-P0-B1-datos-y-balance-lunar.md) | Todos los JSON de la Luna, cargados y validados |
| Sáb 14:00 – 14:30 | **B2** Extracto DONKI | [T-P0-B2](docs/agentes/tareas/T-P0-B2-extracto-donki.md) | Registros reales de NASA empaquetados y trazables |
| **H1 · 14:30** | Integración | | Los datos cargan en `main` |
| Sáb 14:30 – 17:30 | **B3** Mapa lunar | [T-P0-B3](docs/agentes/tareas/T-P0-B3-mapa-lunar.md) | El tablero se dibuja desde el estado, con ratón y teclado |
| **H2 · 17:30** | Integración | | Se construye un panel en el mapa |
| Sáb 17:30 – 19:30 | **B4** Construcción y exploración | [T-P0-B4](docs/agentes/tareas/T-P0-B4-construccion-y-exploracion.md) | Construir, explorar y recolectar con vista previa y motivos |
| Sáb 19:30 – 21:00 | **B5** Decisión de la tormenta | [T-P0-B5](docs/agentes/tareas/T-P0-B5-decision-de-tormenta.md) | Panel con el evento real de NASA y las dos opciones |
| **H3 · 21:00** | Integración y **decisión de alcance** | | Partida completa en Media |
| Sáb noche o Dom 07:30 | **B6** Contenido científico | [T-P0-B6](docs/agentes/tareas/T-P0-B6-contenido-cientifico.md) | Tarjetas y tutorial en dos idiomas; tres dificultades jugadas |
| **H4 · Dom 09:00** | Integración | | P0 verificado |
| Dom 09:30 – 11:30 | Apoyo a la entrega | [T-P0-C7](docs/agentes/tareas/T-P0-C7-entrega.md) | Texto del campo **NASA Data** y pruebas de juego en la URL pública |

**B1 y B2 no dependen de nadie: empiézalos ya.** Mientras el núcleo real no exista, B3 trabaja con los estados de ejemplo de `src/core/fixtures.ts`.

**Dos tareas tuyas no se recortan nunca: B2 y B5.** Sostienen la elegibilidad del proyecto y la demo.

## 5. Guardar y subir tu trabajo

Una rama por tarea:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
git checkout -b b/p0-b1-datos
```

Guarda a menudo:

```bash
git add .
```

```bash
git commit -m "T-P0-B1: JSON de balance lunar y validador"
```

Antes de pedir revisión:

```bash
git pull origin main
```

```bash
npm test
```

```bash
npm run build
```

```bash
git push -u origin b/p0-b1-datos
```

En GitHub abre la solicitud de fusión hacia `main`, pega el informe del agente y pide revisión a A. Quien revisa fusiona con **Squash and merge**.

Si al traer `main` hay un conflicto en un archivo tuyo, se queda tu versión. Si es en un archivo de otro, se queda la suya. Detalle en [docs/agentes/PROTOCOLO-INTEGRACION.md](docs/agentes/PROTOCOLO-INTEGRACION.md).

## 6. Cómo se une tu trabajo con el de los demás

Entregas tres puntos de entrada. A los conecta en `src/main.ts`; tú no tocas ese archivo.

| Tu archivo | Qué exporta | Quién lo usa |
| --- | --- | --- |
| `src/data/index.ts` | `loadGameData(): GameData` | El núcleo de A |
| `src/map/index.ts` | `createMapView(parent, ctx): MapView` | `main.ts` de A |
| `src/ui/panels/decision.ts` | `mountDecisionPanel(root, ctx)` | El HUD de C |

Con C compartes una sola cosa: la **herramienta activa**. El HUD de C llama a `uiStore.setTool(...)` cuando el jugador elige un edificio. Tu mapa lee `uiStore.tool` y, al hacer clic, despacha la acción al almacén. No os llamáis directamente.

El tablero ocupa la zona que define [docs/componentes/hud-y-accesibilidad.md](docs/componentes/hud-y-accesibilidad.md#disposición-del-escenario).

## 7. Lo que revisas de los demás

**De A:** que las cifras del núcleo coinciden con [dificultad-y-balance.md](docs/componentes/dificultad-y-balance.md) y que los recorridos de [luna.md](docs/niveles/luna.md) dan los días de victoria documentados.

**De C:** que el HUD muestra los estados con texto e icono además de color, que los medidores dicen la verdad del estado, y que los créditos nombran DONKI con su enlace.

## 8. Si te atascas

| Problema | Qué hacer |
| --- | --- |
| A las 16:30 el tablero en Phaser no dibuja | Plan B: cuadrícula de 144 botones HTML dentro del mismo contenedor, con la misma interfaz `MapView`. Avisa a A y a C. |
| La API de DONKI no responde | Usa los registros ya copiados en [docs/CIENCIA-Y-DATOS.md](docs/CIENCIA-Y-DATOS.md). El principal está completo. |
| Un registro no tiene fulguración enlazada clara | Descártalo. Basta el principal y uno moderado. |
| Un número de balance se siente injusto | Propónselo a A con el motivo. No se cambia sin volver a pasar las pruebas de recorrido. El balance se congela en H3. |
| No sabes si algo es "dato NASA" | Si no lo leíste hoy en la fuente, no lo es. Etiquétalo como transformación didáctica o quítalo. |
| No llegas a B6 completo | Seis tarjetas en inglés son el mínimo. El español de las tarjetas puede quedar para después. |

Cortes generales: [docs/PLAN-EQUIPO.md](docs/PLAN-EQUIPO.md#6-criterios-para-cortar-alcance).

## 9. Lista final (domingo 09:30)

- [ ] El extracto DONKI está en `src/data/nasa/` con identificador, instrumento, fulguración y enlace.
- [ ] El panel de decisión muestra el registro real y separa "dato real" de "valores del juego".
- [ ] El enlace al registro abre desde el juego.
- [ ] Jugaste Fácil, Media e Imposible hasta la victoria en el navegador.
- [ ] Ninguna tarjeta presenta un valor de balance como dato real.
- [ ] [docs/CIENCIA-Y-DATOS.md](docs/CIENCIA-Y-DATOS.md) refleja lo que verificaste, con fecha.
- [ ] Redactaste en inglés el campo **NASA Data** y se lo pasaste a C.
- [ ] Tu uso de IA está anotado en tu sección de [docs/IA-Y-CREDITOS.md](docs/IA-Y-CREDITOS.md).
