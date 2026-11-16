# Modo PC y modo Móvil/Tablet

Ficha del modo de plataforma. Los controles de teclado siguen en [controles.md](controles.md).

## 1. Qué es

Earth's Angel es un solo juego con dos formas de jugar:

- **PC:** teclado y ratón. Es el modo por defecto y no cambia nada de la experiencia original.
- **Móvil/Tablet:** controles táctiles, pantalla horizontal y pantalla completa cuando el navegador lo permite.

El selector está en la esquina superior derecha del título («Jugar en: PC | Móvil/Tablet»), y también en **Opciones → Pantalla e idioma**. Se puede cambiar en cualquier momento, también a mitad de partida, sin recargar ni perder progreso.

Cada sesión nueva empieza en PC. Dentro de la misma pestaña, el modo elegido se conserva al recargar (`sessionStorage`), para que un móvil que recarga no vuelva al teclado.

## 2. Arquitectura

| Pieza | Archivo | Qué hace |
| --- | --- | --- |
| Lógica del juego | `src/core/`, `src/app/store.ts` | Sin cambios. Las reglas no saben qué plataforma se usa |
| Gestor de plataforma | `src/app/platform.ts` | Modo activo, orientación, pantalla completa, avisos y variante de textos |
| Entrada de PC | `src/app/input.ts`, `src/map/walk.ts` | Teclado y ratón, sin cambios |
| Entrada táctil | `src/ui/touch/touch-controls.ts` | Toque en el mapa, cruceta y botones de pulgar |
| Interfaz adaptable | `src/styles/mobile.css` | Todo el diseño móvil, siempre bajo `html[data-platform="mobile"]` |
| Selector | `src/ui/components/platform-switch.ts` | Botones PC / Móvil-Tablet (patrón radio, accesible con teclado) |
| Textos táctiles | `src/data/i18n-touch/{en,es}.json` | Versión táctil de cada texto que nombra una tecla |

**Una sola ruta de entrada.** Cada control táctil envía el mismo comando que su tecla (W A S D, E, Q, B, M, F, P) por el mismo camino de teclado que ya escucha el juego, como hace el modo presentación X. Así una acción funciona igual con tecla o con toque y no hay lógica duplicada.

**Textos.** Con Móvil/Tablet activo, el traductor busca primero la versión táctil de cada clave; si no existe, usa la normal. Así el tutorial, las pistas del mapa, el diario y la lista de controles dicen «toca ✋ Acción» en lugar de «pulsa E», y vuelven a las teclas al cambiar a PC. Una prueba comprueba que cada clave táctil existe en el catálogo principal y en los dos idiomas.

## 3. Controles táctiles y por qué

El juego es por turnos en una cuadrícula: el astronauta camina casilla a casilla, mira una casilla y actúa sobre ella. Por eso el control principal es **el propio mapa**, no una copia del teclado:

1. **Tocar el mapa (control principal).** Al tocar una casilla libre, el astronauta camina hasta ella por un camino libre. Al tocar un mineral, la niebla, un edificio o una roca, camina hasta su lado y la mira. Si se toca la casilla que ya mira, se ejecuta la acción (recoger, explorar, reparar, construir). Es lo más natural en una cuadrícula y lo que entiende un niño sin explicación.
2. **Cruceta pequeña abajo a la izquierda (precisión).** Tocar gira y mantener camina, igual que WASD. Sirve en teléfonos, donde las casillas son pequeñas.
3. **Botones de pulgar abajo a la derecha.** Un botón grande ✋ **Acción** que muestra qué hará (por ejemplo «Recoger mineral · 1 PA»), y ⚒ Herramientas, 🏠 Base, 📓 Diario y 🌙 Finalizar día. ⏸ Pausa queda arriba a la derecha.

Se descartó un joystick analógico: el movimiento es por casillas y un joystick haría pasos imprecisos.

Detalles:

- Multitáctil: cada flecha sigue su propio dedo (`pointerId`) y captura el puntero.
- Al perder el foco, ocultar la página, abrir el aviso de girar o cambiar a PC, se suelta todo: nunca queda una tecla pulsada.
- Sin zoom, selección de texto ni desplazamiento accidental (`touch-action`, `user-select`, `overscroll-behavior`).
- Los controles solo aparecen en Móvil/Tablet, en los mapas de la Luna y Marte, y nunca con un diálogo abierto.
- En la Tierra, el mapa no usa caminata y los toques actúan como clics.

## 4. Interfaz en Móvil/Tablet

- La pantalla ocupa todo el alto visible (`100dvh`) y respeta las áreas seguras (`env(safe-area-inset-*)`, `viewport-fit=cover`).
- En la misión, la pista del mapa pasa al centro, entre la cruceta y los botones. Se ocultan los duplicados de los botones táctiles: la barra inferior, Acciones, Diario y la tecla E.
- Botones de menús y diálogos con un mínimo de 36–44 px de alto.
- Se oculta el aviso «pensado para pantallas más anchas», que es para ventanas de PC.
- Las tabletas (al menos 1000 × 640) usan botones táctiles algo más grandes.

## 5. Orientación y pantalla completa

- En vertical aparece «Gira tu dispositivo», con un teléfono animado que gira (fijo si el movimiento está reducido), y la partida queda tapada hasta que la pantalla esté en horizontal. Se detecta solo, con `matchMedia('(orientation: portrait)')` y `orientationchange`. Incluye un botón «Volver al modo PC».
- No depende de `screen.orientation.lock()`: se intenta solo dentro de pantalla completa y, si el navegador lo rechaza (Safari en iOS), la guía basta.
- La pantalla completa se pide en el mismo toque que elige Móvil/Tablet, el único momento en que el navegador la permite. Si no está disponible (iPhone), aparece un consejo: «Compartir → Añadir a pantalla de inicio». Al volver a PC se sale de la pantalla completa solo si la activó el juego.

## 6. Pruebas

Automáticas (`tests/ui/platform.test.ts`): modo por defecto, que no se restaura en una sesión nueva, y catálogo táctil completo en los dos idiomas. Se ejecutan con todo el resto (`npm test`).

En navegador, con emulación de tamaño de pantalla:

| Escenario | Resultado |
| --- | --- |
| Escritorio, PC | Experiencia original: textos de teclado, barra inferior, sin controles táctiles |
| 844 × 390, Móvil/Tablet | Controles táctiles visibles; toque en mineral → camina y lo mira; ✋ Acción lo recoge |
| 844 × 390, cruceta | Mantener ◀ gira y camina hasta el borde de la niebla |
| 390 × 844, Móvil/Tablet | Guía «Gira tu dispositivo» |
| 1180 × 820, Móvil/Tablet | Diseño de tableta |
| Cambio a PC desde Opciones a mitad de partida | Vuelven teclas y textos, desaparecen los controles, la partida sigue |
| 20 cambios seguidos PC ↔ Móvil | Un solo juego de controles, sin listeners duplicados |

Pendiente de validar en dispositivos reales: Android Chrome, iPhone Safari, iPad y PC con pantalla táctil. En particular, la pantalla completa y el bloqueo de orientación, que no se pueden probar con emulación.
