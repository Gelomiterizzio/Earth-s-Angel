# Menú de opciones

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-03 |
| Prioridad · fase | P0 (audio, idioma, subtítulos, movimiento) · P1 (pantalla completa, lista completa) |
| Objetivo | Ajustar audio, idioma y accesibilidad sin afectar a la partida. |
| Responsabilidad | `src/ui/screens/options.ts` (C), `src/app/options.ts` (A) |
| Depende de | [arranque-y-escenas](arranque-y-escenas.md) (`Options`), [persistencia](persistencia.md), [audio](audio.md), [controles](controles.md) |
| No incluye | Guardado de la partida. |
| Responsable · revisor | C · A |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

Pantalla de la escena `opciones`. Se abre desde el título y desde la pausa, y **Volver** regresa a donde se abrió.

Cada control llama a `ctx.options.set(clave, valor)`. El servicio valida, guarda en `ea.options.v1` y emite `options/changed`. No hay botón Guardar: todo se aplica al instante.

**Las opciones no forman parte de `GameState`.** Cambiarlas en mitad de una misión no altera ni un campo de la partida.

### Controles

| Opción | Control | Por defecto | Fase |
| --- | --- | --- | --- |
| Volumen general | Deslizador 0 a 100 | 80 | P0 |
| Volumen de música | Deslizador | 60 | P0 |
| Volumen de efectos | Deslizador | 80 | P0 |
| Silencio | Interruptor | No | P0 |
| Idioma | English · Español | English | P0 |
| Subtítulos | Interruptor | **Sí** | P0 |
| Movimiento reducido | Interruptor | Lo que indique el sistema | P0 |
| Tutorial | Interruptor | Sí | P0 |
| Pregunta de aprendizaje | Interruptor | Sí | P0 |
| Mapa aleatorio (partidas nuevas): hielo y minerales en otros lugares, decididos por la semilla. No afecta a las presentaciones X, Z y V, que siempre usan el mapa estándar | Interruptor | Sí | EARTH'S ANGEL 2 |
| Pantalla completa | Interruptor, solo si el navegador lo permite | No | P1 |
| Controles | Lista de teclas, solo lectura | — | P0 |
| Restablecer | Botón con confirmación | — | P0 |
| Volver | Botón | — | P0 |

## 3. Datos y uso

- **Deslizadores:** `input type="range"`, pasos de 5, con el valor en texto. Flechas izquierda y derecha ajustan. Al soltar el de efectos suena `sfx-click` como prueba.
- **Silencio:** baja la ganancia general a 0 y conserva los tres volúmenes.
- **Idioma:** cambia todos los textos visibles al momento, también subtítulos y HUD.
- **Movimiento reducido:** añade la clase `reduced-motion` a `#stage`. Detalle en [hud-y-accesibilidad](hud-y-accesibilidad.md).
- **Pantalla completa:** `requestFullscreen` sobre `#stage`. Si el navegador lo rechaza, el interruptor vuelve a su posición y aparece un aviso. Si el jugador sale con Esc, la opción se actualiza.
- **Claves de texto:** `ui.options.*`.

### Casos límite

- Opciones abiertas desde la pausa: la misión sigue detrás, intacta y detenida.
- Restablecer: vuelve a los valores por defecto y no toca la partida ni los contadores de aprendizaje.
- `localStorage` bloqueado: las opciones funcionan durante la sesión y se pierden al cerrar.

## 4. Implementación delegable

**Tareas:** [T-P0-C1](../agentes/tareas/T-P0-C1-menus-y-sistema-visual.md) (pantalla) y [T-P0-A5](../agentes/tareas/T-P0-A5-flujo-y-opciones.md) (servicio). Pantalla completa en T-P1-C2.

**Prompt breve:**

```text
Implementa src/ui/screens/options.ts según docs/componentes/menu-opciones.md: un control por
fila de la tabla P0, aplicado al instante con ctx.options.set, sin botón Guardar. Volver regresa
a la escena desde la que se abrió.
```

**Pruebas:** M-MEN-04 a M-MEN-06 y U-OPC-01 a U-OPC-04 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** los tres volúmenes actúan por separado; el idioma cambia sin recargar; las opciones siguen tras recargar; cambiar cualquier opción durante una misión deja `GameState` idéntico.

**Evidencia:** captura de la pantalla y prueba de persistencia.

**Terminado cuando:** las opciones se abren desde el título y desde la pausa.

**Riesgos:** estados desincronizados entre la pantalla y el servicio. Mitigación: la pantalla se suscribe al servicio y nunca guarda copia.
