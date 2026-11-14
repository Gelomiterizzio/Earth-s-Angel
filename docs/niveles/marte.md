# Nivel 2 · Marte, la nueva frontera

La vista de arte muestra mesetas escalonadas, vetas diagonales de arena y ráfagas de polvo. La muestra tiene tema propio y controles de efectos. La simulación marciana y el viaje desde una partida real se mantienen en P1. [Cómo abrir la muestra](../DESPLIEGUE.md#vista-previa-de-interfaz).

| Campo | Valor |
| --- | --- |
| Estado de implementación | **Propuesto. Sin validar por simulación.** No entra en el envío del 15-nov salvo que P0 esté verificado antes. |
| Prioridad | P1 |
| Responsable · revisor | B · A |
| Tareas | [P1-campana-principal.md](../agentes/tareas/P1-campana-principal.md) |

Marte reutiliza mapa, construcción y simulación de la Luna. Añade distancia, polvo, mantenimiento y comunicaciones. Todo número de esta ficha es un **valor de balance inicial** que hay que validar antes de publicarlo.

## Qué cambia respecto a la Luna

| Tema | Luna | Marte |
| --- | --- | --- |
| Mapa | 12 × 12 | 20 × 20, con cámara y vista general |
| Tripulación | 4 | 6 |
| Unidad de tiempo | Día | **Sol** |
| Límite de tiempo | Ventana local y plazo terrestre | Solo el plazo terrestre que quede, más el bono |
| Luz | Sombra puntual | Tormentas de polvo y polvo acumulado en los paneles |
| Distancia | No cuenta | Recargo logístico por lejanía |
| Mantenimiento | No hay | Limpiar paneles y reparar averías |
| Comunicaciones | Tarjeta | Objetivo de enlace y pronóstico más corto sin antena |
| Refugio | 4 plazas para 4 | 4 plazas para 6: hace falta un segundo refugio o un hábitat |

## El sol

El HUD dice "Sol 5". Al llegar aparece la tarjeta `sol`: un sol es el día marciano y dura cerca de 24 horas y 40 minutos (`dato NASA`, Mars24). **Un sol del juego es un turno de la misión; no dura lo mismo que un sol real.**

## Mapa

Cuadrícula de 20 × 20. Mismos caracteres que la Luna. Archivo previsto: `src/data/content/levels/marte.json`.

```json
{
  "id": "marte", "width": 20, "height": 20,
  "rows": [
    "##....oo......m...##",
    "#.....oo...........#",
    "..m.........#.......",
    "........#.......?...",
    "...o...............m",
    "..oo......i.........",
    ".........ii....#....",
    "....#...............",
    ".........S.....m....",
    "....................",
    "..m......#.....oo...",
    "...............oo...",
    "......#.............",
    ".i..........m.......",
    "ii.................#",
    "........oo..........",
    "...m....oo.....#....",
    "..............i.....",
    "#.........m...ii...#",
    "##................##"
  ],
  "ship": { "x": 9, "y": 8 },
  "initialExploredRadius": 2,
  "forecastHorizonDays": 1
}
```

| Elemento | Casillas |
| --- | --- |
| Nave | (9,8) |
| Hielo cercano | (10,5), (9,6), (10,6) |
| Hielo lejano | (1,13), (0,14), (1,14) · (14,17), (14,18), (15,18) |
| Minerales | (14,0), (2,2), (19,4), (15,8), (2,10), (12,13), (3,16), (10,18) |
| Misterio | (16,3) |
| Baliza (P2) | (17,12) |

El hielo cercano alcanza para empezar. Los depósitos minerales están lejos a propósito: obligan a pagar logística.

## Mecánicas nuevas

### Recargo logístico

Construir, explorar o recolectar lejos de la base cuesta más. La distancia se mide en casillas, contando diagonales como una, hasta la nave o el hábitat más cercano.

| Dificultad | Recargo |
| --- | --- |
| Fácil | +1 punto de acción a más de 6 casillas |
| Media | +1 a más de 5 |
| Imposible | +1 a más de 4 y +2 a más de 9 |

Un **hábitat** cuenta como punto de partida: construir uno lejos acerca esa zona. Es la decisión logística del nivel.

### Polvo

- **Tormenta de polvo regional:** paneles al 65 %. La cifra sale de un dato real: InSight pasó de 425 a 275 vatios-hora por sol ([CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md), F-03).
- **Tormenta global:** paneles al 20 % (`balance`).
- **Polvo acumulado:** cada sol los paneles pierden un poco, hasta un tope. La acción `CLEAN_PANELS` cuesta 1 punto de acción y lo devuelve a cero.

```text
gen = floor(paneles × panelOutput × solar / 100 × (100 − polvo) / 100)
```

### Averías

Evento `averia`: un edificio queda dañado y no funciona hasta `REPAIR`, que cuesta 1 punto de acción y 2 materiales. Se anuncian el mismo sol, sin pronóstico.

### Comunicaciones y retraso

- Sin antena, el pronóstico solo alcanza **1 sol**: los avisos de la Tierra tardan en llegar.
- Con antena operativa, alcanza **3 soles**.
- Objetivo `comunicaciones`: mantener la antena con electricidad durante varios soles seguidos.
- Tarjeta `signalDelay`: una señal tarda minutos entre la Tierra y Marte (cifras por verificar).

### Tormenta solar en Marte

Dura dos soles y es moderada. La tarjeta `sameStormMars` cuenta que el evento de septiembre de 2017 también se midió en la superficie de Marte (`dato NASA`, F-05). La exposición sigue siendo un valor del juego.

## Condiciones iniciales

Llegan los suministros del manifiesto de transferencia ([progresion](../componentes/progresion.md)) más el equipo de la dificultad. Tablas en [dificultad-y-balance](../componentes/dificultad-y-balance.md#marte--valores-de-balance-iniciales-sin-validar). Edificios disponibles: los siete de P0 más depósito, comunicaciones, laboratorio y hábitat.

## Objetivos

Los de la Luna con umbrales de Marte, más `comunicaciones`, y `autonomia` en lugar de `racha`. Definición en [objetivos](../componentes/objetivos.md#objetivos-de-marte-p1). La meta final: colonia autónoma durante varios soles con el enlace activo.

## Derrotas

Las de la Luna, más:

| Causa | Condición |
| --- | --- |
| `plazo` | El plazo terrestre llega a 0 |
| `escasez` | No quedan materiales ni depósitos alcanzables y falta un edificio obligatorio |
| `objetivos` | El enlace de comunicaciones se pierde durante más soles de los permitidos en Imposible |

## Rutas de prueba

Pendientes. Tarea T-P1-B2: construir un modelo o pruebas de recorrido y documentar aquí, como en [luna.md](luna.md), un recorrido de victoria por dificultad con el estado al cerrar cada sol. **Hasta entonces no se afirma que ninguna dificultad de Marte sea ganable.**

Rutas que deben quedar cubiertas:

- Luna → Marte → final normal, con el bono aplicado una vez.
- Tormenta regional de tres soles con y sin baterías.
- Limpieza de paneles frente a no limpiarlos durante diez soles.
- Refugio para seis: dos tripulantes fuera con un solo refugio.
- Derrota por plazo terrestre.
