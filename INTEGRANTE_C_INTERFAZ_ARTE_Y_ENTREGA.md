# Integrante C · Interfaz, arte y entrega

Paquete de trabajo de **Earth's Angel** para el NASA Space Apps Challenge 2026.
Repositorio del equipo: <https://github.com/Gelomiterizzio/Earth-s-Angel>

> **Fechas que mandan (hora de Bolivia):** congelación de código el **domingo 09:30** · envío a las **11:30** · límite de la sede 12:00 · defensa 14:00.

## 1. Tu papel

Eres quien hace que el juego **se vea, se entienda y se entregue**. Diseñas el sistema visual, construyes menús, HUD, informes, cinemática y tutorial, produces el arte y el audio, llevas los créditos y el registro de IA, y eres quien graba la demo, rellena el formulario en inglés y coordina con la sede.

| Eres dueño de | No tocas |
| --- | --- |
| `src/ui/` · pantallas, HUD, paneles, cinemáticas | `src/core/`, `src/app/`, `src/main.ts`, `index.html`, `package.json` (A) |
| `src/styles/` | `src/map/`, `src/data/` salvo tus catálogos (B) |
| `src/audio/` | `src/ui/panels/decision.ts` (B) |
| `public/assets/` · sprites, iconos, viñetas, fuentes, audio | |
| `src/data/i18n/en/ui.json` y `es/ui.json` | |
| `docs/ENTREGA.md`, `docs/presentacion/`, `docs/IA-Y-CREDITOS.md`, `docs/ARTE-Y-ACTIVOS.md` | |

**No cambias contratos.** Si la interfaz necesita un dato que no está en el estado, se lo pides a A. No dupliques reglas del núcleo en la interfaz.

Revisas el trabajo de **A** en el flujo y el panel y las tarjetas de **B**. A ti te revisan **A** y **B**.

## 2. Antes de empezar (una sola vez)

1. Acepta la invitación al repositorio.
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

### Tres gestiones tuyas del sábado que no pueden esperar

1. **Pregunta a la organización de la sede:** ¿las 12:00 del domingo son un límite estricto?, ¿cuánto dura la defensa y en qué idioma?, ¿hay proyector?, ¿se puede reenviar después de la defensa?
2. **Comprueba en la web de Space Apps** que los tres aparecéis en la pestaña Members de vuestro equipo, en la sede de Santa Cruz, y que el reto elegido es *Build a Junior Astronaut Mission Trainer*.
3. **Abre la pestaña Project**, compara sus campos con [docs/ENTREGA.md](docs/ENTREGA.md) y guarda un primer borrador.

### Qué leer (20 minutos)

1. [docs/PLAN-EQUIPO.md](docs/PLAN-EQUIPO.md) · horarios y cortes
2. [docs/ARTE-Y-ACTIVOS.md](docs/ARTE-Y-ACTIVOS.md) · paleta, tamaños y lista de activos
3. [docs/componentes/hud-y-accesibilidad.md](docs/componentes/hud-y-accesibilidad.md) · **tu ficha principal**
4. [docs/componentes/arranque-y-escenas.md](docs/componentes/arranque-y-escenas.md) · cómo se conecta una pantalla
5. [docs/NASA-SPACE-APPS-2026.md](docs/NASA-SPACE-APPS-2026.md) · requisitos de entrega, IA y derechos
6. [docs/ENTREGA.md](docs/ENTREGA.md) · el texto que vas a enviar

## 3. Tu prompt para Claude Code

Abre una terminal en la carpeta del repositorio, inicia `claude` y pega esto.

