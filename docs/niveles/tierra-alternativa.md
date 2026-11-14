# Final alternativo · Tierra, Proyecto Segunda Oportunidad

| Campo | Valor |
| --- | --- |
| Estado de implementación | **Integrado.** Validado con recorridos en las tres dificultades. |
| Prioridad | P2 |
| Responsable · revisor | B · A |
| Tareas | [P2-segunda-oportunidad.md](../agentes/tareas/P2-segunda-oportunidad.md) |
| Contrato del sistema | [componentes/mision-terrestre.md](../componentes/mision-terrestre.md) |

> **Ficción y simplificación.** El viaje temporal es parte de la historia. Los indicadores terrestres son simplificaciones de juego, de 0 a 100, y no representan mediciones reales. La pantalla lo dice siempre.

## Premisa

Tras ganar en Marte con las dos balizas, la tripulación cruza el agujero de gusano y llega a la Tierra del pasado, antes del punto crítico. No trae máquinas milagrosas: trae lo que aprendió manteniendo viva una base donde nada se desperdicia.

## Formato

No hay tablero de casillas. Es una pantalla de gestión por turnos.

| Elemento | Valor de balance inicial |
| --- | --- |
| Turno | Una temporada |
| Plazo propio | 8 temporadas |
| Presupuesto | 10 puntos de proyecto por temporada. Se conservan hasta 2 sin gastar. |
| Líneas de acción | 4, cada una con niveles de 0 a 5 |
| Indicadores | 3, de 0 a 100 |

## Líneas de acción

| Línea | Costo por nivel | Efecto por temporada y nivel | Aprendido en |
| --- | --- | --- | --- |
| **Energía limpia** | 3 | +3 de emisiones evitadas | Paneles y baterías |
| **Uso eficiente del agua** | 2 | +2 de agua disponible | Reciclador |
| **Reciclaje** | 2 | +1 de agua y +1 de emisiones evitadas | Ciclo cerrado de la base |
| **Restauración de ecosistemas** | 4 | +3 de ecosistemas recuperados | Invernadero |

### Combinaciones

Las acciones se refuerzan. Es la idea de ciclo cerrado.

| Condición | Efecto extra |
| --- | --- |
| Reciclaje en nivel 2 o más | Uso eficiente del agua da +1 más por nivel |
| Energía limpia en nivel 3 o más | Restauración cuesta 3 en lugar de 4 |
| Agua disponible por debajo de 20 | Restauración rinde la mitad: las plantas necesitan agua |

## Indicadores y metas

| Indicador | Inicio | Deriva por temporada | Meta al cerrar la temporada 8 |
| --- | --- | --- | --- |
| Agua disponible | 30 | −2 | 60 o más |
| Emisiones evitadas | 0 | 0 | 60 o más |
| Ecosistemas recuperados | 10 | −1 | 50 o más |

La deriva representa que, sin hacer nada, la situación empeora.

| Dificultad | Presupuesto | Metas |
| --- | --- | --- |
| Fácil | 12 | 50 · 50 · 40 |
| Media | 10 | 60 · 60 · 50 |
| Imposible | 9 | 70 · 70 · 60 |

## Orden de una temporada

1. El jugador invierte.
2. Al cerrar: efectos de cada línea → combinaciones → deriva → recorte a 0..100 → evaluación.
3. Informe: qué subió, qué bajó y por qué.

## Avances y fallos

- **Avance visible:** cada 20 puntos de un indicador, la ilustración de fondo cambia: ríos con más caudal, cielo más limpio, bosque más denso.
- **Éxito:** las tres metas al cerrar la última temporada.
- **Fallo por plazo:** termina la temporada 8 sin alguna meta.
- **Fallo por agua:** el agua disponible llega a 0.

Tras un fallo el jugador elige: **reintentar la misión terrestre** o **aceptar el final de Marte**. Aceptar aplica `tierra->marte` y reproduce la victoria ordinaria con una línea más: "Volvimos a Marte. La Tierra sigue necesitando ayuda."

## Final

Con éxito se reproduce la cinemática de recuperación: soluciones sostenibles en marcha, ecosistemas que vuelven poco a poco y una civilización que prospera. Mensaje final:

> El futuro comienza aprendiendo a cuidar nuestro hogar. Todavía estamos a tiempo de proteger la Tierra.

## Ejemplo de primera temporada

Media, presupuesto 10. El jugador sube Reciclaje a nivel 2 (4 puntos) y Uso eficiente del agua a nivel 2 (4 puntos). Sobran 2, que se conservan.

| Indicador | Cálculo | Resultado |
| --- | --- | --- |
| Agua | 30 + (2 × 2) + (2 × 1 extra por reciclaje) + (2 × 1 de reciclaje) − 2 | 36 |
| Emisiones | 0 + (2 × 1) | 2 |
| Ecosistemas | 10 − 1 | 9 |

La prueba de Tierra cubre este efecto y el arrastre de presupuesto.


## Rutas verificadas

[Pruebas de sostenibilidad](../../tests/core/earth.test.ts) incluye victorias en las tres dificultades, derrota por plazo e indicador de agua agotado. Con los valores normales, la inacción termina con 14 de agua y derrota por plazo en la temporada 8. La derrota inmediata por agua se prueba con una reserva de agua inicial de prueba más baja.

[Prueba de campaña](../../tests/core/campaign.test.ts) comienza en la Luna, encuentra ambas balizas, abre el portal y prueba el regreso a la victoria de Marte. En Edge se jugaron las ocho temporadas de la ruta alternativa, con 100 de agua, 100 de emisiones evitadas y 71 de ecosistemas recuperados en Media.
