# HUD y accesibilidad

Fuente canónica de la **disposición del escenario** y de las **reglas de accesibilidad**.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-06 |
| Prioridad · fase | P0 · H2 y H3 |
| Objetivo | Mostrar el estado de la colonia sin abrumar y permitir todas las acciones con ratón o teclado. |
| Responsabilidad | `src/ui/screens/mission.ts`, `src/ui/hud/**`, `src/styles/hud.css` |
| Depende de | [arranque-y-escenas](arranque-y-escenas.md), [objetivos](objetivos.md), [eventos-ambientales](eventos-ambientales.md), [tripulacion](tripulacion.md), [controles](controles.md), [localizacion](localizacion.md) |
| No incluye | El tablero ([mapa](mapa.md)). El panel de decisión (B). El informe del día ([resultados-y-finales](resultados-y-finales.md)). |
| Responsable · revisor | C · B |
| Estado | HUD integrado con el núcleo, mapa y panel de decisión de P0. |

## 2. Arquitectura y funcionamiento

### Disposición del escenario

Referencia de 1280 × 720 unidades, proporción 16:9. `#stage` se ajusta a la ventana manteniendo la proporción. Los tamaños se escriben con `--px: calc(100cqw / 1280)`.

| Zona | x | y | Ancho | Alto | Dueño |
| --- | --- | --- | --- | --- | --- |
| Barra superior | 0 | 0 | 1280 | 72 | C |
| Tablero `#map` | 24 | 88 | 576 | 576 | B |
| Panel derecho | 624 | 88 | 632 | 576 | C |
| Barra inferior | 0 | 672 | 1280 | 48 | C |

