# Pruebas

Fuente canónica de los **valores esperados**. Si el código no reproduce un valor de este documento, el fallo está en el código o hay un cambio de reglas que debe pasar por A y B. **Un valor esperado no se edita para que una prueba pase.**

## 1. Estado

| Qué | Estado al 14-nov-2026 |
| --- | --- |
| Pruebas automáticas | No existen: no hay código |
| Resultados medidos | Ninguno |
| Reglas y vectores de la Luna | Validados con un modelo de referencia desechable, escrito en la fase de planificación con ayuda de IA. El modelo no forma parte del repositorio |
| Vectores de Marte y de la Tierra | Sin validar |

Lo que el modelo comprobó: los tres recorridos de victoria, las variantes, las cinco derrotas, el ejemplo numérico del día 8, el ejemplo del día de sombra, el efecto de apagar el invernadero y el generador, y que los recorridos de Fácil y Media siguen ganando con la tormenta un día más tarde.

## 2. Tipos y convenciones

| Prefijo | Tipo | Herramienta | Dueño |
| --- | --- | --- | --- |
| U | Unitaria del núcleo y de la aplicación | Vitest | A |
| D | Datos | Vitest | B |
| I | Integración del núcleo: partidas completas | Vitest | A |
| M | Manual en navegador | Lista de comprobación | C, con B |
| N | Matriz de navegadores | Manual | Todos |
| R | Medidas | Manual | A |

Abreviaturas de estado inicial:

- **Media nueva:** `createCampaign('media', 'EA-DEMO', data, { canonical: true })`. Energía 10/20, oxígeno 24, agua 24, alimentos 32, materiales 40, 4 puntos de acción, zona explorada de `x` 3 a 7 y de `y` 3 a 7.
- **Media D8:** estado al abrir el día 8 del recorrido de Media. Energía 24/40, oxígeno 20, agua 25, alimentos 28, materiales 14, exposición 7, racha 1.

Toda prueba de rechazo comprueba además que **el estado devuelto es el mismo objeto de entrada**.

## 3. Pruebas unitarias

### Azar, almacén y cadenas

| ID | Estado y acción | Esperado |
| --- | --- | --- |
| U-RNG-01 | Dos generadores con la misma semilla; otro con semilla distinta | Las dos primeras secuencias de 100 números coinciden; la tercera no |
| U-ALM-01 | `load(estado)` con un suscriptor | El suscriptor recibe el estado una vez |
| U-ALM-02 | `dispatch` de una acción inválida | Evento `action/rejected`; `getState()` es el mismo objeto |
| U-ALM-03 | `dispatch` de una acción válida | Un aviso a suscriptores y los eventos reenviados en orden |
| U-LOC-01 | `t('sim.error.NO_MATERIALS', { need: 6, have: 5 })` | Texto con 6 y 5, en el idioma activo |
| U-LOC-02 | Clave solo en inglés con idioma español; clave inexistente | Texto en inglés; la propia clave |
| U-LOC-03 | Comparar claves de `en/*.json` y `es/*.json` | Conjuntos idénticos |

### Construcción · Media nueva

| ID | Acción | Esperado |
| --- | --- | --- |
| U-CON-01 | `BUILD panel (4,4)` | Aceptada. Materiales 34, puntos de acción 3, `operationalFromDay` 2 |
| U-CON-02 | `BUILD` con la fase en `report` | `WRONG_PHASE` |
| U-CON-03 | `BUILD` de un tipo que no existe | `UNKNOWN_BUILDING` |
| U-CON-04 | `BUILD deposito (4,4)` en la Luna | `NOT_AVAILABLE_IN_LEVEL` |
| U-CON-05 | `BUILD panel (12,0)` | `TILE_OUT_OF_BOUNDS` |
| U-CON-06 | `BUILD panel (0,2)` | `TILE_UNEXPLORED` |
| U-CON-07 | `BUILD extractor (4,4)` · `BUILD panel (5,5)` | `WRONG_TERRAIN` · `TILE_BLOCKED` |
| U-CON-08 | `BUILD panel (4,4)` dos veces | La segunda: `TILE_OCCUPIED` |
| U-CON-09 | Materiales 5 y `BUILD panel` · materiales 6 y `BUILD panel` | `NO_MATERIALS` · aceptada, materiales 0 |
| U-CON-10 | Puntos de acción 0 y `BUILD panel` | `NO_AP` |

