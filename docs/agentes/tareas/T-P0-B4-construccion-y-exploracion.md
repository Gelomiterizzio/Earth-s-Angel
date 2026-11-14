# T-P0-B4 · Construcción, exploración y recolección en el mapa

| Campo | Valor |
| --- | --- |
| ID | T-P0-B4 |
| Prioridad · hito | P0 · H3 |
| Perfil recomendado | [Jugabilidad](../prompts/jugabilidad.md) |
| Responsable · revisor | B · A |
| Base Git | Rama `b/p0-b4-construccion` desde `main` |
| Estimación | 2,0 h |
| Estado | propuesto |

## Objetivo

El jugador construye, explora y recolecta haciendo clic o con el teclado, ve antes de confirmar si la acción es válida y entiende por qué no lo es.

## Componentes

[construccion](../../componentes/construccion.md) · [mapa](../../componentes/mapa.md)

## Contexto a leer

1. [construccion](../../componentes/construccion.md)
2. [mapa](../../componentes/mapa.md), secciones de exploración y recolección
3. [ARQUITECTURA.md](../../ARQUITECTURA.md): `Tool`, `previewAction`, `ActionError`, eventos `building/placed`, `tile/explored`, `resource/collected`, `action/rejected`

## Dependencias

B3 y A3. Con C2 se coordina la paleta: C cambia `uiStore.tool`, tú la lees.

## Rutas

- **Permitidas:** `src/map/**`, `src/data/i18n/*/content.json` (motivos de rechazo propios del mapa, si hacen falta).
- **Excluidas:** `src/core`, `src/ui/hud`.

## Contratos

Acciones `BUILD`, `EXPLORE`, `COLLECT`. Vista previa con `previewAction`. Los mensajes de error vienen del núcleo en `error.messageKey`.

## Pasos de implementación

1. `map-input.ts`: según `uiStore.tool`:
   - `build`: al pasar por una casilla, `previewAction({ type: 'BUILD', ... })`. Casilla válida: borde con ✔ y texto "Listo el día N". Inválida: borde con ✖ y el motivo traducido.
   - `explore`: resalta las casillas sin explorar que tocan a una explorada. Vista previa del bloque de 3 × 3 que se revelará.
   - `collect`: resalta los minerales explorados sin recolectar.
   - `inspect`: muestra qué hay en la casilla.
2. Clic o Enter: despacha la acción. Esc: vuelve a `inspect`.
3. Reacciones a eventos:
   - `building/placed`: efecto de construcción y edificio con andamio.
   - `tile/explored`: la niebla se retira.
   - `resource/collected`: el mineral desaparece y sube un "+15".
   - `action/rejected`: sacudida corta de la casilla y motivo junto al cursor.
4. Con movimiento reducido: sin sacudida ni partículas; el borde cambia de estado y el texto aparece.
5. La herramienta de construir se mantiene tras colocar, para encadenar. Si no quedan puntos de acción o materiales, vuelve a `inspect`.
6. La etiqueta accesible anuncia el resultado: "Panel solar colocado en columna 4, fila 4. Listo el día 2."

## Entregables

Las tres herramientas funcionando con ratón y teclado, con vista previa y motivo de rechazo.

## Pruebas

Manuales M-CON-01 a M-CON-04 y M-EXP-01 a M-EXP-03 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Se puede ejecutar el día 1 del recorrido de Media solo con ratón y solo con teclado.
- [ ] El extractor solo muestra ✔ sobre hielo.
- [ ] Colocar sin materiales no cambia nada y muestra el motivo.
- [ ] Explorar (8,8) revela el hielo de (9,8) y (9,9).
- [ ] Recolectar (3,7) suma 15 materiales en Media.
- [ ] El mapa no calcula reglas por su cuenta: todo pasa por `previewAction` y `dispatch`.

## Evidencia

GIF o capturas de una colocación válida, una inválida, una exploración y una recolección.

## Condiciones de integración

Fusionado antes de H3 (sábado 21:00). C confirma que la paleta del HUD selecciona la herramienta.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
