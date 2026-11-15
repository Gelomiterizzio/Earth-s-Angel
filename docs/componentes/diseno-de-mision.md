# Diseño de la misión

Pantalla entre la dificultad y el despegue desde la Tierra. Cubre la fase de **concepto** que pide el reto *Space Mission Design Game*: el jugador elige objetivo, lanzador, trayectoria (con ventana orbital y tiempo de viaje), módulo de cabina de la nave, antena de comunicaciones y carga dentro de un presupuesto y de la capacidad de masa del cohete. Después opera la misión en la Luna y en Marte, y el resultado compara el diseño con lo que pasó.

## Tabla final de equilibrio

Presupuesto por dificultad: **Fácil 120 M · Media 100 M · Imposible 85 M**. Todas las cifras son **balance** o **ficción didáctica**, no datos NASA. Viven en [`src/data/balance/mission-design.json`](../../src/data/balance/mission-design.json).

### 1. Objetivos de misión (`objectives`)

| ID | Objetivo | Meta al terminar la Luna (`objectiveAchieved`) | Etiqueta |
| --- | --- | --- | --- |
| `autosuficiente` | Base autosuficiente | Victoria con al menos 6 unidades por encima del mínimo de cada reserva de oxígeno, agua y alimentos | `balance` |
| `hielo` | Ciencia del hielo | Victoria con extractor construido y `>= 6` casillas de hielo exploradas | `balance` |
| `solar` | Vigilancia del clima espacial | Victoria con refugio construido y exposición máxima `<= 20` | `balance` |

### 2. Vehículo de lanzamiento (`rockets`)

| ID | Lanzador | Capacidad de masa | Coste | Papel en el equilibrio |
| --- | --- | --- | --- | --- |
| `ligero` | Cohete ligero | 6 t | 25 M | Libera presupuesto (75 M en Media), pero obliga a elegir pocos módulos |
| `medio` | Cohete mediano (neutro) | 10 t | 40 M | Equilibra masa (10 t) y presupuesto restante (60 M en Media) |
| `pesado` | Cohete pesado | 16 t | 60 M | Gran capacidad de masa, pero consume el 60 % del presupuesto en Media |

### 3. Trayectoria y restricción orbital (`trajectories`)

La alineación Tierra-Luna se presenta como **ficción didáctica**. Una transferencia más rápida exige una ventana más estrecha y más propelente. Se empieza en la oportunidad de lanzamiento, sin elegir fecha. La cuenta atrás de la Tierra gana la diferencia entre los días de viaje de la transferencia de baja energía y los de la trayectoria elegida. Los datos anteriores con solo `earthDays` conservan ese valor.

| ID | Trayectoria | Ventana (`windowDays`) | Viaje (`travelDays`) | Días Tierra ahorrados (`earthDays`) | Coste |
| --- | --- | --- | --- | --- | --- |
| `economica` | Baja energía (neutro) | 4 días | 5 días | +0 días | 0 M |
| `estandar` | Estándar | 2 días | 3 días | +2 días | 10 M |
| `rapida` | Rápida | 1 día | 1 día | +4 días | 20 M |

### 4. Módulo de la nave (`ships`)

En la Luna, el módulo de cabina amplía los topes base de oxígeno, agua y alimentos (40 cada uno) y materiales (60). Así caben más suministros iniciales y cosechas. La bonificación se conserva en Marte.

| ID | Módulo de cabina | Masa | Coste | Efecto (`storage`) |
| --- | --- | --- | --- | --- |
| `pequena` | Cabina pequeña (neutro) | 0 t | 0 M | +0 de almacén (40 O₂/agua/comida, 60 materiales en la Luna) |
| `estandar` | Cabina estándar | 1 t | 6 M | +6 de almacén en oxígeno, agua, alimentos y materiales |
| `grande` | Cabina grande | 2 t | 12 M | +12 de almacén en oxígeno, agua, alimentos y materiales |

### 5. Comunicaciones (`comms`)

| ID | Antena | Masa | Coste | Efecto (`forecast` / `forecastHorizon`) |
| --- | --- | --- | --- | --- |
| `estandar` | Antena estándar (neutro) | 0 t | 0 M | Pronóstico base (2 días en la Luna; en Marte exige construir y alimentar `comunicaciones`) |
| `alta` | Antena de alta ganancia | 1 t | 8 M | +1 día de pronóstico en la Luna y activa desde el sol 1 el pronóstico ampliado de Marte (3 soles) |

### 6. Carga útil (`payload`): suministros, instrumentos y equipo

