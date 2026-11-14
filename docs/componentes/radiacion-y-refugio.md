# Radiación y refugio

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-21 |
| Prioridad · fase | P0 · H3 |
| Objetivo | Convertir una alerta de tormenta solar en una decisión con costo en los dos lados y efecto medible. |
| Responsabilidad | `src/core/radiation.ts`, acción `DECIDE_SHELTER`, panel `src/ui/panels/decision.ts` |
| Depende de | [eventos-ambientales](eventos-ambientales.md), [energia](energia.md), [tripulacion](tripulacion.md), [adaptador-datos-nasa](adaptador-datos-nasa.md) |
| No incluye | Programación de la tormenta. Lectura del registro NASA. |
| Responsable · revisor | A (núcleo) y B (panel) · B y C |
| Estado | Propuesto. Reglas validadas en el modelo de referencia. |

## 2. Arquitectura y funcionamiento

### La decisión

Un día con `radiationLevel > 0` abre en fase `decision`. El jugador elige antes de hacer nada más:

| | Refugiar a la tripulación | Seguir trabajando |
| --- | --- | --- |
| Requisitos | Refugio operativo y `energia + generación de hoy >= shelterEnergy` | Ninguno |
| Puntos de acción hoy | 0 | Los normales |
| Energía | El refugio gasta `shelterEnergy`, con la primera prioridad | Sin gasto extra |
| Exposición hoy | Fondo + valor con refugio | Fondo + valor sin refugio |
| Día estable | Puede serlo | No lo es: la racha vuelve a 0 |

Errores de `DECIDE_SHELTER`: `WRONG_PHASE`, `STALE_DAY`, `NO_RADIATION_TODAY`, `NO_SHELTER`, `NO_ENERGY_FOR_SHELTER`.

Como el refugio tiene la primera prioridad eléctrica y la generación del día se conoce, la comprobación al decidir es exacta: si se acepta, el refugio tendrá energía.

### Exposición · paso 7 del día

```text
para cada tripulante:
  exposure += backgroundExposure
  si radiationLevel > 0:
    exposure += dentroDelRefugio ? exposure[level].sheltered : exposure[level].unsheltered
```

`dentroDelRefugio` exige `shelterToday`, refugio con electricidad y plaza. Plazas = `capacity` × refugios operativos. Si no caben todos, entran primero los de **mayor exposición**; a igual exposición, el de menor `id`.

La exposición nunca baja.

### Niveles y umbrales · valores de balance

| | Sin refugio | Con refugio |
| --- | --- | --- |
| Fondo, cada día | +1 | +1 |
| Tormenta moderada (nivel 1) | +25 | +2 |
| Tormenta severa (nivel 2) | +50 | +5 |

| Exposición acumulada | Estado | Consecuencia |
| --- | --- | --- |
| 0 a 49 | Operativo | — |
| 50 a 99 | En observación | Medio punto de acción |
| 100 o más | Evacuado | Derrota `exposicion` |

### Eventos

`decision/required` al abrir el día · `decision/made` al elegir · `alert/radiation` al cerrar el día, con `sheltered`.

## 3. Datos y uso

### Qué muestra el panel

Dos bloques separados y etiquetados: **dato real de NASA** (fecha, fulguración, región activa, instrumento, minutos de margen, identificador y enlace) y **valores del juego** (costos y exposición de cada opción). Especificación en [T-P0-B5](../agentes/tareas/T-P0-B5-decision-de-tormenta.md). Procedencia en [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md#del-registro-a-la-partida).

### Efecto medible

Tabla de dos decisiones en [ciclo-de-dias](ciclo-de-dias.md#dos-decisiones-ante-el-mismo-evento). Resumen en Media, día 8:

- Refugiar: exposición 13, racha 2, victoria el día 9.
- Trabajar: exposición 58, la tripulación rinde la mitad, victoria el día 11.

En Imposible, trabajar los dos días: 7 + 51 + 51 = 109 → derrota el día 9.

### Textos de ayuda

- "Una tormenta solar lanza partículas muy rápidas. El refugio las frena."
- "Refugiarse gasta energía y un día de trabajo. No refugiarse gasta salud."
- "MeV mide la energía de una partícula. Más MeV, más blindaje hace falta."

### Casos límite

- Sin refugio construido: la opción de refugiar aparece deshabilitada con el motivo.
- Refugio en obra: no cuenta hasta su día operativo. Por eso hay que colocarlo dos días antes.
- Tormenta de dos días: se decide cada día. Se puede refugiar uno y trabajar el otro.
- Marte, seis tripulantes y un refugio de cuatro plazas: dos quedan fuera. Hace falta un segundo refugio o un hábitat (P1).

### Referencias científicas

Registro DONKI (`dato NASA`). Regla del canal de energía y antelación del aviso (`transformación didáctica`). Todas las cifras de exposición (`balance`). El juego no calcula dosis reales.

## 4. Implementación delegable

**Tareas:** [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md) (núcleo) y [T-P0-B5](../agentes/tareas/T-P0-B5-decision-de-tormenta.md) (panel).

**Prompt breve:**

```text
Implementa src/core/radiation.ts y la acción DECIDE_SHELTER según
docs/componentes/radiacion-y-refugio.md: validaciones, efecto sobre puntos de acción, prioridad
eléctrica del refugio, exposición con y sin refugio y reparto de plazas por mayor exposición.
```

**Pruebas:** U-RAD-01 a U-RAD-07, I-REC-MEDIA-B, I-DER-04 y M-DEC-01 a M-DEC-05 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** las dos ramas del día 8 dan 13 y 58; sin refugio operativo `DECIDE_SHELTER` con `shelter: true` devuelve `NO_SHELTER`; con seis tripulantes y cuatro plazas entran los cuatro más expuestos.

**Evidencia:** pruebas en verde y captura del panel.

**Terminado cuando:** la decisión cambia el día de victoria en el recorrido de Media.

**Riesgos:** que la tormenta se sienta como un castigo sin aviso. Mitigación: pronóstico dos días antes y alerta el día anterior.