### Exploración y recolección · Media nueva

| ID | Acción | Esperado |
| --- | --- | --- |
| U-EXP-01 | `EXPLORE (8,8)` | Aceptada. Puntos de acción 3. Se revelan 9 casillas, entre ellas hielo en (9,8) y (9,9) |
| U-EXP-02 | `EXPLORE (4,4)` | `ALREADY_EXPLORED` |
| U-EXP-03 | `EXPLORE (10,10)` | `NOT_ADJACENT` |
| U-EXP-04 | Con (1,5) explorada, `EXPLORE (0,5)` | Aceptada. Solo se revelan casillas dentro del mapa |
| U-EXP-05 | `COLLECT (3,7)` · otra vez · `COLLECT (4,4)` · `COLLECT (1,8)` | Materiales 55 y puntos de acción 3 · `NOTHING_TO_COLLECT` · `NOTHING_TO_COLLECT` · `TILE_UNEXPLORED` |

### Energía

| ID | Estado | Esperado |
| --- | --- | --- |
| U-ENE-01 | 2 paneles operativos, sol al 100 % | Generación 16 |
| U-ENE-02 | Media, día 4: 2 paneles, sol al 25 %, batería 20, cuatro módulos | Generación 4, disponible 24, usado 14, final 10 |
| U-ENE-03 | Una batería operativa | Capacidad 40 |
| U-ENE-04 | Disponible 8, orden por defecto, cuatro módulos | Con electricidad: generador y reciclador. Sin electricidad: extractor e invernadero. Sobra 1 |
| U-ENE-05 | Igual, con el invernadero primero en la prioridad · lista de prioridad incompleta | Con electricidad: invernadero y generador · `INVALID_PRIORITY` |
| U-ENE-06 | Disponible 10, refugio pedido con costo 6 · capacidad 20 y sobran 30 | Refugio y generador con electricidad, el resto no · final 20, desperdicio 10 |

### Agua, oxígeno y alimentos

| ID | Estado | Esperado |
| --- | --- | --- |
| U-AGU-01 | Extractor con electricidad | Agua +6 |
| U-AGU-02 | Reciclador con `wastewater` 4 · con 0 | Agua +3 · +0 |
| U-AGU-03 | Generador con electricidad, agua 10, 4 tripulantes | Agua −2, oxígeno +6 |
| U-AGU-04 | Generador con electricidad, agua 5, 4 tripulantes | No funciona: solo sobra 1 de agua para módulos |
| U-AGU-05 | Invernadero 4 días seguidos funcionando | El cuarto día: +24 alimentos, `growth` 0, `harvests` 1 |
| U-AGU-06 | Invernadero con un día sin funcionar entre medias | Cosecha de 18, un día más tarde |
| U-AGU-07 | Agua 6, 4 tripulantes, generador e invernadero con electricidad | Funciona el generador; el invernadero no y suma estrés |

### Ciclo de días

| ID | Estado y acción | Esperado |
| --- | --- | --- |
| U-DIA-01 | `END_DAY` en `planning` | Día +1, plazo terrestre −1, fase `report` |
| U-DIA-02 | `END_DAY` con `day` anterior | `STALE_DAY` |
| U-DIA-03 | `END_DAY` en fase `decision` | `DECISION_PENDING` |
| U-DIA-04 | `ACK_REPORT` · con `day` equivocado | Fase `planning`, o `decision` si hoy hay radiación · `STALE_DAY` |
| U-DIA-05 | Media D8, refugiar, `END_DAY` | Energía 28/40, oxígeno 22, agua 26, alimentos 24, exposición 13, racha 2, usado 20, generado 24 |
| U-DIA-06 | Media D8, trabajar, sin más acciones, `END_DAY` | Energía 34, exposición 58, racha 0, usado 14 |
| U-DIA-07 | Media con `dayLimit` 9, recorrido completo · salud 0 con objetivos cumplidos | Victoria el día 9 · derrota `soporte-vital` |
| U-DIA-08 | `advanceDay` con la entrada congelada | No lanza error: la entrada no se modifica |

