# Localización

Ficha adicional al inventario base.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-30 |
| Prioridad · fase | P0 · H1 |
| Objetivo | Que todo texto visible salga de un catálogo, en inglés y español, y que cada persona edite solo sus archivos. |
| Responsabilidad | `src/app/i18n.ts` (A), catálogos en `src/data/i18n/` (A, B y C por espacio de nombres) |
| Depende de | [arranque-y-escenas](arranque-y-escenas.md) (`Options.language`) |
| No incluye | Traducción automática. Otros idiomas. |
| Responsable · revisor | A (servicio) · C |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

**El inglés es el idioma por defecto.** La guía de entrega exige inglés en el formulario y en los materiales enlazados, y el juego es un material enlazado. El español se elige en el título o en Opciones.

### Archivos y dueños

| Archivo | Prefijo de clave | Dueño | Contiene |
| --- | --- | --- | --- |
| `en/ui.json`, `es/ui.json` | `ui.` | C | Menús, HUD, botones, opciones, créditos |
| `en/sim.json`, `es/sim.json` | `sim.` | A | Errores de acción, causa y efecto, principios, sugerencias |
| `en/content.json`, `es/content.json` | `content.` | B | Edificios, eventos, tarjetas, tutorial, tripulación |

Tres archivos por idioma para que tres personas no editen el mismo.

### Servicio

```ts
export function createI18n(getLanguage: () => 'en' | 'es'): {
  t(key: string, params?: Record<string, string | number>): string;
  has(key: string): boolean;
};
```

- Carga con `import.meta.glob('../data/i18n/*/*.json', { eager: true })`. Un catálogo que aún no existe no rompe nada.
- Cada archivo es un objeto plano: `{ "ui.title.newGame": "New game" }`.
- Parámetros con llaves: `"sim.error.NO_MATERIALS": "You need {need} materials. You have {have}."`
- Búsqueda: idioma activo → inglés → la propia clave. En desarrollo, una clave ausente avisa en consola.

### Cambio de idioma

`options.set('language', 'es')` emite `options/changed`. Cada pantalla montada vuelve a pintar sus textos. El atributo `lang` de `<html>` se actualiza.

## 3. Datos y uso

### Convención de claves

`<espacio>.<zona>.<elemento>[.<variante>]`, en inglés, en `camelCase`:

- `ui.hud.endDay`
- `sim.cause.greenhouseNoPower`
- `content.building.panel.name`, `.desc`, `.why`
- `content.card.solarStorm.title`, `.body`

### Reglas de redacción

- Frases de 15 palabras o menos. Público de 7 a 12 años.
- Segunda persona, tono cercano: "Tu tripulación necesita agua."
- Mismo término para lo mismo en todo el juego. Glosario mínimo:

| Español | English |
| --- | --- |
| Energía | Power |
| Oxígeno | Oxygen |
| Agua | Water |
| Alimentos | Food |
| Materiales | Materials |
| Exposición | Exposure |
| Refugio | Shelter |
| Puntos de acción | Action points |
| Finalizar día | End day |
| Tormenta solar | Solar storm |
| Racha de estabilidad | Stability streak |
| Sol (día marciano) | Sol |

- Números y unidades fuera de la frase cuando se pueda, para no depender del orden de palabras.
- Sin texto dentro de imágenes. Las viñetas llevan el texto como subtítulo.

### Casos límite

- Texto español más largo que el inglés: los botones parten línea; no se recorta.
- Plurales: se evitan con formatos como "Días: 3".
- Clave presente en inglés y ausente en español: se muestra el inglés y la prueba U-LOC-03 falla.

## 4. Implementación delegable

**Tarea:** [T-P0-A2](../agentes/tareas/T-P0-A2-contratos-y-almacen.md). Cada dueño rellena su catálogo en sus tareas.

**Prompt breve:**

```text
Implementa src/app/i18n.ts según docs/componentes/localizacion.md: carga con import.meta.glob,
parámetros con llaves, respaldo a inglés y a la clave. Añade una prueba que compare las claves
de en/*.json con las de es/*.json y liste las que falten.
```

**Pruebas:** U-LOC-01 a U-LOC-03 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** ninguna cadena visible está escrita en `src/ui`, `src/map` ni `src/core`; todas las claves existen en los dos idiomas; cambiar el idioma repinta la pantalla actual.

**Evidencia:** pruebas en verde y captura de una pantalla en cada idioma.

**Terminado cuando:** la URL pública abre en inglés y funciona completa en español.

**Riesgos:** textos sueltos en el código por prisa. Mitigación: revisión con una búsqueda de cadenas entre comillas en `src/ui` antes de H4.
