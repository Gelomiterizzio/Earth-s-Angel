# Nivel 1 · Luna, el primer refugio

Diseño del nivel, mapa, condiciones iniciales, eventos, objetivos y **recorridos de prueba**. Es la ruta mínima de demostración del reto y el alcance de P0.

| Campo | Valor |
| --- | --- |
| Estado de implementación | **Propuesto.** Reglas y recorridos validados con un modelo de referencia el 14-nov-2026. Sin código. |
| Responsable · revisor | B · A |
| Tareas | [T-P0-B1](../agentes/tareas/T-P0-B1-datos-y-balance-lunar.md), [T-P0-B3](../agentes/tareas/T-P0-B3-mapa-lunar.md), [T-P0-A6](../agentes/tareas/T-P0-A6-pruebas-doradas.md) |

## Mapa

Cuadrícula de 12 × 12. Origen `(0,0)` arriba a la izquierda. `x` crece hacia la derecha, `y` hacia abajo. Archivo previsto: `src/data/content/levels/luna.json`.

```text
      x→ 0 1 2 3 4 5 6 7 8 9 10 11
 y=0     # # . . . o o . . . #  #
 y=1     # . . m . o o . . ? .  #
 y=2     . . . . . . . . . . .  .
 y=3     . . # . . . . . # . .  .
 y=4     . . . . . . . . . . m  .
 y=5     o . . . . S . . . . .  .
 y=6     o o . . . . . . # . .  .
 y=7     . . . m . . . . . . .  .
 y=8     . m . . # . . . . i i  .
 y=9     . . . . . . . . . i o  o
 y=10    # . . . . . m . . . o  o
 y=11    # # . . . . . . . . #  #
```

```json
{
  "id": "luna", "width": 12, "height": 12,
  "rows": [
    "##...oo...##", "#..m.oo..?.#", "............", "..#.....#...",
    "..........m.", "o....S......", "oo......#...", "...m........",
    ".m..#....ii.", ".........ioo", "#.....m...oo", "##........##"
  ],
  "ship": { "x": 5, "y": 5 },
  "initialExploredRadius": 2,
  "forecastHorizonDays": 2
}
```

| Carácter | Terreno | Regla |
| --- | --- | --- |
| `.` | `llano` | Se puede construir. |
| `#` | `roca` | Bloqueado. |
| `o` | `crater` | Bloqueado. |
| `i` | `hielo` | Solo admite el extractor. Casillas: (9,8), (10,8), (9,9). |
| `m` | `mineral` | Se recolecta una vez. Casillas: (3,7), (1,8), (3,1), (10,4), (6,10). |
| `?` | `misterio` | Región del descubrimiento, en (9,1). |
| `S` | `nave` | Nave inicial, en (5,5). |

**Zona explorada al empezar:** el cuadrado de 5 × 5 alrededor de la nave, de `x` 3 a 7 y de `y` 3 a 7. El mineral de (3,7) está dentro: sirve para enseñar a recolectar el primer día.

**Exploración:** se explora una casilla sin explorar que toque, también en diagonal, a una explorada. Cuesta 1 PA y revela el bloque de 3 × 3 centrado en ella. Detalle en [componentes/mapa.md](../componentes/mapa.md).

**Pistas sin azar:** el tutorial dice "Los sensores detectan hielo al sureste de la nave". Explorar (8,8) revela el hielo de (9,8) y (9,9).

## Condiciones iniciales

Tripulación de 4. Reservas, materiales, umbrales, plazos y eventos por dificultad: [componentes/dificultad-y-balance.md](../componentes/dificultad-y-balance.md). Edificios disponibles: los siete de P0 de [componentes/construccion.md](../componentes/construccion.md).

## Sistema de eventos

Dos eventos por misión, los dos anunciados con antelación.

| Evento | Efecto | Qué enseña | Aviso |
| --- | --- | --- | --- |
| **Sombra** (`sombra`) | Los paneles rinden al 25 % o al 50 %. | Guardar energía en baterías para cuando hay poca luz. | 2 días antes |
| **Tormenta solar** (`tormenta-solar`) | Radiación moderada o severa. El día abre con la decisión de refugio. | El blindaje cuesta energía y tiempo de trabajo. | 2 días antes: región activa. 1 día antes: alerta. |

