# NASA Space Apps Challenge 2026 · condiciones y evidencias

Registro de cada condición del evento con su estado de verificación. Fecha de consulta de todas las filas: **14 de noviembre de 2026**, hora de Bolivia.

**Cómo se consultó.** Las páginas de `spaceappschallenge.org` se leyeron con un navegador, porque la descarga automática falló por validación de certificado en la máquina de planificación. Las discusiones de GitHub y las páginas de NASA se leyeron por descarga directa. Nada de esta tabla sale de memoria.

Estados: `Confirmado` (fuente primaria leída) · `Orientación de otra sede o del foro` · `Por verificar`.

## 1. Lo más urgente

| Hecho | Consecuencia |
| --- | --- |
| La agenda de la sede fija **Submit de proyectos el domingo a las 12:00** y **Defensa de Proyectos a las 14:00**. | El plan interno apunta a enviar a las 11:30. Congelación de código a las 09:30. |
| El formulario global cierra el domingo a las 23:59, hora de la sede. | Hay margen técnico después de la defensa, pero no se cuenta con él hasta confirmarlo con la sede. |
| Todo lo que aparezca en el formulario y **en los materiales enlazados** debe estar en inglés. | El juego público arranca en inglés. El README está en inglés. |
| El video dura 30 segundos o menos, o la presentación tiene 7 diapositivas o menos. Pasarse deja al proyecto fuera de la evaluación global. | Cronómetro y recuento antes de subir. |
| Hay que usar al menos una fuente de datos NASA de los recursos del reto. | DONKI está en la lista y mueve la decisión central del juego. |

## 2. Matriz de condiciones

