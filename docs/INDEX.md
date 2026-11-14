# Earth's Angel · mapa de lectura

Estado al **14 de noviembre de 2026**. P0 lunar integrado en la raíz. El juego usa los datos, la simulación y el mapa de A y B con la interfaz, el arte y el audio de C. La vista de arte permite revisar Marte y las secuencias de P1/P2. [Ejecución y comprobaciones](DESPLIEGUE.md).

## Si eres integrante del equipo

1. Tu paquete de trabajo, en la raíz del repositorio:
   - A · [INTEGRANTE_A_SIMULACION.md](../INTEGRANTE_A_SIMULACION.md)
   - B · [INTEGRANTE_B_JUGABILIDAD_Y_CIENCIA.md](../INTEGRANTE_B_JUGABILIDAD_Y_CIENCIA.md)
   - C · [INTEGRANTE_C_INTERFAZ_ARTE_Y_ENTREGA.md](../INTEGRANTE_C_INTERFAZ_ARTE_Y_ENTREGA.md)
2. [PLAN-EQUIPO.md](PLAN-EQUIPO.md): horarios, hitos y criterios para cortar alcance.
3. [ARQUITECTURA.md](ARQUITECTURA.md): contratos que todos comparten.
4. [agentes/PROTOCOLO-INTEGRACION.md](agentes/PROTOCOLO-INTEGRACION.md): cómo se une el trabajo en Git.

## Si eres un agente de IA con una tarea

1. [../CLAUDE.md](../CLAUDE.md)
2. [agentes/REGLAS-DE-TRABAJO.md](agentes/REGLAS-DE-TRABAJO.md)
3. La ficha de tu tarea en [agentes/tareas/](agentes/tareas/) y el prompt de tu perfil en [agentes/prompts/](agentes/prompts/)
4. Las fichas de componente que la tarea enlaza y [ARQUITECTURA.md](ARQUITECTURA.md)

## Si evalúas la demo

1. [../README.md](../README.md) (en inglés)
2. [ENTREGA.md](ENTREGA.md): texto público en inglés, matriz reto → mecánica → fuente NASA → evidencia
3. [CIENCIA-Y-DATOS.md](CIENCIA-Y-DATOS.md): qué es dato NASA, qué es simplificación y qué es ficción
4. [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md): uso de IA, créditos y licencias

## Documentos principales

| Documento | Contenido | Es fuente canónica de |
| --- | --- | --- |
| [PROYECTO.md](PROYECTO.md) | Visión, historia, bucle jugable, niveles, dificultades | Historia y mundo |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Stack, carpetas, contratos, eventos, máquina de estados | Tipos, acciones, eventos, API |
| [DESPLIEGUE.md](DESPLIEGUE.md) | Preparar, ejecutar, probar, compilar, publicar | Comandos |
| [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md) | Condiciones del reto con estado de verificación | Requisitos del evento |
| [CIENCIA-Y-DATOS.md](CIENCIA-Y-DATOS.md) | Modelo científico, fuentes, transformaciones, límites | Procedencia de cada cifra |
| [GUION-CINEMATICAS.md](GUION-CINEMATICAS.md) | Guion y storyboard de las cuatro secuencias | Narración |
| [ARTE-Y-ACTIVOS.md](ARTE-Y-ACTIVOS.md) | Dirección de arte, manifiesto visual y sonoro | Lista de activos |
| [PLAN-EQUIPO.md](PLAN-EQUIPO.md) | Roles, cronograma, P0/P1/P2, definición de terminado | Fechas y reparto |
| [RIESGOS-Y-LIMITES.md](RIESGOS-Y-LIMITES.md) | Riesgos con mitigación y responsable | Riesgos |
| [AGENTES.md](AGENTES.md) | Orden de despacho y reglas de integración | Delegación |
| [PRUEBAS.md](PRUEBAS.md) | Casos de prueba y vectores esperados | Valores esperados |
| [ENTREGA.md](ENTREGA.md) | Formulario en inglés, demo, pitch, comprobaciones | Texto de entrega |
| [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md) | Registro de IA, autores, licencias | Créditos |

