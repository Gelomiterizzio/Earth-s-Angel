# Ciencia y datos

Modelo científico, catálogo de fuentes, transformaciones y límites. Es la **fuente canónica de la procedencia de cada cifra**. Fecha de consulta de todas las fuentes: 14 de noviembre de 2026.

## 1. Cuatro etiquetas

Toda entrada del diseño lleva una:

| Etiqueta | Significado | Ejemplo |
| --- | --- | --- |
| `dato NASA` | Valor o hecho leído tal cual de una fuente NASA citada | La fulguración del 10-sep-2017 fue de clase X8.2 |
| `transformación didáctica` | Regla que convierte un dato real en algo jugable | Un registro en el canal de más de 100 MeV se muestra como tormenta "severa" |
| `balance` | Número elegido para que la partida funcione | Sin refugio la tormenta severa suma 50 de exposición |
| `ficción` | Parte de la historia | Proyecto Last Hope, el agujero de gusano |

Regla de oro: **un valor de balance nunca se presenta como dato real.** Dosis, intensidades en la base y umbrales de victoria son unidades de juego.

## 2. Fuente integrada: DONKI

| Campo | Valor |
| --- | --- |
| ID de ficha | F-01 |
| Publicación | *Space Weather Database Of Notifications, Knowledge, Information (DONKI)*, NASA Goddard, Community Coordinated Modeling Center (CCMC) |
| Enlace | <https://ccmc.gsfc.nasa.gov/tools/DONKI/> |
| En los recursos del reto | **Sí** (ver [NASA-SPACE-APPS-2026.md](NASA-SPACE-APPS-2026.md)) |
| Producto | Registros de eventos de partículas energéticas solares (SEP) y fulguraciones (FLR) |
| Consulta reproducible | `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/SEP?startDate=2017-09-10&endDate=2017-09-10` devuelve 3 registros. `.../get/FLR?startDate=2017-09-10&endDate=2017-09-10` devuelve 2. Comprobado el 14-nov-2026. El servidor `kauai.ccmc.gsfc.nasa.gov` rechazó la conexión; usar `ccmc.gsfc.nasa.gov`. |
| Campos usados | `sepID`, `eventTime`, `instruments[].displayName`, `link`, `linkedEvents[].activityID`; de la fulguración: `flrID`, `classType`, `beginTime`, `peakTime`, `endTime`, `sourceLocation`, `activeRegionNum`, `link` |
| Unidades | Tiempos en UTC. El instrumento indica el canal de energía de protones: más de 10 MeV o más de 100 MeV. La clase de fulguración usa la escala de rayos X (A, B, C, M, X). |
| Alcance | Catálogo de eventos observados cerca de la Tierra. **No contiene dosis en la superficie lunar ni marciana.** |
| Términos | La página indica que los datos se ofrecen "tal cual", como información experimental de investigación, y que la fuente oficial de pronósticos de EE. UU. es NOAA SWPC. Remite a la política de publicación de CCMC para el reconocimiento. **Por verificar:** texto exacto del reconocimiento. |
| Crédito previsto | "Space weather event records: NASA CCMC DONKI. Archived data, not a live feed." |
| Ruta de destino | `src/data/nasa/donki-sep.json` |
| Pantalla de la demo | Tarjeta de decisión del día 8 en Media ([niveles/luna.md](niveles/luna.md)) |
| Prueba reproducible | D-NASA-01 a D-NASA-03 en [PRUEBAS.md](PRUEBAS.md) |
| Responsable | B |

### Registro principal · `dato NASA`

Leído de la API el 14-nov-2026:

```json
{
  "sepID": "2017-09-10T16:25:00-SEP-001",
  "eventTime": "2017-09-10T16:25Z",
  "instruments": [{ "displayName": "GOES13: SEM/EPS >100 MeV" }],
  "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/13101/-1",
  "linkedEvents": [
    { "activityID": "2017-09-10T15:35:00-FLR-001" },
    { "activityID": "2017-09-10T16:09:00-CME-001" }
  ]
}
```

Fulguración enlazada:

```json
{
  "flrID": "2017-09-10T15:35:00-FLR-001",
  "instruments": [{ "displayName": "GOES15: SEM/XRS 1.0-8.0" }],
  "beginTime": "2017-09-10T15:35Z",
  "peakTime": "2017-09-10T16:06Z",
  "endTime": "2017-09-10T16:31Z",
  "classType": "X8.2",
  "sourceLocation": "S08W88",
  "activeRegionNum": 12673,
  "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/13098/-1"
}
```

