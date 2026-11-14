# T-P0-C4 · Cinemática de apertura, tutorial y comprobación de aprendizaje

| Campo | Valor |
| --- | --- |
| ID | T-P0-C4 |
| Prioridad · hito | P0 · H4 |
| Perfil recomendado | [Interfaz](../prompts/interfaz.md) |
| Responsable · revisor | C · A |
| Base Git | Rama `c/p0-c4-cinematica` desde `main` |
| Estimación | 1,5 h |
| Estado | integrado en la misión lunar. Apertura, controles y tutorial inicial comprobados |

## Objetivo

La historia se presenta con una apertura que se puede saltar, el jugador aprende a jugar con un tutorial por pasos y puede consultar las tarjetas científicas cuando quiera.

## Componentes

[motor-cinematicas](../../componentes/motor-cinematicas.md) · [gestor-narrativa](../../componentes/gestor-narrativa.md) · [tutorial-y-tarjetas-cientificas](../../componentes/tutorial-y-tarjetas-cientificas.md) · [comprobacion-de-aprendizaje](../../componentes/comprobacion-de-aprendizaje.md)

## Contexto a leer

1. [motor-cinematicas](../../componentes/motor-cinematicas.md)
2. [GUION-CINEMATICAS.md](../../GUION-CINEMATICAS.md), secuencia de apertura
3. [tutorial-y-tarjetas-cientificas](../../componentes/tutorial-y-tarjetas-cientificas.md)
4. [comprobacion-de-aprendizaje](../../componentes/comprobacion-de-aprendizaje.md)

## Dependencias

A5 (flujo y `completeCinematic`) y B6 (textos de tarjetas y pasos). Las viñetas vienen de C5; sin ellas se usan paneles de color con texto.

## Rutas

- **Permitidas:** `src/ui/cinematics/**`, `src/ui/screens/cinematic.ts`, `src/ui/panels/tutorial.ts`, `science-card.ts`, `learning-check.ts`, `src/data/i18n/*/ui.json`, `src/styles/screens.css`.
- **Excluidas:** `src/data/content` (los textos de tarjetas y pasos son de B), `src/core`, `src/app`.

## Contratos

- El guion de cada secuencia es un JSON en `src/ui/cinematics/scripts/`, con el formato de [motor-cinematicas](../../componentes/motor-cinematicas.md).
- Al terminar o saltar se llama a `ctx.flow.completeCinematic(id)`. El reproductor no cambia el estado del juego.
- El tutorial lee `tutorial.json` y `cards.json` de `ctx.data`.

## Pasos de implementación

1. `player.ts`: reproduce una lista de escenas. Cada escena: capas de imagen con posición y escala inicial y final, duración, clave de narración y transición.
2. Subtítulos siempre visibles salvo que la opción esté desactivada. Texto grande sobre banda oscura.
3. Botón **«Skip (Enter)»** abajo a la derecha, visible desde el primer instante, alcanzable con Tab y con ratón. La tecla Enter hace lo mismo.
4. Fin natural, botón y tecla llaman a la misma función, que detiene todo y llama a `completeCinematic` **una vez**.
5. Movimiento reducido: sin paneos ni zoom; las escenas cambian por corte y cada una se queda fija su duración.
6. Si falta una imagen, la escena muestra un panel de color con el texto. La secuencia nunca se bloquea.
7. `scripts/intro.json`: las seis escenas de la apertura del guion.
8. `tutorial.ts`: evalúa los disparadores de `tutorial.json` cuando cambia el estado. Un paso muestra un globo junto al elemento resaltado, con el texto y un botón "Entendido". Se puede omitir todo el tutorial. Un paso visto no vuelve a salir en esa partida.
9. `science-card.ts`: lista de tarjetas desbloqueadas y vista de una tarjeta con su etiqueta y su fuente. Se abre con el botón de ayuda del HUD.
10. `learning-check.ts`: una pregunta de tres opciones antes de la misión y la misma al final. Guarda solo contadores agregados en `ea.learning.v1`. Sin nombres ni datos personales. Se puede omitir y se puede desactivar en opciones.

## Entregables

Reproductor de cinemáticas, apertura, tutorial, visor de tarjetas y comprobación de aprendizaje.

## Pruebas

Manuales M-CIN-01 a M-CIN-06, M-TUT-01 a M-TUT-04 y M-APR-01 a M-APR-03 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] La apertura dura 45 segundos o menos y se salta con Enter y con el botón.
- [ ] Pulsar Enter cinco veces seguidas lleva a la misión una sola vez.
- [ ] Saltar en el último instante, cuando la secuencia ya terminaba, no rompe nada.
- [ ] Los subtítulos aparecen en el idioma elegido.
- [ ] Con movimiento reducido no hay paneos.
- [ ] El tutorial introduce un sistema por paso y se puede omitir.
- [ ] La comprobación de aprendizaje no pide ni guarda ningún dato personal.

## Evidencia

Capturas de una escena con subtítulo, de un paso del tutorial y de una tarjeta.

## Condiciones de integración

Fusionado antes de H4 (domingo 09:00).

**Recorte previsto:** si falta tiempo, la apertura queda en una sola viñeta con tres frases, y la comprobación de aprendizaje se desactiva por defecto.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
