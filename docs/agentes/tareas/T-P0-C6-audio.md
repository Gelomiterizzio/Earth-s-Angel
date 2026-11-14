# T-P0-C6 · Audio P0: gestor, música y efectos

| Campo | Valor |
| --- | --- |
| ID | T-P0-C6 |
| Prioridad · hito | P0 · H4 |
| Perfil recomendado | [Arte y audio](../prompts/arte-y-audio.md) |
| Responsable · revisor | C · A |
| Base Git | Rama `c/p0-c6-audio` desde `main` |
| Estimación | 1,0 h |
| Estado | integrado en P0 y comprobado en Chrome |

## Objetivo

El juego suena: música en el menú y en la Luna, efectos para las acciones principales y alertas, con volúmenes independientes que respetan las opciones.

## Componentes

[audio](../../componentes/audio.md)

## Contexto a leer

1. [audio](../../componentes/audio.md)
2. [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md), manifiesto sonoro
3. [arranque-y-escenas](../../componentes/arranque-y-escenas.md): `AudioApi`, `Options`
4. [ARQUITECTURA.md](../../ARQUITECTURA.md), sección 8: eventos

## Dependencias

A2 (tipos y eventos). A cablea `createAudio` en `main.ts`.

## Rutas

- **Permitidas:** `src/audio/**`, `public/assets/audio/**`, `docs/ARTE-Y-ACTIVOS.md` (estado), sección de C en `docs/IA-Y-CREDITOS.md`.
- **Excluidas:** `src/core`, `src/app`, `src/ui`.

## Contratos

`createAudio(options): AudioApi` en `src/audio/index.ts`. El gestor se suscribe a los eventos del juego y del flujo por su cuenta: nadie más llama a `playSfx` salvo la interfaz para los clics.

## Pasos de implementación

1. `audio-manager.ts`: un `AudioContext` con tres nodos de ganancia: general, música y efectos. Los volúmenes vienen de las opciones y cambian al instante.
2. **Desbloqueo:** el contexto se crea o se reanuda en la primera interacción del jugador. Antes de eso, las llamadas se ignoran sin error.
3. `synth.ts`: efectos generados con osciladores y envolventes cortas. Es el plan sin archivos y cubre todos los efectos de P0.
4. Música: si existe el archivo OGG del manifiesto, se carga y se reproduce en bucle. Si no existe, suena un colchón ambiental generado. El juego nunca falla por un archivo de audio ausente.
5. Transición entre pistas con fundido de 800 ms. Con movimiento reducido el fundido se mantiene: no es movimiento.
6. `manifest.ts`: tabla de evento a sonido:

| Evento | Sonido |
| --- | --- |
| Clic en botón | `sfx-click` |
| `building/placed` | `sfx-build` |
| `action/rejected` | `sfx-error` |
| `tile/explored` | `sfx-explore` |
| `resource/collected` | `sfx-collect` |
| `day/ended` | `sfx-day-end` |
| `harvest/done` | `sfx-produce` |
| `decision/required` | `sfx-alert-radiation` |
| `alert/shortage` | `sfx-alert-shortage` |
| `objective/met` | `sfx-objective` |
| `mission/victory` | `sfx-victory` |
| `mission/defeat` | `sfx-defeat` |

7. Música por escena: `titulo`, `dificultad`, `opciones` → `music-menu`. `cinematica` → `music-cinematic`. `mision` en la Luna → `music-moon`. `despedida` → silencio.
8. Silencio: baja la ganancia general a 0 sin detener nada.
9. Al ocultarse la pestaña, se suspende el contexto; al volver, se reanuda.

## Entregables

Gestor de audio, efectos sintetizados, música del menú y de la Luna.

## Pruebas

Manuales M-AUD-01 a M-AUD-05 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Sin interacción previa no suena nada y no hay errores de consola.
- [ ] Los tres controles de volumen actúan al instante y de forma independiente.
- [ ] La alerta de radiación suena y además se ve en pantalla.
- [ ] Al pasar del menú a la misión la música cambia con fundido.
- [ ] Sin archivos en `public/assets/audio`, el juego suena con el sintetizador.
- [ ] Todo audio generado con IA está reconocido en créditos y en los metadatos del archivo.

## Evidencia

Lista de sonidos implementados y captura de la consola limpia.

## Condiciones de integración

Fusionado antes de H4 (domingo 09:00).

**Recorte previsto:** solo efectos sintetizados y un colchón ambiental. La música compuesta queda para después.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final), más origen y licencia de cada pista.
