# Dificultad y balance

Fuente canónica de los **valores de balance**. Todo número de esta ficha es un valor de juego elegido para que la partida funcione. Ninguno es un dato de NASA. La procedencia de cada cifra está en [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md).

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-15 |
| Prioridad · fase | P0 · Hito 1 |
| Objetivo | Tener en un solo sitio los parámetros por nivel y dificultad, separados del código. |
| Responsabilidad | `src/data/balance/*.json`, constantes de simulación, validación de datos de balance. |
| Depende de | [ARQUITECTURA.md](../ARQUITECTURA.md) (tipos `DifficultyConfig`, `GameData`) |
| No incluye | Definición de edificios ([construccion](construccion.md)). Mapas ([niveles](../niveles/luna.md)). |
| Responsable · revisor | B · A |
| Estado | Luna: propuesto y **validado con modelo de referencia**. Marte y Tierra: propuestos, **sin validar**. |

## 2. Arquitectura y funcionamiento

- `src/data/balance/difficulty.json`: plazo terrestre y bono por dificultad.
- `src/data/balance/luna.json`, `marte.json`, `tierra.json`: un bloque `DifficultyConfig` por dificultad.
- `src/data/balance/constants.json`: `SimConstants`.
- `src/data/index.ts` los une en `GameData` y valida.

El núcleo lee estos valores de `GameData`. No hay números de balance escritos en `src/core/`.

```ts
export interface SimConstants {
  panelOutput: number;            // energía por panel y día con sol al 100 %
  batteryCapacity: number;
  extractorWater: number;
  recyclePct: number;
  generatorWaterIn: number;  generatorOxygenOut: number;
  greenhouseWaterIn: number; greenhouseCycleDays: number;
  greenhouseHarvest: number; greenhouseStressPenalty: number;
  crewNeedPerDay: number;         // de oxígeno, de agua y de alimentos
  backgroundExposure: number;
  exposure: Record<1 | 2, { unsheltered: number; sheltered: number }>;
  exposureCaution: number;  exposureLimit: number;
  healthPenalty: { oxigeno: number; agua: number; alimentos: number };
  healthRecovery: number;
  exploreRevealRadius: number;
}
```

## 3. Datos y uso

### Constantes de simulación · valores de balance

| Constante | Valor | Unidad de juego |
| --- | --- | --- |
| `panelOutput` | 8 | energía por panel y día |
| `batteryCapacity` | 20 | energía |
| `extractorWater` | 6 | agua por día |
| `recyclePct` | 75 | % del agua que bebió la tripulación ayer |
| `generatorWaterIn` → `generatorOxygenOut` | 2 → 6 | agua → oxígeno |
| `greenhouseWaterIn` | 2 | agua por día |
| `greenhouseCycleDays` | 4 | días de cultivo |
| `greenhouseHarvest` | 24 | raciones por cosecha |
| `greenhouseStressPenalty` | 6 | raciones menos por cada día sin funcionar |
| `crewNeedPerDay` | 1 | por tripulante, de cada recurso vital |
| `backgroundExposure` | 1 | exposición por día |
| `exposure[1]` (moderada) | 25 sin refugio · 2 con refugio | exposición por día |
| `exposure[2]` (severa) | 50 sin refugio · 5 con refugio | exposición por día |
| `exposureCaution` · `exposureLimit` | 50 · 100 | exposición acumulada |
| `healthPenalty` | oxígeno 50 · agua 25 · alimentos 15 | salud por día sin ración |
| `healthRecovery` | 10 | salud por día con todo cubierto |
| `exploreRevealRadius` | 1 | casillas alrededor de la explorada |

**Unidades.** Una unidad de oxígeno, agua o alimentos cubre a un tripulante durante un día de juego. La energía se mide en unidades de energía almacenable, no en potencia. La exposición va de 0 a 100 y representa el margen de la misión, no una dosis real.

### Capacidades base por nivel · valores de balance

| Nivel | Energía | Oxígeno | Agua | Alimentos | Materiales |
| --- | --- | --- | --- | --- | --- |
| Luna | 20 | 40 | 40 | 40 | 60 |
| Marte | 30 | 60 | 60 | 60 | 90 |

Cada batería suma 20 de energía. El depósito (P1) suma 30 a oxígeno, agua, alimentos y materiales.

### Campaña · valores de balance

| Parámetro | Fácil | Media | Imposible |
| --- | --- | --- | --- |
| Plazo terrestre (`earthDays`) | 64 | 54 | 44 |
| Bono Luna → Marte (`bonusDays`) | 12 | 10 | 8 |

### Luna · valores de balance (validados)

