# T-P2-A · Contrato de pistas y portal

Responsable A. Revisor B. Dependencia: P1 de A y datos B.

Lee [arquitectura](../../ARQUITECTURA.md), [reglas](../REGLAS-DE-TRABAJO.md) y [diseño](../../componentes/agujero-de-gusano.md).

Rutas asignadas: `src/core/, src/app/{context,flow,persistence}.ts, src/main.ts y tests/core fuera de planes`.

## Prompt para copiar

```text
Implementa T-P2-A (Contrato de pistas y portal) para Earth's Angel. Responsable A, revisor B.
Lee AGENTS.md, docs/ARQUITECTURA.md, docs/agentes/REGLAS-DE-TRABAJO.md y docs/componentes/agujero-de-gusano.md.
Dependencia: P1 de A y datos B. Edita únicamente src/core/, src/app/{context,flow,persistence}.ts, src/main.ts y tests/core fuera de planes.
Valida SCAN y las condiciones de ACTIVATE_BEACONS. Persiste hallazgos, resuelve transiciones y conserva la victoria marciana. Integra las acciones terrestres de B y gestión de resultados.
Usa el almacén y los tipos de A, catálogos EN/ES y simulación determinista.
Entrega los cambios, pruebas automatizadas o los pasos de reproducción.
Prueba pista persistida, portal bloqueado por cada condición y regreso tras fallo.
Ejecuta npm test y npm run build. Reporta autor y revisión reales.
```

## Integración

A publica los contratos de P1 y P2. B integra los datos y la simulación terrestre. C conecta las vistas. A ejecuta las pruebas de campaña y prepara el despliegue.
