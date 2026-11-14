# T-P2-C · Interfaz terrestre y finales

Responsable C. Revisor A. Dependencia: Contrato A y simulación B.

Lee [arquitectura](../../ARQUITECTURA.md), [reglas](../REGLAS-DE-TRABAJO.md) y [diseño](../../componentes/mision-terrestre.md).

Rutas asignadas: `src/ui/ salvo panels/decision.ts, src/audio/, src/styles/, public/assets/, catálogos ui.json y docs/IA-Y-CREDITOS.md`.

## Prompt para copiar

```text
Implementa T-P2-C (Interfaz terrestre y finales) para Earth's Angel. Responsable C, revisor A.
Lee AGENTS.md, docs/ARQUITECTURA.md, docs/agentes/REGLAS-DE-TRABAJO.md y docs/componentes/mision-terrestre.md.
Dependencia: Contrato A y simulación B. Edita únicamente src/ui/ salvo panels/decision.ts, src/audio/, src/styles/, public/assets/, catálogos ui.json y docs/IA-Y-CREDITOS.md.
Activa registro de pistas, pantalla de elección y misión terrestre. Muestra presupuesto, métricas, resultado, reintento y regreso. Reusa arte y audio acreditados y rotula ficción.
Usa el almacén y los tipos de A, catálogos EN/ES y simulación determinista.
Entrega los cambios, pruebas automatizadas o los pasos de reproducción.
Prueba elección equilibrada, fallo con regreso y cinemática del final alternativo.
Ejecuta npm test y npm run build. Reporta autor y revisión reales.
```

## Integración

A publica los contratos de P1 y P2. B integra los datos y la simulación terrestre. C conecta las vistas. A ejecuta las pruebas de campaña y prepara el despliegue.