La tormenta solar lleva `sourceRef` a un registro real de DONKI. La tarjeta de decisión muestra el identificador, la fecha, el instrumento y el enlace. Cómo se traduce el registro a la partida: [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md).

| Dificultad | Registro DONKI en modo canónico | Nivel en el juego |
| --- | --- | --- |
| Fácil | `2024-05-13T14:00:00-SEP-001` · GOES-P: SEISS >10 MeV | Moderada |
| Media | `2017-09-10T16:25:00-SEP-001` · GOES13: SEM/EPS >100 MeV | Severa |
| Imposible | `2017-09-10T16:25:00-SEP-001` · GOES13: SEM/EPS >100 MeV | Severa, 2 días |

Fuera del modo canónico la semilla elige entre los registros del mismo nivel y puede retrasar un día la tormenta en Fácil y Media.

## Objetivos y victoria

La misión se gana al cerrar un día con **los seis objetivos cumplidos**. Definición exacta en [componentes/objetivos.md](../componentes/objetivos.md).

| Objetivo | Se cumple cuando |
| --- | --- |
| `soporte` · Soporte vital | Extractor, reciclador y generador funcionaron hoy. |
| `energia` · Energía | Batería ≥ umbral de energía y la generación nominal cubre el consumo nominal. |
| `alimentos` · Alimentos | El invernadero funcionó hoy y ya hubo al menos una cosecha. |
| `reservas` · Reservas | Oxígeno, agua y alimentos ≥ umbral de reservas. |
| `proteccion` · Protección demostrada | Hay refugio operativo con plaza para todos y la tormenta solar de la misión ya pasó. |
| `racha` · Estabilidad | Racha de días estables ≥ la exigida. |

Al ganar, la base queda operativa. En P1 se arma el manifiesto de transferencia y empieza la transición a Marte ([componentes/progresion.md](../componentes/progresion.md)). En P0 se muestra el informe de misión y un aviso de "Marte: próximamente".

## Derrotas

| Causa | Condición | Cuándo ocurre en una partida sin hacer nada |
| --- | --- | --- |
| `soporte-vital` | Salud de un tripulante en 0 | Fácil día 10 · Media día 8 · Imposible día 7 |
| `exposicion` | Exposición ≥ 100 | Imposible, trabajando los dos días de tormenta: día 9 |
| `plazo` | Se acaba la ventana o el plazo terrestre | Media sin construir refugio: día 20 |

## Recorridos de prueba

Programa canónico (`canonical: true`). Las columnas muestran el estado **al cerrar** cada día. Cualquier diferencia entre estas tablas y el núcleo es un error del núcleo o un cambio de reglas sin documentar.

### Media · victoria el día 9

| Día | Acciones | Energía | Oxígeno | Agua | Alimentos | Materiales | Racha | Exposición |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Panel (4,4) · panel (5,4) · recolectar (3,7) · explorar (8,8) | 10/20 | 20 | 20 | 28 | 43 | 0 | 1 |
| 2 | Extractor (9,8) · reciclador (6,4) | 20/20 | 16 | 16 | 24 | 27 | 0 | 2 |
| 3 | Generador (4,5) · invernadero (6,6) | 20/20 | 12 | 21 | 20 | 9 | 0 | 3 |
| 4 · sombra 25 % | Explorar (2,8) · recolectar (1,8) · batería (4,6) · explorar (3,2) | 10/20 | 14 | 22 | 16 | 19 | 0 | 4 |
| 5 | Refugio (6,5) · recolectar (3,1) | 12/40 | 16 | 23 | 12 | 20 | 0 | 5 |
| 6 | Panel (3,4) | 14/40 | 18 | 24 | 8 | 14 | 0 | 6 |
| 7 | — | 24/40 | 20 | 25 | 28 | 14 | 1 | 7 |
| 8 · tormenta severa | Decidir: refugiar | 28/40 | 22 | 26 | 24 | 14 | 2 | 13 |
| 9 | — | 38/40 | 24 | 27 | 20 | 14 | 3 | 14 |

Resultado: victoria, 9 días usados, plazo terrestre restante 45.

**Variante:** en el día 8 decidir "seguir trabajando", construir un invernadero en (7,6) y explorar (8,4) y (10,4). Resultado: exposición 58 al cerrar el día, 2 PA por día desde el día 9, victoria el día 11 con exposición 61, materiales 4 y plazo restante 43.

