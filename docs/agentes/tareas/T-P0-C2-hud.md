# T-P0-C2 · HUD, paleta de construcción, pronóstico y objetivos

| Campo | Valor |
| --- | --- |
| ID | T-P0-C2 |
| Prioridad · hito | P0 · H2 (lectura del estado) y H3 (completo) |
| Perfil recomendado | [Interfaz](../prompts/interfaz.md) |
| Responsable · revisor | C · B |
| Base Git | Rama `c/p0-c2-hud` desde `main` |
| Estimación | 2,5 h |
| Estado | integrado y probado con la misión lunar |

## Objetivo

Durante la misión el jugador ve el estado de la colonia en tres medidores, sabe qué viene, elige qué construir y cierra el día.

## Componentes

[hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md) · [objetivos](../../componentes/objetivos.md) · [eventos-ambientales](../../componentes/eventos-ambientales.md) · [tripulacion](../../componentes/tripulacion.md) · [controles](../../componentes/controles.md)

## Contexto a leer

1. [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md) completo
2. [ARQUITECTURA.md](../../ARQUITECTURA.md): `MissionState`, `ObjectiveStatus`, `ForecastItem`, `Tool`, `computeForecast`, `previewEnergy`
3. [construccion](../../componentes/construccion.md): catálogo y textos de "por qué"
4. [controles](../../componentes/controles.md): atajos

## Dependencias

C1 y A2. Trabaja con `fixtureState` hasta que A3 esté en `main`. B5 entrega el panel de decisión, que tú montas.

## Rutas

- **Permitidas:** `src/ui/screens/mission.ts`, `src/ui/screens/pause.ts`, `src/ui/hud/**`, `src/styles/hud.css`, `src/data/i18n/*/ui.json`.
- **Excluidas:** `src/ui/panels/decision.ts` (B), `src/map`, `src/core`.

## Contratos

- El HUD lee con `ctx.store.subscribe` y nunca guarda copia del estado.
- Cambia la herramienta con `ctx.uiStore.setTool`.
- Cierra el día con `ctx.store.dispatch({ type: 'END_DAY', day: mission.day })`.
- Monta `mountDecisionPanel` cuando `phase === 'decision'` y el informe del día (C3) cuando `phase === 'report'`.

## Pasos de implementación

1. `mission.ts`: `Screen` de la escena `mision`. Monta las zonas del HUD según la [disposición del escenario](../../componentes/hud-y-accesibilidad.md#disposición-del-escenario).
2. **Barra superior:** día de misión y ventana ("Day 5 / 20"), plazo terrestre, los tres medidores, materiales, puntos de acción, y botones de ayuda, opciones y pausa.
3. **Tres medidores**, cada uno con icono, valor, texto de estado y color:
   - Energía: batería y capacidad. Al abrir: generación, consumo y módulos sin electricidad.
   - Soporte vital: el menor margen en días entre oxígeno, agua y alimentos. Al abrir: los tres con su reserva y su cambio de ayer.
   - Protección: exposición máxima y estado del refugio. Al abrir: exposición por tripulante.
   Umbrales de seguro, preventivo y crítico en la ficha del HUD.
4. **Objetivos:** lista de los seis con ✔ o pendiente, y progreso de la racha ("2 / 3").
5. **Pronóstico:** hoy y los próximos días del horizonte, con icono y texto. Usa `computeForecast`.
6. **Paleta de construcción:** un botón por edificio disponible con icono, nombre, costo y puntos de acción. Deshabilitado con motivo si no alcanza. Al enfocar muestra "por qué construirlo". Botones Explorar y Recolectar.
7. **Tripulación:** cuatro retratos con salud y exposición, en texto y barra.
8. **Barra inferior:** línea de mensajes con `aria-live="polite"` y el botón **Finalizar día**, grande, con atajo.
9. Finalizar día se deshabilita mientras `phase !== 'planning'`. Tras pulsarlo se deshabilita hasta que llegue el estado nuevo.
10. `pause.ts`: Reanudar, Opciones, Reintentar misión con confirmación, Salir al título con confirmación.
11. Actualización por partes: cada zona compara lo que mostraba con lo nuevo y solo toca lo que cambió.

## Entregables

HUD completo conectado al almacén y pantalla de pausa.

## Pruebas

Manuales M-HUD-01 a M-HUD-08 y M-PAU-01 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Con `fixtureState('media-dia-8')` el HUD muestra energía 24/40, soporte vital con margen de 5 días y exposición 7.
- [ ] Cada estado se distingue sin color: tiene icono y texto.
- [ ] Doble clic en Finalizar día avanza un solo día.
- [ ] Un edificio que no se puede pagar aparece deshabilitado y dice qué falta.
- [ ] Todo el HUD se recorre con Tab en un orden lógico y los atajos funcionan.
- [ ] Un mensaje de rechazo del núcleo se lee en la línea de mensajes.
- [ ] El HUD no tapa el tablero.

## Evidencia

Capturas del HUD en estado seguro, preventivo y crítico.

## Condiciones de integración

Lectura del estado antes de H2. Completo antes de H3.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
