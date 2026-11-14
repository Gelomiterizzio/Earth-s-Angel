# P2 · Segunda Oportunidad

Fichas compactas de las cinco tareas de P2. **Solo se empiezan con P1 verificado.** Mismos campos que la [plantilla](../PLANTILLA-TAREA.md), en forma breve.

Para todas: base Git, rama `<letra>/p2-<id>` desde `main` · reglas en [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md) · informe final con el formato de la plantilla · condición de integración común: `npm test` y `npm run build` en verde, revisión hecha y los recorridos de Luna y Marte siguen pasando.

**Antes de empezar P2, A hace un único cambio de contrato:** acción `SCAN`, acciones `EARTH_INVEST` y `EARTH_END_SEASON`, tipo `EarthState`, y `MissionState` como unión de misión de base o misión terrestre.

Todo el contenido de P2 es `ficción`. Los indicadores terrestres son simplificaciones de juego y así se rotulan.

---

## T-P2-B1 · Balizas, pistas y registro científico

| Campo | Valor |
| --- | --- |
| Perfil · responsable · revisor | [Jugabilidad](../prompts/jugabilidad.md) · B · C |
| Estimación | 2,5 h |
| Componentes | [objetos-secretos](../../componentes/objetos-secretos.md) |
| Contexto | [objetos-secretos](../../componentes/objetos-secretos.md) · [niveles/luna.md](../../niveles/luna.md) · [niveles/marte.md](../../niveles/marte.md) |
| Dependencias | P1 verificado y cambio de contrato de A |
| Rutas permitidas | `src/data/content/levels/*.json`, `src/map/**`, `src/data/i18n/*/content.json`, `tests/data/**` |
| Rutas excluidas | `src/core` (la acción `SCAN` la implementa A en T-P2-A1), `src/ui` |
| Contratos | `SCAN`, `campaign.clues`, banderas `beaconMoon` y `beaconMars` |

**Pasos:** 1) Posición de baliza y textos de las tres pistas por nivel en los datos. 2) Herramienta de escaneo en el tablero. 3) Dibujo del fragmento con muescas. 4) Textos de pistas en dos idiomas.

**Entregables:** búsqueda resoluble con pistas en los dos mapas.

**Pruebas:** U-SEC-01 a U-SEC-05.

**Criterios de aceptación:** dos pistas bastan para ubicar la baliza; las posiciones son fijas; las pistas persisten de la Luna a Marte.

**Evidencia:** capturas del registro de pistas.

---

## T-P2-A1 · Portal, elección de desenlace y núcleo de la misión terrestre

| Campo | Valor |
| --- | --- |
| Perfil · responsable · revisor | [Motor](../prompts/motor.md) · A · B |
| Estimación | 3,5 h |
| Componentes | [agujero-de-gusano](../../componentes/agujero-de-gusano.md) · [mision-terrestre](../../componentes/mision-terrestre.md) · [progresion](../../componentes/progresion.md) |
| Contexto | Las tres fichas y [niveles/tierra-alternativa.md](../../niveles/tierra-alternativa.md) |
| Dependencias | T-P2-B1 |
| Rutas permitidas | `src/core/**`, `src/app/flow.ts`, `tests/core/**`, `src/data/i18n/*/sim.json` |
| Rutas excluidas | Carpetas de B y C |
| Contratos | `SCAN`, `ACTIVATE_BEACONS`, transiciones `marte->tierra` y `tierra->marte`, `EarthState` |

**Pasos:** 1) `SCAN` y banderas. 2) `ACTIVATE_BEACONS` con sus tres condiciones. 3) Escena `eleccion` en el flujo. 4) Las dos transiciones, idempotentes. 5) `earth.ts`: inversión, cierre de temporada en orden fijo, victoria y fallo. 6) Reintento del epílogo y regreso al desenlace marciano.

**Entregables:** ruta secreta completa en el núcleo.

**Pruebas:** U-SEC-06 a U-SEC-09, U-TIE-01 a U-TIE-06, I-CAM-03 e I-CAM-04.

**Criterios de aceptación:** el portal sigue cerrado sin sus condiciones; la transición al pasado se aplica una vez; un fallo terrestre conserva la victoria de Marte.

**Evidencia:** salida de pruebas.

---

## T-P2-B2 · Datos y balance de la misión terrestre

