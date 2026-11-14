# Objetos secretos

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-23 |
| Prioridad · fase | P2 |
| Objetivo | Esconder una baliza en cada mapa y dar pistas suficientes para hallarla razonando, sin azar. |
| Responsabilidad | Posiciones y pistas en `src/data/content/levels/*.json` (B), descubrimiento en `src/core/actions.ts` (A), registro de pistas en la interfaz (C) |
| Depende de | [mapa](mapa.md), [construccion](construccion.md) (laboratorio y comunicaciones), [agujero-de-gusano](agujero-de-gusano.md) |
| No incluye | Activación del portal. |
| Responsable · revisor | B · C |
| Estado | Propuesto. Sin validar. Todo es `ficción`. |

## 2. Arquitectura y funcionamiento

Cada mapa tiene **una baliza** en una casilla de terreno llano, sin marca visible. Tres pistas la señalan. Dos bastan.

| Pista | Cómo se obtiene | Qué dice |
| --- | --- | --- |
| Fragmento tecnológico | Explorar la casilla `misterio` del mapa | La **columna** de la baliza, como símbolo grabado |
| Registro científico | Laboratorio operativo durante 3 días | La **fila** de la baliza, como lectura del subsuelo |
| Señal de antena | Comunicaciones operativas | Distancia en casillas desde la antena hasta la baliza |

Con columna y fila el jugador conoce la casilla exacta. Con una de ellas y la distancia, quedan como mucho dos candidatas.

### Descubrimiento

Acción `EXPLORE` sobre la casilla de la baliza cuando ya está explorada no sirve: hace falta una acción propia.

```ts
{ type: 'SCAN'; x: number; y: number }     // se añade al contrato en P2
```

- Cuesta 1 punto de acción.
- Sobre la casilla correcta: `discovery/found` con `beacon-<nivel>`, y la bandera `beaconMoon` o `beaconMars`.
- Sobre otra casilla: no ocurre nada más que el gasto. El mensaje dice "Nada aquí" y, si hay antena, repite la distancia.

**Sin azar:** las posiciones son fijas en los datos del nivel y las pistas son exactas. La misma partida siempre tiene la baliza en el mismo sitio.

### Persistencia

Las pistas obtenidas viven en `campaign.clues` y viajan en el manifiesto de transferencia. Una pista conseguida en la Luna sigue visible en Marte.

## 3. Datos y uso

### Posiciones propuestas

| Nivel | Casilla `misterio` | Baliza | Fragmento dice | Registro dice |
| --- | --- | --- | --- | --- |
| Luna | (9,1) | (10,2) | "Columna 10" | "Fila 2" |
| Marte | (16,3) | (17,12) | "Columna 17" | "Fila 12" |

### Cómo se muestran

- **Registro de pistas** en el panel de ayuda: una línea por pista, con icono.
- El fragmento se enseña como un dibujo con tantas muescas como la columna, para que contarlas sea parte del juego. El texto alternativo da el número.
- Cuando el jugador tiene columna y fila, la casilla **no** se marca sola en el mapa: la encuentra él.

### Relación con la campaña

- En P0 la casilla `misterio` de la Luna ya existe y da una tarjeta de hallazgo, sin más efecto.
- La baliza lunar exige laboratorio o comunicaciones, que son edificios de P1.
- No encontrar las balizas no impide ganar: lleva a la victoria ordinaria.

### Casos límite

- Baliza bajo un edificio: `SCAN` funciona igual; la baliza está bajo el suelo.
- Jugador que escanea todo el mapa: posible, pero cuesta un punto de acción por casilla. Las pistas son el camino barato.
- Pistas de un nivel no sirven para el otro: cada una lleva el nombre de su nivel.

## 4. Implementación delegable

**Tarea:** T-P2-B1 en [P2-segunda-oportunidad.md](../agentes/tareas/P2-segunda-oportunidad.md).

**Prompt breve:**

```text
Implementa la búsqueda de balizas según docs/componentes/objetos-secretos.md: tres pistas
exactas por nivel, acción SCAN de 1 punto de acción y banderas beaconMoon y beaconMars.
Posiciones fijas en los datos del nivel. Nada de azar.
```

**Pruebas:** U-SEC-01 a U-SEC-05 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** las pistas persisten al pasar de la Luna a Marte; `SCAN` en la casilla correcta pone la bandera; en otra casilla solo gasta el punto de acción.

**Evidencia:** pruebas en verde y captura del registro de pistas.

**Terminado cuando:** un jugador encuentra las dos balizas usando solo las pistas.

**Riesgos:** búsqueda frustrante. Mitigación: dos pistas bastan y son exactas.
