# Guion de cinemáticas

Guion, storyboard, textos localizables, música y transiciones de las cinco secuencias. Toda la historia es `ficción`. [Reproductor y controles](componentes/motor-cinematicas.md).

## Reglas comunes

| Tema | Regla |
| --- | --- |
| Formato | Viñetas originales de 640 × 360 en pixel art, encajadas en 16:9 sobre la banda de subtítulos |
| Capas | Hasta tres por escena: fondo, medio y primer plano. Se mueven a distinta velocidad para dar profundidad |
| Cámara | Paneo y zoom lentos dentro del margen de la ilustración |
| Transiciones | Fundido de 400 ms o corte |
| Música | `music-cinematic` en la apertura, `music-transit` rumbo a Marte, `music-portal` en el portal y `music-ending` en los finales |
| Narración | Texto localizable, clave `ui.cine.<secuencia>.<n>`. Sin voz grabada |
| Subtítulos | Activados por defecto. Una o dos frases por escena, 15 palabras como máximo cada una |
| Saltar | **«Saltar (Intro)»** / **«Skip (Enter)»** abajo a la derecha, desde el primer instante. Enter y el botón hacen lo mismo que ver la escena completa |
| Movimiento reducido | Sin paneos ni zoom. Cambio por corte |
| Personas | Siluetas con traje y casco, sin rostro. Ninguna persona real |
| Marcas | Ningún logotipo, bandera ni identificador de misión |
| Crisis | Sin imágenes gráficas: ríos bajos, luces que se apagan, cielo turbio |
| IA | Procedencia en créditos y metadatos. La entrega oficial exige identificación visible. |

Ver o saltar una secuencia **nunca** cambia el estado del juego ([progresion](componentes/progresion.md)).

## 1. Apertura · `intro` · P0 · 45 s

| Nº | Dur. | Composición y capas | Cámara | Transición | Narración (ES) | Narration (EN) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 7 s | Fondo: estrellas. Medio: la Tierra azul. Frente: nubes finas | Zoom lento hacia dentro | Fundido | La Tierra fue siempre nuestro hogar. | Earth has always been our home. |
| 2 | 8 s | Fondo: cielo que se enturbia. Medio: montañas y bosque ralo. Frente: río con poco caudal | Paneo a la derecha | Fundido | La cuidamos poco. El agua bajó, los bosques se apagaron y el cielo cambió. | We took poor care of it. Rivers shrank, forests faded and the sky changed. |
| 3 | 7 s | Fondo: ciudad de noche. Medio: ventanas que se apagan una a una. Frente: siluetas en fila ante una fuente | Fija | Fundido | Las ciudades empezaron a quedarse sin lo necesario. | Cities began to run short of what they needed. |
| 4 | 8 s | Fondo: sala con un mapa de la Luna y Marte. Medio: mesa de trabajo. Frente: cuatro siluetas con traje | Zoom lento hacia fuera | Fundido | Así nació el Proyecto Last Hope: aprender a vivir sin desperdiciar nada. Cuatro tripulantes fueron elegidos. | So Project Last Hope was born: learning to live without wasting anything. Four crew members were chosen. |
| 5 | 7 s | Fondo: cielo del amanecer. Medio: la nave despegando. Frente: humo en la base | Paneo hacia arriba | Corte | Su nave, la *Ángel*, partió hacia la Luna. | Their ship, the *Angel*, set out for the Moon. |
| 6 | 8 s | Fondo: cielo negro con la Tierra pequeña. Medio: horizonte lunar. Frente: la nave posada | Zoom lento a la nave | Fundido a la misión | Primera misión: construir un refugio donde nada falte. La Tierra cuenta los días. | First mission: build a shelter where nothing runs out. Earth is counting the days. |

Sonido: `sfx-radio` en la escena 4, `sfx-launch` en la 5 y `sfx-landing` en la 6. Al terminar o saltar: escena `mision`, día 1.

**Versión recortada** si falta tiempo: solo la escena 6 con tres frases: "La Tierra necesita ayuda. El Proyecto Last Hope envía cuatro tripulantes a la Luna. Tu misión: construir un refugio donde nada falte."

## 2. Luna → Marte · `moonToMars` · P1 · 36 s

La transición y el bono ya están aplicados y guardados cuando empieza.

| Nº | Dur. | Composición y capas | Cámara | Transición | Narración (ES) | Narration (EN) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 7 s | Fondo: cielo lunar. Medio: la base con paneles, invernadero y refugio iluminados | Paneo a la derecha | Fundido | La base lunar ya funciona por sí sola. | The Moon base now runs on its own. |
| 2 | 6 s | Interior del hábitat. Cuatro siluetas con los brazos en alto | Fija | Fundido | La tripulación lo celebra. | The crew celebrates. |
| 3 | 8 s | La Tierra a un lado y un contador de días que sube | Zoom suave | Fundido | Lo que aprendieron ya ayuda en casa. La Tierra gana {bonus} días. | What they learned is already helping at home. Earth gains {bonus} days. |
| 4 | 7 s | La nave se aleja de la Luna hacia un punto rojo | Paneo siguiendo a la nave | Fundido | Con ese tiempo, la *Ángel* parte hacia Marte. | With that time, the *Angel* sets out for Mars. |
| 5 | 8 s | Fondo: cielo anaranjado. Medio: llanura con polvo en el aire. Frente: la nave posada | Zoom lento | Fundido a la misión | Marte está más lejos. Hay polvo, y las señales tardan en llegar. Empieza una nueva misión. | Mars is farther away. There is dust, and signals take time to arrive. A new mission begins. |