## Niveles

- [niveles/luna.md](niveles/luna.md) · P0
- [niveles/marte.md](niveles/marte.md) · P1
- [niveles/tierra-alternativa.md](niveles/tierra-alternativa.md) · P2

## Fichas de componentes

| Área | Fichas |
| --- | --- |
| Flujo y controles | [arranque-y-escenas](componentes/arranque-y-escenas.md) · [menu-principal](componentes/menu-principal.md) · [menu-opciones](componentes/menu-opciones.md) · [selector-dificultad](componentes/selector-dificultad.md) · [controles](componentes/controles.md) · [hud-y-accesibilidad](componentes/hud-y-accesibilidad.md) · [localizacion](componentes/localizacion.md) |
| Narrativa y aprendizaje | [motor-cinematicas](componentes/motor-cinematicas.md) · [gestor-narrativa](componentes/gestor-narrativa.md) · [tutorial-y-tarjetas-cientificas](componentes/tutorial-y-tarjetas-cientificas.md) · [resultados-y-finales](componentes/resultados-y-finales.md) · [comprobacion-de-aprendizaje](componentes/comprobacion-de-aprendizaje.md) |
| Mundo y progresión | [mapa](componentes/mapa.md) · [construccion](componentes/construccion.md) · [objetivos](componentes/objetivos.md) · [progresion](componentes/progresion.md) · [dificultad-y-balance](componentes/dificultad-y-balance.md) |
| Simulación | [ciclo-de-dias](componentes/ciclo-de-dias.md) · [motor-recursos](componentes/motor-recursos.md) · [energia](componentes/energia.md) · [soporte-vital](componentes/soporte-vital.md) · [agua-y-alimentos](componentes/agua-y-alimentos.md) · [radiacion-y-refugio](componentes/radiacion-y-refugio.md) · [eventos-ambientales](componentes/eventos-ambientales.md) · [tripulacion](componentes/tripulacion.md) |
| Secreto | [objetos-secretos](componentes/objetos-secretos.md) · [agujero-de-gusano](componentes/agujero-de-gusano.md) · [mision-terrestre](componentes/mision-terrestre.md) |
| Servicios y producción | [audio](componentes/audio.md) · [persistencia](componentes/persistencia.md) · [adaptador-datos-nasa](componentes/adaptador-datos-nasa.md) · [proceso-de-activos](componentes/proceso-de-activos.md) |

## Delegación

- [AGENTES.md](AGENTES.md)
- [agentes/BACKLOG.md](agentes/BACKLOG.md) · [agentes/PLANTILLA-TAREA.md](agentes/PLANTILLA-TAREA.md) · [agentes/REGLAS-DE-TRABAJO.md](agentes/REGLAS-DE-TRABAJO.md) · [agentes/PROTOCOLO-INTEGRACION.md](agentes/PROTOCOLO-INTEGRACION.md)
- Prompts por perfil: [motor](agentes/prompts/motor.md) · [jugabilidad](agentes/prompts/jugabilidad.md) · [interfaz](agentes/prompts/interfaz.md) · [arte-y-audio](agentes/prompts/arte-y-audio.md) · [ciencia-y-datos](agentes/prompts/ciencia-y-datos.md) · [integracion-y-qa](agentes/prompts/integracion-y-qa.md)
- Tareas: [agentes/tareas/](agentes/tareas/)

## Presentación

- [presentacion/PITCH.md](presentacion/PITCH.md) · [presentacion/GUION-DEMO.md](presentacion/GUION-DEMO.md) · [presentacion/DIAPOSITIVAS.md](presentacion/DIAPOSITIVAS.md)

## Convenciones

- Documentación interna en español. Texto público y de entrega en inglés.
- `[POR COMPLETAR]` marca un dato que falta.
- Estados de implementación: `propuesto` → `en desarrollo` → `integrado` → `verificado`.
- Clasificación de cifras: `dato NASA`, `transformación didáctica`, `balance`, `ficción`.
- Un dato vive en un solo documento. Los demás lo enlazan.