### Tripulación

| ID | Estado | Esperado |
| --- | --- | --- |
| U-TRI-01 | Todo cubierto, salud 95 | Salud 100 |
| U-TRI-02 | Oxígeno 0, 4 tripulantes | Los cuatro: −50 |
| U-TRI-03 | Oxígeno para 2 de 4, saludes 100, 80, 100, 60 | Se quedan sin oxígeno los `id` 0 y 2 |
| U-TRI-04 | Sin oxígeno y sin agua | −75 |
| U-TRI-05 | Exposiciones 10, 55, 60, 49 | 3 puntos de acción |
| U-TRI-06 | Agua para 3 de 4 | `wastewater` 3 |

### Radiación

| ID | Estado | Esperado |
| --- | --- | --- |
| U-RAD-01 | Día sin evento | Exposición +1 |
| U-RAD-02 | Severa, con refugio | +6 |
| U-RAD-03 | Severa, sin refugio | +51 |
| U-RAD-04 | Moderada, con y sin refugio | +3 · +26 |
| U-RAD-05 | `DECIDE_SHELTER` con `shelter: true` sin refugio · con refugio en obra | `NO_SHELTER` en los dos |
| U-RAD-06 | Energía más generación de hoy menor que el costo · `DECIDE_SHELTER` en fase `planning` | `NO_ENERGY_FOR_SHELTER` · `WRONG_PHASE` |
| U-RAD-07 | 6 tripulantes, 4 plazas, exposiciones 5, 9, 7, 7, 3, 8 | Dentro: `id` 1, 5, 2, 3. Fuera: 0 y 4 |

### Objetivos, validación y eventos

| ID | Estado | Esperado |
| --- | --- | --- |
| U-OBJ-01 | Faltó uno de extractor, reciclador o generador | `soporte` no cumplido |
| U-OBJ-02 | Generador construido, sin electricidad | `soporte` no cumplido |
| U-OBJ-03 | 2 paneles y consumo nominal 14 · 2 paneles y consumo nominal 18 | `energia` cumplido · no cumplido |
| U-OBJ-04 | Invernadero funcionando, sin cosechas todavía | `alimentos` no cumplido |
| U-OBJ-05 | Reservas en 16 con umbral 16 · en 15 | Cumplido · no cumplido |
| U-OBJ-06 | Media: cierre del día 7 · del día 8 con refugio · del día 8 sin refugio construido | `proteccion` no · sí · no |
| U-OBJ-07 | Tres días estables y uno inestable | Racha 1, 2, 3, 0 |
| U-OBJ-08 | Cinco objetivos cumplidos y racha insuficiente | Sin victoria |
| U-VAL-01 | Misión nueva en cada dificultad | Lista vacía |
| U-VAL-02 | Recurso negativo | Un problema que nombra el recurso |
| U-VAL-03 | Edificio sobre roca | Un problema que nombra el edificio |
| U-VAL-04 | Fase `ended` sin resultado | Un problema de fase |
| U-EVE-01 | Programa canónico de cada dificultad | Igual a la tabla de balance |
| U-EVE-02 | Dos misiones con la misma semilla, modo variado | Programas idénticos |
| U-EVE-03 | 50 semillas, modo variado, Media | Tormenta el día 8 o 9; registro de nivel 2 |
| U-EVE-04 | Dos eventos activos el mismo día | Sol: el mínimo. Radiación: el máximo |
| U-EVE-05 | Media: pronóstico en los días 2, 6 y 7 | Sombra en 2 días · tormenta en 2 días · tormenta en 1 día |
| U-REC-01 | Cada día del recorrido de Media | `final = inicial + producido − consumido − desperdiciado` para cada recurso |
| U-REC-02 | Cosecha con almacén casi lleno | Recorte a la capacidad y desperdicio anotado |
| U-REC-03 | Cualquier acción rechazada | Estado idéntico |
| U-REC-04 | `END_DAY` sin construir | Los materiales no cambian |

### Aplicación, HUD y resultados

