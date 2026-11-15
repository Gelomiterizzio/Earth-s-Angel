# Motor de recursos

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-17 |
| Prioridad · fase | P0 · H2 |
| Objetivo | Llevar la contabilidad de los cinco recursos con conservación, límites y un solo consumo por turno. |
| Responsabilidad | Libro de recursos dentro de `src/core/day-cycle.ts` y utilidades de `src/core/actions.ts`; almacén en `src/app/store.ts` |
| Depende de | [ARQUITECTURA.md](../ARQUITECTURA.md), [dificultad-y-balance](dificultad-y-balance.md) |
| No incluye | Las fórmulas de cada sistema: [energia](energia.md), [agua-y-alimentos](agua-y-alimentos.md), [soporte-vital](soporte-vital.md). |
| Responsable · revisor | A · B |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

Cinco recursos, todos enteros: `energia`, `oxigeno`, `agua`, `alimentos`, `materiales`.

| Recurso | Entra por | Sale por | Capacidad |
| --- | --- | --- | --- |
| Energía | Paneles | Módulos, refugio | Base + 20 por batería |
| Oxígeno | Generador | Tripulación | Base (+30 por depósito, P1) |
| Agua | Extractor, reciclador | Tripulación, generador, invernadero | Base (+30 por depósito) |
| Alimentos | Invernadero | Tripulación | Base (+30 por depósito) |
| Materiales | Depósitos minerales | Construcción | Base (+30 por depósito) |

### Cuándo cambia cada uno

- **Materiales:** al instante, en `BUILD` y `COLLECT`.
- **El resto:** solo dentro de `advanceDay`, en el orden de [ciclo-de-dias](ciclo-de-dias.md).

### Invariantes

Se comprueban en las pruebas y en `validateState`:

1. Todo recurso es un entero ≥ 0.
2. Al cerrar el día, todo recurso ≤ su capacidad. Durante el día puede superarla; el recorte ocurre en el paso 8.
3. **Conservación:** para cada recurso, `final = inicial + producido − consumido − desperdiciado`. El informe del día trae los cuatro términos.
4. **Un consumo por turno:** cada edificio toma sus insumos y cada tripulante su ración una sola vez por día.
5. **Producción condicionada:** un módulo sin electricidad o sin insumos no produce nada.
6. Una acción rechazada no cambia ningún recurso.
7. `applyAction` no modifica el estado que recibe.

### Reserva de la tripulación

Los módulos solo pueden usar el agua que sobra después de apartar la ración de hoy:

```text
aguaParaModulos = max(0, agua − tripulantes × crewNeedPerDay)
```

Se recalcula después de cada módulo. Frase para el jugador: "Las máquinas nunca usan el agua que la tripulación necesita hoy."

## 3. Datos y uso

Capacidades y reservas iniciales en [dificultad-y-balance](dificultad-y-balance.md).

### Ejemplo de conservación

Media, día 8, agua: inicial 25 · producido 6 + 3 = 9 · consumido 2 + 2 + 4 = 8 · desperdiciado 0 · final 26. Se cumple 25 + 9 − 8 − 0 = 26.

### Desperdicio

Lo que no cabe se pierde y se anota en `DayReport.wasted`. El informe lo convierte en una pista: "Sobraron 6 de energía. Una batería los habría guardado."

### Casos límite

- Cosecha con el almacén casi lleno: entra lo que cabe.
- Recolectar con los materiales al máximo: el exceso se pierde.
- Batería recién operativa: la capacidad sube ese mismo día, antes de guardar.

### Rendimiento

El estado se copia de forma superficial por acción. Las casillas solo se copian cuando cambia alguna. [Tamaño del mapa marciano](../niveles/marte.md#mapa)

## 4. Implementación delegable

**Tarea:** [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md).

**Prompt breve:**

```text
Implementa el libro de recursos del día según docs/componentes/motor-recursos.md: registra por
recurso inicial, producido, consumido y desperdiciado, recorta a la capacidad en el paso 8 y
rellena DayReport. Añade una prueba de propiedad que compruebe la conservación en cada día de
los recorridos.
```

**Pruebas:** U-REC-01 a U-REC-04 e I-INV-01 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** la conservación se cumple en todos los días de los tres recorridos; ningún recurso es negativo; las acciones rechazadas dejan el estado idéntico.

**Evidencia:** pruebas en verde.

**Terminado cuando:** la prueba de invariantes de A6 pasa.

**Riesgos:** errores de un día de desfase entre producir y consumir. Mitigación: el orden del día es fijo y está probado con el ejemplo numérico.
