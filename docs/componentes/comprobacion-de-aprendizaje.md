# Comprobación de aprendizaje

Ficha adicional al inventario base.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-32 |
| Prioridad · fase | P0 · H4. Es lo tercero que se recorta si falta tiempo. |
| Objetivo | Saber si jugar cambia lo que el jugador haría ante una tormenta solar, sin pedir ningún dato personal. |
| Responsabilidad | `src/ui/panels/learning-check.ts`, clave `ea.learning.v1` |
| Depende de | [resultados-y-finales](resultados-y-finales.md), [persistencia](persistencia.md), [menu-opciones](menu-opciones.md) |
| No incluye | Estudios formales, encuestas, cuentas, analítica en línea. |
| Responsable · revisor | C · B |
| Estado | Propuesto. **No hay resultados.** |

## 2. Arquitectura y funcionamiento

Una sola pregunta de tres opciones, **antes** de la misión y **la misma** al terminar.

> Mañana llega una tormenta solar a tu base lunar. ¿Qué es lo mejor que puedes hacer primero?
>
> A. Seguir construyendo para terminar antes.
> B. Tener listo el refugio y guardar energía para usarlo.
> C. Apagar todas las máquinas para ahorrar energía.

La respuesta que el juego enseña es la B. No se dice si la primera respuesta es correcta, para no condicionar la segunda. Tras la segunda se muestra una frase: "En tu misión viste que el refugio protege, y que usarlo tiene un costo."

### Flujo

1. Tras la apertura y antes del día 1 aparece la pregunta. Botón **Omitir** siempre visible.
2. La respuesta se guarda en memoria de la sesión.
3. En la pantalla de resultado aparece de nuevo.
4. Al responder la segunda, se actualizan los contadores.

### Qué se guarda

```ts
// localStorage 'ea.learning.v1'
interface LearningTotals {
  version: 1;
  sessions: number;                              // sesiones con las dos respuestas
  pre:  { A: number; B: number; C: number };
  post: { A: number; B: number; C: number };
  changedToB: number;                            // respondieron A o C antes y B después
}
```

Solo recuentos. **Ningún nombre, edad, identificador, fecha ni respuesta individual.** No sale nada del dispositivo.

### Dónde se ven los totales

En Créditos, sección "Learning check on this device": tabla de recuentos, botón para copiar como texto y botón para borrar. Pensado para una feria o un aula con un solo equipo.

## 3. Datos y uso

### Registro manual alternativo

Si se prueba con visitantes en la sede, una hoja de palotes sirve igual:

| | Antes: A | Antes: B | Antes: C | Después: A | Después: B | Después: C |
| --- | --- | --- | --- | --- | --- | --- |
| Recuento | | | | | | |

Sin nombres. Sin fotos.

### Cómo informar resultados

- Solo si existen. Mientras no los haya, la entrega dice: "A built-in pre/post question is ready; no results collected yet."
- Siempre con el tamaño de la muestra: "n = 9 sessions on one laptop".
- Con sus límites: mismo dispositivo, participantes no seleccionados al azar, una sola pregunta, sin grupo de control. No es un estudio.
- Nunca porcentajes con menos de 10 sesiones: se dan los recuentos.

### Restricciones del evento

Los términos prohíben incluir nombres, voces o imágenes reconocibles de menores de 18 años y datos personales. Por eso: no se graba ni fotografía a quien prueba el juego, y el video de demostración no muestra jugadores.

### Casos límite

- Omitir la primera pregunta: no se muestra la segunda y no se cuenta la sesión.
- Abandonar la misión: no se cuenta.
- Opción desactivada: no aparece ninguna de las dos.
- `localStorage` bloqueado: la pregunta funciona y los totales no se guardan.

## 4. Implementación delegable

**Tarea:** [T-P0-C4](../agentes/tareas/T-P0-C4-cinematica-y-tutorial.md).

**Prompt breve:**

```text
Implementa src/ui/panels/learning-check.ts según
docs/componentes/comprobacion-de-aprendizaje.md: la misma pregunta antes y después, botón
Omitir, y solo recuentos agregados en ea.learning.v1. No guardes fechas, identificadores ni
respuestas individuales.
```

**Pruebas:** M-APR-01 a M-APR-03 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** lo guardado contiene solo los campos del tipo; omitir no cuenta la sesión; los totales se ven y se borran desde Créditos.

**Evidencia:** captura de la pregunta y del contenido de `ea.learning.v1`.

**Terminado cuando:** B confirma que la pregunta se entiende y no asusta.

**Riesgos:** presentar unos pocos recuentos como prueba de impacto. Mitigación: las reglas de "cómo informar resultados" se copian tal cual a [ENTREGA.md](../ENTREGA.md).