### Reto

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| Reto (15-nov-2026, EARTH'S ANGEL 2): *Space Mission Design Game*. Juego interactivo para diseñar, gestionar y simular una misión completa: objetivos, nave, instrumentos, lanzador, presupuesto, potencia, masa, comunicaciones y restricciones orbitales. Antes figuraba *Build a Junior Astronaut Mission Trainer*. | Global | **Por verificar por el equipo** | [Enunciado](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/) | Reto seleccionado en la página del equipo | C | Abrir "My Team" y comprobar el reto. |
| Público: niños de **7 a 12 años**. El enunciado lo dice en los objetivos. | Global | Confirmado | Mismo enlace | Tutorial y tarjetas en lenguaje sencillo | C | Leer el tutorial en voz alta: frases cortas, términos explicados. |
| Mecánicas pedidas: soporte vital, blindaje contra radiación, presupuesto de energía, producción de alimentos y **retraso en las comunicaciones**. | Global | Confirmado | Mismo enlace | Matriz de [ENTREGA.md](ENTREGA.md) | B | Cada mecánica tiene una pantalla en la demo. El retraso de comunicaciones se cubre en P0 con una tarjeta y en Marte con mecánica. |
| Consideraciones: lenguaje llano; jugable en navegador sin descarga ni cuenta; atribuir las fuentes dentro de la herramienta; si no hay API en vivo, un conjunto real empaquetado es válido **sin presentarlo como en vivo**. | Global | Confirmado | Mismo enlace | Tarjeta de decisión con fuente; créditos en el juego | B, C | La tarjeta dice "registro archivado". |
| Errores a evitar: una opción segura sin costo; pulido visual en lugar de mecánica; demasiados sistemas a la vez (sugiere dos o tres recursos principales). | Global | Confirmado | Mismo enlace | HUD agrupado en tres medidores; tabla de dos decisiones | B, C | Ver [PROYECTO.md](PROYECTO.md), sección HUD. |
| Destacan: consecuencias ligadas a datos reales de clima espacial; rejugabilidad con eventos que varían; explicación breve de qué datos NASA se usaron y por qué. | Global | Confirmado | Mismo enlace | Semilla variable; sección "NASA Data" del formulario | A, B | Dos partidas sin `?seed=` muestran registros distintos. |
| Dificultad del reto: Intermediate, Beginner/Youth. Temas: Games, Planets & Moons, Software, Space Exploration, Sun. | Global | Confirmado | Mismo enlace | — | — | — |

### Recursos del reto

Lista leída en la pestaña Resources. El enunciado avisa de que pueden añadirse más recursos.

| Recurso | En la lista | Uso en Earth's Angel |
| --- | --- | --- |
| [NASA Open APIs](https://api.nasa.gov/) | Sí | Portal. No se llama en ejecución. |
| [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) | **Sí** | **Fuente integrada.** Decisión de la tormenta solar. |
| [OSDR](https://osdr.nasa.gov/bio/repo/) | Sí | Candidata para tarjetas. Sin integrar. |
| [RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) | Sí | Candidata: dosis reales medidas en la ISS. Sin integrar. |
| [Mars Trek](https://trek.nasa.gov/mars/) | Sí | Candidata para el mapa de Marte en P1. |
| CSA · [Space resources for STEM](https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp) y [Food production on the moon](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) | Sí, agencia socia | Candidata para la tarjeta del invernadero. |
| ECLSS, InSight, Mars24, BVAD | **No** | Apoyo conceptual. No cuentan para la elegibilidad. |

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| Para optar a premios globales hay que usar al menos un dato o recurso de NASA. | Global | Confirmado | [Guía de entrega](https://www.spaceappschallenge.org/resources/project-submission-guide/), campo "NASA Data" | Extracto DONKI en el repo y campo "NASA Data" | B | El campo nombra DONKI, el identificador del registro y dónde se ve en el juego. |
| El dato debe ser de los recursos del reto elegido. | Global | Orientación de otra sede o del foro (mantenedor del repositorio oficial, 6-nov-2026) | [Discusión 1849](https://github.com/nasa/spaceapps/discussions/1849) | DONKI está en la lista | B | Volver a abrir Resources antes de enviar. |

### Evento y sede

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| Sede: Universidad Católica Boliviana "San Pablo", Km. 9 carretera al Norte, Av. Milton Parra. 14 y 15 de noviembre. Recepción 08:30. | Sede | Confirmado (contenido publicado por la organización local) | [Sede Santa Cruz](https://www.spaceappschallenge.org/2026/local-events/santa-cruz-de-la-sierra/) | — | C | — |
| Agenda del sábado: 09:30 inauguración · 13:00 almuerzo · 14:00 feria · 15:00 y 16:00 charlas · 20:00 cierre de puertas · 22:00 cena. | Sede | Confirmado | [Agenda](https://www.spaceappschallenge.org/2026/local-events/santa-cruz-de-la-sierra/?tab=schedule) | — | C | Preguntar si se puede seguir trabajando dentro después de las 20:00. |
| Agenda del domingo: 08:30 apertura · **12:00 Submit de proyectos** · 13:00 almuerzo · **14:00 Defensa de Proyectos** · 20:00 clausura. | Sede | Confirmado | Mismo enlace | Envío a las 11:30 | C | — |
| Si las 12:00 son un límite estricto de la sede o una hora orientativa. | Sede | **Por verificar** | Contacto en la página de la sede | Respuesta escrita de la organización | C | Preguntar el sábado por la tarde. |
| Formato de la defensa: duración, idioma, orden, si se juega en vivo, proyector. | Sede | **Por verificar** | Contacto en la página de la sede | Respuesta de la organización | C | Preguntar el sábado. |
| Rúbrica y ponderación locales. | Sede | **Por verificar** | — | — | C | La guía global no publica pesos. No asumir ninguno. |
| Si se puede mejorar y reenviar después de la defensa, hasta las 23:59. | Sede | **Por verificar** | — | — | C | Preguntar a la organización. |
| Los tres integrantes están inscritos en la sede de Santa Cruz, no en lista de espera, y aparecen en la pestaña Members. | Global | **Por verificar por el equipo** | [Guía de evaluación](https://www.spaceappschallenge.org/resources/judging-awards-guide/) | Captura de la pestaña Members | C | Abrir "My Team" → Members. No se pueden añadir miembros tras el cierre. |
| Tamaño del equipo: máximo 6; en sede presencial, mínimo 1. | Global | Confirmado | Misma guía | — | — | Tres integrantes: cumple. |

### Ventana de trabajo

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| El trabajo del proyecto empieza el sábado a las 09:00, hora de la sede. Adelantarse puede causar descalificación. Antes se permite elegir reto, revisar recursos, investigar y formar equipo. | Global | Orientación de otra sede o del foro (mantenedor, 4-nov-2026) | [Discusión 1777](https://github.com/nasa/spaceapps/discussions/1777) | Historial de Git con primer commit posterior a las 09:00 del 14-nov | A | `git log --reverse` muestra la fecha del primer commit. |
| Procedencia del material previo. El prompt maestro `MOONBASE_MASTER_PROMPT.md` tiene fecha de modificación 14-nov-2026 11:20. La documentación se generó el 14-nov a partir de las 11:30. | Equipo | **Por verificar por el equipo** | — | Nota en [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md) | A | El equipo anota cuándo redactó el prompt maestro. Si parte se preparó antes del sábado 09:00, consultar a la organización cómo tratarlo. |
| Reutilizar código anterior. | Global | **Por verificar** (pregunta sin respuesta en el foro al 12-nov) | [Discusión 1777](https://github.com/nasa/spaceapps/discussions/1777) | No se reutiliza código previo | A | No aplica mientras todo el código se escriba durante el evento. |

### Entrega

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| Envío abierto del sábado 09:00 al domingo 23:59, hora de la sede. Hay que pulsar **Submit for Judging**. Se puede editar y reenviar; cuenta lo último guardado. | Global | Confirmado | [Guía de entrega](https://www.spaceappschallenge.org/resources/project-submission-guide/) | Captura del aviso de envío correcto | C | Ver el aviso de confirmación tras enviar. |
| Campos: Project Name · High-Level Project Summary · Link to Project Demo · Link to Final Project · Detailed Project Description · Use of Super Intelligence (SI) · NASA Data · Space Agency Partner Data and Other References. | Global | Confirmado | Misma guía | Borrador en [ENTREGA.md](ENTREGA.md) | C | Comparar con el formulario real al abrir la pestaña Project. |
| Demo: presentación de **7 diapositivas como máximo**, contando título e introducción, o video de **30 segundos o menos**. Pasarse excluye de la evaluación global. | Global | Confirmado | Misma guía | Video cronometrado o PDF de 7 páginas | C | Medir la duración del archivo final. |
| Dos enlaces públicos distintos, demo y proyecto final, sin contraseña, permiso ni registro. | Global | Confirmado | Misma guía | Enlaces probados | A, C | Abrir ambos en ventana privada y desde un teléfono con datos móviles. |
| Idioma: inglés en el formulario y en los materiales enlazados. El video puede hablarse en otro idioma **con subtítulos en inglés**. Las diapositivas, en inglés. | Global | Confirmado | Misma guía | Juego en inglés por defecto; README en inglés | C | Abrir la URL pública en ventana privada: aparece en inglés. |
| Las diapositivas incluyen nombre del equipo, nombres de los integrantes y reto elegido. | Global | Confirmado | Misma guía | Diapositiva 1 | C | Revisar [presentacion/DIAPOSITIVAS.md](presentacion/DIAPOSITIVAS.md). |
| La página Project admite imágenes JPG, PNG o GIF de hasta 10 MB. No admite videos ni documentos. | Global | Confirmado | Misma guía | Capturas preparadas | C | — |
| Casillas obligatorias: aceptar términos y confirmar que el trabajo es original y que todo recurso externo está en el campo de referencias. | Global | Confirmado | [Guía de evaluación](https://www.spaceappschallenge.org/resources/judging-awards-guide/) | [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md) al día | C | El campo de referencias coincide con el registro de créditos. |
| Sitio nuevo: se recomienda pedir clasificación de filtro web en FortiGuard para que el jurado pueda abrirlo. No es obligatorio. | Global | Confirmado | Guía de entrega | — | A | Con GitHub Pages el dominio ya existe. Valorar si sobra tiempo. |
| Solo quienes envían reciben certificado de participación. | Global | Confirmado | Guía de entrega | — | — | — |

### Evaluación

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| Cinco criterios, cada uno de 1 a 5: **Impact, Creativity, Validity, Relevance, Presentation**. La guía no publica ponderaciones. | Global | Confirmado | [Guía de evaluación](https://www.spaceappschallenge.org/resources/judging-awards-guide/) | Sección 3 de este documento | Todos | — |
| Relevance valora que los datos NASA sean parte central de la solución y no un añadido. | Global | Confirmado | Misma guía | La tormenta sale del registro DONKI | B | Quitar el extracto rompe la decisión: prueba D-NASA-03. |
| Presentation se calcula con la demo y con el proyecto completo. | Global | Confirmado | Misma guía | Demo y juego coherentes | C | — |
| Calendario: nominados globales 3-dic-2026 · finalistas 17-dic-2026 · ganadores 26-ene-2027. | Global | Confirmado | Misma guía | — | — | — |
| Jueces locales reclutados por la organización de la sede. Los premios locales son opcionales. | Sede | Confirmado en lo general | Misma guía | — | C | Detalles locales: por verificar. |
| Revisión de elegibilidad por la política de restricción de financiación con China. | Global | Confirmado | Misma guía | — | Equipo | Leer la cláusula en los términos si aplica a algún integrante. |

### IA, datos y derechos

La guía de entrega de 2026 llama a estas herramientas *Super Intelligence (SI)*. Es el mismo campo que otros textos llaman IA.

| Condición | Ámbito | Estado | Enlace | Evidencia prevista | Responsable | Paso de comprobación |
| --- | --- | --- | --- | --- | --- | --- |
| La IA está permitida como herramienta. **No debe usarse para idear la solución al reto.** | Global | Confirmado | [Guía de entrega](https://www.spaceappschallenge.org/resources/project-submission-guide/) | Tabla de decisiones del equipo, sección 4 | Equipo | El equipo confirma por escrito qué ideas son suyas. |
| Indicar dónde y cómo se usó. Imágenes y videos: marca de agua visible. Audio: reconocimiento en texto descriptivo y metadatos. Código y datos: reconocimiento en texto descriptivo y metadatos. | Global | Confirmado | Misma guía · [Discusión 1849](https://github.com/nasa/spaceapps/discussions/1849) | [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md); marcas de agua; cabeceras en archivos | C | Revisar cada activo del manifiesto. |
| El contenido generado no usa, contiene ni modifica marca de NASA: logotipos, banderas, identificadores de misión. | Global | Confirmado | Mismas fuentes | Revisión de activos | C | Ningún sprite ni ilustración muestra insignias. |
| La respuesta al campo SI no la ve el jurado, pero sí ve las marcas, textos y metadatos del proyecto. | Global | Confirmado | Guía de entrega | — | C | — |
| Contenido original: de libre disposición o con licencia de código abierto según OSI. Si no se indica una, NASA aplica Apache 2.0. | Global | Confirmado | [Términos](https://www.spaceappschallenge.org/legal/) | Archivo `LICENSE` | A | El equipo elige licencia. Propuesta: MIT. |
| Materiales de terceros: de libre disposición sin restricciones o con licencia OSI. Hay que documentar su licencia y **citar cada fuente**, aunque sea libre. | Global | Confirmado | Términos | [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md) | C | Preferir material propio o de dominio público. Las licencias con condiciones, como CC BY, se consultan antes de usarlas. |
| Sin datos personales en la entrega. Sin nombres, voces ni imágenes reconocibles de **menores de 18 años**. | Global | Confirmado | Términos · Guía de entrega | La comprobación de aprendizaje no pide datos; no hay fotos de niños | C | Revisar video y diapositivas. |
| Uso del logotipo de Space Apps en diapositivas. | Global | **Por verificar** | [Guía de marca](https://www.spaceappschallenge.org/brand/) | — | C | Leer el PDF de la guía de marca. Hasta entonces, no usar logotipos. La página exige contraste de 4,5:1 o más. |
| Condiciones de uso de DONKI: datos "tal cual", información de investigación experimental; el pronóstico oficial de EE. UU. es de NOAA SWPC. Texto de agradecimiento recomendado. | Fuente | Confirmado lo primero · **Por verificar** el texto de agradecimiento | [DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) · [Política de publicación de CCMC](https://ccmc.gsfc.nasa.gov/publication-policy/) | Crédito en el juego y en el formulario | B | Leer la política y copiar el reconocimiento sugerido. |

## 3. Evidencia por criterio de evaluación

Son propuestas del equipo. NASA no fija estas evidencias.

| Criterio | Evidencia que prepararemos | Dónde se ve | Estado |
| --- | --- | --- | --- |
| Impact | Una pregunta antes y después de la misión mide si el jugador cambia su respuesta sobre qué hacer ante una tormenta solar. Juego en navegador, sin cuenta, en inglés y español. | [componentes/comprobacion-de-aprendizaje.md](componentes/comprobacion-de-aprendizaje.md) | Propuesto. Solo se informan resultados si existen, con tamaño de muestra. |
| Creativity | Una decisión original: la alerta de un evento solar real abre un dilema con costo en ambos lados, y su efecto se arrastra durante días. | [componentes/ciclo-de-dias.md](componentes/ciclo-de-dias.md), tabla de dos decisiones | Propuesto |
| Validity | Trazabilidad de cada cifra y una prueba repetible: el recorrido con semilla `demo` da siempre el mismo resultado. | [CIENCIA-Y-DATOS.md](CIENCIA-Y-DATOS.md) · [PRUEBAS.md](PRUEBAS.md) | Reglas validadas en modelo; sin código |
| Relevance | Las mecánicas del reto en una sola partida: soporte vital, energía, alimentos, blindaje. Dato NASA dentro de la decisión. | Matriz de [ENTREGA.md](ENTREGA.md) | Propuesto |
| Presentation | Demo de 30 segundos centrada en el día de la tormenta, con la referencia NASA en pantalla. | [presentacion/GUION-DEMO.md](presentacion/GUION-DEMO.md) | Propuesto |

## 4. Decisiones creativas

La guía pide que la IA no idee la solución. Esta tabla separa lo que aportó el equipo de lo que propuso la IA al documentar. **El equipo debe revisar la segunda columna y aceptar, cambiar o descartar cada fila.**

| Aportado por el equipo (prompt maestro y decisión del 14-nov) | Propuesto por la IA durante la documentación · requiere revisión |
| --- | --- |
| Título **Earth's Angel** | La nave se llama *Ángel* y la guía del tutorial es ÁNGEL, la asistente de la base |
| Premisa: crisis terrestre y Proyecto Last Hope | Puntos de acción por tripulante |
| Campaña Luna → Marte y final secreto en la Tierra por un agujero de gusano | Extractor de hielo como séptimo edificio de P0 |
| Juego por turnos en cuadrícula con vista cenital | Escala de exposición de 0 a 100 y estado "en observación" |
| Tres dificultades: Fácil, Media, Imposible | Todos los valores numéricos de balance |
| Variables: electricidad, oxígeno, agua, alimentos, radiación, materiales, tripulación, autonomía | HUD agrupado en tres medidores |
| Catálogo de edificios: hábitat, paneles, baterías, oxígeno, reciclaje, invernadero, depósito, refugio, comunicaciones, laboratorio | Evento "sombra" de poca luz |
| Uso de DONKI para un aviso de partículas solares con decisión de refugio | Regla de traducción: canal de más de 100 MeV → tormenta severa |
| Balizas ocultas, pistas, portal y misión terrestre con metas de agua, emisiones y ecosistemas | Distribución concreta del mapa y posición de pistas |
| Cuatro cinemáticas y su contenido | Texto exacto de narración y subtítulos |
| Plazo terrestre global y bono único al pasar a Marte | Ventana local de la misión lunar |
| Pixel art 2D de ciencia ficción | Paleta, tipografías y tamaños |

## 5. Pendientes abiertos

1. Confirmar con la sede el límite de las 12:00, el formato de la defensa y si se puede reenviar después.
2. Confirmar inscripción de los tres, reto elegido y acceso a la pestaña Project.
3. El equipo revisa la tabla de la sección 4.
4. Elegir licencia y crear `LICENSE`.
5. Leer la política de publicación de CCMC y la guía de marca en PDF.
6. Anotar cuándo se redactó el prompt maestro.
7. Volver a abrir la pestaña Resources antes de enviar, por si se añadieron recursos.