| Campo | Valor |
| --- | --- |
| Perfil · responsable · revisor | [Ciencia y datos](../prompts/ciencia-y-datos.md) · B · A |
| Estimación | 2,0 h |
| Componentes | [mision-terrestre](../../componentes/mision-terrestre.md) |
| Contexto | [niveles/tierra-alternativa.md](../../niveles/tierra-alternativa.md) |
| Dependencias | T-P2-A1 |
| Rutas permitidas | `src/data/balance/tierra.json`, `src/data/content/levels/tierra.json`, `src/data/i18n/*/content.json`, `tests/**/earth*.test.ts`, `docs/niveles/tierra-alternativa.md` |
| Rutas excluidas | `src/core`, `src/ui` |
| Contratos | Formato de datos del epílogo |

**Pasos:** 1) JSON de líneas, combinaciones, derivas y metas. 2) Recorrido de victoria por dificultad, temporada a temporada. 3) Casos de fallo documentados. 4) Pruebas de recorrido. 5) Textos en dos idiomas con los rótulos de ficción y simplificación.

**Entregables:** balance terrestre validado y documentado.

**Pruebas:** I-REC-TIERRA-FACIL, I-REC-TIERRA-MEDIA, I-REC-TIERRA-IMPOSIBLE.

**Criterios de aceptación:** tres recorridos reproducibles; no invertir pierde; el estado de la ficha pasa a "validado" solo con las pruebas en verde.

**Evidencia:** tablas en la ficha del nivel y pruebas.

---

## T-P2-C1 · Cinemáticas de la ruta secreta, final terrestre e interfaz del epílogo

| Campo | Valor |
| --- | --- |
| Perfil · responsable · revisor | [Interfaz](../prompts/interfaz.md) · C · A |
| Estimación | 3,5 h |
| Componentes | [motor-cinematicas](../../componentes/motor-cinematicas.md) · [agujero-de-gusano](../../componentes/agujero-de-gusano.md) · [mision-terrestre](../../componentes/mision-terrestre.md) |
| Contexto | [GUION-CINEMATICAS.md](../../GUION-CINEMATICAS.md), secuencia 4 |
| Dependencias | T-P2-A1 |
| Rutas permitidas | `src/ui/**` salvo `decision.ts`, `src/styles/**`, `public/assets/**`, `src/data/i18n/*/ui.json` |
| Rutas excluidas | `src/core`, `src/app` |
| Contratos | `CinematicScript`, escena `eleccion`, acciones del epílogo |

**Pasos:** 1) Pantalla de elección con dos opciones equivalentes. 2) Guiones `wormhole.json` y `earthVictory.json`. 3) Pantalla del epílogo: cuatro líneas, tres indicadores, presupuesto, cierre de temporada. 4) Fondo que cambia con el avance. 5) Rótulos fijos de ficción y simplificación. 6) Registro de pistas en el panel de ayuda.

**Entregables:** ruta secreta jugable de principio a fin.

**Pruebas:** M-SEC-01 a M-SEC-05.

**Criterios de aceptación:** los rótulos están siempre visibles; todo se maneja con teclado; saltar las cinemáticas no cambia el estado; el mensaje final aparece con sus dos frases.

**Evidencia:** capturas.

---

## T-P2-C2 · Pulido: efectos, animaciones y audio

| Campo | Valor |
| --- | --- |
| Perfil · responsable · revisor | [Arte y audio](../prompts/arte-y-audio.md) · C · B |
| Estimación | Lo que quede |
| Componentes | [audio](../../componentes/audio.md) · [proceso-de-activos](../../componentes/proceso-de-activos.md) |
| Contexto | [ARTE-Y-ACTIVOS.md](../../ARTE-Y-ACTIVOS.md) |
| Dependencias | Todo lo anterior |
| Rutas permitidas | `public/assets/**`, `src/audio/**`, `src/styles/**` |
| Rutas excluidas | `src/core`, reglas de juego |
| Contratos | Ninguno nuevo |

**Pasos:** 1) `music-earth`, temas de victoria y derrota. 2) Animaciones de edificios en funcionamiento. 3) Partículas de polvo y de portal. 4) Transiciones entre pantallas. Todo respetando movimiento reducido.

**Entregables:** mejoras que no condicionan ningún recorrido.

**Pruebas:** M-AUD-01 a M-AUD-05 y M-ART-01 a M-ART-03.

**Criterios de aceptación:** ninguna mejora cambia un resultado de prueba; con movimiento reducido no hay animaciones nuevas; cada activo está registrado.

**Evidencia:** lista de cambios.