El mismo día hay otros dos registros SEP del mismo evento: `2017-09-10T16:45:00-SEP-001` (GOES13: SEM/EPS >10 MeV) y `2017-09-10T20:00:00-SEP-001` (SOHO: COSTEP 15.8-39.8 MeV).

### Registros candidatos para la variación entre partidas · `dato NASA`

Identificadores, instrumentos y enlaces leídos de la API. **Falta leer la fulguración enlazada de cada uno** antes de mostrarlos (tarea [T-P0-B2](agentes/tareas/T-P0-B2-extracto-donki.md)).

| `sepID` | Instrumento | Enlace | Nivel en el juego |
| --- | --- | --- | --- |
| `2021-10-28T16:35:00-SEP-001` | GOES-P: SEISS >100 MeV | <https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/18101/-1> | Severa |
| `2024-05-11T02:10:00-SEP-001` | GOES-P: SEISS >100 MeV | <https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30714/-1> | Severa |
| `2024-05-13T14:00:00-SEP-001` | GOES-P: SEISS >10 MeV | <https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30817/-1> | Moderada |
| `2024-05-10T13:35:00-SEP-001` | GOES-P: SEISS >10 MeV | <https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30677/-1> | Moderada |

### Del registro a la partida

| Qué ve el jugador | De dónde sale | Etiqueta |
| --- | --- | --- |
| "Evento real del 10 de septiembre de 2017" | `eventTime` | `dato NASA` |
| "Fulguración de clase X8.2 en la región activa 12673" | `classType`, `activeRegionNum` | `dato NASA` |
| "Detectado por el satélite GOES-13, protones de más de 100 MeV" | `instruments` | `dato NASA` |
| "Las primeras partículas llegaron 50 minutos después de empezar la fulguración" | 16:25 − 15:35, resta de dos campos | `transformación didáctica` |
| Tormenta **severa** o **moderada** | Regla: canal de más de 100 MeV → nivel 2; solo más de 10 MeV → nivel 1 | `transformación didáctica` |
| Aviso dos días antes y alerta un día antes | Convierte "menos de una hora de margen" en "un turno para prepararse" | `transformación didáctica` |
| Día del juego en que cae la tormenta | Tabla de [dificultad-y-balance](componentes/dificultad-y-balance.md) | `balance` |
| Duración de uno o dos días | Misma tabla | `balance` |
| +50 de exposición sin refugio, +5 con refugio | Misma tabla | `balance` |
| El refugio gasta 6 de energía y el día de trabajo | Misma tabla | `balance` |

Por qué la regla del canal es razonable: los protones de mayor energía atraviesan más material, así que un evento que se registra en el canal alto exige más blindaje. La regla **no** calcula dosis.

La fecha del evento contextualiza el aviso. No fija la intensidad en la base: eso requeriría un modelo de transporte de radiación que el prototipo no tiene.

### Formato del extracto empaquetado

Los campos de la fuente y los del juego van separados:

```json
{
  "source": "NASA CCMC DONKI",
  "sourceUrl": "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
  "endpoint": "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/SEP",
  "retrievedAt": "2026-11-14",
  "notice": "Archived records. Not a live feed.",
  "records": [
    {
      "nasa": {
        "sepID": "2017-09-10T16:25:00-SEP-001",
        "eventTime": "2017-09-10T16:25Z",
        "instrument": "GOES13: SEM/EPS >100 MeV",
        "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/13101/-1",
        "flare": {
          "flrID": "2017-09-10T15:35:00-FLR-001", "classType": "X8.2",
          "beginTime": "2017-09-10T15:35Z", "peakTime": "2017-09-10T16:06Z",
          "sourceLocation": "S08W88", "activeRegionNum": 12673,
          "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/13098/-1"
        }
      },
      "game": { "radiationLevel": 2, "rule": "channel>100MeV=>severe", "leadMinutes": 50 }
    }
  ]
}
```

Contrato del adaptador: [componentes/adaptador-datos-nasa.md](componentes/adaptador-datos-nasa.md).

## 3. Apoyo conceptual

Fuentes NASA que justifican relaciones del modelo. **No están en los recursos del reto**, así que no respaldan la elegibilidad.

### F-02 · ECLSS