| ID | Estado y acción | Esperado |
| --- | --- | --- |
| U-FLU-01 | Cada transición de la tabla de P0 | Aceptada |
| U-FLU-02 | `titulo` → `resultado` | Ignorada; sigue en `titulo` |
| U-FLU-03 | `completeCinematic` dos veces | Una sola navegación |
| U-FLU-04 | El estado pasa a tener `result` | El flujo va a `resultado` |
| U-FLU-05 | Cambio de escena | `unmount` de la anterior antes del `mount` de la nueva; sin suscripciones vivas |
| U-OPC-01 | Sin nada guardado | Valores por defecto de la ficha |
| U-OPC-02 | Cambiar, recrear el servicio | Los valores siguen |
| U-OPC-03 | Texto que no es JSON en `ea.options.v1` | Valores por defecto, sin error |
| U-OPC-04 | Volumen 500 guardado | Ese campo vuelve a su valor por defecto; los demás se conservan |
| U-HUD-01 | Reservas por encima del umbral, batería por encima del umbral, sin alerta | Los tres medidores en `seguro` |
| U-HUD-02 | Oxígeno 8 con 4 tripulantes | Soporte vital `preventivo`, margen 2, limitante oxígeno |
| U-HUD-03 | Oxígeno 4 · exposición 80 | Soporte vital `critico` · protección `critico` |
| U-RES-01 | Día de sombra | `causeEffectKeys` contiene `sim.cause.lowLight` |
| U-RES-02 | Día de tormenta con y sin refugio | `sheltered` · `unsheltered` |
| U-RES-03 | Derrota por oxígeno | Principio y sugerencia de oxígeno |
| U-RES-04 | Derrota por exposición | Principio y sugerencia de refugio |
| U-RES-05 | Derrota por plazo sin refugio | Sugerencia de reservar materiales para el refugio |

### P1 y P2

Se detallan al empezar cada fase. Identificadores reservados:

| ID | Tema |
| --- | --- |
| U-PRO-01 a 06 | Transición idempotente, bono único, manifiesto, reinicio de misión, precondiciones, recarga |
| U-GUA-01 a 06 | Guardar y cargar, ausente, corrupto, incompatible, inválido, migración |
| U-MAR-01 a 08 | Polvo, limpieza, recargo logístico, averías, horizonte de pronóstico, refugio con menos plazas, enlace, derrotas |
| U-SEC-01 a 09 | Pistas, persistencia de pistas, `SCAN`, banderas, portal cerrado sin condiciones, elección, transiciones |
| U-TIE-01 a 06 | Inversión, orden de la temporada, combinaciones, victoria, fallos, regreso a Marte |

## 4. Pruebas de datos

| ID | Comprobación | Esperado |
| --- | --- | --- |
| D-BAL-01 | `constants.json` frente a la tabla de constantes | Idénticos |
| D-BAL-02 | `buildings.json` frente al catálogo P0 | Idénticos |
| D-BAL-03 | `luna.json` y `difficulty.json` frente a las tablas | Idénticos |
| D-BAL-04 | Mapa lunar | 12 filas de 12; una `S`; tres `i`; cinco `m`; una `?` |
| D-BAL-05 | Un dato roto por cada regla de validación | Error que nombra archivo y clave |
| D-BAL-06, 07 | Mapa y balance de Marte (P1) | 20 filas de 20; valores de la tabla |
| D-NASA-01 | Forma de cada registro del extracto | Campos obligatorios; enlace que empieza por `https://ccmc.gsfc.nasa.gov/` |
| D-NASA-02 | Datos de producción | Ningún `SYNTHETIC`; cada `sourceRef` del balance existe en el extracto |
| D-NASA-03 | Registro `2017-09-10T16:25:00-SEP-001` · cargar sin el extracto | Instrumento con ">100 MeV", nivel 2, `leadMinutes` 50, fulguración X8.2 · `loadGameData` falla |
| D-CON-01 | Tarjetas con etiqueta `nasa` | Todas tienen fuente con URL |
| D-CON-02 | Claves citadas en `cards.json` y `tutorial.json` | Existen en inglés y español |
| D-CON-03 | Pasos del tutorial | Sus tarjetas y elementos resaltados existen |

## 5. Pruebas de integración

Partidas completas en modo canónico. Las tablas día a día están en [niveles/luna.md](niveles/luna.md): la prueba compara **cada fila**.

