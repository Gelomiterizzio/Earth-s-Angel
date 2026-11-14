# Plantilla de tarea

Copia este archivo a `docs/agentes/tareas/T-<fase>-<letra><número>-<nombre>.md` y rellena cada campo. Una ficha debe poder entregarse a un agente sin más explicación.

---

# T-XX-YY · Título corto

| Campo | Valor |
| --- | --- |
| ID | T-XX-YY |
| Prioridad · hito | P0, P1 o P2 · H1 a H4 |
| Perfil recomendado | motor, jugabilidad, interfaz, arte y audio, ciencia y datos, integración y QA |
| Responsable · revisor | A, B o C · A, B o C |
| Base Git | Rama `letra/nombre` creada desde `main` |
| Estimación | Horas |
| Estado | propuesto, en desarrollo, integrado o verificado |

## Objetivo

Una o dos frases: qué existe al terminar que antes no existía.

## Componentes

Enlaces a las fichas de `docs/componentes/` que esta tarea implementa.

## Contexto a leer

Lista ordenada de documentos y secciones. Lo imprescindible, no todo el repositorio.

## Dependencias

Tareas que deben estar en `main` antes de empezar y tareas que esperan a esta.

## Rutas

- **Permitidas:** carpetas y archivos que la tarea puede crear o modificar.
- **Excluidas:** lo que no se toca aunque parezca necesario.

## Contratos

Tipos, funciones, eventos o formatos que la tarea usa o cumple. Enlaza la sección de [ARQUITECTURA.md](../ARQUITECTURA.md). Si la tarea necesita cambiar un contrato, se detiene y lo pide a A.

## Pasos de implementación

1. Pasos concretos y ordenados.

## Entregables

Archivos y comportamientos que deben existir al terminar.

## Pruebas

Identificadores de [PRUEBAS.md](../PRUEBAS.md) y pruebas nuevas que la tarea añade. Indica el tipo: unitaria, integración o manual.

## Criterios de aceptación

Lista de comprobaciones observables. Cada una se puede responder con sí o no.

## Evidencia

Qué se adjunta para demostrarlo: salida de pruebas, captura, GIF, enlace.

## Condiciones de integración

Qué debe cumplirse para fusionar: pruebas, compilación, revisión, sin conflictos, estado actualizado.

## Informe final

El agente termina con este informe:

```text
Archivos creados o modificados:
Pruebas ejecutadas y resultado:
Implementado:
Probado:
Pendiente o sin verificar:
Dependencias nuevas (con justificación):
Cambios de contrato solicitados:
Uso de IA y activos a registrar en docs/IA-Y-CREDITOS.md:
```
