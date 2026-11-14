# Pitch para la defensa local

Defensa de proyectos: **domingo 15-nov a las 14:00**, sede de Santa Cruz de la Sierra.

**Por confirmar con la organización:** duración, idioma, si hay preguntas, si se puede jugar en vivo y si hay proyector. Este guion supone **3 minutos en español más preguntas**. Si el tiempo es menor, se usan las versiones cortas del final.

> Guion escrito antes de programar. Se dice solo lo que el juego haga de verdad el domingo.

## Reparto

| Parte | Quién | Tiempo |
| --- | --- | --- |
| Problema y enfoque | C | 0:40 |
| Demo en vivo: el día de la tormenta | B, con A manejando el juego | 1:20 |
| Datos, tecnología y límites | A | 0:40 |
| Cierre | C | 0:20 |

## Guion · 3 minutos

### 1. El problema · 0:00 a 0:40 · C

> "A los niños les enseñamos el espacio con cohetes y datos curiosos. Pero una misión de verdad no es un dato: es una cadena de decisiones donde todo cuesta algo.
>
> El reto que elegimos pide un entrenador de misiones para astronautas júnior, de 7 a 12 años.
>
> Nuestro juego se llama **Earth's Angel**. Diriges una base en la Luna. Tienes poca energía, poca agua, poco aire y poco tiempo. Y nada es gratis."

### 2. La demo · 0:40 a 2:00 · B y A

Juego abierto con `?seed=demo`, Media, en el **día 7**, con una partida de respaldo en otra pestaña.

> "Esta es la base. Arriba, tres medidores: energía, soporte vital y protección. No cinco ni seis: tres, para que un niño no se pierda."

A pulsa **Finalizar día**. Aparece la tarjeta de decisión.

> "Día 8. Llega una tormenta solar. Y este evento **no lo inventamos**: es un registro real de la base de datos DONKI de NASA. Diez de septiembre de 2017, una fulguración de clase X8.2. Aquí está el identificador y aquí el enlace.
>
> El jugador tiene que decidir. Si refugia a la tripulación, gasta energía y pierde el día de trabajo. Si sigue trabajando, avanza hoy, pero la tripulación recibe radiación.
>
> Elegimos refugiar."

A elige. Aparece el informe.

> "El juego explica qué pasó en una frase: con refugio, cinco de exposición; sin él habrían sido cincuenta.
>
> Si refugias, terminas la misión el día 9. Si trabajas, la tripulación queda en observación, rinde la mitad y terminas el día 11. La misma tormenta, dos decisiones, dos resultados que se pueden medir."

### 3. Datos, tecnología y límites · 2:00 a 2:40 · A

> "Somos claros con lo que es real y lo que no. La fecha, la fulguración y el instrumento son datos de NASA. La regla que convierte ese registro en una tormenta 'severa' es nuestra, para enseñar. Y los números de exposición son valores del juego: no calculamos dosis reales, y el juego lo dice.
>
> Funciona en el navegador, sin instalar nada y sin cuenta. Está en inglés y en español. Se puede jugar entero con el teclado.
>
> La simulación es determinista: con la misma semilla, la misma misión. Eso nos deja probarla con pruebas automáticas.
>
> Usamos inteligencia artificial como herramienta, y está declarado en los créditos: qué herramienta, para qué, y quién lo revisó."

### 4. Cierre · 2:40 a 3:00 · C

> "Hoy entregamos la Luna. Marte y un final secreto en la Tierra están diseñados y documentados en el repositorio.
>
> Porque al final el juego no va de irse. Va de lo que se aprende para volver:
>
> **El futuro comienza aprendiendo a cuidar nuestro hogar. Todavía estamos a tiempo de proteger la Tierra.**"

## Versión de 1 minuto

> "Earth's Angel es un juego de navegador para niños de 7 a 12 años. Diriges una base lunar donde energía, agua, aire, comida y protección compiten por lo mismo.
>
> El momento clave es una tormenta solar que sale de un registro real de NASA DONKI. Refugias a la tripulación y pierdes energía y un día, o sigues trabajando y pagas con su salud. Las dos opciones cuestan, y el juego te explica el resultado en una frase.
>
> Sin instalación, sin cuenta, en inglés y español. Hoy la Luna; Marte y un final en la Tierra ya están diseñados."

## Versión de 30 segundos · en inglés

> "Earth's Angel is a browser game for kids ages 7 to 12. You run a Moon base where power, water, air, food and shielding compete for the same resources. A solar storm, taken from a real NASA DONKI record, forces a choice: shelter the crew and lose power and a day, or keep working and pay with their health. No safe option. Every result is explained in one sentence. Free, no download, English and Spanish."

## Preguntas probables

| Pregunta | Respuesta honesta |
| --- | --- |
| ¿Los datos son en vivo? | No. Son registros archivados de DONKI, empaquetados con el juego. El juego lo dice. Una consulta en vivo queda como ampliación. |
| ¿La radiación del juego es real? | No. La fecha y la clase del evento son reales. La exposición es una barra de juego de 0 a 100. No calculamos dosis. |
| ¿Por qué ese evento? | Es un registro real con canal de más de 100 MeV y fulguración enlazada. Además se midió también en Marte, lo que enlaza con el siguiente nivel. |
| ¿Lo han probado con niños? | `[Responder con lo que haya ocurrido. Si no se probó: "Todavía no. El juego incluye una pregunta antes y después de la misión para medirlo sin recoger datos personales."]` |
| ¿Qué hizo la IA y qué hicieron ustedes? | La idea, la historia y las mecánicas son nuestras. La IA nos ayudó a documentar, a programar y `[lo que corresponda]`. Todo está registrado y revisado por nosotros. |
| ¿Qué falta? | Marte y el epílogo terrestre están diseñados, no programados. `[Añadir lo que falte de P0.]` |
| ¿Es accesible? | Se juega con teclado, los estados se muestran con icono y texto además del color, hay subtítulos y opción de movimiento reducido. `[Confirmar lo que esté hecho.]` |
| ¿Qué licencia tiene? | `[La que haya elegido el equipo.]` |
| ¿Cómo se usaría en un aula? | Una laptop, quince minutos por partida, sin instalar nada. Tres niveles de dificultad. |

## Preparación

- [ ] Preguntar a la organización el tiempo y el formato exactos.
- [ ] Dos laptops con el juego abierto y una copia local servida con `npm run preview`, por si falla la red.
- [ ] Partida de respaldo en el día 7 en una segunda pestaña.
- [ ] Ensayar dos veces con cronómetro.
- [ ] Decidir quién responde cada tipo de pregunta.
- [ ] No prometer nada que el juego no haga.
