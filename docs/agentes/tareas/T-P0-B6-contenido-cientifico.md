# T-P0-B6 · Tarjetas científicas, textos del tutorial y verificación de balance

| Campo | Valor |
| --- | --- |
| ID | T-P0-B6 |
| Prioridad · hito | P0 · H4 |
| Perfil recomendado | [Ciencia y datos](../prompts/ciencia-y-datos.md) |
| Responsable · revisor | B · C |
| Base Git | Rama `b/p0-b6-contenido` desde `main` |
| Estimación | 1,5 h |
| Estado | propuesto |

## Objetivo

El juego explica su ciencia con tarjetas cortas y un tutorial por pasos, en inglés y español, y B ha jugado las tres dificultades de principio a fin.

## Componentes

[tutorial-y-tarjetas-cientificas](../../componentes/tutorial-y-tarjetas-cientificas.md) · [dificultad-y-balance](../../componentes/dificultad-y-balance.md) · [comprobacion-de-aprendizaje](../../componentes/comprobacion-de-aprendizaje.md)

## Contexto a leer

1. [tutorial-y-tarjetas-cientificas](../../componentes/tutorial-y-tarjetas-cientificas.md): lista de tarjetas y pasos
2. [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md): secciones 3, 5 y 6
3. [niveles/luna.md](../../niveles/luna.md): recorridos

## Dependencias

B1. La espera C4, que construye los componentes que muestran estos textos.

## Rutas

- **Permitidas:** `src/data/content/cards.json`, `src/data/content/tutorial.json`, `src/data/i18n/*/content.json`, `tests/data/content.test.ts`, `docs/CIENCIA-Y-DATOS.md`.
- **Excluidas:** `src/ui`, `src/core`.

## Contratos

Formato de `cards.json` y `tutorial.json` en [tutorial-y-tarjetas-cientificas](../../componentes/tutorial-y-tarjetas-cientificas.md).

## Pasos de implementación

1. `cards.json`: las tarjetas P0 de la ficha. Cada una con `id`, claves de título y texto, etiqueta (`nasa`, `didactic`, `balance`, `fiction`), y fuente con enlace si la etiqueta es `nasa`.
2. `tutorial.json`: los pasos de la ficha con su disparador, el elemento del HUD que resaltan y la tarjeta que desbloquean.
3. `content.json` en inglés y español: tarjetas, pasos, nombres y descripciones de edificios, "por qué construirlo", avisos de eventos, pregunta de la comprobación de aprendizaje.
4. Revisión de lenguaje: frases de 15 palabras o menos, tarjetas de 60 palabras o menos, cada término explicado.
5. **Cada afirmación `dato NASA` se comprueba abriendo su fuente.** Lo que no se pueda comprobar baja a `transformación didáctica` o se quita. En particular: hielo lunar y retraso de comunicaciones están "por verificar" en [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md).
6. Prueba: toda clave citada en `cards.json` y `tutorial.json` existe en los dos idiomas.
7. **Verificación de balance:** jugar en el navegador Fácil, Media e Imposible siguiendo los recorridos. Después, una partida libre en Media sin mirar el recorrido. Anotar: día de victoria, momentos confusos, números que se sienten injustos.
8. Si un valor debe cambiar, proponerlo a A con el motivo. No se cambia sin volver a ejecutar las pruebas de recorrido.

## Entregables

Tarjetas, tutorial y textos en dos idiomas. Notas de la verificación de balance.

## Pruebas

D-CON-01 a D-CON-03 y manual M-BAL-01 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Hay al menos seis tarjetas: energía y baterías, agua que vuelve, aire del agua, comida que crece, tormenta solar, retraso de las señales.
- [ ] Cada tarjeta muestra su etiqueta. Las de `dato NASA` tienen enlace que abre.
- [ ] Ninguna tarjeta presenta un valor de balance como dato real.
- [ ] Todas las claves existen en inglés y español.
- [ ] Las tres dificultades se ganaron en el navegador en los días documentados.

## Evidencia

Salida de `npm test`, notas de juego y lista de fuentes abiertas con fecha.

## Condiciones de integración

Fusionado antes de H4 (domingo 09:00). El balance se congela en H3: después solo se cambia un número si impide ganar.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final), más la lista de afirmaciones verificadas y las retiradas.