```text
Soy el integrante C (interfaz, arte y entrega) del equipo de Earth's Angel, un juego educativo
2D por turnos para niños de 7 a 12 años, para el NASA Space Apps Challenge 2026. Entregamos el
domingo 15-nov a las 11:30, hora de Bolivia, y la congelación de código es a las 09:30.

Lee, en este orden: CLAUDE.md, INTEGRANTE_C_INTERFAZ_ARTE_Y_ENTREGA.md,
docs/agentes/REGLAS-DE-TRABAJO.md, docs/agentes/prompts/interfaz.md,
docs/agentes/prompts/arte-y-audio.md, docs/ARTE-Y-ACTIVOS.md,
docs/componentes/hud-y-accesibilidad.md y docs/componentes/arranque-y-escenas.md.

Trabajas con el perfil "interfaz" para C1, C2, C3 y C4, "arte y audio" para C5 y C6, e
"integración y QA" para C7. Te pediré las tareas una por una. Para cada una:
1. Lee su ficha en docs/agentes/tareas/ y los documentos que la ficha lista.
2. Dime en cinco líneas qué vas a hacer y qué archivos vas a crear o tocar. Espera mi "adelante".
3. Trabaja solo en las rutas permitidas de la ficha.
4. Ejecuta npm test y npm run build y pégame la salida.
5. Termina con el informe final de docs/agentes/PLANTILLA-TAREA.md, separando lo implementado,
   lo probado y lo pendiente.

Reglas que no se rompen:
- La interfaz no guarda estado del juego ni calcula reglas: se suscribe al almacén y despacha
  acciones. No toques src/core, src/app, src/map, index.html ni src/main.ts.
- Ningún texto visible en el código: todo sale del catálogo, en inglés y español. El inglés es
  el idioma por defecto.
- Accesibilidad obligatoria: controles reales con foco visible, todo manejable con teclado,
  estados con texto e icono además del color, subtítulos, y respeto a movimiento reducido.
- Colores y tamaños solo desde src/styles/tokens.css.
- Sin bibliotecas de interfaz ni dependencias nuevas.
- Nada generado puede usar logotipos, banderas ni identificadores de misión de NASA. Toda
  imagen o video generado con IA lleva marca de agua visible, y todo uso de IA se anota en
  docs/IA-Y-CREDITOS.md.
- Ninguna imagen, voz o nombre reconocible de menores de 18 años.
- Puedes hacer commits en mi rama con el ID de la tarea. No hagas push ni fusiones: eso lo hago yo.

Empieza por la tarea T-P0-C1: docs/agentes/tareas/T-P0-C1-menus-y-sistema-visual.md
```

Para las siguientes:

```text
Siguiente tarea: docs/agentes/tareas/T-P0-C2-hud.md. Perfil: interfaz. Mismo procedimiento.
```

Para generar arte con una herramienta de imágenes, usa los prompts de [docs/ARTE-Y-ACTIVOS.md](docs/ARTE-Y-ACTIVOS.md) y anota cada resultado en [docs/IA-Y-CREDITOS.md](docs/IA-Y-CREDITOS.md).

## 4. Tus tareas, en orden

| Cuándo | Tarea | Ficha | Qué queda hecho |
| --- | --- | --- | --- |
| Sáb 12:45 – 14:30 | **C1** Sistema visual y menús | [T-P0-C1](docs/agentes/tareas/T-P0-C1-menus-y-sistema-visual.md) | Estilos base y pantalla de título; después dificultad, opciones y despedida |
| En paralelo | **C5** Arte | [T-P0-C5](docs/agentes/tareas/T-P0-C5-arte.md) | Edificios y terreno primero; luego iconos, logotipo y viñetas |
| **H1 · 14:30** | Integración | | El título se ve en `main` |
| Sáb 14:30 – 17:30 | **C1** (resto) y **C2** HUD | [T-P0-C2](docs/agentes/tareas/T-P0-C2-hud.md) | El HUD lee el estado real: tres medidores, objetivos, pronóstico, paleta |
| **H2 · 17:30** | Integración | | Finalizar día avanza y el HUD cambia |
| Sáb 17:30 – 19:00 | **C2** (completo) | | Paleta conectada al mapa de B, pausa, mensajes |
| Sáb 19:00 – 21:00 | **C3** Informe, resultados y créditos | [T-P0-C3](docs/agentes/tareas/T-P0-C3-informe-resultados-creditos.md) | Informe con causa y efecto, victoria, derrota y créditos |
| **H3 · 21:00** | Integración y **decisión de alcance** | | Partida completa en Media |
| Sáb noche | **C4** Cinemática y tutorial | [T-P0-C4](docs/agentes/tareas/T-P0-C4-cinematica-y-tutorial.md) | Apertura saltable, tutorial por pasos, tarjetas |
| Dom 07:30 – 09:00 | **C6** Audio y resto de **C5** | [T-P0-C6](docs/agentes/tareas/T-P0-C6-audio.md) | Música y efectos con volúmenes; arte que falte |
| **H4 · Dom 09:00** | Integración | | P0 verificado |
| **Dom 09:30 – 11:30** | **C7** Entrega | [T-P0-C7](docs/agentes/tareas/T-P0-C7-entrega.md) | Demo subida, formulario enviado, enlaces probados |
| Dom 12:00 – 14:00 | Ensayo | [docs/presentacion/PITCH.md](docs/presentacion/PITCH.md) | Pitch ensayado dos veces |

**Empieza por `tokens.css`, `base.css` y el título.** No dependen de nadie. Mientras el núcleo real no exista, el HUD trabaja con los estados de ejemplo de `src/core/fixtures.ts`.

**Tu carga es la mayor del equipo.** Orden de recorte si falta tiempo, de lo primero que se sacrifica a lo último:

