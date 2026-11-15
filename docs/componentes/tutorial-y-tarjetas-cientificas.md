# Tutorial y tarjetas científicas

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-09 |
| Prioridad · fase | P0 · H4 |
| Objetivo | Enseñar a jugar introduciendo un sistema cada vez, y explicar la ciencia en tarjetas cortas que se pueden volver a consultar. |
| Responsabilidad | Contenido: `src/data/content/tutorial.json`, `cards.json` y `content.json` (B). Componentes: `src/ui/panels/tutorial.ts` y `science-card.ts` (C) |
| Depende de | [hud-y-accesibilidad](hud-y-accesibilidad.md), [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md), [localizacion](localizacion.md) |
| No incluye | Cinemáticas. Comprobación de aprendizaje. |
| Responsable · revisor | B (contenido) y C (componentes) · C y B |
| Estado | Propuesto. Textos por verificar contra las fuentes en T-P0-B6. |

## 2. Arquitectura y funcionamiento

El tutorial es **contextual y guiado por datos**. Cada paso tiene un disparador; cuando se cumple, aparece un globo junto al elemento que resalta. No bloquea el juego: el jugador puede cerrarlo, omitirlo todo o desactivarlo en Opciones.

### Formatos

```ts
export interface TutorialStep {
  id: string;
  trigger: {
    event: 'day/started' | 'event/forecast' | 'decision/required' | 'streak/changed';
    day?: number;                 // para day/started
    eventType?: EventType;        // para event/forecast
    inDays?: number;
  };
  highlight: string | null;       // atributo data-tutorial del elemento del HUD
  textKey: string;
  completeOn?: GameEvent['type']; // se cierra solo al ocurrir este evento
  unlockCards?: string[];
}

export interface ScienceCard {
  id: string;
  titleKey: string;
  bodyKey: string;
  tag: 'nasa' | 'didactic' | 'balance' | 'fiction';
  source?: { label: string; url: string };   // obligatorio si tag es 'nasa'
  level: LevelId | 'all';
}
```

### Flujo

1. `tutorial.ts` escucha los eventos del almacén. Si un paso sin ver coincide, lo muestra.
2. El globo tiene el texto, **Entendido** y **Omitir tutorial**.
3. Al cerrarse, desbloquea sus tarjetas y avisa: "Nueva tarjeta: Aire del agua".
4. El botón de ayuda del HUD abre la lista de tarjetas desbloqueadas.
5. Los pasos vistos y las tarjetas desbloqueadas viven en memoria durante la partida.

## 3. Datos y uso

### Pasos de la Luna · P0

| ID | Disparador | Resalta | Texto | Se cierra con | Tarjetas |
| --- | --- | --- | --- | --- | --- |
| `t01` | Día 1 | Medidores | "Esta es tu base. Arriba ves energía, soporte vital y protección." | Entendido | — |
| `t02` | Tras `t01` | Paleta: panel | "Sin electricidad nada funciona. Construye un panel solar." | `building/placed` | `power` |
| `t03` | Tras `t02` | Recolectar | "Hay mineral cerca de la nave. Recógelo para tener más materiales." | `resource/collected` | — |
| `t04` | Tras `t03` | Explorar | "Los sensores detectan hielo al sureste. Explora hacia allí." | `tile/explored` | `moonIce` |
| `t05` | Tras `t04` | Finalizar día | "Pulsa Finalizar día para ver qué pasó." | `day/ended` | — |
| `t06` | Día 2 | Paleta: extractor | "Pon un extractor sobre el hielo y un reciclador. Así tendrás agua." | Entendido | `waterLoop` |
| `t07` | Día 3 | Paleta: generador | "El generador saca oxígeno del agua. El invernadero da comida cada 4 días." | Entendido | `airFromWater`, `growFood`, `firstAir` |
| `t08` | Pronóstico: sombra en 2 días | Pronóstico | "Viene poca luz. Una batería guarda energía para ese día." | Entendido | — |
| `t09` | Pronóstico: tormenta en 2 días | Paleta: refugio | "Tormenta solar a la vista. El refugio tarda 2 días: constrúyelo hoy." | Entendido | `solarStorm` |
| `t10` | `decision/required` | Panel de decisión | "Tú decides. Cada opción tiene un costo." | `decision/made` | `signalDelay` |
| `t11` | Racha pasa a 1 | Objetivos | "Día estable. Mantén la racha para completar la misión." | Entendido | — |