| Campo | Valor |
| --- | --- |
| Publicación | *Environmental Control and Life Support Systems (ECLSS)*, NASA. Página actualizada el 4-abr-2025. |
| Enlace | <https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/> |
| `dato NASA` | El sistema de recuperación de agua de la estación recupera y recicla cerca del 90 % del agua. El sistema de generación de oxígeno separa por electrólisis el agua que le entrega el sistema de recuperación. El hidrógeno se ventila o va a un reactor Sabatier, que con CO₂ produce agua y metano. |
| En el juego | El reciclador devuelve parte del agua usada. El generador gasta agua y electricidad para dar oxígeno. |
| Simplificación | La base recupera el 75 %, no el 90 % (`balance`: es un primer prototipo de base, no la estación). No se modelan el CO₂, el hidrógeno ni el reactor Sabatier. La proporción 2 de agua → 6 de oxígeno es `balance`. |
| Pantalla | Tarjetas "Agua que vuelve" y "Aire del agua" |

### F-03 · InSight y el polvo marciano

| Campo | Valor |
| --- | --- |
| Publicación | *NASA's InSight Waits Out Dust Storm*, NASA/JPL, 7-oct-2022 |
| Enlace | <https://www.jpl.nasa.gov/news/nasas-insight-waits-out-dust-storm/> |
| `dato NASA` | La energía del módulo cayó de 425 a 275 vatios-hora por sol. La bruma de polvo aumentó cerca del 40 %. El equipo apagó el sismómetro dos semanas para ahorrar energía. |
| En el juego | Tormenta de polvo regional en Marte: los paneles rinden al **65 %**. |
| Transformación | 275 ÷ 425 = 0,647 → 65 %. `transformación didáctica`. |
| Simplificación | Un caso de un módulo concreto se aplica a una base ficticia. La tormenta global al 20 % es `balance`. |
| Pantalla | Tarjeta "Polvo sobre los paneles", nivel Marte (P1) |

### F-04 · El sol marciano

| Campo | Valor |
| --- | --- |
| Publicación | *Mars24 Sunclock — Technical Notes on Mars Solar Time*, NASA GISS |
| Enlace | <https://www.giss.nasa.gov/tools/mars24/help/notes.html> |
| `dato NASA` | Un día solar marciano dura de media 24 h 39 min 35,244 s y se llama "sol". Es cerca de un 3 % más largo que el día terrestre. |
| En el juego | En Marte el HUD dice "Sol". La tarjeta aclara que un sol del juego es un turno de la misión y no dura lo mismo que un sol real. |

### F-05 · La misma tormenta, vista desde Marte

| Campo | Valor |
| --- | --- |
| Publicación | *Large Solar Storm Sparks Global Aurora and Doubles Radiation Levels on the Martian Surface*, NASA/JPL, 29-sep-2017 |
| Enlace | <https://www.jpl.nasa.gov/news/large-solar-storm-sparks-global-aurora-and-doubles-radiation-levels-on-the-martian-surface/> |
| `dato NASA` | El evento solar del 11-sep-2017 produjo en la superficie de Marte niveles de radiación de más del doble de cualquier medida anterior del detector RAD del rover Curiosity. Las lecturas altas duraron más de dos días. |
| En el juego | En Marte la tormenta solar dura dos soles. La tarjeta cuenta que el evento que el jugador vivió en la Luna también llegó a Marte. |
| Simplificación | "Más del doble" no se convierte en un número de juego. La exposición marciana es `balance`. |

## 4. Fuentes candidatas sin integrar

