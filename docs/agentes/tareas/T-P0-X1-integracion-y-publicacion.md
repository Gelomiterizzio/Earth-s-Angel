# T-P0-X1 · Integración por hitos, pruebas en navegadores y publicación

| Campo | Valor |
| --- | --- |
| ID | T-P0-X1 |
| Prioridad · hito | P0 · se ejecuta en H1, H2, H3 y H4 |
| Perfil recomendado | [Integración y QA](../prompts/integracion-y-qa.md) |
| Responsable · revisor | A · B y C |
| Base Git | `main`. Arreglos en ramas `a/fix-<tema>` |
| Estimación | 1,5 h repartidas |
| Estado | propuesto |

## Objetivo

En cada hito, `main` compila, pasa pruebas, se juega la ruta del hito y la URL pública está al día. El domingo a las 09:30 hay una versión verificada y etiquetada.

## Componentes

Todos. Procedimientos en [PROTOCOLO-INTEGRACION.md](../PROTOCOLO-INTEGRACION.md), [DESPLIEGUE.md](../../DESPLIEGUE.md) y [PRUEBAS.md](../../PRUEBAS.md).

## Contexto a leer

1. [PROTOCOLO-INTEGRACION.md](../PROTOCOLO-INTEGRACION.md), secciones 5, 7 y 9
2. [PLAN-EQUIPO.md](../../PLAN-EQUIPO.md): hitos, cortes y lista de lanzamiento
3. [PRUEBAS.md](../../PRUEBAS.md): procedimiento manual y matriz de navegadores
4. [DESPLIEGUE.md](../../DESPLIEGUE.md)

## Dependencias

Las tareas de cada hito.

## Rutas

- **Permitidas:** `src/main.ts` (cableado), `.github/workflows/deploy.yml`, `docs/PRUEBAS.md` (resultados), `docs/DESPLIEGUE.md`, `docs/PLAN-EQUIPO.md` (estado real), `CLAUDE.md` (estado).
- **Excluidas:** arreglar código de B o C. Se informa al dueño.

## Contratos

`main` siempre en verde. Orden de fusión: A, B, C.

## Pasos de implementación

**En cada hito (15 minutos)**

1. Avisar al equipo 20 minutos antes. Todos suben y abren sus solicitudes.
2. Fusionar en orden A, B, C. Resolver conflictos según la tabla del protocolo.
3. `git pull`, `npm install` si cambió `package.json`, `npm test`, `npm run build`.
4. Cablear en `main.ts` los puntos de entrada que hayan llegado.
5. Jugar entre los tres la ruta del hito:

| Hito | Ruta |
| --- | --- |
| H1 | La página abre en local y en la URL pública. Los datos cargan. El título se ve. |
| H2 | Título → misión con datos reales. Construir un panel. Finalizar día. El HUD cambia. |
| H3 | Partida completa en Media con `?seed=demo` hasta la victoria del día 9. Una derrota sin hacer nada. |
| H4 | Lo de H3 más Fácil e Imposible, tutorial, idioma, audio y créditos, en los tres navegadores. |

6. Anotar fallos con dueño y gravedad. Lo que rompe `main` se arregla antes de seguir.
7. Etiquetar: `h1`, `h2`, `h3`, `h4`.
8. Comprobar que la publicación terminó y abrir la URL pública en ventana privada.
9. Actualizar el estado real en [PLAN-EQUIPO.md](../../PLAN-EQUIPO.md#9-estado-real) y en `CLAUDE.md`.

**En H3 (sábado 21:00)**

10. Aplicar con el equipo la tabla de cortes. Dejar por escrito qué entra y qué no.

**En H4 (domingo 09:00)**

11. Procedimiento manual completo de [PRUEBAS.md](../../PRUEBAS.md) en Chrome, Firefox y Edge.
12. Medir y anotar: tamaño de `dist/`, tiempo hasta el título en la laptop del evento, errores y avisos de consola. Solo valores medidos.
13. Comprobar que la compilación de producción no contiene `debug.ts` ni eventos `SYNTHETIC`.

**Congelación (domingo 09:30)**

14. Etiqueta `entrega-2026-11-15`. Desde aquí solo arreglos de fallos que impiden jugar, revisados por dos personas.
15. Entregar a C la URL pública y la del repositorio para [T-P0-C7](T-P0-C7-entrega.md).

## Entregables

Cuatro etiquetas de hito, URL pública verificada, resultados de pruebas anotados y versión de entrega etiquetada.

## Pruebas

M-ARR-01 · procedimiento manual M-GEN-01 · matriz de navegadores N-01 a N-03 · I-REC-* · medidas R-01 a R-04 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Cada hito tiene su etiqueta y su ruta jugada por los tres.
- [ ] `main` nunca quedó sin compilar más de 15 minutos.
- [ ] La URL pública abre en ventana privada, en inglés, sin errores de consola.
- [ ] La partida de Media con `?seed=demo` termina en victoria el día 9 en la URL pública.
- [ ] Los resultados anotados en `PRUEBAS.md` son medidos y llevan fecha, navegador y versión.
- [ ] Lo no probado está escrito como "no probado".

## Evidencia

Etiquetas en GitHub, sección de resultados de `PRUEBAS.md` y captura de la URL pública.

## Condiciones de integración

No aplica: esta tarea es la integración.

## Informe final

Pruebas ejecutadas con resultado · fallos abiertos por gravedad y dueño · qué no se probó · estado de `main` · estado de la URL pública · riesgos para la entrega.
