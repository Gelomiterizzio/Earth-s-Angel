# Riesgos y límites

Riesgos del proyecto con su mitigación y su responsable. Se revisa en cada punto de control de [PLAN-EQUIPO.md](PLAN-EQUIPO.md).

Probabilidad e impacto: alta, media o baja, según el juicio del equipo. No son mediciones.

## 1. Tiempo

| Riesgo | Prob. | Impacto | Señal de alerta | Mitigación | Resp. |
| --- | --- | --- | --- | --- | --- |
| Quedan unas 24 horas hasta el envío en la sede | Alta | Alto | Hito H2 sin cerrar a las 17:30 del sábado | Compromiso solo con P0. Tabla de cortes aplicada en cada hito | A |
| El andamiaje se retrasa y bloquea a B y C | Media | Alto | A1 sin fusionar a las 13:30 | B y C empiezan por tareas sin dependencias. A sube el andamiaje mínimo cuanto antes | A |
| C tiene la carga mayor | Alta | Medio | C2 sin terminar a las 19:00 | Orden de recorte de C definido: música, viñetas, pregunta de aprendizaje, sprites, español | C |
| Charlas y feria de la sede restan horas el sábado por la tarde | Media | Medio | — | El plan supone que dos personas siguen trabajando | Todos |
| No se puede trabajar en la sede después de las 20:00 | Media | Medio | Aviso de la organización | Preguntarlo el sábado. H3 se puede cerrar a distancia | C |
| P1 y P2 tientan antes de cerrar P0 | Media | Alto | Alguien empieza Marte el sábado | P1 solo con H4 cerrado. Marte y Tierra quedan documentados | A |

## 2. Balance y diseño

| Riesgo | Prob. | Impacto | Señal de alerta | Mitigación | Resp. |
| --- | --- | --- | --- | --- | --- |
| El núcleo no reproduce los vectores del modelo de referencia | Media | Alto | Falla la prueba del día 8 | El orden del día está documentado paso a paso. Las diferencias se informan con el cálculo, no se "arreglan" cambiando el esperado | A, B |
| Demasiados sistemas para niños de 7 a 12 años | Media | Alto | Quien prueba no sabe qué hacer el día 1 | Tres medidores, tutorial de un sistema por paso, dificultad Fácil | C, B |
| Una opción resulta "gratis" | Baja | Medio | Una estrategia gana sin pagar nada | Tabla de dos decisiones probada: cada rama tiene costo | B |
| Imposible no es ganable fuera del recorrido documentado | Media | Bajo | Nadie más lo gana | Hay un recorrido reproducible. Si H4 no lo verifica, se rotula "experimental" | B |
| Cambiar un número al final rompe los recorridos | Media | Alto | Ajustes después de H3 | Balance congelado en H3. Todo cambio vuelve a pasar las pruebas | B |
| Valores de Marte y Tierra sin validar | Alta | Bajo para la entrega | — | Rotulados "sin validar". No se publican como ganables | B |

## 3. Fuentes y ciencia

| Riesgo | Prob. | Impacto | Señal de alerta | Mitigación | Resp. |
| --- | --- | --- | --- | --- | --- |
| El dato NASA parece un adorno | Media | Alto | La tormenta funcionaría igual sin el registro | El registro fija el nivel de la tormenta, aparece en la decisión y quitarlo impide arrancar | B |
| Presentar un valor de balance como dato real | Media | Alto | Una tarjeta dice "la radiación fue de 50" | Cuatro etiquetas obligatorias. Dato real y valores del juego en bloques separados | B |
| Presentar el dato archivado como en vivo | Baja | Alto | — | Frase fija: "Archived data, not a live feed" | B |
| La API de DONKI no responde durante el evento | Media | Bajo | Error al consultar | El registro principal ya está copiado en la documentación. El juego no llama a la API | B |
| Afirmaciones sin fuente: hielo lunar, retraso de señales, BVAD | Media | Medio | Tarjeta con cifra sin enlace | Marcadas "por verificar". No se muestran como dato NASA hasta abrir la fuente | B |
| Condiciones de uso de DONKI incompletas | Media | Medio | — | Crédito visible ya definido. Falta leer la política de publicación de CCMC | B |
| Indicadores de la Tierra leídos como ciencia climática | Baja | Medio | — | Rótulos fijos de ficción y simplificación | B |

## 4. Compatibilidad técnica

| Riesgo | Prob. | Impacto | Señal de alerta | Mitigación | Resp. |
| --- | --- | --- | --- | --- | --- |
| Las versiones propuestas no funcionan juntas | Media | Alto | `npm run build` falla en A1 | Respaldos definidos: TypeScript 6.0.3 o 5.9.3. Se comprueba en la primera hora | A |
| Phaser da problemas con el escalado o con el tiempo | Media | Medio | El tablero no dibuja a las 16:30 | `MapView` aísla a Phaser. Plan B: cuadrícula de botones HTML | B |
| Diferencias entre Chrome, Firefox y Edge | Media | Medio | Algo solo falla en uno | Sin API experimentales. Prueba en los tres en H4 | Todos |
| El navegador bloquea el audio | Alta | Bajo | Silencio al cargar | Desbloqueo en la primera interacción. El juego funciona en silencio | C |
| `localStorage` bloqueado | Baja | Bajo | — | Opciones en memoria. Sin fallo | A |
| Pantallas pequeñas o táctiles | Media | Bajo | — | Fuera de P0. Aviso en pantallas estrechas | C |
| Rutas locales con espacios o apóstrofos | Media | Medio | Errores raros al instalar | Clonar en una ruta simple | Todos |

