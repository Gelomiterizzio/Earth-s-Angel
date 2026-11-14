# Objetivos

Fuente canónica del **predicado de victoria** de cada nivel.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-13 |
| Prioridad · fase | P0 · H3 |
| Objetivo | Decidir cada día si la colonia es estable, llevar la racha y declarar la victoria. |
| Responsabilidad | `src/core/objectives.ts` |
| Depende de | [ciclo-de-dias](ciclo-de-dias.md), [dificultad-y-balance](dificultad-y-balance.md) |
| No incluye | Derrotas ([ciclo-de-dias](ciclo-de-dias.md), precedencia). Pantalla de resultado. |
| Responsable · revisor | A, con B para los umbrales · B |
| Estado | Propuesto. Predicados de la Luna validados en el modelo de referencia. |

## 2. Arquitectura y funcionamiento

Se evalúa en el paso 9 del día, con el estado ya actualizado.

### Hechos del día

| Hecho | Definición |
| --- | --- |
| `lsOk` | Hoy funcionaron al menos un extractor, un reciclador y un generador |
| `greenhouseRan` | Hoy funcionó al menos un invernadero |
| `noShortage` | Ningún tripulante se quedó sin oxígeno, agua ni alimentos |
| `protectedToday` | No hubo radiación, o toda la tripulación estuvo en el refugio |
| `reservesOk` | Oxígeno, agua y alimentos ≥ `reserveThreshold` |
| `energyOk` | Energía almacenada ≥ `energyThreshold` |

"Funcionó" significa: operativo, encendido, con electricidad y con sus insumos.

### Día estable y racha

```text
stable = lsOk && noShortage && protectedToday && reservesOk && energyOk
streak = stable ? streak + 1 : 0
```

### Objetivos de la Luna

| ID | Se cumple cuando |
| --- | --- |
| `soporte` | `lsOk` |
| `energia` | `energyOk` y generación nominal ≥ consumo nominal |
| `alimentos` | `greenhouseRan` y `harvests >= 1` |
| `reservas` | `reservesOk` |
| `proteccion` | Plazas de refugio operativo ≥ tripulación, y todos los días de radiación programados son ≤ hoy |
| `racha` | `streak >= streakDays` |

- Generación nominal: paneles operativos × `panelOutput`, con sol al 100 %.
- Consumo nominal: suma de `energyPerDay` de los edificios operativos y encendidos. No incluye el gasto del refugio.

**Victoria:** los seis se cumplen al cerrar el mismo día.

Los objetivos se recalculan cada día. Uno cumplido ayer puede no cumplirse hoy.

### Objetivos de Marte (P1)

Los seis anteriores con los umbrales de Marte, más:

| ID | Se cumple cuando |
| --- | --- |
| `comunicaciones` | Antena operativa y enlace mantenido durante los soles exigidos |
| `autonomia` | `streak >= streakDays` con el polvo acumulado por debajo de su tope |

En Marte `racha` se sustituye por `autonomia`.

### Eventos

`objective/met` la primera vez que un objetivo pasa a cumplido en la misión. `streak/changed` cuando cambia la racha.

## 3. Datos y uso

Umbrales por dificultad en [dificultad-y-balance](dificultad-y-balance.md).

### Ejemplo

Media, cierre del día 7 del recorrido de referencia: energía 24, oxígeno 20, agua 25, alimentos 28; extractor, reciclador, generador e invernadero funcionaron; primera cosecha hoy; sin radiación.

- `stable` es verdadero → racha 1.
- Cumplidos: `soporte`, `energia`, `alimentos`, `reservas`.
- Pendientes: `proteccion` (la tormenta es mañana) y `racha` (1 de 3).

### Cómo se muestra

Lista de seis líneas con ✔ o casilla vacía, texto corto y progreso: "Reservas para 4 días · oxígeno 20/16 ✔". La racha, como "Estabilidad 1/3".

### Casos límite

- Racha cumplida y un día inestable justo después: la racha vuelve a 0 y el objetivo deja de cumplirse.
- Sin tormenta programada: `proteccion` solo exige el refugio.
- Tormenta de dos días: `proteccion` se cumple al cerrar el segundo día.
- Trabajar durante la tormenta no impide ganar: corta la racha ese día y deja la exposición alta.

## 4. Implementación delegable

**Tarea:** [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md).

**Prompt breve:**

```text
Implementa src/core/objectives.ts según docs/componentes/objetivos.md: hechos del día,
estabilidad, racha y los seis objetivos de la Luna con sus definiciones exactas. Devuelve
ObjectiveStatus[] con current y target donde tenga sentido. Sin números en el código.
```

**Pruebas:** U-OBJ-01 a U-OBJ-08 e I-REC-* en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** en el recorrido de Media la racha es 1, 2 y 3 los días 7, 8 y 9; en Imposible se corta el día 9 porque los alimentos bajan a 12; `proteccion` se cumple el día de la tormenta y no antes.

**Evidencia:** pruebas en verde.

**Terminado cuando:** los tres recorridos ganan en los días documentados.

**Riesgos:** confundir "funcionó hoy" con "está construido". La prueba U-OBJ-02 lo cubre con un generador sin electricidad.
