# Reglas de trabajo

Valen para las tres personas y para cualquier agente de IA.

## 1. Antes de escribir

1. Lee [../../CLAUDE.md](../../CLAUDE.md), tu ficha de tarea y los documentos que la ficha lista en "Contexto a leer".
2. Comprueba que las dependencias de la ficha están en `main`.
3. Si algo de la ficha contradice a [ARQUITECTURA.md](../ARQUITECTURA.md), manda la arquitectura. Avisa de la contradicción en tu informe.

## 2. Qué puedes tocar

- Solo las **rutas permitidas** de tu ficha.
- Nunca borres ni reescribas trabajo ajeno. Si un archivo de otra persona te estorba, pídele el cambio.
- Archivos con un único dueño:

| Archivo | Dueño |
| --- | --- |
| `src/core/types.ts`, API de `src/core/index.ts` | A |
| `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts` | A |
| `src/data/i18n/*/sim.json` | A |
| `src/data/**` salvo lo anterior, `src/map/**`, `src/ui/panels/decision.ts` | B |
| `src/data/i18n/*/content.json` | B |
| `src/ui/**` salvo `decision.ts`, `src/styles/**`, `src/audio/**`, `public/assets/**` | C |
| `src/data/i18n/*/ui.json` | C |
| `docs/IA-Y-CREDITOS.md` | C integra. Cada persona escribe solo en su sección. |

## 3. Contratos, arquitectura y ciencia

- **No cambies un contrato.** Si lo necesitas, detente, describe el cambio y pídeselo a A. A lo aplica en `main` junto con la actualización de [ARQUITECTURA.md](../ARQUITECTURA.md).
- **No cambies una regla científica ni un valor de balance** sin B. Cada cifra conserva su etiqueta: `dato NASA`, `transformación didáctica`, `balance` o `ficción`.
- **No añadas dependencias.** Si crees que hace falta una, justifícala en el informe: qué resuelve, tamaño, licencia y alternativa sin dependencia. Espera el visto bueno de A.
- Un cambio de arquitectura se propone, no se hace.

## 4. Código

- TypeScript estricto. Sin `any` salvo en fronteras con datos externos, y ahí con validación.
- En `src/core/`: sin DOM, sin Phaser, sin `Date`, sin `Math.random`, sin `localStorage`. Solo enteros.
- Ningún número de balance dentro del código. Todo sale de `GameData`.
- Ningún texto visible dentro del código. Todo sale del catálogo, en inglés y español.
- Funciones pequeñas y con nombre claro. Comenta solo lo que el código no puede decir.
- Archivos generados con IA: primera línea con un comentario que lo reconozca, por ejemplo `// AI-assisted: Claude Code (claude-fable-5-2), reviewed by <A|B|C>`.

## 5. Pruebas

- Toda regla del núcleo tiene una prueba con números exactos.
- Los vectores de [PRUEBAS.md](../PRUEBAS.md) y de [niveles/luna.md](../niveles/luna.md) **no se editan para que una prueba pase.** Si el código no los reproduce, el error está en el código o hay un cambio de reglas que debe pasar por A y B.
- Antes de pedir revisión: `npm test` y `npm run build` en verde.

## 6. Activos, créditos e IA

- Cada activo nuevo se registra en [ARTE-Y-ACTIVOS.md](../ARTE-Y-ACTIVOS.md) y en [IA-Y-CREDITOS.md](../IA-Y-CREDITOS.md) con autor, licencia y, si se generó, herramienta, modelo y prompt.
- Imágenes y videos generados: marca de agua visible.
- Audio, código y datos generados: reconocimiento en el texto descriptivo y en los metadatos.
- Nada generado usa logotipos, banderas ni identificadores de misión de NASA.
- Material de terceros: solo de libre disposición sin restricciones o con licencia OSI. Si dudas, no lo uses.
- Sin datos personales. Sin nombres, voces ni imágenes reconocibles de menores de 18 años.

## 7. Informe al terminar

Todo agente cierra con el informe de la [plantilla](PLANTILLA-TAREA.md#informe-final). Reglas del informe:

- Separa **implementado**, **probado** y **pendiente**.
- Si una prueba falla, pega la salida. No la resumas como "casi pasa".
- Si no ejecutaste algo, dilo.
- Lista cada archivo tocado.

## 8. Cuándo detenerse y preguntar

- La tarea exige tocar una ruta excluida.
- Hace falta cambiar un contrato, una regla científica o añadir una dependencia.
- Un vector de prueba no se puede reproducir.
- Vas a superar la estimación en más de un 50 %.