**Variante:** apagar el invernadero el día 4 y encenderlo el día 5. La cosecha llega el día 8 con 18 raciones en lugar de 24 el día 7, los alimentos bajan a 4 y la victoria se retrasa al día 14.

### Fácil · victoria el día 9

| Día | Acciones | Energía | Oxígeno | Agua | Alimentos | Materiales | Racha | Exposición |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Panel (4,4) · panel (5,4) · recolectar (3,7) · explorar (8,8) | 16/20 | 28 | 28 | 36 | 58 | 0 | 1 |
| 2 | Extractor (9,8) · reciclador (6,4) | 20/20 | 24 | 24 | 32 | 42 | 0 | 2 |
| 3 | Generador (4,5) · invernadero (6,6) | 20/20 | 20 | 29 | 28 | 24 | 0 | 3 |
| 4 | Refugio (6,5) | 20/20 | 22 | 30 | 24 | 10 | 1 | 4 |
| 5 · sombra 50 % | — | 14/20 | 24 | 31 | 20 | 10 | 2 | 5 |
| 6 | — | 16/20 | 26 | 32 | 16 | 10 | 3 | 6 |
| 7 | — | 18/20 | 28 | 33 | 36 | 10 | 4 | 7 |
| 8 | — | 20/20 | 30 | 34 | 32 | 10 | 5 | 8 |
| 9 · tormenta moderada | Decidir: refugiar | 18/20 | 32 | 35 | 28 | 10 | 6 | 11 |

Resultado: victoria, plazo terrestre restante 55. **Variante:** no refugiarse el día 9 da victoria el día 11 con exposición 36.

### Imposible · victoria el día 13

| Día | Acciones | Energía | Oxígeno | Agua | Alimentos | Materiales | Racha | Exposición |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Recolectar (3,7) · panel (4,4) · panel (5,4) · explorar (8,8) | 8/20 | 16 | 16 | 20 | 37 | 0 | 1 |
| 2 | Extractor (9,8) · invernadero (6,6) | 20/20 | 12 | 12 | 16 | 19 | 0 | 2 |
| 3 | Reciclador (6,4) · generador (4,5) | 20/20 | 8 | 12 | 12 | 3 | 0 | 3 |
| 4 | Explorar (2,8) · recolectar (1,8) · explorar (3,2) · recolectar (3,1) | 20/20 | 10 | 13 | 8 | 33 | 0 | 4 |
| 5 · sombra 25 % | Refugio (6,5) · panel (3,4) | 10/20 | 12 | 14 | 4 | 13 | 0 | 5 |
| 6 · sombra 25 % | Batería (4,6) | 2/20 | 14 | 15 | 24 | 8 | 0 | 6 |
| 7 | — | 12/40 | 16 | 16 | 20 | 8 | 1 | 7 |
| 8 · tormenta severa | Decidir: refugiar | 14/40 | 18 | 17 | 16 | 8 | 2 | 13 |
| 9 · tormenta severa | Decidir: refugiar | 16/40 | 20 | 18 | 12 | 8 | 0 | 19 |
| 10 | — | 26/40 | 22 | 19 | 32 | 8 | 1 | 20 |
| 11 | — | 36/40 | 24 | 20 | 28 | 8 | 2 | 21 |
| 12 | — | 40/40 | 26 | 21 | 24 | 8 | 3 | 22 |
| 13 | — | 40/40 | 28 | 22 | 20 | 8 | 4 | 23 |

Resultado: victoria, plazo terrestre restante 31. La racha se corta el día 9 porque los alimentos bajan a 12, por debajo del umbral, hasta la segunda cosecha del día 10.

### Recorrido de demostración

Para el video y la defensa: `?seed=demo`, dificultad Media. Guion en [ENTREGA.md](../ENTREGA.md). El momento que se enseña es el día 8.

## Tutorial del nivel

Pasos, textos y disparadores en [componentes/tutorial-y-tarjetas-cientificas.md](../componentes/tutorial-y-tarjetas-cientificas.md). Orden: energía y paneles (día 1), agua y hielo (día 1 y 2), oxígeno y alimentos (día 3), pronóstico y baterías (cuando aparece la sombra), tormenta solar y refugio (cuando aparece la alerta).
