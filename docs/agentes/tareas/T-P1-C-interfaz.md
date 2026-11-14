# T-P1-C · Interfaz y cinemáticas de Marte

Responsable C. Revisor B. Dependencia: API de A y datos de B.

Lee [arquitectura](../../ARQUITECTURA.md), [reglas](../REGLAS-DE-TRABAJO.md) y [diseño](../../componentes/motor-cinematicas.md).

Rutas asignadas: `src/ui/ salvo panels/decision.ts, src/audio/, src/styles/, public/assets/ y catálogos ui.json`.

## Prompt para copiar

```text
Implementa T-P1-C (Interfaz y cinemáticas de Marte) para Earth's Angel. Responsable C, revisor B.
Lee AGENTS.md, docs/ARQUITECTURA.md, docs/agentes/REGLAS-DE-TRABAJO.md y docs/componentes/motor-cinematicas.md.
Dependencia: API de A y datos de B. Edita únicamente src/ui/ salvo panels/decision.ts, src/audio/, src/styles/, public/assets/ y catálogos ui.json.
Conecta los botones de partida, resultados y continuación al flujo de A. Reutiliza arte, música, manifiesto y cinemáticas existentes. Expón mantenimiento, pronóstico y objetivo marciano en el HUD.
Usa el almacén y los tipos de A, catálogos EN/ES y simulación determinista.
Entrega los cambios, pruebas automatizadas o los pasos de reproducción.
Prueba controles, cambio de idioma, salto de cinemática y créditos.
Ejecuta npm test y npm run build. Reporta autor y revisión reales.
```

## Integración

A publica los contratos de P1 y P2. B integra los datos y la simulación terrestre. C conecta las vistas. A ejecuta las pruebas de campaña y prepara el despliegue.
