# T-P0-B5 · Decisión de la tormenta con tarjeta NASA y pronóstico

| Campo | Valor |
| --- | --- |
| ID | T-P0-B5 |
| Prioridad · hito | P0 · H3 |
| Perfil recomendado | [Ciencia y datos](../prompts/ciencia-y-datos.md) |
| Responsable · revisor | B · C |
| Base Git | Rama `b/p0-b5-decision` desde `main` |
| Estimación | 1,5 h |
| Estado | propuesto |

## Objetivo

El día de la tormenta el jugador ve una tarjeta con el evento real de NASA, entiende las dos opciones y su costo, elige, y después ve qué pasó.

**Es el momento central de la demo.** No se recorta.

## Componentes

[radiacion-y-refugio](../../componentes/radiacion-y-refugio.md) · [adaptador-datos-nasa](../../componentes/adaptador-datos-nasa.md) · [eventos-ambientales](../../componentes/eventos-ambientales.md)

## Contexto a leer

1. [radiacion-y-refugio](../../componentes/radiacion-y-refugio.md)
2. [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md#del-registro-a-la-partida): qué se muestra y con qué etiqueta
3. [ciclo-de-dias](../../componentes/ciclo-de-dias.md): fase `decision` y tabla de dos decisiones
4. [arranque-y-escenas](../../componentes/arranque-y-escenas.md): `AppContext`
5. [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md): estilos de panel y reglas de accesibilidad

## Dependencias

B2 y A4. C2 monta el panel desde el HUD.

## Rutas

- **Permitidas:** `src/ui/panels/decision.ts`, `src/data/i18n/*/content.json`, `src/data/content/events.json`.
- **Excluidas:** el resto de `src/ui`, `src/core`. Usa las clases de `src/styles` sin modificarlas; si te falta un estilo, pídeselo a C.

## Contratos

- `export function mountDecisionPanel(root: HTMLElement, ctx: AppContext): () => void`. Devuelve la función de limpieza.
- Se muestra cuando `mission.phase === 'decision'`. Despacha `DECIDE_SHELTER`.
- Datos del registro por `findSepRecord(event.sourceRef)` y `describeSepRecord`.

## Pasos de implementación

1. El panel es un diálogo modal: `role="dialog"`, `aria-modal="true"`, foco atrapado, foco inicial en el título. No se cierra con Esc: hay que decidir.
2. Cabecera: "Tormenta solar hoy" y el nivel con icono y texto.
3. Bloque **dato real de NASA**, con la etiqueta visible:
   - Fecha del evento, clase de la fulguración y región activa, instrumento, minutos entre la fulguración y las primeras partículas.
   - Identificador del registro y enlace que abre en pestaña nueva.
   - Frase fija: "Registro archivado de NASA DONKI. No es un dato en vivo."
4. Bloque **en tu base**, con la etiqueta "valores del juego": lo que pasa con cada opción.
5. Dos botones grandes con su costo, calculado con `previewEnergy` y los valores de balance:
   - **Refugiar a la tripulación:** "Gasta N de energía. Hoy no se construye ni se explora. Exposición +N."
   - **Seguir trabajando:** "Conservas tus N acciones. Exposición +N."
6. Si no hay refugio operativo o no alcanza la energía, el primer botón queda deshabilitado con el motivo visible: "Aún no tienes refugio" o "Faltan N de energía".
7. Al elegir, despacha `DECIDE_SHELTER` con `day` actual. Si el núcleo rechaza, muestra el motivo.
8. Pronóstico: textos de aviso dos días antes ("Región activa vigilada") y un día antes ("Alerta: partículas en camino"), con claves en `content.json`. El HUD de C los pinta.
9. Texto para el informe del día siguiente a la decisión: una frase de comparación, por ejemplo "Con refugio: +5 de exposición. Sin refugio habrían sido +50."
10. Todos los textos en inglés y español, con frases de 15 palabras o menos.

## Entregables

Panel de decisión completo, textos de pronóstico y frase de comparación.

## Pruebas

Manuales M-DEC-01 a M-DEC-05 de [PRUEBAS.md](../../PRUEBAS.md). Automática D-NASA-03.

## Criterios de aceptación

- [ ] En Media, día 8, el panel muestra `2017-09-10T16:25:00-SEP-001`, X8.2, región 12673, GOES13 y 50 minutos.
- [ ] El enlace abre la página del registro en DONKI.
- [ ] Las cifras de costo coinciden con [dificultad-y-balance](../../componentes/dificultad-y-balance.md).
- [ ] Sin refugio, la primera opción está deshabilitada y explica por qué.
- [ ] Se puede decidir solo con teclado. El foco no sale del diálogo.
- [ ] El dato real y los valores del juego están visualmente separados y etiquetados.
- [ ] Si el evento es de prueba (`SYNTHETIC`), el panel dice "Datos de prueba" y no muestra enlace.

## Evidencia

Captura del panel en inglés y en español. Esta captura va al formulario de entrega.

## Condiciones de integración

Fusionado antes de H3. C revisa estilo y accesibilidad.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
