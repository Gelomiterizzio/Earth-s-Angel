# Agua y alimentos

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-20 |
| Prioridad · fase | P0 · H2 |
| Objetivo | Modelar el ciclo del agua y el cultivo de alimentos con un tiempo de producción explícito. |
| Responsabilidad | `src/core/water-food.ts` |
| Depende de | [energia](energia.md), [motor-recursos](motor-recursos.md), [tripulacion](tripulacion.md) |
| No incluye | Generador de oxígeno ([soporte-vital](soporte-vital.md)). |
| Responsable · revisor | A · B |
| Estado | Propuesto. Reglas validadas en el modelo de referencia. |

## 2. Arquitectura y funcionamiento

Paso 5 del día. Orden fijo: **extractor → reciclador → generador → invernadero**.

### Extractor de hielo

```text
si tiene electricidad: agua += extractorWater      // 6
```

### Reciclador

```text
si tiene electricidad: agua += floor(wastewater × recyclePct / 100)
```

`wastewater` es el agua que bebió la tripulación **ayer**. El día 1 vale 0. Con cuatro tripulantes y el 75 %: 3 de agua por día.

### Invernadero

```text
si tiene electricidad y aguaParaModulos >= greenhouseWaterIn:
  agua   −= greenhouseWaterIn        // 2
  growth += 1
  funcionó hoy
si no:
  stress += 1

si growth >= greenhouseCycleDays:      // 4
  cosecha    = max(0, greenhouseHarvest − greenhouseStressPenalty × stress)   // 24 − 6 × estrés
  alimentos += cosecha
  growth = 0; stress = 0; harvests += 1
  evento harvest/done
```

- El cultivo es continuo: tras cosechar empieza otro ciclo.
- Un día sin funcionar (apagado, sin electricidad o sin agua) no avanza el cultivo **y** resta 6 a la próxima cosecha.
- Un invernadero colocado el día `d` empieza a contar el día `d + 1`.

### Consumo de la tripulación

Un agua y un alimento por tripulante y día, en el paso 6. Sin agua: −25 de salud. Sin alimentos: −15.

## 3. Datos y uso

### Balance diario en la Luna, con todo encendido

| | Agua | Alimentos |
| --- | --- | --- |
| Extractor | +6 | |
| Reciclador | +3 | |
| Generador | −2 | |
| Invernadero | −2 | +24 cada 4 días, +6 de media |
| Tripulación | −4 | −4 |
| **Neto** | **+1 por día** | **+2 por día de media** |

Sin extractor, el agua baja 5 por día. Por eso encontrar hielo es lo primero.

### Ejemplo: quitarle energía al invernadero

Recorrido de Media. Invernadero colocado el día 3.

| | Siempre encendido | Apagado el día 4 |
| --- | --- | --- |
| Días de cultivo | 4, 5, 6, 7 | 5, 6, 7, 8 |
| Primera cosecha | Día 7, 24 raciones | Día 8, 18 raciones |
| Alimentos al cerrar el día 7 | 28 | 4 |
| Victoria | Día 9 | Día 14 |

Apagarlo un día ahorró 4 de energía y costó cinco días de misión.

### Diente de sierra de los alimentos

Con un invernadero, los alimentos bajan 4 por día y suben 24 cada cuatro. El jugador ve la cuenta atrás del cultivo sobre el edificio: "Cosecha en 2 días".

### Simplificaciones

- El reciclador solo recupera agua de la tripulación, no la del invernadero ni la del generador.
- 75 % de recuperación es `balance`; la estación espacial recupera cerca del 90 % (`dato NASA`, ECLSS).
- El hielo no se agota en P0.
- No hay tipos de cultivo ni plagas.

### Casos límite

- Dos invernaderos y agua para uno: funciona el de menor `id`; el otro suma estrés.
- Estrés de 4 o más: la cosecha vale 0.
- Cosecha con el almacén lleno: se guarda lo que cabe.

## 4. Implementación delegable

**Tarea:** [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md).

**Prompt breve:**

```text
Implementa src/core/water-food.ts según docs/componentes/agua-y-alimentos.md: extractor,
reciclador con el agua de ayer, e invernadero con crecimiento, estrés y cosecha. Respeta el
orden fijo y la reserva de agua de la tripulación. Prueba la tabla del invernadero apagado.
```

**Pruebas:** U-AGU-01 a U-AGU-07 e I-REC-MEDIA-C en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** con `wastewater` 0 el reciclador devuelve 0 y con cuatro tripulantes servidos el día anterior devuelve 3; cuatro días de cultivo dan 24; un día de estrés da 18 y retrasa un día.

**Evidencia:** pruebas en verde.

**Terminado cuando:** agua y alimentos de los tres recorridos coinciden con las tablas.

**Riesgos:** que el retraso de la cosecha parezca un fallo del juego. Mitigación: contador visible y frase en el informe.
