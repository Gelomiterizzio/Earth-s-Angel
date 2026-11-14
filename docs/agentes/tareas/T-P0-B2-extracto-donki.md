# T-P0-B2 · Extracto DONKI y adaptador de datos NASA

| Campo | Valor |
| --- | --- |
| ID | T-P0-B2 |
| Prioridad · hito | P0 · H1 |
| Perfil recomendado | [Ciencia y datos](../prompts/ciencia-y-datos.md) |
| Responsable · revisor | B · A |
| Base Git | Rama `b/p0-b2-donki` desde `main` |
| Estimación | 1,0 h |
| Estado | propuesto |

## Objetivo

El juego lleva empaquetado un extracto pequeño y trazable de registros reales de DONKI, y un adaptador que los convierte en lo que la tarjeta de decisión necesita.

**Esta es la tarea que sostiene la elegibilidad para premios globales.** No se recorta.

## Componentes

[adaptador-datos-nasa](../../componentes/adaptador-datos-nasa.md) · [radiacion-y-refugio](../../componentes/radiacion-y-refugio.md)

## Contexto a leer

1. [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md), secciones 1 y 2
2. [adaptador-datos-nasa](../../componentes/adaptador-datos-nasa.md)
3. [NASA-SPACE-APPS-2026.md](../../NASA-SPACE-APPS-2026.md), recursos del reto y condiciones de DONKI

## Dependencias

Ninguna. La espera B5.

## Rutas

- **Permitidas:** `src/data/nasa/donki-sep.json`, `src/data/nasa/adapter.ts`, `tests/data/nasa.test.ts`, `docs/CIENCIA-Y-DATOS.md`, sección de B en `docs/IA-Y-CREDITOS.md`.
- **Excluidas:** `src/core`, `src/app`, `src/ui`.

## Contratos

`NasaSepRecord` y las funciones del adaptador en [adaptador-datos-nasa](../../componentes/adaptador-datos-nasa.md). Formato del archivo en [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md#formato-del-extracto-empaquetado).

## Pasos de implementación

1. Volver a leer cada registro en la fuente. Consultas:
   - `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/SEP?startDate=2017-09-10&endDate=2017-09-10`
   - `https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=2017-09-10&endDate=2017-09-10`
   - Lo mismo para 2021-10-28, 2024-05-10 a 2024-05-11 y 2024-05-13.
2. Para cada registro candidato de la tabla de [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md#registros-candidatos-para-la-variación-entre-partidas--dato-nasa), leer la fulguración enlazada y anotar clase, inicio, pico, región activa y enlace. Si un registro no tiene fulguración enlazada clara, se descarta del extracto.
3. Escribir `donki-sep.json` con el formato documentado: bloque `nasa` con los campos tal cual y bloque `game` con `radiationLevel`, `rule` y `leadMinutes`.
4. Regla del nivel: instrumento con "100 MeV" → 2; con "10 MeV" y sin registro de 100 MeV del mismo evento → 1.
5. `leadMinutes` = minutos entre `flare.beginTime` y `eventTime`.
6. `adapter.ts`: `loadSepRecords()`, `findSepRecord(id)`, `recordsByLevel(level)`, `describeSepRecord(record)`. La elección con semilla la hace el núcleo leyendo `data.nasa.sep`.
7. Pruebas: forma de cada registro, regla del nivel, `leadMinutes` del registro principal igual a 50, y que ningún registro lleve `SYNTHETIC`.
8. Leer la [política de publicación de CCMC](https://ccmc.gsfc.nasa.gov/publication-policy/) y copiar a [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md) el reconocimiento que recomienda. Si no se puede abrir, dejarlo como "por verificar".
9. Actualizar en [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md) la fecha de consulta y el estado de cada registro.

## Entregables

Extracto con al menos el registro principal y un registro moderado. Adaptador probado. Documentación de procedencia al día.

## Pruebas

D-NASA-01 a D-NASA-03 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] El registro `2017-09-10T16:25:00-SEP-001` está en el extracto con instrumento, enlace y fulguración X8.2 de la región 12673.
- [ ] Hay al menos un registro de nivel 1 para Fácil.
- [ ] Cada campo del bloque `nasa` se puede comprobar abriendo el enlace del registro.
- [ ] El archivo declara `retrievedAt` y el aviso de que son datos archivados.
- [ ] Las pruebas pasan.

## Evidencia

Salida de `npm test` y los enlaces de los registros.

## Condiciones de integración

Fusionado antes de H1. A revisa que `sourceRef` de los eventos de balance apunte a identificadores presentes en el extracto.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final), más: fuentes consultadas con fecha, qué quedó como `dato NASA` y qué como "por verificar".
