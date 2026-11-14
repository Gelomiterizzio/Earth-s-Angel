# Backlog

Índice de tareas con su orden de dependencias. El **estado** de cada tarea se lleva en su ficha, que edita su responsable. Esta tabla no se toca en el día a día, así no hay conflictos.

Horas y hitos: [PLAN-EQUIPO.md](../PLAN-EQUIPO.md).

## P0 · Prototipo lunar

| ID | Tarea | Resp. | Rev. | Perfil | Hito | Horas | Depende de |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [T-P0-A1](tareas/T-P0-A1-andamiaje.md) | Andamiaje, configuración y primera publicación | A | C | Motor | H1 | 1,0 | — |
| [T-P0-A2](tareas/T-P0-A2-contratos-y-almacen.md) | Contratos, almacén, datos de prueba y cadenas | A | B | Motor | H1 | 1,5 | A1 |
| [T-P0-A3](tareas/T-P0-A3-nucleo-recursos-y-dias.md) | Núcleo I: acciones, recursos, energía y ciclo de días | A | B | Motor | H2 | 2,5 | A2, B1 |
| [T-P0-A4](tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md) | Núcleo II: tripulación, radiación, objetivos y resultado | A | B | Motor | H3 | 2,0 | A3 |
| [T-P0-A5](tareas/T-P0-A5-flujo-y-opciones.md) | Flujo de escenas, opciones y entrada global | A | C | Motor | H3 | 1,5 | A2 |
| [T-P0-A6](tareas/T-P0-A6-pruebas-doradas.md) | Pruebas doradas y recorridos por dificultad | A | B | Integración y QA | H4 | 1,5 | A4 |
| [T-P0-B1](tareas/T-P0-B1-datos-y-balance-lunar.md) | Datos de contenido y balance lunar | B | A | Jugabilidad | H1 | 1,5 | — |
| [T-P0-B2](tareas/T-P0-B2-extracto-donki.md) | Extracto DONKI y adaptador de datos NASA | B | A | Ciencia y datos | H1 | 1,0 | — |
| [T-P0-B3](tareas/T-P0-B3-mapa-lunar.md) | Mapa lunar en Phaser | B | A | Jugabilidad | H2 | 2,5 | A2 |
| [T-P0-B4](tareas/T-P0-B4-construccion-y-exploracion.md) | Construcción, exploración y recolección en el mapa | B | A | Jugabilidad | H3 | 2,0 | B3, A3 |
| [T-P0-B5](tareas/T-P0-B5-decision-de-tormenta.md) | Decisión de la tormenta con tarjeta NASA y pronóstico | B | C | Ciencia y datos | H3 | 1,5 | B2, A4 |
| [T-P0-B6](tareas/T-P0-B6-contenido-cientifico.md) | Tarjetas científicas, textos del tutorial y verificación de balance | B | C | Ciencia y datos | H4 | 1,5 | B1 |
| [T-P0-C1](tareas/T-P0-C1-menus-y-sistema-visual.md) | Sistema visual, menú, dificultad, opciones y despedida | C | A | Interfaz | H1–H2 | 2,0 | A2 para conectar |
| [T-P0-C2](tareas/T-P0-C2-hud.md) | HUD, paleta de construcción, pronóstico y objetivos | C | B | Interfaz | H2–H3 | 2,5 | C1, A2 |
| [T-P0-C3](tareas/T-P0-C3-informe-resultados-creditos.md) | Informe del día, resultados y créditos | C | B | Interfaz | H3 | 1,5 | A4 |
| [T-P0-C4](tareas/T-P0-C4-cinematica-y-tutorial.md) | Cinemática de apertura, tutorial y comprobación de aprendizaje | C | A | Interfaz | H4 | 1,5 | A5, B6 |
| [T-P0-C5](tareas/T-P0-C5-arte.md) | Arte P0: sprites, iconos, logotipo y fondo | C | B | Arte y audio | H2–H4 | 1,5 | — |
| [T-P0-C6](tareas/T-P0-C6-audio.md) | Audio P0: gestor, música y efectos | C | A | Arte y audio | H4 | 1,0 | A2 |
| [T-P0-C7](tareas/T-P0-C7-entrega.md) | Entrega: demo, formulario en inglés y defensa | C | A, B | Integración y QA | Entrega | 2,0 | X1 |
| [T-P0-X1](tareas/T-P0-X1-integracion-y-publicacion.md) | Integración por hitos, pruebas en navegadores y publicación | A | B, C | Integración y QA | H1–H4 | 1,5 | Todas |

### Orden por persona

- **A:** A1 → A2 → A3 → A4 → A5 → A6 → X1
- **B:** B1 y B2 → B3 → B4 → B5 → B6
- **C:** C1 y C5 → C2 → C3 → C4 → C6 → C7

## P1 · Campaña principal

Fichas en [tareas/P1-campana-principal.md](tareas/P1-campana-principal.md). Solo se empieza con P0 verificado.

| ID | Tarea | Resp. | Rev. | Depende de |
| --- | --- | --- | --- | --- |
| T-P1-A1 | Transición Luna → Marte, manifiesto y bono único | A | B | P0 |
| T-P1-A2 | Guardado de campaña, Continuar y Reiniciar | A | C | T-P1-A1 |
| T-P1-A3 | Núcleo marciano: polvo, mantenimiento, logística y comunicaciones | A | B | T-P1-A1 |
| T-P1-B1 | Mapa y datos de Marte | B | A | T-P1-A3 |
| T-P1-B2 | Eventos, objetivos y validación del balance marciano | B | A | T-P1-B1 |
| T-P1-C1 | Cinemáticas Luna → Marte y victoria ordinaria | C | A | T-P1-A1 |
| T-P1-C2 | Opciones completas y HUD marciano | C | B | T-P1-A3 |
| T-P1-C3 | Arte y música de Marte | C | B | — |

## P2 · Segunda Oportunidad

Fichas en [tareas/P2-segunda-oportunidad.md](tareas/P2-segunda-oportunidad.md).

| ID | Tarea | Resp. | Rev. | Depende de |
| --- | --- | --- | --- | --- |
| T-P2-B1 | Balizas, pistas y registro científico | B | C | P1 |
| T-P2-A1 | Portal, elección de desenlace y núcleo de la misión terrestre | A | B | T-P2-B1 |
| T-P2-B2 | Datos y balance de la misión terrestre | B | A | T-P2-A1 |
| T-P2-C1 | Cinemáticas de la ruta secreta y final terrestre, interfaz del epílogo | C | A | T-P2-A1 |
| T-P2-C2 | Pulido: efectos, animaciones y audio | C | B | Todo lo anterior |

## Reglas del backlog

- Una tarea nueva se crea con la [plantilla](PLANTILLA-TAREA.md) y se añade aquí en un solo cambio que hace A.
- Si una tarea crece más de un 50 % sobre su estimación, se avisa en el siguiente punto de control y se aplica la tabla de cortes de [PLAN-EQUIPO.md](../PLAN-EQUIPO.md#6-criterios-para-cortar-alcance).