| ID | Partida | Esperado |
| --- | --- | --- |
| I-REC-FACIL | Recorrido de Fácil | Victoria el día 9. Final: energía 18/20, oxígeno 32, agua 35, alimentos 28, materiales 10, exposición 11. Plazo terrestre 55 |
| I-REC-MEDIA | Recorrido de Media | Victoria el día 9. Final: energía 38/40, oxígeno 24, agua 27, alimentos 20, materiales 14, exposición 14. Plazo terrestre 45 |
| I-REC-IMPOSIBLE | Recorrido de Imposible | Victoria el día 13. Final: energía 40/40, oxígeno 28, agua 22, alimentos 20, materiales 8, exposición 23. Plazo terrestre 31 |
| I-REC-MEDIA-B | Media; el día 8 trabajar, invernadero en (7,6), explorar (8,4) y (10,4) | Día 8: exposición 58, racha 0. Desde el día 9: 2 puntos de acción. Victoria el día 11, exposición 61, materiales 4, plazo 43 |
| I-REC-MEDIA-C | Media; invernadero apagado el día 4 y encendido el día 5 | Alimentos 4 el día 7 y 18 el día 8. Victoria el día 14 |
| I-REC-FACIL-B | Fácil sin refugiarse el día 9 | Victoria el día 11, exposición 36 |
| I-DER-01 | Fácil sin ninguna acción | Primera falta el día 9. Derrota `soporte-vital` el día 10 |
| I-DER-02 | Media sin ninguna acción | Primera falta el día 7, salud 25. Derrota `soporte-vital` el día 8 |
| I-DER-03 | Imposible sin ninguna acción | Primera falta el día 6. Derrota `soporte-vital` el día 7 |
| I-DER-04 | Imposible; recorrido sin refugiarse los días 8 y 9 | Derrota `exposicion` el día 9, exposición 109 |
| I-DER-05 | Media; recorrido sin construir el refugio | Derrota `plazo` el día 20, exposición 70. Único objetivo sin cumplir: `proteccion` |
| I-BOR-01 | Dos `END_DAY` seguidos con el mismo `day` | Avanza un día; el segundo devuelve `STALE_DAY` |
| I-BOR-02 | Media con `dayLimit` 9 | Victoria el día 9: el éxito gana al plazo |
| I-BOR-03 | Media con `dayLimit` 8 | Derrota `plazo` al cerrar el día 8 |
| I-INV-01 | 100 partidas con acciones válidas elegidas con semilla | Tras cada acción: `validateState` vacío, recursos entre 0 y su capacidad, entrada sin modificar |
| I-CAM-01 | Luna → Marte → final normal (P1) | Campaña completa con el bono aplicado una vez |
| I-CAM-02 | `applyTransition('luna->marte')` cinco veces; recarga a mitad de cinemática (P1) | Mismo estado |
| I-CAM-03 | Luna y Marte con balizas → viaje al pasado → misión terrestre → final alternativo (P2) | Campaña completa |
| I-CAM-04 | Fallo de la misión terrestre (P2) | Desenlace marciano conservado |

Recorridos de Marte y de la Tierra (`I-REC-MARTE-*`, `I-REC-TIERRA-*`): pendientes de definir en T-P1-B2 y T-P2-B2.

## 6. Pruebas manuales en navegador

### Procedimiento general · M-GEN-01

Ruta mínima: **Nueva partida → dificultad → introducción → Luna → informe de misión.** Con la consola abierta.

1. Abrir la URL con `?seed=demo` en ventana privada. Aparece el título en inglés.
2. **New game** → **Medium**. Empieza la apertura.
3. Pulsar Enter. Empieza la misión en el día 1.
4. Jugar el recorrido de Media de [niveles/luna.md](niveles/luna.md) día a día.
5. En cada informe, comparar las cifras con la tabla.
6. El día 8, comprobar la tarjeta de decisión con el registro DONKI y elegir refugiar.
7. El día 9 aparece la victoria con el informe de misión y la semilla.
8. Volver al título. Repetir sin hacer nada hasta la derrota del día 8.
9. Anotar cualquier error o aviso de consola.

### Listas por área

