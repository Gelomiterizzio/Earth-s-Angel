# T-RPG-A1 · Mecánicas del RPG de Earth’s Angel

| Campo | Valor |
| --- | --- |
| Responsable | Antigravity, implementación de mecánicas |
| Revisión e integración visual | Codex |
| Punto de partida | Carpeta del proyecto con la salida lunar a pie ya implementada |
| Primer entregable | Recorrido lunar completo desde una partida nueva |
| Estado | Hito 1 integrado localmente y verificado en Edge. Hitos 2 y 3 propuestos |

## Encargo para Antigravity

Desarrolla el RPG de exploración y gestión de Earth’s Angel sobre la campaña existente. El jugador controla a un astronauta, explora a pie y toma decisiones que cambian el estado de la base y la siguiente etapa de la misión. Entrega primero el recorrido lunar del hito 1 y continúa por hitos verificables hasta cubrir la campaña.

Antes de editar, lee [AGENTS.md](../../../AGENTS.md), [las reglas del equipo](../REGLAS-DE-TRABAJO.md), [la arquitectura](../../ARQUITECTURA.md) y [la ficha del mapa](../../componentes/mapa.md). Comprueba `git status --short`. El prototipo puede estar en cambios locales, incluido `src/map/walk.ts`. Si trabajas desde otra copia, parte de una que los incluya. Sigue el [protocolo de integración](../PROTOCOLO-INTEGRACION.md) y respeta la congelación y las ramas de entrega descritas allí.

## Hito 1 · Una misión lunar jugable

1. Parte de `src/map/walk.ts`, `src/map/index.ts` y `src/map/map-input.ts`. Completa el movimiento con WASD, las colisiones, la cámara y la interacción con la casilla frente al astronauta. Caminar deja intactos los puntos de acción. Ajusta el foco para que informes, diálogos y pausa tengan prioridad sobre el control del personaje.
2. Vincula **E** con las acciones disponibles del terreno y los equipos. Antes de confirmar, presenta la acción, su costo y el motivo si está bloqueada. Usa las validaciones y acciones del núcleo para explorar, recoger, construir y reparar. Evita repetir una acción por mantener pulsada la tecla.
3. Completa una salida que se pueda hacer desde **Nueva partida**. El jugador sale de la nave, reconoce un objetivo cercano y decide entre dedicar sus acciones a energía o a materiales. La campaña actual permite instalar un panel o recoger el depósito. Si se introduce un panel averiado como parte del arranque, coordina su efecto en balance y guardado con A y B. El informe debe reflejar el efecto real de la elección, incluido el día en que una construcción comienza a producir.
4. Conecta **M** al diario de misión y resuelve el atajo actual de foco del mapa. El diario debe poder presentar el objetivo activo, el plazo y el progreso. Implementa el comportamiento y una vista funcional; Codex realizará su diseño final.

**Aceptación.** Desde una partida nueva se puede caminar, interactuar, tomar una decisión y cerrar el día con teclado. Se comprueban ambas elecciones y la diferencia en el estado resultante. Se comprueba reparación con un estado que contiene una avería y que el recorrido sigue funcionando al recargar un guardado existente.

## Hito 2 · Tripulación y exploración

1. Permite seleccionar a la comandante, la ingeniera, el botánico o la médica. Da a cada rol una acción propia que afecte el estado y se pueda probar durante una misión. Usa la salud, exposición y trabajo realizado para diferenciar cómo les afectan los riesgos. Los efectos del juego conservan su clasificación científica.
2. Amplía el mapa por zonas jugables. Prueba primero la base, un depósito o cráter y un lugar de trabajo con una decisión distinta en cada zona. Verifica que el jugador pueda salir y regresar. Coordina con B cualquier cambio en los mapas de campaña o sus cifras de balance.
3. Añade un impacto de micrometeorito como evento de ficción que cause una avería o un bloqueo y obligue a tomar una decisión. Prueba el efecto del evento y la recuperación con una semilla reproducible.

**Aceptación.** Cambiar de tripulante cambia las opciones disponibles. Un peligro altera un objetivo o recorrido y la respuesta del jugador se refleja en el estado. Guardar y continuar conserva los efectos de las decisiones.

## Hito 3 · Historia y consecuencias

1. Monta un prólogo interactivo breve en la Tierra. Un oficial ficticio explica el objetivo y el jugador completa una preparación antes de entrar en la secuencia de lanzamiento y alunizaje existente.
2. Aprovecha la cuenta regresiva de la Tierra y la transición a Marte. Implementa una decisión lunar con dos consecuencias observables al llegar a Marte, por ejemplo en los suministros, la composición del equipo o el tiempo disponible. Al agotarse el plazo, enlaza la derrota con el desenlace ficticio de la destrucción de la Tierra.
3. Conserva la continuidad del guardado y comprueba el acceso a los finales de la campaña, incluida la ruta opcional terrestre. Entrega un recorrido reproducible con decisiones y resultados esperados.

## Frontera de trabajo

- **Antigravity** trabaja la lógica de movimiento e interacción y su integración en `src/map/`, el motor y el flujo en las rutas asignadas a A, y las pruebas correspondientes. Coordina con B los datos de campaña y con C los cambios funcionales en archivos de interfaz compartidos. Canaliza por A cualquier cambio de contrato del núcleo o del guardado y actualiza la documentación canónica correspondiente.
- **Codex** diseña el mapa en pantalla, los sprites y la animación de los cuatro tripulantes, el diario, los diálogos, el HUD y la respuesta visual de cada acción. La dirección visual usa una cámara cercana, terreno legible, un indicador sobre el objetivo y paneles compactos que aparecen al interactuar. Codex revisará la implementación de Antigravity en el navegador, corregirá problemas de integración y pulirá los controles y la respuesta visual.
- Para el traspaso, deja clara la información que ofrece la lógica a la vista. Incluye posición y orientación, tripulante activo, objetivo frente al jugador, acciones disponibles con costo y motivo de bloqueo, y resultado de cada acción. Reutiliza las interfaces existentes donde cubran esa información. Coordina el traspaso antes de que los dos agentes editen un mismo archivo.

## Entrega de cada hito

Ejecuta `npm test` y `npm run build`. Incluye pasos para reproducir el recorrido en navegador, los archivos modificados, lo implementado, lo probado y los pendientes. Indica las interfaces que deberá consumir Codex, los cambios de contrato acordados y el uso de IA que corresponda registrar en [los créditos](../../IA-Y-CREDITOS.md).
