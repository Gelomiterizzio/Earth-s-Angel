# Tripulación

Ficha adicional al inventario base.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-31 |
| Prioridad · fase | P0 · H3 |
| Objetivo | Modelar el estado de cada tripulante, lo que consume, su capacidad de trabajo y las señales de degradación. |
| Responsabilidad | `src/core/crew.ts` |
| Depende de | [soporte-vital](soporte-vital.md), [radiacion-y-refugio](radiacion-y-refugio.md), [dificultad-y-balance](dificultad-y-balance.md) |
| No incluye | Retratos y nombres en pantalla (C). |
| Responsable · revisor | A · B |
| Estado | Propuesto. Reglas validadas en el modelo de referencia. |

## 2. Arquitectura y funcionamiento

Cada `CrewMember` tiene `health` de 0 a 100 y `exposure` de 0 a 100. Los tripulantes se identifican por rol: `content.crew.commander`, `engineer`, `botanist`, `medic`. No tienen nombre propio.

### Estados

| Estado | Condición | Efecto |
| --- | --- | --- |
| Operativo | Salud > 0 y exposición < 50 | Aporta 1 punto de acción |
| En observación | Exposición de 50 a 99 | Aporta medio punto de acción |
| Evacuado | Salud 0 o exposición ≥ 100 | Fin de la misión |

En el juego nadie muere. Una tripulación que falla es evacuada.

### Puntos de acción

```text
ap = operativos + floor(enObservacion / 2)
```

Con cuatro tripulantes operativos hay 4 puntos de acción. Con los cuatro en observación, 2. Si el día se pasa en el refugio, 0.

### Consumo diario

Paso 6 del día. Cada tripulante necesita `crewNeedPerDay` de oxígeno, de agua y de alimentos. Se reparte en ese orden. Para cada recurso:

1. `dadas = min(necesarias, reserva)`. Se descuentan.
2. Si faltan `n`, se quedan sin ración los `n` tripulantes con **más salud**. A igual salud, el de menor `id`.
3. `wastewater` = agua entregada hoy.

### Salud

| Situación del tripulante hoy | Cambio de salud |
| --- | --- |
| Sin oxígeno | −50 |
| Sin agua | −25 |
| Sin alimentos | −15 |
| Todo cubierto | +10, hasta 100 |

Las penalizaciones se suman. La salud no baja de 0.

## 3. Datos y uso

### Ejemplo: no hacer nada en Media

Reservas iniciales: oxígeno 24, agua 24, alimentos 32. Tripulación de 4.

| Día | Oxígeno | Agua | Alimentos | Salud |
| --- | --- | --- | --- | --- |
| 6 | 0 | 0 | 8 | 100 |
| 7 | falta para 4 | falta para 4 | 4 | 100 − 50 − 25 = 25 |
| 8 | falta para 4 | falta para 4 | 0 | 0 → evacuación |

Derrota por soporte vital el día 8.

### Señales de degradación en pantalla

- Salud por debajo de 100: el retrato muestra ▲ y el texto "Débil".
- Salud de 25 o menos: ✖ y "En peligro". Alerta hablada.
- En observación: icono médico y el texto "Rinde la mitad".
- El informe del día dice quién se quedó sin qué.

### Casos límite

- Faltan raciones para dos de cuatro: las pierden los dos con más salud.
- Un tripulante en observación sigue consumiendo como los demás.
- La recuperación de +10 exige los tres recursos cubiertos ese día.

### Referencia científica

El reparto y las penalizaciones son `balance`. El orden oxígeno, agua, alimentos refleja qué carencia es más urgente; se explica en la tarjeta "Primero el aire".

## 4. Implementación delegable

**Tarea:** [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md).

**Prompt breve:**

```text
Implementa src/core/crew.ts según docs/componentes/tripulacion.md: consumo en orden oxígeno,
agua, alimentos; reparto de faltas a quien tiene más salud; penalizaciones y recuperación;
cálculo de puntos de acción. Solo enteros y sin números en el código.
```

**Pruebas:** U-TRI-01 a U-TRI-06 e I-DER-01 a I-DER-03 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** la tabla del ejemplo se reproduce; con cuatro tripulantes en observación hay 2 puntos de acción; la salud nunca sale de 0 a 100.

**Evidencia:** pruebas en verde.

**Terminado cuando:** las derrotas de referencia ocurren en los días 10, 8 y 7.

**Riesgos:** reparto de faltas no determinista. Mitigación: orden explícito por salud y por `id`.
