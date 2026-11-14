# Eventos ambientales

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-22 |
| Prioridad · fase | P0 · H2 y H3 |
| Objetivo | Programar los eventos de la misión con semilla, anunciarlos con antelación y aplicar su efecto. |
| Responsabilidad | `src/core/events.ts` (A), `src/data/content/events.json` y programa por dificultad (B) |
| Depende de | [dificultad-y-balance](dificultad-y-balance.md), [adaptador-datos-nasa](adaptador-datos-nasa.md) |
| No incluye | La decisión de refugio ([radiacion-y-refugio](radiacion-y-refugio.md)). |
| Responsable · revisor | B (datos y textos) y A (núcleo) · A |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

### Tipos

| Tipo | Efecto | Nivel | Prioridad |
| --- | --- | --- | --- |
| `sombra` | `solarFactorPct` de 25 o 50 | Luna | P0 |
| `tormenta-solar` | `radiationLevel` 1 o 2, con `sourceRef` a un registro DONKI | Luna y Marte | P0 |
| `tormenta-polvo` | `solarFactorPct` de 65 (regional) o 20 (global) | Marte | P1 |
| `averia` | Un edificio queda `damaged` hasta `REPAIR` | Marte | P1 |

### Programación · `createMission`

El programa se genera una vez y se guarda en `mission.schedule`. Después no se usa azar.

```text
para cada evento de la tabla de la dificultad:
  inicio = startDay
  si no es modo canónico y jitterDays > 0:
    inicio += entero al azar entre 0 y jitterDays
  si es tormenta-solar:
    canónico → registro fijo de la tabla de niveles/luna.md
    variado  → registro al azar entre los de data.nasa.sep con ese radiationLevel
  añadir { id, type, startDay: inicio, durationDays, ..., sourceRef }
```

- Modo canónico: `?seed=demo` y todas las pruebas. Sin variación.
- Modo variado: cambia qué evento real ilustra la tormenta y, en Fácil y Media, puede retrasarla un día. Comprobado en el modelo: los recorridos de referencia siguen ganando con ese retraso.

### Efecto del día · paso 2

```text
solar = mínimo solarFactorPct de los eventos activos hoy, o 100
rad   = máximo radiationLevel de los eventos activos hoy, o 0
```

Un evento está activo si `startDay <= day < startDay + durationDays`.

### Pronóstico · `computeForecast`

Devuelve los eventos activos hoy y los que empiezan dentro de `forecastHorizonDays`. En la Luna el horizonte es de 2 días.

| Días que faltan | Sombra | Tormenta solar |
| --- | --- | --- |
| 2 | "Sombra del cráter en 2 días" | "Región activa vigilada" |
| 1 | "Mañana habrá poca luz" | "Alerta: partículas en camino" |
| 0 | "Hoy: paneles al 25 %" | Decisión de refugio |

## 3. Datos y uso

Programa por dificultad en [dificultad-y-balance](dificultad-y-balance.md). Registros en [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md).

### Qué enseña cada evento

- **Sombra:** hay que guardar energía antes. El aviso llega con dos días para construir una batería.
- **Tormenta solar:** el refugio tarda dos días en estar listo. El primer aviso llega dos días antes: si se coloca el refugio ese mismo día, estará listo. Quien espera a la alerta del día anterior llega tarde. Es deliberado: prepararse antes es la lección.

### Rejugabilidad

El reto valora que los eventos varíen entre partidas. Sin `?seed=demo`, cada partida puede mostrar un evento real distinto, con su fecha, su fulguración y su enlace.

### Comunicaciones (P1)

Con una antena de comunicaciones el horizonte sube a 3 días. En Marte, sin antena, el horizonte es de 1 sol: los avisos de la Tierra tardan en llegar. Es la mecánica de retraso de comunicaciones que pide el reto.

### Casos límite

- Dos eventos el mismo día: se combinan con las reglas de mínimo y máximo.
- Evento que empieza después de la ventana de la misión: la validación de datos lo rechaza.
- Evento de prueba con `sourceRef: 'SYNTHETIC'`: se muestra con la etiqueta "Datos de prueba" y no puede llegar a producción.

## 4. Implementación delegable

**Tareas:** [T-P0-B1](../agentes/tareas/T-P0-B1-datos-y-balance-lunar.md) (programa), [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md) (núcleo), [T-P0-B5](../agentes/tareas/T-P0-B5-decision-de-tormenta.md) (textos).

**Prompt breve:**

```text
Implementa src/core/events.ts según docs/componentes/eventos-ambientales.md: generación del
programa en modo canónico y variado con el generador con semilla, efecto del día y
computeForecast. Misma semilla, mismo programa.
```

**Pruebas:** U-EVE-01 a U-EVE-05 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** en modo canónico el programa es idéntico al de la tabla; con la misma semilla el programa se repite; el pronóstico anuncia la tormenta de Media los días 6 y 7.

**Evidencia:** pruebas en verde.

**Terminado cuando:** el HUD muestra el pronóstico correcto en el recorrido de Media.

**Riesgos:** variación que haga imposible una partida. Mitigación: en Imposible no hay variación de fechas.
