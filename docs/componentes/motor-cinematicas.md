# Motor de cinemáticas

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-07 |
| Prioridad · fase | P0 (apertura) · P1 y P2 (resto) |
| Objetivo | Reproducir secuencias 2D por viñetas, con subtítulos y música, que se puedan saltar sin efectos secundarios. |
| Responsabilidad | `src/ui/cinematics/player.ts`, `src/ui/screens/cinematic.ts`, `src/ui/cinematics/scripts/*.json` |
| Depende de | [arranque-y-escenas](arranque-y-escenas.md) (`completeCinematic`), [gestor-narrativa](gestor-narrativa.md), [audio](audio.md), [localizacion](localizacion.md) |
| No incluye | El guion ([GUION-CINEMATICAS.md](../GUION-CINEMATICAS.md)). Los cambios de estado del juego. |
| Responsable · revisor | C · A |
| Estado | Apertura conectada al flujo real de P0. Las cuatro secuencias posteriores están disponibles en la vista de arte. |

## 2. Arquitectura y funcionamiento

Las cinemáticas son HTML y CSS dentro de `#ui`: capas de imagen que se mueven con transformaciones, y un subtítulo. No usan Phaser ni video.

**Una cinemática no cambia el estado del juego.** Cualquier transición de nivel ya se aplicó y se guardó antes de reproducirla. Por eso verla, saltarla o recargar da el mismo resultado.

### Formato del guion

```ts
export interface CinematicScript {
  id: string;                    // 'intro', 'moonToMars', 'marsVictory', 'wormhole', 'earthVictory'
  music: string;                 // tema de la secuencia
  scenes: CinematicScene[];
}
export interface CinematicScene {
  durationMs: number;
  captionKey: string;            // clave de narración y subtítulo
  background: string;            // color de respaldo si faltan las imágenes
  layers: {
    image: string;               // ruta bajo public/assets/cinematics/
    from: { x: number; y: number; scale: number; opacity: number };
    to:   { x: number; y: number; scale: number; opacity: number };
  }[];
  transition: 'cut' | 'fade';    // cómo entra la escena siguiente
}
```

### Reproducción

1. La pantalla recibe `params.id`. El identificador `opening` del flujo de A selecciona el guion `intro` y se conserva al cerrar la escena.
2. Llama a `audio.playMusic(script.music)`.
3. Por cada escena: coloca las capas en `from`, las anima hasta `to` en `durationMs`, muestra el subtítulo y espera.
4. Al acabar la última escena, llama a `finish()`.

### Saltar

- Botón **«Saltar (Intro)»** / **«Skip (Enter)»** en una banda inferior separada del arte. Enter activa el mismo botón durante la secuencia. Se ignoran la repetición de tecla y los primeros 300 ms.
- El manifiesto Luna → Marte enfoca **Continuar**. El botón de salto sigue disponible durante el manifiesto y se puede enfocar con Tab.
- `finish()` es la única salida. La usan el fin natural, el botón y la tecla:

```text
finish():
  si ya terminó → salir
  marcar como terminada
  cancelar animaciones y temporizadores
  ctx.flow.completeCinematic(id)
```

Dos cerrojos, uno en el reproductor y otro en `flow`: una pulsación repetida, o el fin natural que llega justo después de saltar, navegan una sola vez.

## 3. Datos y uso

| Dato | Valor |
| --- | --- |
| Tamaño de viñeta | 640 × 360, encajada en 16:9 sobre la banda inferior |
| Duración de la apertura | 45 segundos o menos |
| Movimientos | Paneo y zoom lentos; fundidos de 400 ms |
| Música | Una pista por tipo de secuencia: apertura, viaje, portal o cierre |

- **Subtítulos:** activados por defecto. Banda inferior de contraste alto, con texto de 24 unidades a 1280 × 720 y una columna propia para Saltar.
- **Movimiento reducido:** planos fijos centrados y cambios por corte con la opción del juego o del sistema.
- **Imagen ausente:** se muestra el color `background` y el subtítulo. La secuencia sigue.
- **Marca de agua:** la presentación local omite rótulos del arte. El material de entrega debe seguir las reglas de identificación del evento.
- **Accesibilidad:** el subtítulo vive en una región `aria-live="polite"`. El foco inicial está en el botón de saltar.

### Casos límite

- Pestaña en segundo plano. El reloj del reproductor se pausa y continúa al volver.
- Cambio de idioma durante la escena. El subtítulo siguiente muestra el nuevo idioma.
- Recarga a mitad de la apertura en P0: vuelve al título. En P1, con guardado, entra a la misión.
- Enter mantenido al entrar desde la pantalla anterior: se ignoran las pulsaciones de los primeros 300 ms.

## 4. Implementación delegable

**Tarea:** [T-P0-C4](../agentes/tareas/T-P0-C4-cinematica-y-tutorial.md). Secuencias restantes en P1 y P2.

**Prompt breve:**

```text
Implementa src/ui/cinematics/player.ts según docs/componentes/motor-cinematicas.md: reproduce
un CinematicScript con capas animadas y subtítulos, con una única función finish() que usan el
fin natural, el botón «Skip (Enter)» y la tecla Enter. No toques el estado del juego.
```

**Pruebas:** M-CIN-01 a M-CIN-06 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** Enter cinco veces navega una vez; saltar en el último instante no duplica nada; con movimiento reducido no hay paneos; sin imágenes la secuencia se completa.

**Evidencia:** captura de una escena con subtítulo y botón de saltar.

**Terminado cuando:** la apertura se ve y se salta en los tres navegadores.

**Riesgos:** viñetas que no llegan a tiempo. Mitigación: paneles de color con texto; la secuencia funciona sin arte.
