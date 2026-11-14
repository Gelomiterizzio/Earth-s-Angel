# Misión terrestre

Verificado en la campaña local. El recorrido y sus resultados están en [PRUEBAS.md](../PRUEBAS.md#verificación-de-campaña).

Contrato del sistema del epílogo. El diseño del nivel, con sus acciones, metas y números, está en [niveles/tierra-alternativa.md](../niveles/tierra-alternativa.md).

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-25 |
| Prioridad · fase | P2 |
| Objetivo | Un epílogo jugable por turnos en el que la tripulación aplica en la Tierra lo aprendido sobre ciclos cerrados. |
| Responsabilidad | `src/core/earth.ts` (A), datos en `src/data/balance/tierra.json` y `content/levels/tierra.json` (B), pantalla `src/ui/screens/earth.ts` (C) |
| Depende de | [agujero-de-gusano](agujero-de-gusano.md), [progresion](progresion.md), [resultados-y-finales](resultados-y-finales.md) |
| No incluye | Tablero de casillas, tripulación, radiación. Es un sistema distinto y más simple. |
| Responsable · revisor | B (diseño y datos) y A (núcleo) · A |
| Estado | Implementado y probado. |

## 2. Arquitectura y funcionamiento

La misión terrestre **no reutiliza** el estado de base lunar. Tiene su propio estado, más pequeño, dentro de `GameState`:

```ts
export type EarthAction = 'energia' | 'agua' | 'reciclaje' | 'restauracion';

export interface EarthState {
  season: number;                       // temporada actual, empieza en 1
  seasons: number;                      // plazo propio
  budget: number;                       // puntos de proyecto disponibles esta temporada
  levels: Record<EarthAction, number>;  // nivel invertido en cada línea
  indicators: { agua: number; emisiones: number; ecosistemas: number }; // 0..100
  result: MissionResult | null;
}

export type EarthGameAction =
  | { type: 'EARTH_INVEST'; action: EarthAction }
  | { type: 'EARTH_END_SEASON'; season: number };
```

`MissionState` pasa a ser una unión en P2: base (`luna`, `marte`) o tierra. Ese cambio de contrato lo hace A antes de empezar las tareas de P2.

### Ciclo de una temporada

1. El jugador reparte su presupuesto entre las cuatro líneas con `EARTH_INVEST`. Cada inversión sube un nivel y cuesta puntos.
2. `EARTH_END_SEASON` aplica, en este orden: efectos de cada línea según su nivel → combinaciones → deriva natural → recorte de indicadores a 0..100 → evaluación.
3. Informe de temporada con causa y efecto.

### Victoria y fallo

- **Éxito:** al cerrar la última temporada, los tres indicadores alcanzan sus metas.
- **Fallo:** se acaba el plazo sin las metas, o el agua disponible llega a 0.
- **Tras un fallo:** `applyTransition('tierra->marte')`. La campaña termina con la victoria ordinaria de Marte. El jugador puede reintentar la misión terrestre antes.

### Mismas garantías que el resto del núcleo

Solo enteros, sin azar, acciones inválidas sin efecto, `EARTH_END_SEASON` protegido contra doble pulsación con el número de temporada, y validación de invariantes al cargar.

## 3. Datos y uso

### Rotulado obligatorio

En pantalla, siempre visibles:

- "El viaje en el tiempo es ficción."
- "Agua disponible, emisiones evitadas y ecosistemas recuperados son indicadores simplificados del juego, no mediciones reales."

### Relación con lo aprendido

Cada línea de acción enlaza con un sistema de la base:

| En la base | En la Tierra |
| --- | --- |
| Paneles y baterías | Energía limpia |
| Reciclador | Uso eficiente del agua |
| Ciclo cerrado de la base | Reciclaje |
| Invernadero | Restauración de ecosistemas |

El informe final lo dice: "Lo que mantuvo viva a la base también cuida la Tierra."

### Casos límite

- Presupuesto insuficiente para una inversión: se rechaza sin cambios.
- Nivel máximo alcanzado: la línea se deshabilita.
- Presupuesto sin gastar: se conserva una parte pequeña para la temporada siguiente, según los datos.

## 4. Implementación delegable

**Tareas:** T-P2-A1 y T-P2-B2 en [P2-segunda-oportunidad.md](../agentes/tareas/P2-segunda-oportunidad.md).

**Prompt breve:**

```text
Implementa src/core/earth.ts según docs/componentes/mision-terrestre.md y
docs/niveles/tierra-alternativa.md: estado EarthState, acciones EARTH_INVEST y
EARTH_END_SEASON, orden fijo de la temporada, victoria y fallo. Solo enteros y sin azar.
```

**Pruebas:** U-TIE-01 a U-TIE-06 e I-CAM-03 e I-CAM-04 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** un recorrido documentado gana; no invertir nada pierde; un fallo devuelve el desenlace marciano; los rótulos de ficción y simplificación están siempre visibles.

**Evidencia:** pruebas en verde y captura de la pantalla con los rótulos.

**Terminado cuando:** B validó el balance con un modelo o con pruebas de recorrido.

**Riesgos:** que los indicadores se lean como ciencia climática real. Mitigación: rótulos fijos y unidades abstractas de 0 a 100.
