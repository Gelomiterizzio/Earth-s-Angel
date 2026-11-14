# T-P0-A6 · Pruebas doradas y recorridos por dificultad

| Campo | Valor |
| --- | --- |
| ID | T-P0-A6 |
| Prioridad · hito | P0 · H4 |
| Perfil recomendado | [Integración y QA](../prompts/integracion-y-qa.md) |
| Responsable · revisor | A · B |
| Base Git | Rama `a/p0-a6-recorridos` desde `main` |
| Estimación | 1,5 h |
| Estado | propuesto |

## Objetivo

Los tres recorridos de victoria, sus variantes y las derrotas de referencia se ejecutan como pruebas automáticas y comparan cada día con la documentación.

## Componentes

[ciclo-de-dias](../../componentes/ciclo-de-dias.md) · [objetivos](../../componentes/objetivos.md) · [dificultad-y-balance](../../componentes/dificultad-y-balance.md)

## Contexto a leer

1. [niveles/luna.md](../../niveles/luna.md), sección de recorridos
2. [PRUEBAS.md](../../PRUEBAS.md), bloques I-REC e I-DER
3. [ciclo-de-dias](../../componentes/ciclo-de-dias.md)

## Dependencias

A4 y B1.

## Rutas

- **Permitidas:** `tests/core/walkthroughs.test.ts`, `tests/core/plans/*.ts`, `tests/core/invariants.test.ts`, sección de resultados de `docs/PRUEBAS.md`.
- **Excluidas:** `src/**`. Esta tarea no arregla código: informa.

## Contratos

`createCampaign` con `canonical: true`, `applyAction`, `validateState`.

## Pasos de implementación

1. `tests/core/plans/`: un plan por recorrido. Un plan es una lista de acciones por día, copiada de las tablas de [niveles/luna.md](../../niveles/luna.md).
2. Ayudante `runPlan(difficulty, plan)`: crea la campaña, aplica las acciones de cada día, responde a la decisión de refugio según el plan, cierra el día y acepta el informe. Devuelve la lista de informes.
3. Para Fácil, Media e Imposible: comparar al cerrar cada día energía, capacidad, oxígeno, agua, alimentos, materiales, racha y exposición. Comprobar día de victoria y plazo terrestre restante.
4. Variantes: Media trabajando el día 8; Media con el invernadero apagado el día 4; Fácil sin refugiarse.
5. Derrotas: sin hacer nada en las tres dificultades; Imposible trabajando los dos días de tormenta; Media sin construir refugio.
6. Bordes: doble `END_DAY`; victoria el último día de la ventana; derrota al vencer el plazo.
7. `invariants.test.ts`: cien partidas con acciones válidas elegidas con semilla. Tras cada acción, `validateState` devuelve lista vacía, ningún recurso es negativo ni supera su capacidad, y la entrada de `applyAction` no cambió.
8. Anotar en [PRUEBAS.md](../../PRUEBAS.md) fecha, número de pruebas y resultado.

## Entregables

Batería de recorridos e invariantes. Resultados anotados.

## Pruebas

I-REC-FACIL · I-REC-MEDIA · I-REC-IMPOSIBLE · I-REC-MEDIA-B · I-REC-MEDIA-C · I-REC-FACIL-B · I-DER-01 a I-DER-05 · I-BOR-01 a I-BOR-03 · I-INV-01 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Los tres recorridos ganan los días 9, 9 y 13 con todas las cifras de las tablas.
- [ ] Las variantes y derrotas dan los días y causas documentados.
- [ ] La prueba de invariantes pasa.
- [ ] **Ningún valor esperado se cambió para que una prueba pasara.** Toda diferencia quedó informada con día, campo, esperado, obtenido y cálculo.

## Evidencia

Salida de `npm test` y la sección de resultados de `PRUEBAS.md`.

## Condiciones de integración

Fusionado antes de H4 (domingo 09:00). Si un recorrido no pasa, se aplica la tabla de cortes de [PLAN-EQUIPO.md](../../PLAN-EQUIPO.md#6-criterios-para-cortar-alcance).

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final). Incluye la lista de diferencias encontradas y a quién se asignó cada una.