| Parámetro | Fácil | Media | Imposible |
| --- | --- | --- | --- |
| Tripulación | 4 | 4 | 4 |
| Ventana de la misión (`dayLimit`) | 24 | 20 | 16 |
| Energía inicial | 16 | 10 | 8 |
| Oxígeno inicial | 32 | 24 | 20 |
| Agua inicial | 32 | 24 | 20 |
| Alimentos iniciales | 40 | 32 | 24 |
| Materiales iniciales | 50 | 40 | 34 |
| Materiales por depósito mineral | 20 | 15 | 15 |
| Umbral de reservas | 12 | 16 | 16 |
| Umbral de energía | 6 | 10 | 10 |
| Racha de estabilidad | 2 | 3 | 4 |
| Energía del refugio por día | 4 | 6 | 8 |
| Sombra: inicio · duración · sol | día 5 · 1 · 50 % | día 4 · 1 · 25 % | día 5 · 2 · 25 % |
| Tormenta solar: inicio · duración · nivel | día 9 · 1 · moderada | día 8 · 1 · severa | día 8 · 2 · severa |
| Variación del inicio fuera del modo canónico | tormenta +0 o +1 | tormenta +0 o +1 | ninguna |
| Victoria del recorrido de referencia | día 9 | día 9 | día 13 |

El umbral de reservas equivale a tres o cuatro días de consumo de la tripulación.

**Por qué Imposible es difícil y ganable.** Arranca con comida para seis días y el primer cultivo tarda cuatro, así que el invernadero tiene que estar puesto el día 2 y encendido durante los dos días de sombra. Los materiales iniciales no alcanzan: hacen falta tres depósitos minerales. La tormenta dura dos días y trabajar en ambos es derrota. El recorrido de [niveles/luna.md](../niveles/luna.md) gana el día 13 de 16.

### Marte · valores de balance iniciales (sin validar)

| Parámetro | Fácil | Media | Imposible |
| --- | --- | --- | --- |
| Tripulación | 6 | 6 | 6 |
| Ventana local | ninguna: manda el plazo terrestre | igual | igual |
| Suministros de llegada | manifiesto + 20 de cada recurso vital, 60 materiales | manifiesto + 12, 50 materiales | manifiesto + 6, 40 materiales |
| Umbral de reservas | 18 | 24 | 24 |
| Umbral de energía | 10 | 15 | 15 |
| Racha de autonomía (soles) | 4 | 5 | 6 |
| Soles de enlace de comunicaciones | 3 | 4 | 5 |
| Polvo acumulado en paneles | −2 % por sol, tope −20 % | −3 %, tope −30 % | −4 %, tope −40 % |
| Tormenta de polvo regional (sol al 65 %) | 1 de 3 soles | 2 de 3 soles | 2 de 4 soles |
| Tormenta de polvo global (sol al 20 %) | no | 1 de 3 soles | 1 de 5 soles |
| Tormenta solar | 1, moderada, 2 soles | 1, moderada, 2 soles | 2, moderada, 2 soles |
| Recargo logístico | +1 PA a más de 6 casillas | +1 PA a más de 5 | +1 PA a más de 4, +2 a más de 9 |

El factor 65 % de la tormenta regional sale de un dato real (ver [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md), InSight). El resto son propuestas. Tarea de validación: [T-P1-B2](../agentes/tareas/P1-campana-principal.md).

### Tierra · valores de balance iniciales (sin validar)

En [niveles/tierra-alternativa.md](../niveles/tierra-alternativa.md).

### Cómo se eligen los números

1. Cada edificio debe pagar algo y dar algo. Ningún edificio es gratis.
2. Con todos los módulos encendidos, el balance neto diario en la Luna es: energía +2 con dos paneles, agua +1, oxígeno +2, alimentos +2 de media. Márgenes pequeños a propósito.
3. Las dificultades cambian reservas iniciales, plazos, duración de eventos y racha. **No cambian las reglas.**
4. Cualquier cambio de un número de esta ficha obliga a volver a ejecutar los recorridos de [PRUEBAS.md](../PRUEBAS.md).

### Validación de datos al arrancar

`loadGameData` rechaza: valores negativos, `dayLimit` menor que el último día de evento, `streakDays` mayor que `dayLimit`, umbral de reservas mayor que la capacidad base, eventos solapados del mismo tipo, y dificultades con claves distintas entre niveles.

## 4. Implementación delegable

**Tarea:** [T-P0-B1](../agentes/tareas/T-P0-B1-datos-y-balance-lunar.md).

**Prompt breve:**

```text
Crea src/data/balance/{constants,difficulty,luna}.json con los valores exactos de
docs/componentes/dificultad-y-balance.md y el cargador src/data/index.ts que los valida
y devuelve GameData según src/core/types.ts. Añade tests/data/balance.test.ts que compare
cada valor de la ficha con el JSON y pruebe cada regla de validación con un dato roto.
```

**Pruebas:** D-BAL-01 a D-BAL-05 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** los JSON coinciden con las tablas; un JSON roto produce un error que nombra el archivo y la clave; los tres recorridos de la Luna ganan en los días indicados cuando el núcleo esté listo.

**Evidencia:** pruebas de datos en verde y captura del error de validación.

**Terminado cuando:** A confirma que `GameData` carga en el núcleo y B ha jugado una partida en Media de principio a fin.

**Riesgos:** ajustar números al final sin volver a probar. Mitigación: congelar el balance en el hito 3.