El tablero lunar tiene 288 × 288 píxeles lógicos y se muestra al doble: casillas de 48 unidades. El HUD nunca tapa la zona del tablero. Diálogos y paneles modales sí la cubren, con un velo.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Día 8/20 · 🌍 47   ⚡ Energía   🫧 Soporte vital   🛡 Protección   ▣ 14  ●●●● │
├───────────────────────────┬──────────────────────────────────────────────┤
│                           │ Objetivos            ✔✔✔✔▢▢   Racha 1/3      │
│                           │ Pronóstico           Hoy ☢ · Mañana ☀        │
│        TABLERO            │ Construir   [panel][batería][generador]...   │
│                           │             [Explorar] [Recolectar]          │
│                           │ Tripulación  ▮▮▮▮                            │
├───────────────────────────┴──────────────────────────────────────────────┤
│ Mensajes (aria-live)                                   [ Finalizar día ] │
└──────────────────────────────────────────────────────────────────────────┘
```

### Tres medidores

El reto sugiere dos o tres recursos principales. El HUD agrupa seis variables en tres medidores y deja el detalle a un toque.

La cabecera reserva una columna para cada medidor. Nombre y lectura ocupan dos líneas y el detalle se abre debajo del medidor, donde cabe el texto sin recortarse. La paleta usa los mismos atlas de edificios que el tablero lunar y la vista de arte de Marte. Los retratos usan celdas de 32 × 32 con el borde fuera de la imagen. [Manifiesto y anclajes](../ARTE-Y-ACTIVOS.md).

El estado de cada medidor lo calcula el núcleo, no la interfaz:

```ts
// src/core, expuesto en index.ts
export type Status = 'seguro' | 'preventivo' | 'critico';
export interface HudSummary {
  energia:    { status: Status; stored: number; cap: number; generationToday: number; demandToday: number };
  soporte:    { status: Status; marginDays: number; limiting: 'oxigeno' | 'agua' | 'alimentos' };
  proteccion: { status: Status; maxExposure: number; shelterReady: boolean; alertInDays: number | null };
}
export function summarizeHud(state: GameState, data: GameData): HudSummary;
```

| Medidor | Seguro ✔ | Preventivo ▲ | Crítico ✖ |
| --- | --- | --- | --- |
| Energía | Batería ≥ umbral y la generación de hoy cubre el consumo | Batería < umbral, o el consumo de hoy supera a la generación | Con la energía de hoy, algún módulo de soporte vital se quedará sin electricidad |
| Soporte vital | Las tres reservas ≥ umbral | Alguna < umbral y margen de 2 días o más | Margen de 1 día o menos |
| Protección | Exposición < 50 y, si hay alerta en el pronóstico, hay refugio listo | Exposición de 50 a 74, o alerta en el pronóstico sin refugio listo | Exposición ≥ 75, o tormenta hoy sin refugio |

`marginDays` = el menor de `floor(reserva / consumo diario de la tripulación)` entre oxígeno, agua y alimentos.

### Flujo

1. `mission.ts` se monta en la escena `mision` y crea las zonas.
2. Cada zona se suscribe al almacén y actualiza solo lo que cambió.
3. La paleta llama a `uiStore.setTool`. **Finalizar día** despacha `END_DAY` con el día actual.
4. Con `phase === 'decision'` se monta el panel de B. Con `phase === 'report'`, el informe del día.
5. `action/rejected` escribe el motivo en la línea de mensajes.

## 3. Datos y uso

### Contenido de cada zona

| Zona | Muestra |
| --- | --- |
| Barra superior | Día y ventana · plazo terrestre · tres medidores · materiales · puntos de acción · ayuda, opciones, pausa |
| Objetivos | Los seis con ✔ o pendiente y su progreso |
| Pronóstico | Hoy y los días del horizonte, con icono y texto |
| Construir | Un botón por edificio: icono, nombre, costo, puntos de acción. Explorar y Recolectar |
| Tripulación | Rol, salud y exposición de cada uno, con barra y número |
| Barra inferior | Mensajes y Finalizar día |

En Marte "Día" se sustituye por "Sol" y la tarjeta científica lo explica.

### Reglas de accesibilidad

1. **Controles reales.** Todo lo accionable es `button`, `a` o `input`, con nombre accesible.
2. **Teclado completo.** Tab recorre en orden de lectura. Enter y Espacio activan. Esc cierra el panel abierto o abre la pausa.
3. **Foco visible.** Contorno de 3 unidades en color `--focus`, nunca oculto.
4. **Nunca solo color.** Cada estado lleva icono con forma propia y texto: ✔ círculo "Seguro", ▲ triángulo "Atención", ✖ octágono "Crítico".
5. **Contraste** de texto de 4,5:1 o más; de iconos y bordes de control, 3:1 o más.
6. **Avisos hablados.** Mensajes en una región `aria-live="polite"`. Alertas de radiación y de falta de recursos, en `aria-live="assertive"`.
7. **Diálogos modales** con `role="dialog"`, `aria-modal`, foco atrapado y retorno del foco al cerrar.
8. **Movimiento reducido.** Si la opción o `prefers-reduced-motion` están activas: sin desplazamientos, sacudidas ni parpadeos. Solo cambios instantáneos o fundidos de 150 ms.
9. **Texto.** Cuerpo de 16 unidades en 1280 × 720. La cabecera compacta usa 12 a 14 unidades. Frases cortas y detalle accesible al abrir cada medidor.
10. **Sin límite de tiempo.** Nada en el juego expira por reloj real.
11. **Todo aviso sonoro tiene equivalente visual.**

### Tamaños de pantalla

El escenario de referencia mide 1280 × 720 y escala manteniendo la proporción 16:9. Por debajo de 1024 de ancho aparece un aviso de pantalla estrecha. [Comprobaciones de la vista previa](../DESPLIEGUE.md#vista-previa-de-interfaz).

### Casos límite

- Doble clic en Finalizar día: el botón se deshabilita al primer clic y el núcleo rechaza el segundo.
- Nombre de edificio largo en español: el botón parte en dos líneas, no recorta.
- Más de un aviso a la vez: se encolan en la línea de mensajes; las alertas pasan delante.

## 4. Implementación delegable

**Tareas:** [T-P0-C2](../agentes/tareas/T-P0-C2-hud.md) (interfaz) y [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md) (`summarizeHud`).

**Prompt breve:**

```text
Construye el HUD de la misión según docs/componentes/hud-y-accesibilidad.md: cuatro zonas con
las medidas de la tabla, tres medidores que pintan el HudSummary que devuelve summarizeHud,
objetivos, pronóstico, paleta, tripulación y barra inferior. Cumple las once reglas de
accesibilidad. La interfaz no calcula estados: los pide al núcleo.
```

**Pruebas:** M-HUD-01 a M-HUD-08 y U-HUD-01 a U-HUD-03 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** los tres medidores cambian de estado en los umbrales de la tabla; todo se maneja con teclado; cada estado se distingue en escala de grises; el HUD no invade la zona del tablero.

**Evidencia:** capturas en los tres estados y una en escala de grises.

**Terminado cuando:** B confirma que el HUD dice la verdad del estado en el recorrido de Media.

**Riesgos:** demasiada información a la vez. Mitigación: el detalle solo aparece al abrir un medidor.