| ID | Fuente | En recursos | Idea de uso | Qué falta |
| --- | --- | --- | --- | --- |
| F-06 | [RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/), dosimetría de la ISS. API en `https://visualization.osdr.nasa.gov/radlab/api`. Tasa de dosis absorbida en μGy/hora. | Sí | Tarjeta con una lectura real de la estación para dar escala | Elegir instrumento y fecha, leer condiciones de uso |
| F-07 | [OSDR](https://osdr.nasa.gov/bio/repo/) | Sí | Tarjeta sobre plantas o salud en el espacio | Elegir un estudio concreto |
| F-08 | [Mars Trek](https://trek.nasa.gov/mars/) | Sí | Inspirar el relieve del mapa marciano | Elegir sitio y producto |
| F-09 | [NASA Open APIs](https://api.nasa.gov/) | Sí | Ampliación: consulta en vivo de DONKI con clave | Queda fuera del prototipo |
| F-10 | [BVAD](https://ntrs.nasa.gov/citations/20210024855), valores de referencia de soporte vital | No | Sustituir consumos abstractos por valores reales | **No consultada.** No citar cifras hasta leerla |
| F-11 | CSA, [Food production on the moon and in remote areas](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) | Sí, agencia socia | Tarjeta del invernadero | Leer y resumir |
| F-12 | Retraso de comunicaciones | — | Tarjeta: una señal tarda cerca de 1,3 s entre la Tierra y la Luna y entre 3 y 22 minutos hasta Marte | El cálculo es distancia ÷ velocidad de la luz (`transformación didáctica`). **Por verificar** con una página de NASA antes de publicar las cifras |

## 5. Modelo científico del juego

| Relación del modelo | Base real | Etiqueta |
| --- | --- | --- |
| Sin luz no hay electricidad; las baterías guardan el exceso | Funcionamiento de un sistema solar con almacenamiento | `transformación didáctica` |
| El oxígeno sale del agua con electricidad | ECLSS (F-02) | `transformación didáctica` |
| Parte del agua usada se recupera | ECLSS (F-02) | `transformación didáctica` |
| El hielo del suelo lunar es una fuente de agua | Motivo conocido para explorar el polo sur lunar. **Por verificar** con una fuente NASA antes de citarla en una tarjeta | `transformación didáctica` |
| Las plantas necesitan agua, luz y tiempo; el descuido reduce la cosecha | Agricultura en ambiente controlado | `transformación didáctica` |
| Un refugio reduce la exposición durante una tormenta solar | Práctica de protección en misiones | `transformación didáctica` |
| La exposición se acumula y no baja | La dosis es acumulativa | `transformación didáctica` |
| Todos los números | — | `balance` |
| Un día de juego = un turno de la misión | — | `balance` |
| Crisis terrestre, Last Hope, viaje temporal, indicadores de la Tierra del pasado | — | `ficción` |

## 6. Diseño educativo

**Qué debe poder decir un jugador de 7 a 12 años al terminar:**

1. "En el espacio todo se gasta: la luz, el agua, el aire y la comida dependen unos de otros."
2. "Si viene una tormenta solar hay que protegerse, aunque cueste energía y tiempo."
3. "Los científicos avisan de las tormentas con datos reales del Sol."

**Cómo se enseña:**

- Un sistema nuevo por día en el tutorial. Nunca dos a la vez.
- Tres medidores en el HUD: energía, soporte vital y protección. El detalle se abre al tocar.
- Cada decisión muestra su costo antes de confirmarla.
- El informe del día explica causa y efecto con una frase: "El invernadero no tuvo electricidad, así que la cosecha se retrasa un día".
- Los términos se explican donde aparecen: sol, radiación, electrólisis, MeV.

**Tarjetas científicas.** Textos y fuentes en [componentes/tutorial-y-tarjetas-cientificas.md](componentes/tutorial-y-tarjetas-cientificas.md). Cada tarjeta muestra su etiqueta y, si es `dato NASA`, su enlace.

**Comprobación del aprendizaje.** Una pregunta antes y la misma después de la misión, sin datos personales. Diseño en [componentes/comprobacion-de-aprendizaje.md](componentes/comprobacion-de-aprendizaje.md). Se informan resultados solo si existen, con tamaño de muestra y límites.

## 7. Ejemplos de turnos

- Día completo con cifras: [componentes/ciclo-de-dias.md](componentes/ciclo-de-dias.md#ejemplo-numérico-de-un-día-completo).
- Dos decisiones ante la misma tormenta: misma ficha, sección siguiente.
- Efecto de quitarle energía al invernadero: variante del recorrido de Media en [niveles/luna.md](niveles/luna.md).

## 8. Límites de la simulación

- No calcula dosis reales ni riesgo para la salud. La exposición es una barra de juego.
- No modela CO₂, presión, temperatura ni ciclos de día y noche lunares reales.
- Una unidad de recurso por tripulante y día es una abstracción. No equivale a kilogramos ni litros.
- La energía se cuenta en unidades almacenables por día. No distingue potencia de energía porque no hay consumo instantáneo. Si en el futuro se usan unidades físicas, la energía irá en kWh y la potencia en kW.
- El registro DONKI describe un evento cerca de la Tierra. El juego no afirma qué habría pasado en una base lunar ese día.
- El viaje temporal es ficción. Los indicadores de la Tierra del epílogo son simplificaciones de juego y así se rotulan en pantalla.
- Los valores de Marte y de la Tierra no se han validado por simulación.

## 9. Datos sintéticos

Mientras se desarrolla, `src/core/fixtures.ts` puede usar eventos inventados. Deben llevar `sourceRef: "SYNTHETIC"` y la interfaz los muestra con la etiqueta "Datos de prueba". La prueba D-NASA-02 falla si la compilación de producción contiene un evento sintético. El extracto real de la sección 2 ya está identificado, así que la integración real solo depende de la tarea T-P0-B2.