## 5. Integración

| Riesgo | Prob. | Impacto | Señal de alerta | Mitigación | Resp. |
| --- | --- | --- | --- | --- | --- |
| Conflictos al fusionar | Media | Medio | Conflicto en un archivo compartido | Cada carpeta tiene un dueño. Catálogos de cadenas partidos por dueño | A |
| Cambio de contrato sin avisar | Media | Alto | A B o C les deja de compilar | Solo A cambia contratos, en `main`, con aviso | A |
| Un agente de IA toca archivos ajenos | Media | Medio | Cambios fuera de las rutas permitidas | Rutas permitidas y excluidas en cada ficha. El revisor lo comprueba | Todos |
| Un agente informa "hecho" sin probar | Media | Alto | Informe sin salida de pruebas | El informe separa implementado, probado y pendiente. La persona ejecuta las pruebas | Todos |
| `main` roto | Media | Alto | La compilación falla tras una fusión | Fusión solo con pruebas y compilación en verde. Etiquetas por hito para volver atrás | A |
| Miembros del equipo sin experiencia en Git | Media | Medio | Dudas al subir | Comandos paso a paso en cada paquete de trabajo. Preguntar antes de improvisar | A |

## 6. Entrega y reglas del evento

| Riesgo | Prob. | Impacto | Señal de alerta | Mitigación | Resp. |
| --- | --- | --- | --- | --- | --- |
| El límite real de la sede es las 12:00 y no las 23:59 | Alta | Alto | Agenda oficial | Envío interno a las 11:30. Confirmarlo el sábado | C |
| La demo supera 30 segundos o 7 diapositivas | Baja | Alto: fuera de la evaluación global | Cronómetro | Medir el archivo final antes de subirlo | C |
| Un enlace pide inicio de sesión | Media | Alto | — | Probar en ventana privada y en un teléfono | C, A |
| Materiales enlazados que no están en inglés | Media | Alto | — | Juego en inglés por defecto. README en inglés. La documentación interna está en español: el README lo explica. **Por confirmar** con la sede si eso basta | C |
| La pestaña Project tiene campos distintos de los previstos | Baja | Medio | — | Abrirla el sábado y comparar | C |
| Algún integrante no está confirmado en la sede | Baja | Alto: no elegible | No aparece en Members | Comprobarlo el sábado. No se pueden añadir miembros después | C |
| Falla la red durante la defensa | Media | Medio | — | Copia local servida con `npm run preview` y partida de respaldo abierta en dos laptops | A |
| Uso de IA mal declarado | Media | Alto | — | Registro en [IA-Y-CREDITOS.md](IA-Y-CREDITOS.md), marcas de agua y comentarios en los archivos | C |
| La IA "ideó la solución", algo que la guía no permite | Media | Alto | — | Tabla que separa las decisiones del equipo de las propuestas de la IA. **El equipo debe revisarla y confirmarla** | Todos |
| Contenido generado con marca de NASA | Baja | Alto | Un logotipo en una ilustración | Revisión humana de cada activo. Lo dudoso se descarta | C |
| Imagen o voz de menores en el video o las diapositivas | Baja | Alto | — | No se graba a quien prueba el juego | C |
| Material de terceros con licencia no admitida | Media | Medio | Activo sin licencia clara | Solo material propio, generado o de libre disposición sin restricciones | C |
| Trabajo previo al sábado 09:00 | Media | Alto | — | Anotar cuándo se redactó el prompt maestro. Si hay dudas, preguntar a la organización | Todos |
| Sin licencia en el repositorio | Media | Bajo | — | El equipo elige una. Si no, los términos indican que NASA aplica Apache 2.0 | A |

## 7. Límites conocidos

Lo que el proyecto **no** hace, dicho sin rodeos:

- No hay código todavía. Todo lo descrito es diseño.
- La simulación no calcula dosis de radiación ni riesgo para la salud.
- Las unidades de recursos son abstractas.
- El registro DONKI describe un evento cerca de la Tierra. El juego no afirma qué habría pasado en la Luna ese día.
- No hay datos en vivo.
- Marte y la misión terrestre están diseñados y no validados.
- No se ha probado con niños. La comprobación de aprendizaje está diseñada y no tiene resultados.
- No se ha medido rendimiento, tamaño ni compatibilidad.
- El juego está pensado para escritorio.
- Las versiones del stack existen en npm, pero no se han probado juntas.

## 8. Qué vigilar en cada hito

| Hito | Pregunta |
| --- | --- |
| H1 | ¿Instala y compila con las versiones propuestas? ¿Hay URL pública? |
| H2 | ¿Pasa la prueba del día 8? ¿Dibuja el tablero? |
| H3 | ¿Se juega una partida entera? ¿Se ve el registro de NASA en la decisión? |
| H4 | ¿Pasan los tres recorridos? ¿Está en inglés? ¿Están los créditos? |
| Entrega | ¿Abren los dos enlaces en ventana privada? ¿La demo cumple el límite? |
