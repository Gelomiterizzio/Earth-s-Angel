# T-P2-B · Pistas y sostenibilidad

Responsable B. Revisor A. Dependencia: Contrato A y mapa P1.

Lee [arquitectura](../../ARQUITECTURA.md), [reglas](../REGLAS-DE-TRABAJO.md) y [diseño](../../niveles/tierra-alternativa.md).

Rutas asignadas: `src/data/ salvo sim.json y ui.json, src/core/earth.ts y tests/data`.

## Prompt para copiar

```text
Implementa T-P2-B (Pistas y sostenibilidad) para Earth's Angel. Responsable B, revisor A.
Lee AGENTS.md, docs/ARQUITECTURA.md, docs/agentes/REGLAS-DE-TRABAJO.md y docs/niveles/tierra-alternativa.md.
Dependencia: Contrato A y mapa P1. Edita únicamente src/data/ salvo sim.json y ui.json, src/core/earth.ts y tests/data.
Configura posiciones fijas de balizas y parámetros terrestres. Implementa el turno terrestre puro, presupuesto, combinaciones, deriva y metas.
Usa el almacén y los tipos de A, catálogos EN/ES y simulación determinista.
Entrega los cambios, pruebas automatizadas o los pasos de reproducción.
Prueba victoria por dificultad, inacción, acción única, límites de presupuesto y doble cierre.
Ejecuta npm test y npm run build. Reporta autor y revisión reales.
```

## Integración

A publica los contratos de P1 y P2. B integra los datos y la simulación terrestre. C conecta las vistas. A ejecuta las pruebas de campaña y prepara el despliegue.
