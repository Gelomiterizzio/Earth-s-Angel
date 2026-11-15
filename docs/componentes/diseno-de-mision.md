# Diseño de la misión

Pantalla entre la dificultad y el despegue desde la Tierra. Cubre la fase de **concepto** que pide el reto *Space Mission Design Game*: el jugador elige objetivo, lanzador, trayectoria y carga dentro de un presupuesto y de la capacidad de masa del cohete. Después opera la misión en la Luna y en Marte, y el resultado compara el diseño con lo que pasó.

## Elecciones

| Elección | Opciones | Efecto |
| --- | --- | --- |
| Objetivo | Base autosuficiente · Ciencia del hielo · Vigilancia del clima espacial | Se evalúa al final de la misión lunar (`objectiveAchieved`) |
| Lanzador | Ligero (6 t, 25 M) · Mediano (10 t, 40 M) · Pesado (16 t, 60 M) | Capacidad de masa y coste |
| Trayectoria | Baja energía (0 M) · Estándar (10 M, +2 días de la Tierra) · Rápida (20 M, +4) | Coste y días de la cuenta atrás de la Tierra |
| Suministros | Oxígeno, agua, comida (+12), materiales (+15), batería (+10 energía) | Llegan al aterrizar, limitados por el almacén |
| Instrumentos | Espectrómetro (radio explorado +1) · Sensor de radiación (pronóstico +1 día) | Toda la campaña |
| Equipo de la tripulación | Kit de herramientas (reparar gratis) · Taladro (+50 % de minerales) · Trajes blindados (−1 de exposición por día de tormenta sin refugio) | Toda la campaña |

Presupuesto: Fácil 120 M · Media 100 M · Imposible 85 M. Todas las cifras son **balance** o **ficción**, no datos NASA. Viven en [`src/data/balance/mission-design.json`](../../src/data/balance/mission-design.json).

## Reglas

- Núcleo puro en `src/core/design.ts`: enteros, sin DOM ni azar. El diseño por defecto (cohete mediano, baja energía, sin carga) no cambia nada, así que los recorridos de prueba y las partidas guardadas siguen igual.
- El diseño se guarda en `campaign.design` y se vuelve a aplicar al reintentar la misión lunar.
- La pantalla impide despegar si el diseño se pasa del presupuesto o de la masa.
- Las presentaciones X y Z eligen su diseño en esta pantalla (`PRESENTATION_DESIGN`, `LOSING_DESIGN`).

**Pruebas:** `tests/core/design.test.ts`, y `presentation*.test.ts` con los diseños de las presentaciones.

**Contrato:** añade `CampaignState.design` y `GameData.missionDesign`, y la escena `diseno`. Revisión de A pendiente.