El tiempo ganado es ficción y la escena 3 lo presenta como parte de la historia. `{bonus}` sale del balance.

## 3. Victoria ordinaria · `marsVictory` · P1 · 30 s

| Nº | Dur. | Composición y capas | Cámara | Transición | Narración (ES) | Narration (EN) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 8 s | Colonia marciana: cúpulas, paneles limpios, antena | Paneo a la derecha | Fundido | La colonia de Marte funciona. | The Mars colony is working. |
| 2 | 7 s | Seis siluetas mirando el horizonte al amanecer | Fija | Fundido | Aquí empieza una nueva etapa. | A new chapter begins here. |
| 3 | 7 s | Cielo marciano con un punto azul | Zoom lento al punto | Fundido | Desde aquí, la Tierra es un punto azul. | From here, Earth is a small blue dot. |
| 4 | 8 s | La Tierra llena la viñeta | Zoom lento hacia fuera | Fundido a créditos | Aprendimos a vivir sin desperdiciar nada. Cuidar la Tierra sigue siendo tarea de todos. | We learned to live without wasting anything. Caring for Earth is still everyone's job. |

Si se llega aquí tras fallar en la Tierra, la escena 1 añade: "Volvimos a Marte. La Tierra sigue necesitando ayuda."

## 4. Ruta secreta y victoria terrestre · P2

### 4a. Ruta secreta · `wormhole` · 30 s

Se reproduce después de que el jugador elige entrar al portal. La transición ya está aplicada.

| Nº | Dur. | Composición y capas | Cámara | Transición | Narración (ES) | Narration (EN) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 7 s | Dos balizas que emiten luz. Un anillo se abre sobre el laboratorio | Zoom lento | Fundido | Las dos balizas despiertan a la vez. Algo se abre sobre el laboratorio. | Both beacons wake at once. Something opens above the lab. |
| 2 | 7 s | La tripulación, de espaldas, ante el anillo | Fija | Fundido | La tripulación decide cruzar. | The crew decides to cross. |
| 3 | 8 s | Túnel de luz. Con movimiento reducido, imagen fija | Avance lento | Fundido | El paso lleva al pasado de la Tierra. | The passage leads to Earth's past. |
| 4 | 8 s | Paisaje terrestre todavía verde, con las primeras señales de daño | Paneo a la derecha | Fundido a la misión | Aquí todavía hay tiempo. Proyecto Segunda Oportunidad. | Here, there is still time. Project Second Chance. |

Sonido: `sfx-portal` en la escena 1. Rótulo fijo en las cuatro escenas: "El viaje en el tiempo es parte de la historia."

### 4b. Victoria terrestre · `earthVictory` · 32 s

| Nº | Dur. | Composición y capas | Cámara | Transición | Narración (ES) | Narration (EN) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 8 s | Paneles en los tejados, una planta de reciclaje, agua que se reutiliza | Paneo a la derecha | Fundido | Lo que mantuvo viva a la base ahora cuida la Tierra. | What kept the base alive now cares for Earth. |
| 2 | 8 s | El río recupera caudal y los árboles vuelven | Fundido entre dos estados | Fundido | Poco a poco, los ecosistemas regresan. | Little by little, ecosystems return. |
| 3 | 8 s | Una ciudad con verde, luces encendidas y cielo limpio | Zoom lento hacia fuera | Fundido | La civilización vuelve a prosperar. | Civilization thrives again. |
| 4 | 8 s | La Tierra desde el espacio, luminosa | Fija | Fundido a créditos | El futuro comienza aprendiendo a cuidar nuestro hogar. Todavía estamos a tiempo de proteger la Tierra. | The future begins by learning to care for our home. We still have time to protect Earth. |

## Tiempos

| Secuencia | Escenas | Duración | Fase |
| --- | --- | --- | --- |
| Apertura | 6 | 45 s | P0 |
| Luna → Marte | 5 | 36 s | P1 |
| Victoria ordinaria | 4 | 30 s | P1 |
| Ruta secreta | 4 | 30 s | P2 |
| Victoria terrestre | 4 | 32 s | P2 |

## Cómo se evita duplicar efectos

Definido en [ARQUITECTURA.md](ARQUITECTURA.md#9-máquina-de-estados-del-flujo) y [componentes/progresion.md](componentes/progresion.md):

1. El cambio de estado se aplica y se guarda **antes** de reproducir.
2. Fin natural, botón y tecla llaman a una sola función con cerrojo.
3. `flow.completeCinematic` tiene su propio cerrojo.
4. Tras una recarga, el flujo lee el guardado y entra a la misión que corresponde.

Con esto, una pulsación repetida, una recarga o el fin natural no duplican recompensas, saltos de nivel ni cambios de estado.

## Producción

Las 23 viñetas están en `public/assets/cinematics/` y los cinco guiones de reproducción en `src/ui/cinematics/scripts/`. Ejecuta `node tools/write-scripts.mjs` para volver a exportar los guiones. La nave Ángel, la Tierra y la tripulación comparten diseño entre planos. [Manifiesto visual](ARTE-Y-ACTIVOS.md).

Los destinos del storyboard se pueden revisar desde los accesos de prueba del menú. La aplicación del bono, el guardado y el salto de nivel de campaña requieren la integración de A y B. [Accesos de la vista previa](DESPLIEGUE.md#vista-previa-de-interfaz).
