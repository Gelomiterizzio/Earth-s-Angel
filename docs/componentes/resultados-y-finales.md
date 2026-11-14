# Resultados y finales

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-10 |
| Prioridad · fase | P0 (informe del día, victoria y derrota lunar) · P1 y P2 (finales) |
| Objetivo | Explicar qué pasó y por qué, cada día y al terminar, de forma que el jugador aprenda algo y quiera reintentar. |
| Responsabilidad | Textos de causa, principio y sugerencia: claves `sim.*` del núcleo (A). Pantallas: `src/ui/panels/day-report.ts`, `src/ui/screens/result.ts` (C) |
| Depende de | [ciclo-de-dias](ciclo-de-dias.md) (`DayReport`), [objetivos](objetivos.md), [progresion](progresion.md), [comprobacion-de-aprendizaje](comprobacion-de-aprendizaje.md) |
| No incluye | Cinemáticas de final. |
| Responsable · revisor | C (pantallas) y A (claves) · B |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

El núcleo decide **qué** decir y devuelve claves. La interfaz decide **cómo** mostrarlo. La interfaz no deduce causas por su cuenta.

### Informe del día

Se muestra con `phase === 'report'`. Contenido, de arriba abajo:

1. "Día N" y eventos activos.
2. **Causa y efecto:** una frase por cada clave de `DayReport.causeEffectKeys`. Es lo primero que se lee.
3. Tres bloques: energía, soporte vital y protección, con inicio, cambio y final.
4. Racha y objetivos que cambiaron.
5. Botón **Continuar** → `ACK_REPORT`.

### Claves de causa y efecto

| Clave `sim.cause.*` | Se añade cuando | Ejemplo |
| --- | --- | --- |
| `lowLight` | Factor solar < 100 | "Poca luz: los paneles rindieron al 25 %." |
| `unpowered` | Un módulo no tuvo electricidad | "El invernadero no tuvo electricidad." |
| `noWaterForModule` | Generador o invernadero sin agua | "El generador no tuvo agua." |
| `greenhouseStress` | El invernadero sumó estrés | "La cosecha se retrasa un día y será menor." |
| `harvest` | Hubo cosecha | "Cosecha: 24 raciones." |
| `energyWasted` | Sobró energía | "Sobraron 6 de energía. Una batería los habría guardado." |
| `shortage.oxigeno`, `.agua`, `.alimentos` | Faltó una ración | "Faltó oxígeno para 4 tripulantes." |
| `sheltered` | Radiación con refugio | "Con refugio: +5 de exposición. Sin él habrían sido +50." |
| `unsheltered` | Radiación sin refugio | "Sin refugio: +50 de exposición. Con él habrían sido +5." |
| `observation` | Alguien pasa a observación | "La tripulación está en observación: rinde la mitad." |
| `streakUp` | La racha sube | "Día estable. Racha: 2 de 3." |
| `streakReset.reservas`, `.energia`, `.proteccion`, `.soporte`, `.escasez` | La racha vuelve a 0 | "La racha se cortó: los alimentos bajaron de 16." |
| `objectiveMet.<id>` | Un objetivo se cumple por primera vez | "Objetivo cumplido: soporte vital." |

Máximo cinco frases por informe. Prioridad: faltas → radiación → racha cortada → módulos sin electricidad → resto.

### Resultado de la misión

`MissionResult` trae causa, cifras, `principleKey` y `suggestionKey`.

