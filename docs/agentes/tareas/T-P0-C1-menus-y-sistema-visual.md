# T-P0-C1 · Sistema visual, menú, dificultad, opciones y despedida

| Campo | Valor |
| --- | --- |
| ID | T-P0-C1 |
| Prioridad · hito | P0 · H1 (estilos y título) y H2 (resto) |
| Perfil recomendado | [Interfaz](../prompts/interfaz.md) |
| Responsable · revisor | C · A |
| Base Git | Rama `c/p0-c1-menus` desde `main` |
| Estimación | 2,0 h |
| Estado | integrado y probado en Chrome |

## Objetivo

Existe el sistema visual del juego y las pantallas que rodean a la misión: título, selector de dificultad, opciones y despedida.

## Componentes

[menu-principal](../../componentes/menu-principal.md) · [selector-dificultad](../../componentes/selector-dificultad.md) · [menu-opciones](../../componentes/menu-opciones.md) · [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md) · [localizacion](../../componentes/localizacion.md)

## Contexto a leer

1. [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md): paleta, tipografías, tamaños
2. [hud-y-accesibilidad](../../componentes/hud-y-accesibilidad.md): disposición del escenario y reglas de accesibilidad
3. [arranque-y-escenas](../../componentes/arranque-y-escenas.md): `Screen`, `AppContext`, `Flow`, `Options`
4. Las fichas de las tres pantallas

## Dependencias

Los estilos y el HTML se empiezan sin esperar a nadie. Para conectar con el flujo hace falta A2 (tipos) y después A5.

## Rutas

- **Permitidas:** `src/styles/**`, `src/ui/index.ts`, `src/ui/screens/title.ts`, `difficulty.ts`, `options.ts`, `farewell.ts`, `src/ui/components/**`, `src/data/i18n/en/ui.json`, `src/data/i18n/es/ui.json`.
- **Excluidas:** `index.html`, `src/main.ts`, `src/app`, `src/core`, `src/map`.

## Contratos

- `src/ui/index.ts` exporta `registerScreens(flow: Flow): void`.
- Cada pantalla es un `Screen` con `mount(root, ctx)` y `unmount()`.
- `src/styles/index.css` importa `tokens.css`, `base.css`, `screens.css` y `hud.css`.

## Pasos de implementación

1. `tokens.css`: colores, tipografías, radios, espacios y la unidad `--px: calc(100cqw / 1280)`. Todos los tamaños del juego se expresan con `--px`.
2. `base.css`: `#stage` en 16:9 centrado con `container-type: size`; `#map` y `#ui` en sus zonas; foco visible de 3 píxeles en color `--focus`; clase `.sr-only`; reglas de movimiento reducido.
3. Componentes: `button.ts`, `slider.ts`, `toggle.ts`, `dialog.ts` (diálogo modal con foco atrapado), `status-badge.ts` (icono, texto y color para seguro, preventivo, crítico).
4. **Título:** logotipo, fondo con estrellas en movimiento lento, botones Nueva partida, Opciones y Salir, y selector de idioma EN/ES visible. Pie: "Not affiliated with or endorsed by NASA".
5. **Dificultad:** tres tarjetas con nombre, para quién es y tres datos (ventana, tormenta, racha). Botón Volver.
6. **Opciones:** volumen general, música y efectos; silencio; subtítulos; movimiento reducido; idioma; pantalla completa si el navegador lo permite; lista de controles; Volver. Cada cambio se aplica al instante con `ctx.options.set`.
7. **Despedida:** el audio se detiene, mensaje de cierre, botón "Volver al título" y texto "Ya puedes cerrar esta pestaña".
8. Salir con partida activa: diálogo de confirmación.
9. `registerScreens` registra las pantallas en el flujo.
10. Catálogo `ui.json` en inglés y español.

## Entregables

Sistema visual, cuatro pantallas, componentes reutilizables y catálogo de interfaz.

## Pruebas

Manuales M-MEN-01 a M-MEN-06 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Las cuatro pantallas se recorren completas solo con Tab, Enter y Esc.
- [ ] El foco siempre se ve.
- [ ] Cambiar el idioma cambia todos los textos al instante.
- [ ] Con movimiento reducido, las estrellas se quedan quietas.
- [ ] A 1280 × 720, 1366 × 768 y 1920 × 1080 nada se corta ni se solapa.
- [ ] Ningún color está escrito fuera de `tokens.css`. Ningún texto visible está escrito en el código.

## Evidencia

Capturas de las cuatro pantallas en inglés y de una en español.

## Condiciones de integración

`tokens.css`, `base.css` y el título, antes de H1. El resto, antes de H2.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
