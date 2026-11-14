# MoonBase Last Hope · Prompt maestro para Claude Code

Verificación de fuentes al **14 de noviembre de 2026**, hora de Bolivia.

## Antes de empezar

1. Guarda este archivo en la raíz del repositorio de MoonBase y abre una terminal en esa carpeta.
2. Comprueba la versión con `claude --version`. Claude Fable 5.2 requiere **Claude Code v2.1.321 o posterior**. Si tu instalación es anterior, actualízala con `claude update` o con el método de tu instalación. [Configuración de modelos de Claude Code](https://code.claude.com/docs/en/model-config#work-with-fable)
3. Inicia `claude --model fable`. En una sesión abierta puedes usar `/model fable`. Comprueba el modelo activo con `/status`. Si usas **Claude apps gateway**, selecciona `/model claude-fable-5-2` cuando tu gateway ofrezca esa versión. `claude-fable-5-2` es el identificador oficial de la API de Anthropic. En otros proveedores, usa el identificador que muestre tu proveedor. Si tu cuenta no tiene acceso, una alternativa para la fase de arquitectura es **Claude Opus 5.5**, si figura en tu selector. [Anuncio de Anthropic](https://www.anthropic.com/claude-fable-and-mythos-5-2) · [Alias y proveedores](https://code.claude.com/docs/en/model-config#model-aliases) · [Cómo comprobar el modelo activo](https://code.claude.com/docs/en/model-config#checking-your-current-model)
4. En una sesión que permita escribir archivos, envía `Lee @MOONBASE_MASTER_PROMPT.md y ejecuta el prompt desde «Inicio del prompt» hasta «Fin del prompt». Crea y verifica los archivos Markdown en este repositorio.` También puedes pegar el bloque delimitado directamente.

---

## Inicio del prompt

### Tu encargo

Dirige la arquitectura de software, el diseño del videojuego 2D, la simulación científica, la experiencia de usuario y la planificación técnica de **MoonBase Last Hope — La última esperanza de la humanidad**, un juego educativo para navegador desarrollado por un equipo de **tres integrantes**. Tu primera entrega consiste en **escribir los archivos Markdown del proyecto en el repositorio**. Especifica una arquitectura que se pueda implementar, divide el trabajo en tareas con criterios comprobables y deja fichas listas para entregar a agentes en una segunda fase.

Antes de escribir, inspecciona el árbol del repositorio, las instrucciones vigentes, los cambios locales y los scripts instalados, si existen. Si el repositorio está vacío, presenta toda ruta de código como propuesta. Si ya existe una base funcional, conserva las decisiones compatibles con este encargo y documenta las discrepancias. Preserva el trabajo existente. Limita los cambios de esta fase a documentación Markdown. Deja la implementación, la instalación de dependencias, el despliegue, la inscripción y el envío para las personas responsables en la fase correspondiente. Avanza con supuestos reversibles y deja por escrito cualquier decisión que el equipo deba confirmar.

Escribe la documentación interna en español. Prepara también el texto público del proyecto y el guion de entrega en inglés. Usa `[POR COMPLETAR]` para nombres, capturas, URL públicas, resultados o datos que todavía falten.

### NASA Space Apps Challenge 2026

**Reto seleccionado.** **Build a Junior Astronaut Mission Trainer**. El enunciado pide una experiencia interactiva para estudiantes que les permita gestionar un puesto **lunar o marciano**, equilibrar soporte vital, protección frente a radiación, energía y producción de alimentos, y experimentar cómo sus decisiones determinan el éxito o el fracaso. El juego completo explora ambos destinos. Usa la Luna como ruta mínima de demostración del reto. Diseña el tutorial con lenguaje claro para estudiantes jóvenes. Puedes usar 7–12 años como público de diseño inicial y registrar la edad oficial por separado solo si la fuente primaria la especifica. Selecciona este reto para la entrega. [Enunciado oficial del reto](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/) · [Catálogo de retos de 2026](https://www.spaceappschallenge.org/2026/challenges/)

**Evento.** NASA International Space Apps Challenge 2026, sede presencial de Santa Cruz de la Sierra, Bolivia, campus de la Universidad Católica Boliviana. Se celebra el **14 y 15 de noviembre**. La sede anuncia recepción a las **08:30** y cierre el domingo alrededor de las **20:00**. El sitio global indica que la pestaña **Project** del equipo recibe entregas desde el sábado 14 a las **09:00** hasta el domingo 15 a las **23:59**, hora local. Un equipo de tres cabe en el límite de seis. En el plan, deja margen para la defensa presencial y registra el horario y formato de esa defensa como pendientes hasta tener confirmación local. Verifica la inscripción de los tres integrantes en la sede, la selección del reto y el acceso a la pestaña Project. [Edición 2026](https://www.spaceappschallenge.org/2026/) · [Sede de Santa Cruz](https://www.spaceappschallenge.org/2026/local-events/santa-cruz-de-la-sierra/)

**Uso de datos e IA.** Para optar a los premios globales, el equipo organizador indica que se debe usar al menos una fuente de datos NASA incluida en los recursos del reto elegido. Usa el recurso dentro de una decisión jugable, cita su procedencia y conserva evidencia de la integración. El equipo organizador permite la IA y pide documentar dónde y cómo se usó. Añade marcas de agua visibles para imágenes y videos generados. Acredita el audio, el código y los datos generados en la descripción y los metadatos pertinentes. Excluye los elementos de marca de NASA del contenido generado. Registra herramientas, modelos efectivamente usados, usos, activos y revisión humana. Cita cada fuente usada y documenta sus licencias. Revisa en los términos los requisitos sobre materiales de terceros y disponibilidad del contenido original. NASA indica que aplicará Apache 2.0 al contenido original cuando el equipo no indique una licencia compatible con OSI. [Recursos del reto](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=resources) · [Aclaración del equipo organizador sobre datos e IA](https://github.com/nasa/spaceapps/discussions/1849) · [Términos 2026](https://www.spaceappschallenge.org/legal/) · [Guía de marca](https://www.spaceappschallenge.org/brand/)

**Ventana de trabajo.** El equipo organizador indica que el trabajo del proyecto empieza el sábado 14 a las **09:00** hora de la sede. Antes permite seleccionar el reto, revisar recursos, investigar y formar equipo. Para una entrega competitiva, sitúa la ejecución de este encargo y el desarrollo dentro de la ventana oficial, registra la procedencia de cualquier material previo y confirma con la organización cómo tratarlo si hay dudas. [Inicio del trabajo según el equipo organizador](https://github.com/nasa/spaceapps/discussions/1777)

**Entrega y evaluación.** Revisa la edición vigente de la guía de entrega, la guía de evaluación, los avisos de la sede y los campos reales de la pestaña Project. Como preparación, redacta resumen y detalles en inglés, prevé subtítulos en inglés si el video se graba en español y prepara enlaces públicos independientes para el proyecto y la demo que se puedan abrir en una ventana privada. Presupuesta un video de **menos de 30 segundos** o **hasta 7 diapositivas** según la orientación de un Navigator en el foro de Space Apps. Confirma estos límites, el idioma y los campos en la guía o en el formulario antes de enviar. Para reunir evidencia, usa **impacto, creatividad, validez, relevancia y presentación**, publicados por la sede 2026 de Ajmer. Queda pendiente verificar el contenido de las guías y los recursos oficiales del reto, que no estuvieron accesibles directamente durante la preparación de este archivo. La ponderación, el horario de defensa y la rúbrica específica de Santa Cruz requieren su propia fuente. [Guías enlazadas por el equipo organizador](https://github.com/nasa/spaceapps/discussions/2028) · [Guía de entrega](https://www.spaceappschallenge.org/resources/project-submission-guide) · [Guía de evaluación y premios](https://www.spaceappschallenge.org/resources/judging-awards-guide) · [Orientación del Navigator](https://github.com/nasa/spaceapps/discussions/1991) · [Criterios publicados por Ajmer 2026](https://www.spaceappschallenge.org/2026/local-events/ajmer/)

En `docs/NASA-SPACE-APPS-2026.md`, registra cada condición con **ámbito, estado de verificación, enlace directo, fecha de consulta, evidencia prevista, responsable y paso de comprobación**. Usa estados claros como `Confirmado`, `Orientación de otra sede o del foro` y `Por verificar`. Si una web falla, usa las confirmaciones de arriba y deja constancia de qué falta consultar. Puedes terminar el diseño con esos pendientes abiertos. Evita atribuir a NASA porcentajes, umbrales de juego, decisiones de diseño o resultados del equipo. Propón una evidencia por criterio de evaluación, como la respuesta de aprendizaje para impacto, una decisión original para creatividad, la trazabilidad y una prueba repetible para validez, las cuatro mecánicas del reto para relevancia y una demo legible para presentación. Registra las decisiones creativas aportadas por el equipo y marca las propuestas nuevas que requieran su revisión.

### Visión, historia y recorrido del juego

**Premisa.** En un futuro cercano ficticio, la crisis climática, la escasez de recursos y el deterioro de los ecosistemas ponen en riesgo la civilización terrestre. El Proyecto Last Hope selecciona una tripulación de astronautas, científicos e ingenieros para desarrollar tecnologías de supervivencia, reciclaje y aprovechamiento de recursos. Su misión es construir primero una colonia lunar autosuficiente y después establecer otra en Marte antes del punto crítico. Presenta la crisis sin imágenes gráficas y diseña decisiones interesantes tanto para estudiantes jóvenes como para adolescentes y adultos.

#### Menú, opciones e interfaz

- **Pantalla de inicio.** Título, logotipo propio y fondo espacial con animación ligera. Presenta `Nueva partida`, `Opciones` y `Salir`. Nueva partida abre `Fácil`, `Media`, `Imposible` y, tras la elección, empieza la historia. Salir pide confirmación si hay una partida activa y abre una despedida con el audio detenido y una forma clara de volver al título o cerrar la pestaña manualmente.
- **Opciones.** Volúmenes general, música y efectos, silencio, controles, subtítulos activados por defecto, movimiento reducido y regreso al menú previo. Incluye pantalla completa cuando sea compatible y español e inglés si cabe en el alcance. Prepara desde el inicio un catálogo de cadenas localizables para diálogos, guía y HUD.
- **HUD.** Muestra día o sol y plazo terrestre restante, estado de la colonia y la tripulación, energía, oxígeno, agua, alimentos, materiales, exposición y riesgo radiativo, objetivos y pronóstico de cambios. Añade acciones de construir, finalizar día, pausar y abrir opciones. Diseña un tutorial contextual y tarjetas científicas que se puedan consultar desde el HUD. Usa escala 16:9 como referencia de escritorio, estado seguro/preventivo/crítico con texto e iconos además del color, foco visible y explicaciones accesibles.

#### Cinemáticas 2D

Escribe un guion y un storyboard por escenas, con viñetas originales, capas, composición, movimientos de cámara y transiciones ligeras. Documenta tiempos, narración localizable y subtítulos. Puedes producirlas en el navegador con ilustraciones y animación, usando la misma pista musical en todas.

| Secuencia | Contenido |
| --- | --- |
| Apertura | Tierra antes de la crisis, deterioro progresivo de los ecosistemas y efectos en ciudades y población, creación de Last Hope, selección de la tripulación, lanzamiento y llegada a la Luna. |
| Luna → Marte | Base lunar operativa, celebración, explicación ficticia del tiempo ganado gracias a sus avances, preparación de la nave, viaje y presentación de los retos marcianos. |
| Victoria ordinaria | Colonia marciana funcional y comienzo de una nueva etapa. Cierre esperanzador que recuerde la responsabilidad de proteger la Tierra. |
| Ruta secreta y victoria terrestre | Descubrimiento del fenómeno, elección de la tripulación y viaje temporal. Después de la misión jugable, muestra la aplicación de soluciones sostenibles, la recuperación gradual de ecosistemas y la prosperidad de la civilización terrestre. |

Todas las secuencias muestran **«Saltar (Intro)»** en la esquina inferior derecha. La tecla **Enter/Intro** y el botón accesible por ratón, teclado y toque deben ejecutar la misma transición que ver la escena completa. Define cómo evitar que una pulsación repetida, una recarga o el fin natural de la animación dupliquen recompensas, saltos de nivel o cambios de estado.

#### Nivel 1 · Luna, el primer refugio

Mapa pequeño de cuadrícula con nave inicial, cráteres, rocas, zonas de construcción y exploración, materiales y una región para un descubrimiento. Diseña un catálogo acotado de hábitat, paneles solares, baterías, generación de oxígeno, reciclaje de agua, invernadero, depósito, refugio radiativo, comunicaciones y laboratorio. Selecciona los módulos imprescindibles para el prototipo. La victoria exige comprobar soporte vital en funcionamiento, balance de energía, producción de alimentos, reservas, protección demostrada y una racha de estabilidad. Al completar los preparativos, la base queda operativa y la tripulación pasa a Marte. Define un manifiesto de transferencia para tripulación, suministros y hallazgos.

#### Nivel 2 · Marte, la nueva frontera

Usa un mapa mayor con distancias y costos logísticos más altos, zonas de materiales y regiones de descubrimiento. Reutiliza mapas, construcción y simulación. Incorpora tormentas de polvo que afectan a la energía solar, mantenimiento y un objetivo de comunicaciones. Evalúa autonomía, soporte vital, producción alimentaria, protección y reservas durante varios turnos, además de la meta final. Si el HUD usa «sol», explica que es el término para el día marciano y distingue su duración real del turno del juego. [NASA GISS · Tiempo en Marte](https://www.giss.nasa.gov/tools/mars24/help/notes.html)

#### Final alternativo · Tierra, Proyecto Segunda Oportunidad

Como propuesta de desbloqueo, coloca una baliza oculta en cada mapa y revela pistas mediante un registro científico, una señal de antena o un fragmento tecnológico. Al cumplir los objetivos de Marte, el laboratorio puede activar juntas las balizas. Da al jugador la elección de finalizar la campaña en Marte o entrar al agujero de gusano. Diseña una búsqueda que se pueda resolver con pistas y sin depender del azar.

En la Tierra del pasado, la tripulación aplica las lecciones de los sistemas de ciclo cerrado. Diseña un epílogo jugable con presupuesto y plazo propios, acciones combinables de energía, uso de agua, reciclaje y restauración, y metas claras de agua disponible, emisiones evitadas y ecosistemas recuperados. Define avances en varios turnos, causas de fallo y cómo retomar el desenlace marciano si falla la misión. Identifica el viaje temporal como ficción y rotula los indicadores terrestres como simplificaciones de juego. Con éxito, muestra la cinemática de recuperación y un mensaje final centrado en «El futuro comienza aprendiendo a cuidar nuestro hogar. Todavía estamos a tiempo de proteger la Tierra».

### Simulación y objetivos comprobables

Diseña un juego por turnos con tablero de cuadrícula y vista cenital como punto de partida. El jugador revisa la colonia y el pronóstico de riesgos, explora, construye, repara o mejora módulos según el alcance, asigna prioridades y pulsa **Finalizar día**. Define qué consume un turno y cuándo se confirman las acciones. Diseña compromisos visibles, como usar electricidad para alimentar a la tripulación o generar oxígeno, gastar materiales en blindaje o expansión, y almacenar energía para cuando haya poca luz.

Usa un contador global de días restantes y un contador de día de la misión actual. Al cerrar el día, valida acciones, calcula cómo afectan los eventos a los insumos del turno, asigna electricidad, opera módulos, asienta consumo y exposición, actualiza reservas, evalúa objetivos y muestra el resumen. Documenta cuándo se aplica cada efecto. Permite completar la misión en su último día si se cumplen los objetivos y la tripulación sigue operativa, y define la precedencia entre fallo crítico y éxito. Aplica el bono de días de Luna → Marte **una vez** como parte de la transición de estado. Conserva los días que queden del plazo terrestre, reinicia el contador local al llegar a Marte y deja el reloj detenido en menús, pausas y cinemáticas.

Define casos de derrota por plazo agotado, colapso del soporte vital, escasez irrecuperable, exposición extrema o incumplimiento de objetivos obligatorios. Muestra en el resultado la causa, las decisiones y recursos implicados, un principio científico y una sugerencia concreta para el siguiente intento. Explica cómo reiniciar la misión.

Propón tablas iniciales de parámetros por nivel y por dificultad, todas rotuladas **«valores de balance»**. Puedes partir de 12×12 casillas para Luna y 20×20 para Marte. Incluye reservas iniciales y disponibles, plazo, bono, tasas, costos, umbrales, duración de rachas, frecuencia y gravedad de eventos, y tamaño de tripulación. Haz **Imposible** difícil y ganable con compromisos coherentes y un recorrido reproducible de victoria por dificultad. Separa definiciones de contenido, balance y datos de referencia.

Define las unidades, los límites, la forma de calcular cada flujo y la condición que contribuye a ganar. Cubre como mínimo:

| Variable | Decisión y efecto a modelar |
| --- | --- |
| Electricidad | Energía generada, consumida y almacenada por día, con capacidad de batería. Priorizar reciclaje, refugio o producción según el evento. Si usas unidades físicas, distingue energía (kWh) de potencia (kW). |
| Oxígeno y agua | Reservas y consumo por tripulante y por día de juego. El agua recuperada y la generación de oxígeno dependen de módulos operativos y energía. Una escasez activa consecuencias visibles y comprobables. |
| Alimentos | Reservas y raciones diarias. El invernadero necesita recursos y un tiempo de producción. Su rendimiento cambia si el jugador le resta energía o agua. |
| Radiación | Avisos, refugio con capacidad y exposición acumulada en unidades de juego. La protección debe cambiar el estado y afectar a la misión. |
| Materiales | Costos y reservas, con colocaciones inválidas que preservan el inventario. Presenta al jugador por qué conviene construir un módulo en lugar de otro. |
| Tripulación | Estado operativo, recursos consumidos, aptitud para continuar y señales de degradación de soporte vital. |
| Autonomía | Racha de días consecutivos con soporte vital operativo, tripulación protegida y reservas por encima de los umbrales. Define el predicado de victoria de cada nivel. |

Para cada edificio documenta insumos, salidas, costo, capacidad, prioridad y tiempo de producción o reparación. Garantiza conservación y límites de recursos, consumos únicos por turno, producción condicionada a insumos y cosecha con un ciclo de cultivo explícito. Las victorias deben comprobar el estado operativo y la carga de una partida debe validar los mismos invariantes que una partida nueva.

Especifica un ejemplo numérico de un día completo y un recorrido con dos decisiones distintas ante el mismo evento, de modo que un principiante pueda entender qué cambió. En el resumen de misión, muestra días usados, reservas, márgenes, incidentes y una explicación breve de causa y efecto. Diseña una opción de comprobación del aprendizaje con una pregunta antes y después de la misión y registro agregado o manual, sin pedir datos personales al jugador. Informa resultados solo si existen, indicando el tamaño de la muestra y los límites.

### Ciencia y datos integrados

**Primera opción de datos.** Verifica en la pestaña Resources del reto la entrada de **NASA CCMC DONKI**. Como diseño candidato, elige un registro histórico público de evento de partículas solares, conserva su identificador temporal y tipo de evento, y transforma el registro en un aviso predecible de simulación. El jugador debe poder decidir si usa el refugio y comparar el resultado. Guarda un extracto trazable y pequeño si sus condiciones de uso lo permiten. Documenta qué parte procede del registro y qué parte se fijó para equilibrar el juego. La fecha de un evento sirve para contextualizar el aviso. Las dosis, la intensidad local en la base y los umbrales de victoria requieren un modelo distinto, por lo que el prototipo debe usar unidades de juego para esos efectos. Si la fuente no se confirma en la lista oficial o no es utilizable, elige otra fuente NASA de esa lista con una integración demostrable. [DONKI · NASA Goddard](https://ccmc.gsfc.nasa.gov/tools/DONKI/)

**Apoyo conceptual.** Usa la descripción NASA de ECLSS para justificar la relación entre recuperación de agua y generación de oxígeno, y el caso InSight para ilustrar cómo el polvo puede reducir la producción solar en Marte. Documenta qué se simplifica al trasladar cada referencia a bases ficticias y explica que un día del juego representa un turno de la misión. Clasifica cada entrada del diseño como `dato NASA`, `transformación didáctica`, `balance` o `ficción`. [Sistemas de soporte vital ECLSS · NASA](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) · [Tormenta de polvo e InSight · NASA/JPL](https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm/)

**Otras fuentes candidatas.** Considera BVAD para valores de referencia de soporte vital, OSDR para estudios de ciencias biológicas y físicas, y Solar System Treks para terreno y emplazamiento. NASA Open APIs es un portal desde el que se pueden localizar conjuntos concretos. Antes de usar una referencia, comprueba su producto, unidades, alcance, condiciones y presencia en Resources si va a respaldar elegibilidad. Una API en vivo puede quedar para una ampliación. [BVAD · NASA NTRS](https://ntrs.nasa.gov/citations/20210024855) · [Datos biológicos y físicos · NASA](https://science.nasa.gov/biological-physical/data/) · [Solar System Treks · NASA](https://trek.nasa.gov/) · [NASA Open APIs](https://api.nasa.gov/)

Para cada fuente registra publicación y enlace, fecha de consulta, identificador o rango exacto, campos y unidades, alcance, términos y créditos, extracto y ruta de destino, transformación y prueba reproducible. Vincula la ficha con una pantalla o un turno de la demo. Usa datos empaquetados para ejecutar la demo sin APIs ni claves en tiempo real. Si solo tienes datos sintéticos durante el desarrollo, etiquétalos como tales y registra la integración de datos reales como pendiente. Propón textos de ayuda breves que expliquen la relación científica durante el juego.

### Arquitectura que debes especificar

Si el repositorio carece de una base técnica, evalúa **TypeScript + Vite + Phaser 3 o una versión estable compatible**, con simulación pura en TypeScript, Phaser con Canvas o WebGL para el mapa y HTML/CSS para menús, HUD y cinemáticas. Propón un sitio estático accesible desde un enlace, sin instalación, pago ni registro, con datos y configuraciones JSON locales, persistencia en `localStorage`, Vitest o equivalente y Git para el trabajo en paralelo. Justifica cambios de stack y cualquier dependencia que añada complejidad. Verifica versiones antes de fijarlas y adapta las rutas si ya existe una base equivalente.

- Dibuja el flujo `entrada → acción validada → núcleo de simulación → estado y eventos → HUD/mapa/audio/guardado`. Define un único propietario del estado autoritativo. La interfaz presenta el estado y el motor visual emite acciones. Incluye manejo de acciones inválidas, entradas repetidas y transición fallida.
- Especifica tipos e interfaces en la documentación, por ejemplo `GameState`, `Action`, `DayReport`, `LevelConfig`, `DifficultyConfig`, `MissionResult` y `SaveData`. Documenta quién modifica cada campo, funciones como `advanceDay` y `evaluateObjectives`, eventos para audio y UI, validación de datos y contratos entre módulos. Aísla el azar mediante semilla y evita depender del reloj real.
- Dibuja los estados y transiciones de menú, selección, cinemática inicial, Luna, viaje, Marte, elección de desenlace, Tierra, finales y fallo. Identifica condiciones de entrada y salida, orden de actualización y puntos de guardado. Define recorridos reproducibles de prueba y demostración para el equipo usando semillas y partidas de prueba. Aísla las ayudas de depuración del sitio público.
- Define controles de ratón y teclado, foco visible, etiquetas que acompañen al color, navegación por los controles principales, subtítulos, tratamiento de movimiento y soporte para tamaños de pantalla. Prioriza escritorio para el hackathon y especifica el alcance de las pantallas táctiles si se programan después.

**Partidas y opciones.** Prioriza guardar opciones por separado. Para el guardado de campaña de P1, especifica un formato de instantánea versionado en puntos estables, con dificultad, nivel, mapa, edificios, inventario, tripulación, día local, plazo global, objetivos, eventos, semilla, pistas, estado narrativo y marca de transición o bono. Define validación, migración y recuperación ante guardado ausente, corrupto o incompatible. Diseña `Continuar`, `Reiniciar misión` y `Nueva partida`, con confirmación antes de sobrescribir el progreso. Los cambios de idioma, audio o accesibilidad deben preservar la partida.

### Dirección de arte y audio

Usa pixel art 2D de ciencia ficción como dirección base, con viñetas originales para las cinemáticas. Define tipografía, paleta por entorno, resolución, tamaño de casillas, escala de sprites, iluminación, capas, transparencias, animaciones y efectos. El manifiesto de activos incluye por lo menos fondo de menú y logotipo propio, terrenos lunar y marciano, módulos de base, nave, astronautas, iconos, señales de estado, efectos de construcción, objetos ocultos, ilustraciones y elementos de Tierra. Para cada activo registra identificador, ruta esperada, dimensiones, formato, escena, capas o animaciones, transparencia, prioridad, estado, autoría, licencia y prompt de producción si corresponde. Mantén identidad propia y evita insinuar patrocinio o aval oficial.

Define un gestor de audio con volumen general, música y efectos independientes, inicio tras una interacción y transiciones de volumen entre escenas cuando sea viable. Incluye un tema del menú, pistas distintas para Luna, Marte y Tierra, tema común para cinemáticas y temas opcionales de victoria y derrota. El inventario de efectos cubre interfaz, confirmación, construcción, producción, cierre de día, alertas de radiación, averías, objetivos, descubrimientos, despegue y portal. Documenta formato, duración aproximada, bucle, uso y licencia, y acompaña avisos importantes con información en pantalla.

### Archivos de documentación que debes crear

Enlaza el mapa de lectura `docs/INDEX.md` desde el `README.md`. Si existe un README, añade los enlaces preservando su contenido. En un `CLAUDE.md` breve, indica el estado del proyecto, los contratos compartidos y dónde encontrar cada ficha. Integra esas referencias con las instrucciones existentes. Usa un documento de referencia por historia, contrato o parámetro para evitar divergencias. Crea estos archivos, usando rutas equivalentes cuando el repositorio ya tenga una convención establecida:

| Ruta | Contenido mínimo |
| --- | --- |
| `docs/INDEX.md` | Índice y orden de lectura para integrantes, agentes y quien evalúe la demo. |
| `docs/PROYECTO.md` | Visión, documento de diseño del juego, historia y mundo, bucle jugable, niveles, dificultades y metas por fase. Enlaza contratos y fichas para los detalles. |
| `docs/ARQUITECTURA.md` | Stack, árbol de carpetas, límites de módulos, estado, contratos de datos, flujo de eventos, dependencias y decisiones técnicas. Usa Mermaid o diagramas de texto. Documenta `src/`, `public/assets/` y `tests/` como estructura prevista cuando aún no existan. |
| `docs/DESPLIEGUE.md` | Preparación, ejecución, pruebas, compilación y publicación estática. Distingue comandos comprobados de los previstos. |
| `docs/NASA-SPACE-APPS-2026.md` | Matriz de condiciones y evidencias, fuentes, reglas de IA y datos, criterios de evaluación y pendientes de Santa Cruz. |
| `docs/CIENCIA-Y-DATOS.md` | Modelo científico, catálogo de fuentes y transformaciones, diseño educativo, ejemplos de turnos y límites de la simulación. |
| `docs/GUION-CINEMATICAS.md` | Guion, storyboard, textos localizables, música y transiciones por secuencia. |
| `docs/ARTE-Y-ACTIVOS.md` | Dirección de arte, manifiesto visual y sonoro y prioridades de producción. |
| `docs/PLAN-EQUIPO.md` | Roles, plan de trabajo, tablero y dependencias, ruta P0/P1/P2, definición de terminado y lista de verificación de lanzamiento. |
| `docs/RIESGOS-Y-LIMITES.md` | Riesgos del tiempo disponible, de balance, de fuentes, de compatibilidad, de integración y de entrega, con mitigación y responsable. |
| `docs/AGENTES.md` | Orden de despacho, responsabilidades, reglas de integración y enlaces a las fichas. |
| `docs/PRUEBAS.md` | Casos, estado inicial, acciones, valores esperados y tipo de prueba. Incluye procedimiento de prueba manual en navegador. |
| `docs/ENTREGA.md` | Borrador público en inglés, enlaces y comprobaciones de inscripción, atribuciones y envío. Incluye pitch local, guion breve de demo y esquema provisional de hasta siete diapositivas, en secciones o archivos enlazados de `docs/presentacion/`. Incluye una matriz `criterio del reto → mecánica y estado → fuente NASA → evidencia → escena de demostración`. |
| `docs/IA-Y-CREDITOS.md` | Registro de modelos, herramientas, usos, revisión humana, datos, código y activos, con sus autores, licencias, créditos e identificación visible cuando aplique. |

Da a **cada componente** su propio `.md` dentro de `docs/componentes/`. Las fichas describen límites funcionales. Si varios componentes comparten código, documenta cómo se relacionan y dispón la implementación de acuerdo con la arquitectura elegida. Añade fichas para módulos adicionales que diseñes. El inventario base es:

| Área | Fichas individuales |
| --- | --- |
| Flujo y controles | `arranque-y-escenas.md`, `menu-principal.md`, `menu-opciones.md`, `selector-dificultad.md`, `controles.md`, `hud-y-accesibilidad.md`. |
| Narrativa y aprendizaje | `motor-cinematicas.md`, `gestor-narrativa.md`, `tutorial-y-tarjetas-cientificas.md`, `resultados-y-finales.md`. |
| Mundo y progresión | `mapa.md`, `construccion.md`, `objetivos.md`, `progresion.md`, `dificultad-y-balance.md`. |
| Simulación | `ciclo-de-dias.md`, `motor-recursos.md`, `energia.md`, `soporte-vital.md`, `agua-y-alimentos.md`, `radiacion-y-refugio.md`, `eventos-ambientales.md`. |
| Secreto | `objetos-secretos.md`, `agujero-de-gusano.md`, `mision-terrestre.md`. |
| Servicios y producción | `audio.md`, `persistencia.md`, `adaptador-datos-nasa.md`, `proceso-de-activos.md`. |

Crea además `docs/niveles/luna.md`, `docs/niveles/marte.md` y `docs/niveles/tierra-alternativa.md` con mapa, condiciones iniciales, sistema de eventos, objetivos, rutas de prueba y estado previsto de implementación. La ficha `mision-terrestre.md` define el contrato del sistema y enlaza al diseño del nivel Tierra.

Cada ficha debe permitir implementar la tarea leyendo también la arquitectura y sus contratos. Incluye:

- **Identificación y límites.** ID, prioridad, fase, objetivo, responsabilidad, dependencias, exclusiones y responsable humano.
- **Arquitectura y funcionamiento.** Módulos, funciones, flujo paso a paso, estados y propietario, tipos TypeScript, entradas y salidas, eventos emitidos y consumidos, rutas y contratos. Usa un diagrama donde aclare el flujo.
- **Datos y uso.** Configuración, fórmulas, valores por defecto, controles, reacciones al jugador, recuperación de errores, casos límite, rendimiento y referencias científicas cuando correspondan.
- **Implementación delegable.** Prompt breve por componente, tarea enlazada, pruebas unitarias, de integración o manuales según corresponda, criterios de aceptación observables, evidencia, definición de terminado y riesgos. Enlaza los contratos, parámetros o fuentes que se mantienen en otra ficha.

### Plan para tres personas y delegación posterior

Usa **A, B y C** hasta que el equipo confirme sus nombres. Cada tarea tiene una persona responsable y otra revisora:

| Integrante | Tiempo de desarrollo | Responsabilidad de integración |
| --- | --- | --- |
| A · Simulación y arquitectura | Configuración del proyecto, motor 2D, contratos, estado global, turnos, recursos y pruebas de lógica. | Integra contratos compartidos, coordina los cambios del motor y verifica la compilación. |
| B · Jugabilidad y ciencia | Mapas y construcción, objetivos, balance, eventos, investigación NASA y validación de datos. | Comprueba la jugabilidad, los recorridos por dificultad y que el dato de NASA influya en una decisión. |
| C · Arte, narrativa y presentación | Dirección artística, HUD, accesibilidad, escenas, sprites, audio, tutorial, guion y demo. | Verifica los flujos en navegador, consolida los créditos, comprueba enlaces de entrega y coordina con la sede. |

Adapta el reparto a las habilidades reales cuando se conozcan. En la primera integración, A define los contratos y un día reproducible. B prepara el primer tablero y verifica la fuente y el evento. C construye el HUD y el tutorial sobre datos de prueba etiquetados y prepara la ficha de entrega. En el cronograma indica horas estimadas por integrante, dependencias, cierre comprobable de cada hito y hora interna de congelación. Deja margen para pruebas, publicación, captura, créditos y envío.

| Prioridad | Entrega jugable y condición de avance |
| --- | --- |
| **P0 · Prototipo lunar** | Web, menú, tres dificultades, apertura saltable, mapa 2D, construcción básica, ciclo de días, soporte vital, energía, alimentos y protección radiativa. Incluye un evento significativo, una decisión con datos NASA trazables, victoria y derrota, resumen, música lunar, efectos básicos, créditos y demo funcional. Cierra el hito con un recorrido desde el menú y una compilación lista para publicar. |
| **P1 · Campaña principal** | Introduce la transición Luna → Marte con el bono único, mapa marciano mayor, tormentas y logística, objetivos marcianos, música propia, victoria normal, guardado de campaña y opciones completas. Incorpora mejoras de arte e interfaz según el tiempo. |
| **P2 · Segunda Oportunidad** | Añade búsqueda y pistas, portal, misión jugable terrestre, cinemáticas y final alternativo. Deja para el final los efectos, animaciones y mejoras de audio que no condicionen los recorridos. |

Fija criterios para cortar alcance y pasar a pruebas, despliegue y presentación. Si hace falta, reduce casillas, animaciones o variedad de edificios y protege la relación entre ciencia y decisión de P0. Registra el estado real de cada elemento como propuesto, en desarrollo, integrado o verificado.

Crea en `docs/agentes/` una plantilla de tarea reutilizable, el backlog y su orden de dependencias, las reglas de trabajo y el protocolo de integración. Escribe prompts autocontenidos en `docs/agentes/prompts/` para **motor**, **jugabilidad**, **interfaz**, **arte y audio**, **ciencia y datos** e **integración y QA**. Una persona puede supervisar más de un perfil. Cada ficha incluye ID, título, prioridad, hito, perfil recomendado, responsable humano y revisor, base Git, componentes, contexto a leer, dependencias, rutas permitidas y excluidas, contratos, pasos de implementación, entregables, pruebas, evidencia y condiciones de integración. Pide informar archivos modificados, pruebas ejecutadas, resultados y pendientes. Si dos agentes dependen de un cambio de contrato, asigna a A esa modificación antes de ejecutar tareas paralelas.

Pide que cada agente consulte las fichas canónicas, conserve el trabajo ajeno, justifique dependencias nuevas y eleve cualquier cambio de arquitectura, contrato o regla científica a la persona responsable. Los informes deben distinguir lo implementado, lo probado y lo pendiente. Los recursos y cifras deben conservar sus créditos, licencias y procedencia.

En la segunda fase, usa ramas o copias de trabajo separadas para las tareas paralelas con Git. Cada humano revisa los cambios asignados y la integración pasa por una prueba conjunta. Define en el protocolo cómo se coordinan cambios simultáneos y quién resuelve conflictos en los archivos compartidos. Si el equipo quiere subagentes nativos, documenta cómo convertir una ficha en un Markdown de `.claude/agents/` con `name`, `description`, `model` si corresponde e `isolation: worktree` cuando convenga. En la API de Anthropic, `sonnet` y `haiku` seleccionan Claude Sonnet 5.5 y Claude Haiku 5.5 según la documentación consultada. Comprueba la versión que ofrece tu cuenta y reserva los modelos de mayor capacidad para las decisiones de arquitectura o integración. Para asistentes externos como Grok o GPT, copia la ficha a la herramienta correspondiente y verifica allí la disponibilidad del modelo. La fase actual termina con estas fichas listas para despachar. [Subagentes personalizados de Claude Code](https://code.claude.com/docs/en/sub-agents) · [Alias de Claude Code por proveedor](https://code.claude.com/docs/en/model-config#model-aliases)

### Pruebas y evidencias

- El plan de pruebas cubre la ruta mínima `Nueva partida → dificultad → introducción → Luna → informe de misión`. Para el juego completo, cubre `Luna → Marte → final normal` y `Luna y Marte con balizas → viaje al pasado → misión terrestre → final alternativo`. Incluye fallo de la misión principal y fallo del epílogo.
- Especifica pruebas de construcción válida e inválida, balance de producción y consumo, capacidad de almacenamiento, orden de operaciones, agotamiento de oxígeno, prioridades con poca energía, protección activa en una alerta y eventos reproducibles. Prueba doble pulsación de Finalizar día, victoria en el último día y derrota al vencer el plazo. Prevé al menos un recorrido de victoria reproducible por dificultad.
- Cubre menú, pausa y opciones, reproducciones con música y subtítulos, salto mediante Enter y botón, transferencia de recursos, aplicación única del bono al ver o saltar la cinemática, continuar, recarga y guardado inválido. Para la ruta secreta, verifica persistencia de pistas y que el portal siga cerrado sin sus condiciones.
- Define pruebas en **Chrome, Firefox y Edge**, resoluciones de laptop, controles principales y funcionamiento sin cuenta. Propón indicadores medibles de carga inicial, estabilidad, consistencia de simulación e incidencias de consola. Documenta resultados solo después de medirlos.
- El plan de entrega incluye una demo breve centrada en una decisión con efecto medible y una referencia NASA visible. Cuenta el problema educativo, el enfoque, tecnologías, uso de datos, ficción y simplificaciones, y resultados observados. Comprueba que se pueda jugar en la URL pública y abrir los enlaces en ventana privada.

### Primera ejecución y cierre

1. **Audita.** Revisa repositorio, instrucciones, cambios locales, fuentes oficiales y dudas de elegibilidad. Identifica riesgos y base de trabajo.
2. **Diseña.** Define alcance, stack, escenas, reglas, datos, contratos, dificultades, niveles y dependencias.
3. **Documenta.** Escribe los Markdown y actualiza los índices y las instrucciones persistentes con enlaces relativos.
4. **Prepara la delegación.** Escribe el backlog P0/P1/P2, el reparto y los prompts para las sesiones de implementación posteriores.
5. **Revisa.** Reabre los archivos. Comprueba existencia, enlaces, correspondencia entre rutas y contratos, una ficha por componente, procedencia de datos, viabilidad del P0, criterios de aceptación y ruta de entrega NASA.
6. **Informa.** En tu respuesta final en Claude Code, incluye resumen del diseño, stack, arquitectura, lista de `.md`, alcance P0, reparto A/B/C, riesgos, verificaciones oficiales pendientes y la **primera tarea concreta con el prompt exacto** para iniciarla.

Finaliza esta ejecución al entregar la planificación y los Markdown verificados. Deja las rutas de código previstas documentadas para la siguiente fase y registra el estado real de implementación.

## Fin del prompt
