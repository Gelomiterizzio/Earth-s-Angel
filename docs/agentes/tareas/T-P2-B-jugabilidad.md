# T-P2-B · Pistas y reglas de sostenibilidad de la Tierra

| Campo | Valor |
| --- | --- |
| Integrante | **B · Jugabilidad y ciencia** |
| Revisor | A (datos que lee el núcleo) · C (textos en pantalla) |
| Fase · hito | P2 · Segunda Oportunidad |
| Dependencia | Contrato de P2 de A ([T-P2-A](T-P2-A-motor.md)) |
| Estado real | Balizas en los mapas y `src/data/balance/tierra.json` integrados (commit `4c969ae`). **Revisión humana y validación de balance pendientes.** Todo el contenido de P2 es `ficción`. |

## Propiedad de archivos

| Archivo | Dueño |
| --- | --- |
| `src/data/content/levels/{luna,marte}.json` (campo `secret`) | B |
| `src/data/balance/tierra.json`, `src/data/validate.ts` (reglas de la Tierra) | B |
| `src/data/i18n/*/content.json` (pistas y textos de la Tierra) | B |
| `docs/niveles/tierra-alternativa.md`, `docs/componentes/objetos-secretos.md` | B |

## Markdown que debes leer

1. [AGENTS.md](../../../AGENTS.md) · [REGLAS-DE-TRABAJO.md](../REGLAS-DE-TRABAJO.md)
2. [componentes/objetos-secretos.md](../../componentes/objetos-secretos.md)
3. [niveles/tierra-alternativa.md](../../niveles/tierra-alternativa.md) · [componentes/mision-terrestre.md](../../componentes/mision-terrestre.md)
4. [CIENCIA-Y-DATOS.md](../../CIENCIA-Y-DATOS.md), sección de límites y etiquetas

## Tareas

### T-P2-B1 · Ubicación y lógica de las pistas

| Campo | Valor |
| --- | --- |
| Responsable · revisor | B · C |
| Depende de | Contrato de P2 de A |
| Archivos | `src/data/content/levels/{luna,marte}.json`, `src/data/validate.ts`, `content.json`, `tests/data/campaign.test.ts` |
| Contratos | `LevelConfig.secret.beacon`, claves `content.clue.*` |

**Diseño:** una baliza por mapa en llano. Tres pistas exactas: fragmento (columna), registro de laboratorio (fila), señal de antena (distancia). Dos bastan. Propuesta: Luna misterio (9,1) → baliza (10,2); Marte misterio (16,3) → baliza (17,12).

**Criterios de aceptación**
- [ ] La baliza está en una casilla de llano dentro del mapa; la validación lo comprueba.
- [ ] Con dos pistas cualesquiera la casilla queda determinada o con dos candidatas como máximo.
- [ ] Textos de pistas en inglés y español, rotulados como historia.
- [ ] La victoria ordinaria no exige ninguna pista.

**Pruebas:** U-SEC-01 a U-SEC-05, D-CON-02.

```text
Eres el integrante B de Earth's Angel. Lee docs/agentes/prompts/jugabilidad.md y
docs/componentes/objetos-secretos.md.
Tarea T-P2-B1: revisa el campo secret de los mapas de Luna y Marte y los textos de las tres
pistas. Posiciones fijas, sin azar; dos pistas deben bastar. Añade a src/data/validate.ts que
la baliza esté en llano y dentro del mapa. Textos en content.json (EN y ES), etiquetados
como ficción. No toques src/core ni src/ui.
Pruebas: tests/data/campaign.test.ts. Ejecuta npm test y npm run build.
```

### T-P2-B2 · Reglas de sostenibilidad, métricas, plazo y victoria

| Campo | Valor |
| --- | --- |
| Responsable · revisor | B · A |
| Depende de | T-P2-A3 para jugarlo |
| Archivos | `src/data/balance/tierra.json`, `src/data/validate.ts`, `tests/core/earth.test.ts` (recorridos), `docs/niveles/tierra-alternativa.md` |
| Contratos | `EarthData`: `maxLevel`, `lines`, `start`, `drift`, `combos`, `difficulty` |

**Diseño base (valores de balance):** 8 temporadas; cuatro líneas (energía limpia, uso eficiente del agua, reciclaje, restauración); indicadores agua 30, emisiones 0, ecosistemas 10; deriva −2, 0, −1; metas por dificultad 50/50/40, 60/60/50 y 70/70/60.

**Criterios de aceptación**
- [ ] Un recorrido de victoria por dificultad, temporada a temporada, en `tierra-alternativa.md` y como prueba.
- [ ] No invertir nada termina en fallo por agua; invertir en una sola línea, en fallo por plazo.
- [ ] Rótulos de ficción y de "indicadores simplificados" en el texto de la misión.
- [ ] El ejemplo de primera temporada de la ficha coincide con el núcleo.

**Pruebas:** I-REC-TIERRA-FACIL, I-REC-TIERRA-MEDIA, I-REC-TIERRA-IMPOSIBLE, U-TIE-01 a U-TIE-06.

```text
Eres el integrante B de Earth's Angel. Lee docs/agentes/prompts/ciencia-y-datos.md,
docs/niveles/tierra-alternativa.md y docs/componentes/mision-terrestre.md.
Tarea T-P2-B2: revisa src/data/balance/tierra.json. Encuentra y documenta un recorrido de
victoria por dificultad y los casos de fallo; conviértelos en pruebas. Los indicadores son
simplificaciones de juego, no ciencia climática: rotúlalos así. Si una regla necesita
cambiar, pídeselo a A. Ejecuta npm test y npm run build. Informa qué quedó validado.
```

## Orden de integración

B1 entra justo después del contrato de A. B2 entra con el núcleo terrestre de A. Orden general en [T-P2-A](T-P2-A-motor.md#orden-de-integración-de-p2).

## Registro de autoría

| Tarea | Implementó | Revisó | Fecha |
| --- | --- | --- | --- |
| T-P2-B1, B2 | Asistente de IA en el commit `4c969ae` | `[POR COMPLETAR: B, revisor A o C]` | 14-nov-2026 |