Un sistema por paso. Nunca dos globos a la vez.

### Tarjetas · P0

Texto de 60 palabras o menos. La etiqueta se muestra en la tarjeta.

| ID | Título | Texto en español | Etiqueta | Fuente |
| --- | --- | --- | --- | --- |
| `power` | Energía y baterías | Los paneles hacen electricidad con la luz del Sol. Si hay sombra, hacen menos. Las baterías guardan la que sobra para usarla después. | Transformación didáctica | — |
| `waterLoop` | Agua que vuelve | En el espacio el agua se recicla. En la Estación Espacial se recupera cerca del 90 % del agua. Tu base recupera el 75 %: ese número es del juego. | Dato NASA + balance | [ECLSS](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) |
| `airFromWater` | Aire del agua | El agua tiene oxígeno dentro. Con electricidad se puede separar: se llama electrólisis. Así se fabrica oxígeno en la Estación Espacial. | Dato NASA | [ECLSS](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) |
| `growFood` | Comida que crece | Las plantas necesitan agua, luz y tiempo. Si un día les falta algo, la cosecha llega más tarde y es más pequeña. | Transformación didáctica | — |
| `firstAir` | Primero el aire | Sin aire se aguanta muy poco, sin agua algo más y sin comida más todavía. Por eso el juego reparte en ese orden. | Transformación didáctica | — |
| `solarStorm` | Tormenta solar | A veces el Sol lanza partículas muy rápidas. NASA registra esos eventos. El que ves en el juego ocurrió de verdad. La radiación de tu base es un valor del juego. | Dato NASA + balance | [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) |
| `moonIce` | Hielo lunar | En tu misión hay hielo en el suelo de un cráter. De él sale el agua de la base. | Ficción · **por verificar** una fuente NASA antes de presentarlo como hecho | — |
| `signalDelay` | Señales que tardan | Las señales de radio viajan a la velocidad de la luz. Aun así tardan: poco más de un segundo hasta la Luna y varios minutos hasta Marte. | Transformación didáctica · cifras **por verificar** | — |

Versión en inglés de cada texto en `en/content.json`. Ejemplo: `power` → "Solar panels turn sunlight into electricity. In the shade they make less. Batteries store what is left over for later."

### Tarjetas · P1, Marte

