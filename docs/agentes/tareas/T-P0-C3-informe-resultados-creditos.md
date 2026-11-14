# T-P0-C3 · Informe del día, resultados y créditos

| Campo | Valor |
| --- | --- |
| ID | T-P0-C3 |
| Prioridad · hito | P0 · H3 |
| Perfil recomendado | [Interfaz](../prompts/interfaz.md) |
| Responsable · revisor | C · B |
| Base Git | Rama `c/p0-c3-informes` desde `main` |
| Estimación | 1,5 h |
| Estado | integrado. Informe, victoria y derrota comprobados |

## Objetivo

Al cerrar cada día el jugador entiende qué pasó y por qué. Al terminar la misión ve un resultado que le enseña algo y le invita a reintentar. Los créditos reconocen fuentes, herramientas y uso de IA.

## Componentes

[resultados-y-finales](../../componentes/resultados-y-finales.md) · [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md)

## Contexto a leer

1. [resultados-y-finales](../../componentes/resultados-y-finales.md)
2. [ARQUITECTURA.md](../../ARQUITECTURA.md): `DayReport`, `MissionResult`
3. [IA-Y-CREDITOS.md](../../IA-Y-CREDITOS.md)
4. [NASA-SPACE-APPS-2026.md](../../NASA-SPACE-APPS-2026.md): reglas de IA y de atribución

## Dependencias

A4 para el informe y el resultado reales. Con `fixtureReport()` se puede empezar antes.

## Rutas

- **Permitidas:** `src/ui/panels/day-report.ts`, `src/ui/screens/result.ts`, `src/ui/screens/credits.ts`, `src/ui/credits-data.ts`, `src/data/i18n/*/ui.json`, `src/styles/screens.css`.
- **Excluidas:** `src/core`, `src/map`.

## Contratos

- `mountDayReport(root, ctx): () => void`. Se muestra con `phase === 'report'`. El botón Continuar despacha `ACK_REPORT`.
- La pantalla de resultado lee `mission.result`.
- Los textos de causa y efecto, principio y sugerencia llegan como claves `sim.*` del núcleo. Tú solo las traduces con `ctx.t`.

## Pasos de implementación

1. **Informe del día**, diálogo modal:
   - Título "Día N" y eventos activos.
   - Tres bloques, uno por medidor: energía (generada, usada, guardada, desperdiciada), soporte vital (producido y consumido de agua, oxígeno y alimentos), protección (exposición del día, con o sin refugio).
   - **Causa y efecto:** una frase por cada clave de `causeEffectKeys`. Es lo más importante del informe.
   - Racha y objetivos que cambiaron hoy.
   - Botón Continuar, con foco inicial.
2. **Resultado de victoria:** días usados, plazo terrestre restante, reservas y márgenes, exposición máxima, incidentes, semilla. Botones: Jugar otra vez, Créditos, Título. Aviso "Marte: próximamente".
3. **Resultado de derrota:** causa en una frase, qué decisiones y recursos estuvieron implicados, un principio científico y **una sugerencia concreta** para el siguiente intento. Botones: Reintentar misión, Título. Tono: la tripulación fue evacuada y puede volver a intentarlo.
4. Reintentar misión despacha `RESTART_MISSION` tras confirmar.
5. **Créditos:** equipo, reto y evento, fuentes NASA con enlace, herramientas y bibliotecas con licencia, tipografías, **uso de IA** (qué, con qué herramienta, quién revisó), y la frase de no afiliación. Los datos salen de `credits-data.ts`, que refleja [IA-Y-CREDITOS.md](../../IA-Y-CREDITOS.md).
6. Si la comprobación de aprendizaje está activa, la pantalla de resultado muestra la pregunta final (componente de C4).

## Entregables

Informe del día, dos variantes de resultado y créditos.

## Pruebas

Manuales M-INF-01 a M-INF-04 y M-RES-01 a M-RES-04 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] El informe del día 8 de Media muestra las cifras del ejemplo numérico.
- [ ] Cada derrota muestra causa, principio y sugerencia distintos según la causa.
- [ ] La semilla aparece en el resultado.
- [ ] Los créditos nombran DONKI con enlace, declaran el uso de IA y dicen que el proyecto no está afiliado a NASA.
- [ ] Todo se maneja con teclado. Enter continúa.
- [ ] Ningún texto de causa, principio o sugerencia está escrito en `src/ui`.

## Evidencia

Capturas del informe, de una victoria, de una derrota y de los créditos.

## Condiciones de integración

Fusionado antes de H3 (sábado 21:00).

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
