# Menú principal

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-02 |
| Prioridad · fase | P0 · H1 |
| Objetivo | Presentar el juego y dar acceso a jugar, a las opciones y a salir. |
| Responsabilidad | `src/ui/screens/title.ts`, `src/ui/screens/farewell.ts` |
| Depende de | [arranque-y-escenas](arranque-y-escenas.md), [localizacion](localizacion.md), [audio](audio.md) |
| No incluye | Selector de dificultad y opciones, que tienen su ficha. |
| Responsable · revisor | C · A |
| Estado | Integrado con el flujo de P0. Continuar recupera la misión activa al volver al título en la misma pestaña. |

## 2. Arquitectura y funcionamiento

Pantalla de la escena `titulo`. Es un `Screen`: recibe `ctx` y no guarda estado del juego.

### Contenido

- Título **Earth's Angel** y logotipo propio.
- Ilustración lunar fija con la Tierra al fondo. El panel de controles se sitúa delante de la imagen.
- Botones, en este orden: **Continuar** (si hay una misión en curso en la sesión) · **Nueva partida** · **Opciones** · **Créditos** · **Salir**.
- Selector de idioma EN / ES, siempre visible.
- Pie: "A NASA Space Apps Challenge 2026 project. Not affiliated with or endorsed by NASA."

### Flujo

| Acción | Resultado |
| --- | --- |
| Nueva partida | `flow.go('dificultad')`. Con una misión activa, primero pide confirmación. |
| Opciones | `flow.go('opciones')` |
| Créditos | `flow.go('creditos')` |
| Salir | Con misión activa, diálogo "¿Salir? Perderás la misión en curso". Después `flow.go('despedida')`. |
| Cambiar idioma | `options.set('language', ...)`. Los textos cambian al instante. |

### Despedida

Escena `despedida`. Un sitio web no puede cerrar la pestaña del jugador, así que la pantalla lo dice con claridad:

- El audio se detiene.
- Mensaje: "Gracias por jugar. Todavía estamos a tiempo de proteger la Tierra."
- Botón **Volver al título**.
- Texto: "Ya puedes cerrar esta pestaña."

## 3. Datos y uso

- **Audio:** el primer clic o tecla llama a `audio.unlock()` y arranca `music-menu`. Antes no suena nada.
- **Foco inicial:** en Nueva partida, o en Continuar si existe.
- **Teclado:** flechas arriba y abajo o Tab recorren los botones; Enter activa.
- **Movimiento reducido:** el fondo queda fijo.
- **Activos.** `ui/logo.png` y `ui/menu-bg.png`. Si falla la carga se muestra el título de texto o el fondo de color, respectivamente. [Manifiesto visual](../ARTE-Y-ACTIVOS.md).
- **Claves de texto:** `ui.title.*`, `ui.farewell.*`.

### Casos límite

- `?seed=demo` en la URL: junto al título aparece una etiqueta discreta "Demo seed".
- Idioma del navegador en español: el juego sigue abriendo en inglés. El requisito de entrega manda.
- Ventana más estrecha de 1024: aviso de pantalla pequeña sobre el menú.

## 4. Implementación delegable

**Tarea:** [T-P0-C1](../agentes/tareas/T-P0-C1-menus-y-sistema-visual.md).

**Prompt breve:**

```text
Implementa src/ui/screens/title.ts y farewell.ts como objetos Screen según
docs/componentes/menu-principal.md. Botones reales, foco inicial en Nueva partida, selector de
idioma visible, confirmación al salir con misión activa. Textos desde ctx.t.
```

**Pruebas:** M-MEN-01 a M-MEN-03 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** se llega a cada destino con ratón y con teclado; el idioma cambia al instante; Salir con misión activa pide confirmación; la despedida detiene el audio.

**Evidencia:** capturas del título en inglés y en español.

**Terminado cuando:** el título es la primera pantalla de la URL pública.

**Riesgos:** que el fondo animado distraiga o cueste rendimiento. Mitigación: una sola capa con transformación CSS.