1. Música compuesta → solo efectos y ambiente sintetizado.
2. Apertura de seis viñetas → una viñeta con tres frases.
3. Comprobación de aprendizaje → desactivada.
4. Sprites dibujados → formas de la paleta con icono.
5. Español → se entrega en inglés.

**Nunca se recorta:** el informe con causa y efecto, los créditos con el registro de IA, la versión en inglés y la entrega.

## 5. Guardar y subir tu trabajo

Una rama por tarea:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
git checkout -b c/p0-c1-menus
```

Guarda a menudo:

```bash
git add .
```

```bash
git commit -m "T-P0-C1: sistema visual y pantalla de título"
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
git push -u origin c/p0-c1-menus
```

En GitHub abre la solicitud de fusión hacia `main`, pega el informe del agente y pide revisión. Quien revisa fusiona con **Squash and merge**.

Los activos pesados se suben por tandas pequeñas. Ningún archivo de más de 5 MB sin hablarlo.

## 6. Cómo se une tu trabajo con el de los demás

Entregas tres puntos de entrada. A los conecta en `src/main.ts`; tú no tocas ese archivo.

| Tu archivo | Qué exporta |
| --- | --- |
| `src/ui/index.ts` | `registerScreens(flow)`: registra todas tus pantallas |
| `src/styles/index.css` | Importa `tokens.css`, `base.css`, `screens.css`, `hud.css` |
| `src/audio/index.ts` | `createAudio(options)`: devuelve el `AudioApi` |

Cada pantalla es un objeto con `mount(root, ctx)` y `unmount()`. Recibes en `ctx` todo lo que necesitas: `store`, `uiStore`, `flow`, `options`, `t`, `audio`, `data`.

Con B compartes dos cosas:

- **La herramienta activa.** Tu paleta llama a `ctx.uiStore.setTool(...)`. El mapa de B la lee.
- **El panel de decisión.** Lo escribe B en `src/ui/panels/decision.ts`. Tú lo montas desde el HUD cuando `phase === 'decision'` y le das los estilos.

Los textos de causa y efecto, principios y sugerencias vienen del núcleo como claves `sim.*`. Los nombres de edificios, tarjetas y avisos vienen de B como claves `content.*`. Tú solo escribes `ui.*`.

## 7. Lo que revisas de los demás

**De A:** que el flujo monta y desmonta bien tus pantallas, que las opciones se guardan y que cambiar idioma o volumen no altera la partida.

**De B:** que el panel de la tormenta y las tarjetas se leen bien, tienen frases cortas, funcionan con teclado y separan a la vista el dato real de los valores del juego.

## 8. Si te atascas

| Problema | Qué hacer |
| --- | --- |
| El HUD necesita un dato que no está en el estado | Pídeselo a A. No lo calcules tú. |
| No llegan los sprites | El mapa de B ya dibuja rectángulos con letras. Sigue con lo demás. |
| El audio no suena al cargar | Es normal: el navegador exige una interacción. Arranca el audio en el primer clic. |
| La herramienta de imágenes dibuja un logotipo de NASA | Descarta esa imagen. No la edites para taparlo. |
| El video pasa de 30 segundos | Recorta. Pasarse deja al proyecto fuera de la evaluación global. |
| El enlace del video pide iniciar sesión | Cambia la visibilidad a público o no listado y prueba en ventana privada. |
| No hay tiempo para el video | Exporta las 7 diapositivas de [docs/presentacion/DIAPOSITIVAS.md](docs/presentacion/DIAPOSITIVAS.md) a PDF con enlace público. |

Cortes generales: [docs/PLAN-EQUIPO.md](docs/PLAN-EQUIPO.md#6-criterios-para-cortar-alcance).

## 9. Lista final (domingo 11:30)

- [ ] El juego abre en inglés en la URL pública y el español funciona desde el menú.
- [ ] Todo se maneja con teclado y el foco siempre se ve.
- [ ] Los créditos nombran las fuentes NASA, las herramientas, el uso de IA y la frase de no afiliación.
- [ ] Toda ilustración generada lleva marca de agua visible.
- [ ] Ningún material muestra a menores, datos personales ni marca de NASA.
- [ ] La demo dura 30 segundos o menos, o tiene 7 diapositivas o menos, en inglés o con subtítulos en inglés.
- [ ] Los dos enlaces abren en ventana privada y en un teléfono.
- [ ] El formulario está completo en inglés y coincide con [docs/ENTREGA.md](docs/ENTREGA.md).
- [ ] **Submit for Judging** pulsado y aviso de confirmación capturado.
- [ ] [docs/IA-Y-CREDITOS.md](docs/IA-Y-CREDITOS.md) al día, con las secciones de A y B integradas.
- [ ] Pitch ensayado dos veces con cronómetro.
