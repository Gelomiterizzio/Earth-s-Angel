# Energía

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-18 |
| Prioridad · fase | P0 · H2 |
| Objetivo | Calcular generación, almacenamiento y reparto de la electricidad, de modo que priorizar sea una decisión real. |
| Responsabilidad | `src/core/energy.ts` |
| Depende de | [eventos-ambientales](eventos-ambientales.md), [construccion](construccion.md), [dificultad-y-balance](dificultad-y-balance.md) |
| No incluye | Qué hace cada módulo una vez encendido. |
| Responsable · revisor | A · B |
| Estado | Propuesto. Reglas validadas en el modelo de referencia. |

## 2. Arquitectura y funcionamiento

Pasos 3 y 4 del día.

```text
capE       = capacidad base + batteryCapacity × baterías operativas
gen        = floor(paneles operativos × panelOutput × solar / 100)
disponible = energia + gen

si shelterToday:
  disponible >= shelterEnergy → refugio activo, disponible −= shelterEnergy

para cada tipo en energyPriority, y dentro del tipo por id:
  si el edificio está operativo y encendido:
    disponible >= energyPerDay → con electricidad, disponible −= energyPerDay
    si no → sin electricidad (evento building/unpowered)

energia final = min(capE, disponible)      // paso 8; el resto se desperdicia
```

- Un edificio está encendido del todo o apagado. No hay medias potencias.
- El orden por defecto es generador, reciclador, extractor, invernadero. El jugador lo cambia con `SET_ENERGY_PRIORITY`. Un orden que no contenga exactamente los tipos con consumo se rechaza con `INVALID_PRIORITY`.
- Un edificio apagado por el jugador (`enabled: false`) no pide energía.
- Si un edificio no alcanza, se sigue con los siguientes: uno más barato puede encenderse.

### Vista previa

`previewEnergy(state, data)` devuelve la generación de hoy, la demanda de los edificios encendidos y si el refugio se podría pagar. La usan el HUD y el panel de decisión.

## 3. Datos y uso

Valores en [dificultad-y-balance](dificultad-y-balance.md) y [construccion](construccion.md): panel 8, batería +20, generador 4, reciclador 3, extractor 3, invernadero 4, refugio 4, 6 u 8 según dificultad.

### Ejemplo: día de sombra

Media, día 4, sol al 25 %. Dos paneles. Batería 20 de 20. Operativos: extractor, reciclador, generador e invernadero.

| Paso | Cálculo | Resultado |
| --- | --- | --- |
| Generar | floor(2 × 8 × 25 / 100) | 4 |
| Disponible | 20 + 4 | 24 |
| Asignar | 4 + 3 + 3 + 4 | 14 usados |
| Guardar | min(20, 10) | 10 |

Sin batería llena al empezar, algún módulo se habría apagado. Es la lección: guardar energía para cuando hay poca luz.

### Compromisos que crea

- **Panel o batería:** el panel da energía todos los días con sol; la batería salva los días sin él.
- **Qué apagar:** con poca energía, apagar el invernadero ahorra 4 pero retrasa y reduce la cosecha.
- **Refugio:** el día de tormenta gasta de 4 a 8 de energía con prioridad absoluta.

### Unidades

La energía del juego es energía almacenable por día, en unidades de juego. No hay potencia instantánea. Si en el futuro se usan unidades físicas: energía en kWh, potencia en kW.

### Casos límite

- Sin paneles operativos: `gen = 0` y se vive de la batería.
- Sol al 0 %: igual.
- Panel colocado hoy: genera desde mañana.
- Energía sobrante con la batería llena: se desperdicia y el informe lo dice.

### Referencia científica

Relación entre luz, generación y almacenamiento: `transformación didáctica`. Factor de polvo en Marte: InSight, en [CIENCIA-Y-DATOS.md](../CIENCIA-Y-DATOS.md).

## 4. Implementación delegable

**Tarea:** [T-P0-A3](../agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md).

**Prompt breve:**

```text
Implementa src/core/energy.ts según docs/componentes/energia.md: capacidad, generación con
factor solar, asignación binaria por prioridad con el refugio primero, y previewEnergy.
Prueba el ejemplo del día de sombra con sus cuatro cifras.
```

**Pruebas:** U-ENE-01 a U-ENE-06 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** el ejemplo da 4, 24, 14 y 10; cambiar la prioridad cambia qué módulo se apaga; el refugio se enciende antes que cualquier otro.

**Evidencia:** pruebas en verde.

**Terminado cuando:** los días 4 de Media y 5 y 6 de Imposible dan la energía de las tablas.

**Riesgos:** prioridades que el jugador no entiende. Mitigación: en P0 el HUD ofrece interruptores por módulo y el orden por defecto.