| Causa | Principio | Sugerencia |
| --- | --- | --- |
| `soporte-vital`, faltó oxígeno | "El aire va primero. Sin oxígeno nada más importa." | "Construye el generador antes del día 4 y dale agua." |
| `soporte-vital`, faltó agua | "El agua se gasta en todo: beber, respirar y cultivar." | "Explora al sureste el primer día y pon un extractor sobre el hielo." |
| `soporte-vital`, faltaron alimentos | "Las plantas tardan. Hay que sembrar antes de tener hambre." | "Construye el invernadero en los tres primeros días y no lo apagues." |
| `exposicion` | "La radiación se acumula y no baja." | "Coloca el refugio dos días antes de la tormenta y guarda energía para usarlo." |
| `plazo`, faltó `proteccion` | "El blindaje no se improvisa." | "Reserva 14 materiales para el refugio antes de ampliar la base." |
| `plazo`, faltó `racha` o `reservas` | "Una base estable tiene margen todos los días." | "Mantén las reservas por encima del umbral varios días seguidos." |
| `plazo`, otro | "El tiempo también es un recurso." | "Usa todos tus puntos de acción los primeros días." |
| `escasez` (P1) | "Los materiales no vuelven." | "Recolecta minerales antes de quedarte sin materiales." |

**Victoria:** principio "Una base estable equilibra energía, agua, aire, comida y protección", más una frase según la partida: exposición máxima baja o alta, días sobrantes.

### Pantalla de resultado

| Bloque | Victoria | Derrota |
| --- | --- | --- |
| Titular | "Base lunar operativa" | "Misión interrumpida: la tripulación fue evacuada" |
| Cifras | Días usados, plazo restante, reservas y márgenes, exposición máxima, incidentes | Día del fallo, causa, recursos implicados |
| Aprendizaje | Principio | Principio y **sugerencia** |
| Datos | Semilla y dificultad | Semilla y dificultad |
| Botones | Jugar otra vez · Créditos · Título | **Reintentar misión** · Título |

Tono de la derrota: nadie muere, se puede volver a intentar, y el juego dice qué probar distinto.

### Finales

| Final | Cuándo | Cierre | Fase |
| --- | --- | --- | --- |
| Victoria lunar | Seis objetivos en la Luna | Informe de misión y "Marte: próximamente" | P0 |
| Victoria ordinaria | Objetivos de Marte | Colonia funcional y recordatorio de cuidar la Tierra | P1 |
| Victoria terrestre | Éxito del epílogo | "El futuro comienza aprendiendo a cuidar nuestro hogar. Todavía estamos a tiempo de proteger la Tierra." | P2 |

## 3. Datos y uso

- Las frases de ejemplo se guardan en `sim.json` en inglés y español, con parámetros.
- Las cifras de la sugerencia (día 4, 14 materiales) salen de `GameData`, no del texto.
- La pregunta final de aprendizaje aparece antes de los botones si la opción está activa.
- El resultado se puede copiar como texto para compartir la semilla.

### Casos límite

- Derrota el día 1: imposible con las reservas iniciales; si ocurriera por datos rotos, el resultado muestra la causa sin sugerencia.
- Varias faltas a la vez: la sugerencia sigue a la de mayor prioridad: oxígeno, agua, alimentos.
- Informe con más de cinco causas: se muestran cinco y un "ver todo".

## 4. Implementación delegable

**Tareas:** [T-P0-A4](../agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md) (claves) y [T-P0-C3](../agentes/tareas/T-P0-C3-informe-resultados-creditos.md) (pantallas).

**Prompt breve:**

```text
Núcleo: rellena causeEffectKeys, principleKey y suggestionKey según las tablas de
docs/componentes/resultados-y-finales.md. Interfaz: day-report.ts y result.ts muestran esas
claves traducidas, con causa y efecto arriba y la sugerencia destacada en la derrota.
```

**Pruebas:** U-RES-01 a U-RES-05, M-INF-01 a M-INF-04 y M-RES-01 a M-RES-04 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** cada causa de derrota produce su principio y su sugerencia; el informe del día de sombra incluye `lowLight`; el de la tormenta incluye `sheltered` o `unsheltered` con las dos cifras.

**Evidencia:** capturas de un informe, una victoria y dos derrotas distintas.

**Terminado cuando:** un jugador que pierde sabe qué cambiar en el siguiente intento.

**Riesgos:** informes largos que nadie lee. Mitigación: cinco frases como máximo y lo importante arriba.
