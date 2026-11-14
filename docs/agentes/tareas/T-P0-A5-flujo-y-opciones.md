# T-P0-A5 · Flujo de escenas, opciones y entrada global

| Campo | Valor |
| --- | --- |
| ID | T-P0-A5 |
| Prioridad · hito | P0 · H3 |
| Perfil recomendado | [Motor](../prompts/motor.md) |
| Responsable · revisor | A · C |
| Base Git | Rama `a/p0-a5-flujo` desde `main` |
| Estimación | 1,5 h |
| Estado | propuesto |

## Objetivo

Se puede ir del título a la misión y al resultado. Las opciones se guardan y sobreviven a una recarga. `main.ts` conecta datos, núcleo, mapa, pantallas y audio.

## Componentes

[arranque-y-escenas](../../componentes/arranque-y-escenas.md) · [persistencia](../../componentes/persistencia.md) · [controles](../../componentes/controles.md) · [menu-opciones](../../componentes/menu-opciones.md)

## Contexto a leer

1. [ARQUITECTURA.md](../../ARQUITECTURA.md), secciones 9, 11 y 13
2. [arranque-y-escenas](../../componentes/arranque-y-escenas.md)
3. [persistencia](../../componentes/persistencia.md), parte de opciones
4. [controles](../../componentes/controles.md)

## Dependencias

A2. Para cablear necesita que existan `src/ui/index.ts` (C1), `src/map/index.ts` (B3) y `src/data/index.ts` (B1). Lo que no haya llegado se cablea en el siguiente punto de integración. La espera C4.

## Rutas

- **Permitidas:** `src/app/flow.ts`, `options.ts`, `persistence.ts`, `input.ts`, `debug.ts`, `seed.ts`, `src/main.ts`, `index.html`, `tests/core/flow.test.ts`, `tests/core/options.test.ts`.
- **Excluidas:** carpetas de B y C. Solo importas sus puntos de entrada.

## Contratos

`Flow`, `Screen`, `AppContext`, `OptionsService`, `Options` de [arranque-y-escenas](../../componentes/arranque-y-escenas.md). Clave de almacenamiento `ea.options.v1`.

## Pasos de implementación

1. `flow.ts`: máquina de estados con las escenas de P0: `arranque`, `titulo`, `opciones`, `dificultad`, `cinematica`, `mision`, `pausa`, `resultado`, `creditos`, `despedida`. Tabla de transiciones permitidas; una transición no permitida se ignora y se avisa en desarrollo.
2. `flow.register(scene, screen)`, `go`, `back`. Al cambiar: `unmount` de la actual, `mount` de la nueva en `#ui`, evento `flow/changed`.
3. `flow.startCampaign(difficulty)`: obtiene la semilla, llama a `createCampaign`, carga el estado en el almacén y va a la cinemática de apertura.
4. `flow.completeCinematic(id)`: cerrojo de un solo uso por reproducción.
5. Suscripción al almacén: cuando `mission.result` deja de ser `null`, va a `resultado`.
6. `seed.ts`: lee `?seed=`. `demo` → modo canónico con semilla `EA-DEMO`. Sin parámetro → semilla nueva con `crypto.getRandomValues`.
7. `options.ts`: valores por defecto, validación campo a campo, lectura y escritura en `ea.options.v1`, evento `options/changed`. Un valor inválido se sustituye por su valor por defecto.
8. `input.ts`: Esc abre o cierra la pausa durante la misión; atajos de [controles](../../componentes/controles.md). Ignora teclas cuando el foco está en un campo de texto.
9. `main.ts`: `loadGameData` → almacén → opciones → cadenas → audio → mapa → `registerScreens` → `flow.go('titulo')`. Si `loadGameData` falla, muestra una pantalla de error legible.
10. El mapa es visible en `mision` y `pausa`, y se oculta en el resto.
11. `debug.ts` dentro de `if (import.meta.env.DEV)`: saltar a un día, aplicar un plan, forzar resultado.

## Entregables

Flujo completo de P0, opciones persistentes, semilla por URL, cableado en `main.ts`.

## Pruebas

U-FLU-01 a U-FLU-05 · U-OPC-01 a U-OPC-04 · manuales M-FLU-01 y M-FLU-02 de [PRUEBAS.md](../../PRUEBAS.md).

## Criterios de aceptación

- [ ] Título → dificultad → apertura → misión → resultado → título, sin recargar.
- [ ] Dos llamadas seguidas a `completeCinematic` navegan una sola vez.
- [ ] Cambiar idioma o volumen durante una misión no cambia `GameState`.
- [ ] Las opciones siguen ahí tras recargar. Un valor corrupto en `localStorage` no rompe el arranque.
- [ ] `?seed=demo` produce siempre el mismo programa de eventos.
- [ ] La compilación de producción no contiene el código de `debug.ts`.

## Evidencia

Salida de pruebas y un recorrido grabado o descrito paso a paso.

## Condiciones de integración

C confirma que sus pantallas montan y desmontan bien. Fusionado antes de H3.

## Informe final

Formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final).
