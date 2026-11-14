# Selector de dificultad

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-04 |
| Prioridad · fase | P0 · H2 |
| Objetivo | Que el jugador elija entre Fácil, Media e Imposible sabiendo qué cambia. |
| Responsabilidad | `src/ui/screens/difficulty.ts` |
| Depende de | [dificultad-y-balance](dificultad-y-balance.md), [arranque-y-escenas](arranque-y-escenas.md) |
| No incluye | Los valores de cada dificultad. |
| Responsable · revisor | C · B |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

Pantalla de la escena `dificultad`. Se llega desde **Nueva partida**.

Tres tarjetas, cada una un botón grande:

| | Fácil | Media | Imposible |
| --- | --- | --- | --- |
| Icono | ✔ con una estrella | ▲ con dos | ✖ con tres |
| Para quién | "Tu primera misión" | "Ya sabes cómo funciona la base" | "Solo para expertos" |
| Ventana | 24 días | 20 días | 16 días |
| Tormenta solar | Moderada, 1 día | Severa, 1 día | Severa, 2 días |
| Estabilidad exigida | 2 días | 3 días | 4 días |

Los tres datos de cada tarjeta **se leen de `ctx.data`**, no se escriben en la interfaz. Si cambia el balance, la tarjeta cambia sola.

### Flujo

1. Elegir una tarjeta → `ctx.flow.startCampaign(difficulty)`.
2. `flow` crea la campaña y pasa a la cinemática de apertura.
3. **Volver** regresa al título.

## 3. Datos y uso

- **Foco inicial:** Fácil.
- **Teclado:** flechas izquierda y derecha o Tab entre tarjetas; Enter elige; Esc vuelve.
- **Nota al pie:** "Las reglas son las mismas. Cambian las reservas, el tiempo y la tormenta."
- **Claves de texto:** `ui.difficulty.*`.
- Cada dificultad se distingue por icono, nombre y texto, no solo por color.

### Casos límite

- Doble clic en una tarjeta: tras el primero, las tres se deshabilitan.
- `?seed=demo`: se puede elegir cualquier dificultad; la demo usa Media.
- Si H4 no verifica Fácil o Imposible, esas tarjetas llevan la etiqueta "Experimental" ([PLAN-EQUIPO.md](../PLAN-EQUIPO.md#6-criterios-para-cortar-alcance)).

## 4. Implementación delegable

**Tarea:** [T-P0-C1](../agentes/tareas/T-P0-C1-menus-y-sistema-visual.md).

**Prompt breve:**

```text
Implementa src/ui/screens/difficulty.ts según docs/componentes/selector-dificultad.md: tres
tarjetas-botón cuyos datos salen de ctx.data, foco inicial en Fácil y llamada a
ctx.flow.startCampaign al elegir.
```

**Pruebas:** M-MEN-02 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** las cifras de las tarjetas coinciden con los JSON de balance; elegir inicia la apertura una sola vez; todo funciona con teclado.

**Evidencia:** captura de la pantalla.

**Terminado cuando:** las tres dificultades arrancan una misión con sus reservas iniciales.

**Riesgos:** que "Imposible" desanime a los más pequeños. Mitigación: Fácil tiene el foco inicial y el texto "Tu primera misión".
