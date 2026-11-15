# Earth's Angel · instrucciones para agentes

Juego educativo 2D por turnos para navegador. Entrada del equipo al NASA Space Apps Challenge 2026, reto *Space Mission Design Game* (Juego de diseño de misiones espaciales; antes figuraba *Build a Junior Astronaut Mission Trainer*: confirmar en My Team), sede Santa Cruz de la Sierra.

## Estado del proyecto

- **15-nov-2026.** El diseño previo al lanzamiento aplica cabina, antena, trayectoria y carga. El aviso lunar, el diario y el resultado muestran esas decisiones. [Diseño de la misión](docs/componentes/diseno-de-mision.md).

- **15-nov-2026.** La llegada a Marte muestra cómo se incorporan los dos refuerzos y la tripulación pasa de cuatro a seis.

- **15-nov-2026.** El final marciano aprobado de 28 segundos muestra la celebración de la colonia y el enlace con la Tierra antes de los créditos.

- **15-nov-2026.** Nueva partida muestra la apertura animada aprobada de 45 segundos, con el proyecto EARTH'S ANGEL y la nave EL ANGEL.

- **15-nov-2026.** El servidor local reproduce en bucle la pista ambiental aportada por el usuario a través de los controles de audio existentes.

- **15-nov-2026.** La compilación local incluye una cinemática secreta con el astronauta activo. Se abre desde el [extremo noreste de la Luna](docs/niveles/luna.md#encuentro-secreto) y, al terminar, devuelve el control al mismo punto de la misión.

- **14-nov-2026.** Luna, Marte y Tierra están integrados y verificados en la compilación local. [Comandos y verificación](docs/DESPLIEGUE.md).
- **14-nov-2026.** El primer hito del RPG lunar está integrado en la compilación local. Incluye exploración a pie, interacciones de proximidad, diario de misión y un informe de fin de día con materiales y construcciones. [Alcance del RPG](docs/agentes/tareas/T-RPG-A1-mecanicas-de-campana.md).
- **14-nov-2026.** El mapa lunar ocupa la ventana y permite girar en el sitio. El menú Q permite elegir a un tripulante y limita sus acciones de especialidad según el cargo.
- **15-nov-2026.** La [Luna](docs/niveles/luna.md#mapa) mide 73 × 73 y [Marte](docs/niveles/marte.md#mapa), 81 × 81. La cámara deja visibles las casillas junto al HUD en los bordes. Los guardados anteriores conservan el progreso al abrir los mapas ampliados.
- **15-nov-2026.** En las derrotas de Luna y Marte, la Tierra se agrieta y estalla, la tripulación se pierde a la deriva y aparece GAME OVER antes del informe.
- **15-nov-2026.** El HUD de misión permite consultar las reservas con R. La guía del primer día explica el panel.
- **15-nov-2026.** La guía y las tarjetas ofrecen preguntas rápidas sobre energía, agua, oxígeno y protección. Un astronauta explica la respuesta.
- **15-nov-2026.** La victoria lunar celebra con los cuatro tripulantes. El viaje muestra su embarque y despegue. Marte usa la misma exploración a pie y conserva sus objetivos de colonia autónoma.
- Entrega local: **domingo 15-nov a las 12:00** (envío) y **14:00** (defensa), hora de Bolivia. Congelación interna de código: domingo 09:30.
- La demo mínima del reto usa la Luna. La campaña publicada incluye Marte y la ruta opcional de Tierra cuando se complete el despliegue.

Actualiza esta sección cuando cambie el estado real.

## Antes de tocar nada

1. Lee [docs/INDEX.md](docs/INDEX.md) y la ficha de tu tarea en [docs/agentes/tareas/](docs/agentes/tareas/).
2. Lee [docs/agentes/REGLAS-DE-TRABAJO.md](docs/agentes/REGLAS-DE-TRABAJO.md). Trabaja solo en las rutas permitidas de tu ficha.
3. Si tu tarea necesita cambiar un contrato, detente y pídeselo a A. No lo cambies por tu cuenta.

## Contratos compartidos

| Qué | Dónde está la versión canónica |
| --- | --- |
| Tipos, acciones, eventos, API del núcleo, máquina de estados | [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) → `src/core/types.ts` |
| Orden del día y fórmulas | [docs/componentes/ciclo-de-dias.md](docs/componentes/ciclo-de-dias.md) |
| Valores de balance | [docs/componentes/dificultad-y-balance.md](docs/componentes/dificultad-y-balance.md) |
| Catálogo de edificios | [docs/componentes/construccion.md](docs/componentes/construccion.md) |
| Mapa y programa de eventos de la Luna | [docs/niveles/luna.md](docs/niveles/luna.md) |
| Fuentes NASA y transformaciones | [docs/CIENCIA-Y-DATOS.md](docs/CIENCIA-Y-DATOS.md) |
| Vectores de prueba | [docs/PRUEBAS.md](docs/PRUEBAS.md) |

Un dato vive en un solo documento. Si necesitas citarlo en otro sitio, enlázalo.

## Reglas que no se negocian

- El núcleo (`src/core/`) es TypeScript puro: sin DOM, sin Phaser, sin reloj real, sin `Math.random`. Solo enteros.
- El estado autoritativo tiene un único propietario: el almacén de `src/app/store.ts`. La interfaz y el mapa leen el estado y emiten acciones.
- El idioma por defecto de la versión pública es **inglés**. El español se elige en el menú. Todo texto visible sale del catálogo de cadenas.
- Cada cifra de la simulación está clasificada como `dato NASA`, `transformación didáctica`, `balance` o `ficción`. No presentes un valor de balance como dato real.
- Registra cada uso de IA y cada activo de terceros en [docs/IA-Y-CREDITOS.md](docs/IA-Y-CREDITOS.md). La entrega a Space Apps exige marca de agua visible en imágenes y videos generados. La presentación local actual conserva la procedencia en metadatos y créditos. Nada generado usa logotipos, banderas ni identificadores de misión de NASA.
- No incluyas nombres, voces ni imágenes reconocibles de menores de 18 años en ningún material.

## Dónde está cada cosa

- Fichas de componentes: [docs/componentes/](docs/componentes/)
- Niveles: [docs/niveles/](docs/niveles/)
- Backlog, tareas y prompts: [docs/AGENTES.md](docs/AGENTES.md) y [docs/agentes/](docs/agentes/)
- Paquetes de trabajo por integrante: `INTEGRANTE_A_SIMULACION.md`, `INTEGRANTE_B_JUGABILIDAD_Y_CIENCIA.md`, `INTEGRANTE_C_INTERFAZ_ARTE_Y_ENTREGA.md`
- Requisitos del reto: [docs/NASA-SPACE-APPS-2026.md](docs/NASA-SPACE-APPS-2026.md)

## Al terminar una tarea

Informa archivos modificados, pruebas ejecutadas con su resultado y pendientes. Distingue lo implementado, lo probado y lo que falta.