| ID | Grupo | Nombre | Masa | Coste | Efecto (`amount`) |
| --- | --- | --- | --- | --- | --- |
| `oxigeno` | `supply` | Tanques de oxígeno | 2 t | 6 M | +12 de oxígeno al aterrizar |
| `agua` | `supply` | Tanques de agua | 2 t | 6 M | +12 de agua al aterrizar |
| `alimentos` | `supply` | Raciones de comida | 2 t | 6 M | +12 de alimentos al aterrizar (aprovecha el almacén extra de la cabina) |
| `materiales` | `supply` | Materiales de construcción | 3 t | 5 M | +15 materiales al aterrizar |
| `bateria` | `supply` | Batería cargada | 1 t | 6 M | +10 de energía al aterrizar |
| `espectrometro` | `instrument` | Espectrómetro orbital | 1 t | 12 M | Radio explorado inicial +3 (revela 3 casillas de hielo y 4 depósitos minerales adicionales sin gastar PA) |
| `sensor` | `instrument` | Sensor de radiación | 1 t | 10 M | +1 día de pronóstico en todos los niveles |
| `herramientas` | `crew` | Kit de herramientas | 1 t | 8 M | Reparar edificios averiados cuesta 0 materiales |
| `taladro` | `crew` | Taladro de muestreo | 2 t | 10 M | +50 % de materiales por mineral recogido (22 en vez de 15 en Media) |
| `exotraje` | `crew` | Trajes blindados | 2 t | 12 M | −15 de exposición por día de tormenta sin refugio (evita caer en observación `>= 50` en tormenta severa) |

## Arquetipos verificados en dificultad Media (100 M)

El coste total de elegir las opciones máximas asciende a **181 M** y **20 t**. Media ofrece **100 M** de presupuesto y el cohete pesado admite **16 t**. En `tests/core/design.test.ts` se simulan cuatro partidas completas en Media.

1. **Barato (36 M / 100 M · 4 / 6 t):** cohete ligero, transferencia económica, cabina pequeña, antena estándar y carga `materiales + bateria`. Gana en el día 9 y cumple `solar`.
2. **Caro (97 M / 100 M · 11 / 16 t):** cohete pesado, transferencia económica, cabina estándar (+6 almacén), antena de alta ganancia y suministros completos (`oxigeno, agua, alimentos, materiales`). Gana un día antes (día 8) con márgenes altos (`>= 18`) y transfiere el almacén extra a Marte.
3. **Solo instrumentos y equipo (100 M / 100 M · 8 / 10 t):** cohete mediano, transferencia económica, cabina pequeña, antena de alta ganancia y carga `espectrometro + sensor + taladro + exotraje + herramientas`. Gana sin gastar un solo PA en `EXPLORE` y recolectando solo 2 minerales gracias al taladro (+50 %), cumpliendo `solar`.
4. **Solo suministros (96 M / 100 M · 9 / 10 t):** cohete mediano, transferencia rápida (+4 días Tierra), cabina grande (+12 almacén) y carga `oxigeno + agua + alimentos + bateria`. No desperdicia comida al aterrizar (44 / 52), gana en el día 8 y conserva 50 días de la Tierra.

## Reglas

- Al aterrizar, el aviso muestra cabina, antena, carga y objetivo. El diario (`M`) indica los efectos de los módulos y el progreso del objetivo lunar. Para Base autosuficiente distingue las unidades por encima del mínimo de los días de consumo que cubren las reservas.
- El pronóstico identifica qué avisos aparecen antes gracias a la antena o al sensor. El resultado lunar muestra cabina, antena, trayectoria, días de la Tierra ahorrados, coste, masa y cumplimiento del objetivo.
- Núcleo puro en `src/core/design.ts`: enteros, sin DOM ni azar. El diseño por defecto (`DEFAULT_DESIGN`: cohete mediano, baja energía, cabina pequeña, antena estándar, sin carga) no cambia nada, así que los recorridos de prueba y las partidas guardadas siguen igual.
- El diseño se guarda en `campaign.design` y se vuelve a aplicar al reintentar la misión lunar.
- La pantalla impide despegar si el diseño se pasa del presupuesto o de la masa.
- Las presentaciones X y Z eligen su diseño en esta pantalla (`PRESENTATION_DESIGN`, `LOSING_DESIGN`).

**Pruebas:** `tests/core/design.test.ts`, y `presentation*.test.ts` con los diseños de las presentaciones.

**Contrato:** usa `CampaignState.design` y `GameData.missionDesign`, y la escena `diseno`.