| ID | Comprobación |
| --- | --- |
| M-ARR-01 | La URL pública abre en ventana privada, en inglés, sin errores de consola |
| M-FLU-01 | Título → dificultad → apertura → misión → resultado → título, sin recargar |
| M-FLU-02 | `?seed=demo` da siempre el mismo pronóstico; sin parámetro, la semilla del resultado cambia entre partidas |
| M-MEN-01 | El título se recorre con Tab y Enter; el foco se ve siempre |
| M-MEN-02 | Las tres tarjetas de dificultad muestran las cifras del balance y arrancan la misión |
| M-MEN-03 | Salir con misión activa pide confirmación; la despedida detiene el audio y permite volver |
| M-MEN-04 | Los tres volúmenes actúan por separado; silencio los anula sin perderlos |
| M-MEN-05 | Cambiar el idioma cambia todos los textos sin recargar |
| M-MEN-06 | Las opciones siguen tras recargar; cambiarlas en mitad de una misión no altera la partida |
| M-MAP-01 | Día 1: zona de 5 × 5 explorada, nave en (5,5), mineral en (3,7) |
| M-MAP-02 | Día 8: todos los edificios del recorrido en su casilla |
| M-MAP-03 | El tablero cambia al cambiar el estado, sin recargar |
| M-MAP-04 | Las flechas mueven el cursor y la etiqueta accesible describe la casilla |
| M-MAP-05 | Sin sprites, el tablero se ve con rectángulos y letras |
| M-CON-01 | Colocar un panel: vista previa con ✔ y "Listo el día 2" |
| M-CON-02 | Colocar sobre roca o sin materiales: ✖ con el motivo y nada cambia |
| M-CON-03 | El extractor solo se acepta sobre hielo |
| M-CON-04 | Todo lo anterior solo con teclado |
| M-EXP-01 | Explorar (8,8) revela el hielo |
| M-EXP-02 | Explorar una casilla no adyacente muestra el motivo |
| M-EXP-03 | Recolectar (3,7) suma los materiales de la dificultad y el mineral desaparece |
| M-DEC-01 | Día 8 en Media: el panel muestra identificador, X8.2, región 12673, GOES13 y 50 minutos |
| M-DEC-02 | El enlace abre el registro en DONKI |
| M-DEC-03 | Las cifras de costo y exposición coinciden con el balance |
| M-DEC-04 | Sin refugio, la opción de refugiar está deshabilitada y dice por qué |
| M-DEC-05 | Se decide solo con teclado; el foco no sale del panel; el dato real y los valores del juego están separados |
| M-HUD-01 | Los tres medidores muestran icono, valor y texto de estado |
| M-HUD-02 | Cada medidor abre su detalle |
| M-HUD-03 | Los seis objetivos y la racha se actualizan al cerrar el día |
| M-HUD-04 | El pronóstico anuncia sombra y tormenta con dos días |
| M-HUD-05 | Un edificio que no se puede pagar está deshabilitado y dice qué falta |
| M-HUD-06 | Doble clic en Finalizar día avanza un solo día |
| M-HUD-07 | Los rechazos se leen en la línea de mensajes |
| M-HUD-08 | En escala de grises, los tres estados se distinguen |
| M-PAU-01 | Esc abre la pausa y el día no avanza; Reanudar vuelve; Opciones se abre y regresa a la pausa; Reintentar y Salir piden confirmación |
| M-INF-01 | El informe del día 8 muestra las cifras del ejemplo numérico |
| M-INF-02 | El informe del día de sombra explica la poca luz |
| M-INF-03 | Una falta de recursos aparece la primera en el informe |
| M-INF-04 | Enter continúa |
| M-RES-01 | La victoria muestra días usados, plazo, reservas, exposición y semilla |
| M-RES-02 | Cada causa de derrota muestra principio y sugerencia propios |
| M-RES-03 | Reintentar misión reinicia con la misma dificultad |
| M-RES-04 | Los créditos nombran DONKI con enlace, el uso de IA y la no afiliación |
| M-CIN-01 | La apertura se reproduce con música y subtítulos |
| M-CIN-02 | Enter salta |
| M-CIN-03 | El botón «Skip (Enter)» salta, con ratón y con teclado |
| M-CIN-04 | Cinco pulsaciones de Enter llevan a la misión una vez |
| M-CIN-05 | Con movimiento reducido no hay paneos |
| M-CIN-06 | Sin imágenes, la secuencia se completa con paneles de color |
| M-TUT-01 | Los pasos aparecen en orden, uno cada vez |
| M-TUT-02 | Omitir el tutorial lo cierra sin errores |
| M-TUT-03 | Las tarjetas se desbloquean y se pueden releer |
| M-TUT-04 | Cada tarjeta muestra su etiqueta; las de dato NASA abren su fuente |
| M-NAR-01 | La guía comenta la primera cosecha sin tapar ninguna alerta |
| M-APR-01 | La pregunta aparece antes y después; se puede omitir |
| M-APR-02 | Lo guardado solo contiene recuentos |
| M-APR-03 | Los totales se ven y se borran en Créditos |
| M-CTL-01 | Cada atajo de la tabla de controles hace lo que dice |
| M-CTL-02 | Ningún atajo actúa con un diálogo abierto |
| M-CTL-03 | La lista de Opciones coincide con los atajos reales |
| M-CTL-04 | Una partida completa de Media solo con teclado |
| M-AUD-01 | Sin interacción no suena nada ni hay errores |
| M-AUD-02 | La música cambia con fundido entre menú y misión |
| M-AUD-03 | Cada efecto de la tabla P0 suena con su evento |
| M-AUD-04 | La alerta de radiación suena y además se ve |
| M-AUD-05 | Sin archivos de audio, el juego suena con el sintetizador |
| M-ART-01 | Cada archivo de `public/assets` está en el manifiesto con autoría y licencia |
| M-ART-02 | Toda ilustración generada lleva marca de agua legible |
| M-ART-03 | Ningún activo muestra logotipos, banderas, insignias ni personas reales |
| M-BAL-01 | B gana Fácil, Media e Imposible en el navegador y anota día y dudas |
| M-ENT-01 | La demo dura 30 s o menos, o tiene 7 diapositivas o menos |
| M-ENT-02 | Los dos enlaces abren en ventana privada y en un teléfono |
| M-ENT-03 | Formulario y materiales enlazados en inglés |
| M-ENT-04 | El campo NASA Data nombra DONKI, el identificador y dónde aparece |
| M-ENT-05 | Ningún material muestra menores, datos personales ni marca de NASA |
| M-ENT-06 | Aviso de envío correcto capturado |

