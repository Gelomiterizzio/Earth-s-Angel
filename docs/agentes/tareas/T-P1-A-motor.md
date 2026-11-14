# T-P1-A · Motor y guardado

Responsable A. Revisor B. Dependencia: P0 verificado.

Lee [arquitectura](../../ARQUITECTURA.md), [reglas](../REGLAS-DE-TRABAJO.md) y [diseño](../../componentes/progresion.md).

Rutas asignadas: `src/core/{types,progression,actions,day-cycle,energy,objectives,save,validate}.ts, src/app/{flow,context,persistence}.ts, src/main.ts y tests/core`.

## Prompt para copiar

```text
Implementa T-P1-A (Motor y guardado) para Earth's Angel. Responsable A, revisor B.
Lee AGENTS.md, docs/ARQUITECTURA.md, docs/agentes/REGLAS-DE-TRABAJO.md y docs/componentes/progresion.md.
Dependencia: P0 verificado. Edita únicamente src/core/{types,progression,actions,day-cycle,energy,objectives,save,validate}.ts, src/app/{flow,context,persistence}.ts, src/main.ts y tests/core.
Integra la victoria lunar con Marte. Transfiere tripulación, suministros, hallazgos y bono según la ficha. Guarda antes de la cinemática y usa el mismo cierre para fin natural y salto. Conserva estado inicial al reintentar.
Usa el almacén y los tipos de A, catálogos EN/ES y simulación determinista.
Entrega los cambios, pruebas automatizadas o los pasos de reproducción.
Verifica bono repetido, igualdad tras salto y recarga, y reinicio de Marte.
Ejecuta npm test y npm run build. Reporta autor y revisión reales.
```

## Integración

A publica los contratos de P1 y P2. B integra los datos y la simulación terrestre. C conecta las vistas. A ejecuta las pruebas de campaña y prepara el despliegue.
