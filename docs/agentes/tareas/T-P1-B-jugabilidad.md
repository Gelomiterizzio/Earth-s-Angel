# T-P1-B · Balance de Marte

Responsable B. Revisor A. Dependencia: Contrato de A.

Lee [arquitectura](../../ARQUITECTURA.md), [reglas](../REGLAS-DE-TRABAJO.md) y [diseño](../../niveles/marte.md).

Rutas asignadas: `src/data/ salvo sim.json y ui.json, tests/data y recorridos en tests/core/plans`.

## Prompt para copiar

```text
Implementa T-P1-B (Balance de Marte) para Earth's Angel. Responsable B, revisor A.
Lee AGENTS.md, docs/ARQUITECTURA.md, docs/agentes/REGLAS-DE-TRABAJO.md y docs/niveles/marte.md.
Dependencia: Contrato de A. Edita únicamente src/data/ salvo sim.json y ui.json, tests/data y recorridos en tests/core/plans.
Carga nivel 20×20, edificios, hielo, minerales, polvo y cronograma por dificultad. Conserva la Luna y separa datos NASA de balance.
Usa el almacén y los tipos de A, catálogos EN/ES y simulación determinista.
Entrega los cambios, pruebas automatizadas o los pasos de reproducción.
Ejecuta victoria por dificultad y compara la producción con y sin polvo.
Ejecuta npm test y npm run build. Reporta autor y revisión reales.
```

## Integración

A publica los contratos de P1 y P2. B integra los datos y la simulación terrestre. C conecta las vistas. A ejecuta las pruebas de campaña y prepara el despliegue.