Identificadores reservados para P1 y P2: M-GUA-01, M-MAP-06 a 08, M-HUD-09 a 12, M-MEN-07, M-SEC-01 a 05.

## 7. Navegadores y pantallas

| ID | Navegador | 1366 × 768 | 1920 × 1080 | Sin cuenta |
| --- | --- | --- | --- | --- |
| N-01 | Chrome | no probado | no probado | no probado |
| N-02 | Firefox | no probado | no probado | no probado |
| N-03 | Edge | no probado | no probado | no probado |

En cada celda: M-GEN-01 completo con ratón y un día completo con teclado. Se anota la versión del navegador.

## 8. Indicadores medibles

Se anotan **solo después de medirlos**.

| ID | Indicador | Cómo se mide | Objetivo orientativo | Medido |
| --- | --- | --- | --- | --- |
| R-01 | Tamaño de `dist/` | Explorador de archivos, tras `npm run build` | Menos de 5 MB sin música | — |
| R-02 | Carga inicial | Segundos desde abrir la URL hasta el título, en una laptop del evento, sin caché | Menos de 3 s | — |
| R-03 | Incidencias de consola | Errores y avisos en un M-GEN-01 completo | 0 | — |
| R-04 | Consistencia de simulación | Mismo plan y semilla en los tres navegadores | Mismo resultado y mismas cifras | — |
| R-05 | Estabilidad | Partidas completas seguidas sin recargar | 3 sin fallos | — |

## 9. Resultados

Sin resultados. Esta sección se rellena con fecha, navegador, versión, número de pruebas y resultado. Lo no probado se escribe "no probado".

| Fecha | Qué se ejecutó | Resultado | Quién |
| --- | --- | --- | --- |
| — | — | — | — |