| ID | Título | Etiqueta | Fuente |
| --- | --- | --- | --- |
| `sol` | Un sol no es un día | Dato NASA | [Mars24, NASA GISS](https://www.giss.nasa.gov/tools/mars24/help/notes.html) |
| `dustPanels` | Polvo sobre los paneles | Dato NASA + transformación | [InSight, NASA/JPL](https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm/) |
| `sameStormMars` | La misma tormenta, en Marte | Dato NASA | [NASA/JPL, 2017](https://www.jpl.nasa.gov/news/large-solar-storm-sparks-global-aurora-and-doubles-radiation-levels-on-the-martian-surface/) |

### Reglas del contenido

- Cada término técnico se explica en la misma tarjeta.
- Una tarjeta `nasa` sin fuente no se carga.
- Ninguna tarjeta presenta un valor de balance como dato real.
- Sin miedo: la tripulación se protege, no sufre.

### Casos límite

- Jugador que construye antes de leer `t02`: el paso se da por cumplido y se salta.
- Tutorial desactivado: las tarjetas se desbloquean igual, sin globos.
- Elemento resaltado fuera de pantalla: el globo aparece centrado.

## Preguntas rápidas tras el día

`src/ui/panels/day-quiz.ts` ofrece una pregunta opcional al cerrar el informe del día, sobre algo que el jugador acaba de vivir:

| Pregunta | Se ofrece cuando el día cerrado tuvo |
| --- | --- |
| `solarStorm` | radiación mayor que 0 |
| `power` | luz solar por debajo del 100 % |
| `airFromWater` | oxígeno producido |
| `waterLoop` | un reciclador funcionando que recuperó agua consumida |

- Como máximo una pregunta por día, en ese orden de prioridad, y cada una una sola vez por partida y nivel.
- Al cerrar el día 1 se reinicia la lista, para que el siguiente jugador de la demo (misma semilla) vuelva a verlas. Al pulsar Continuar o volver de Opciones no aparece ninguna pregunta.
- Espera a que se cierre cualquier diálogo abierto (refugio, diario).
- Desbloquea la tarjeta, así que la pregunta queda luego en Ayuda.
- No se muestra si la opción «Pregunta de aprendizaje» está desactivada.
- La de tormenta se omite mientras falte la pregunta final de [comprobación de aprendizaje](comprobacion-de-aprendizaje.md), para no adelantar la respuesta.
- Solo lee el informe. No cambia el estado ni la puntuación.

Pruebas: `tests/core/day-quiz.test.ts`.

## En la vida real

Algunas tarjetas tienen un recuadro «En la vida real» con un dato NASA comprobado el 15-nov-2026 en la página enlazada. El texto está en `content.card.<id>.realLife` y la fuente en `cards.json` (`realLife.source`, o la fuente de la propia tarjeta).

| Tarjeta | Dato | Fuente |
| --- | --- | --- |
| `waterLoop` | El ECLSS de la ISS demostró una recuperación de agua cercana al 98 % | [NASA, hito de recuperación de agua](https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/) |
| `airFromWater` | El sistema de generación de oxígeno de la ISS separa el agua por electrólisis | [NASA ECLSS](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) |
| `solarStorm` | La tormenta del juego viene del registro DONKI del 10-sep-2017 | [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) |
| `sol` | Un sol dura en promedio 24 h 39 min 35 s | [Mars24](https://www.giss.nasa.gov/tools/mars24/help/notes.html) |
| `marsDust` | En 2022 una tormenta de polvo bajó la energía de InSight de 425 a 275 Wh por sol | [JPL](https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm/) |
| `sameStormMars` | La tormenta de sep-2017 duplicó con creces el máximo de radiación medido por Curiosity | [JPL](https://www.jpl.nasa.gov/news/large-solar-storm-sparks-global-aurora-and-doubles-radiation-levels-on-the-martian-surface/) |

## 4. Implementación delegable

**Tareas:** [T-P0-B6](../agentes/tareas/T-P0-B6-contenido-cientifico.md) (contenido) y [T-P0-C4](../agentes/tareas/T-P0-C4-cinematica-y-tutorial.md) (componentes).

**Prompt breve:**

```text
Contenido: crea tutorial.json y cards.json con los pasos y tarjetas P0 de
docs/componentes/tutorial-y-tarjetas-cientificas.md y sus textos en inglés y español.
Componentes: src/ui/panels/tutorial.ts evalúa los disparadores y muestra un globo por paso;
science-card.ts lista y muestra las tarjetas con etiqueta y fuente.
```

**Pruebas:** D-CON-01 a D-CON-03 y M-TUT-01 a M-TUT-04 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** los once pasos aparecen en orden en el recorrido de Media; cada tarjeta muestra su etiqueta; las de dato NASA abren su fuente; omitir el tutorial no rompe nada.

**Evidencia:** capturas de un paso y de una tarjeta en cada idioma.

**Terminado cuando:** una persona que no conoce el juego completa el día 1 solo con el tutorial.

**Riesgos:** afirmar algo que la fuente no dice. Mitigación: B abre cada fuente antes de marcar una tarjeta como dato NASA.
