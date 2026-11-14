# Protocolo de integración

Cómo tres personas, cada una con sus agentes, unen su trabajo en un solo repositorio sin pisarse.

Repositorio: <https://github.com/Gelomiterizzio/Earth-s-Angel>

## 1. Ramas

| Rama | Uso | Quién escribe |
| --- | --- | --- |
| `main` | Siempre compila y pasa pruebas. De aquí se publica. | Solo por fusión de una rama revisada. Excepciones: la documentación inicial y el andamiaje de A1. |
| `a/<tarea>` | Trabajo de A. Ejemplo: `a/p0-a3-nucleo` | A |
| `b/<tarea>` | Trabajo de B. Ejemplo: `b/p0-b3-mapa` | B |
| `c/<tarea>` | Trabajo de C. Ejemplo: `c/p0-c2-hud` | C |

Una rama por tarea. Ramas cortas: se fusionan en horas, no en días.

## 2. Ciclo de una tarea

Crear la rama:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
git checkout -b b/p0-b3-mapa
```

Guardar avances a menudo, con el ID de la tarea en el mensaje:

```bash
git add src/map
```

```bash
git commit -m "T-P0-B3: dibuja el tablero desde el estado"
```

Antes de pedir revisión, traer lo último de `main` y comprobar:

```bash
git pull origin main
```

```bash
npm test
```

```bash
npm run build
```

Subir y abrir la solicitud de fusión:

```bash
git push -u origin b/p0-b3-mapa
```

En GitHub: **Compare & pull request** hacia `main`. Título con el ID de la tarea. En la descripción, pega el informe final de la ficha.

## 3. Revisión

- Revisa la persona que indica la ficha. Plazo: 15 minutos. En el hackathon se puede revisar mirando juntos la pantalla, pero la solicitud queda como registro.
- El revisor comprueba: rutas permitidas respetadas, pruebas y compilación en verde, criterios de aceptación de la ficha, ninguna dependencia nueva sin justificar.
- Si todo está bien, el revisor fusiona con **Squash and merge**.
- Si hay algo pequeño, lo arregla el autor en la misma rama y se vuelve a mirar.

## 4. Propiedad de archivos

La tabla completa está en [REGLAS-DE-TRABAJO.md](REGLAS-DE-TRABAJO.md#2-qué-puedes-tocar). La idea: **cada carpeta tiene un dueño y dos personas no editan el mismo archivo.** Por eso los conflictos deberían ser raros.

## 5. Cambios simultáneos y conflictos

| Situación | Quién resuelve | Cómo |
| --- | --- | --- |
| Conflicto en un archivo con dueño | El dueño | Se queda la versión del dueño y el otro vuelve a aplicar su cambio encima, si procede. |
| Conflicto en `src/core/types.ts` | A | Nadie más lo edita. Si aparece un conflicto, alguien rompió la regla: se descarta ese cambio. |
| Conflicto en `package.json` o `package-lock.json` | A | Se toma `main` y A vuelve a instalar si hace falta. |
| Conflicto en un catálogo de cadenas | El dueño del espacio de nombres | `ui` es de C, `sim` de A, `content` de B. |
| Conflicto en `docs/IA-Y-CREDITOS.md` | C | Cada persona escribe solo en su sección. |
| Dos tareas necesitan el mismo cambio de contrato | A | A lo hace primero en `main`. Las dos tareas esperan y luego traen `main`. |
| Algo se rompió en `main` | Quien fusionó por última vez | Arreglo inmediato o reversión con `git revert`. `main` no se queda rojo. |

Para resolver un conflicto al traer `main`: abre el archivo, elige según la tabla, y después:

```bash
git add <archivo>
```

```bash
git commit
```

## 6. Cambio de contrato

1. Quien lo necesita escribe a A: qué tipo, función o evento, por qué, y qué tareas afecta.
2. A decide. Si acepta, cambia `src/core/types.ts` y [ARQUITECTURA.md](../ARQUITECTURA.md) en el mismo commit, directamente en una rama `a/contrato-<tema>` que se fusiona enseguida.
3. A avisa al equipo. Todos traen `main`.
4. Si el cambio altera vectores de prueba, A y B actualizan [PRUEBAS.md](../PRUEBAS.md) y [niveles/luna.md](../niveles/luna.md) en ese mismo cambio.

## 7. Puntos de integración

En cada hito de [PLAN-EQUIPO.md](../PLAN-EQUIPO.md#3-cronograma), A dirige una prueba conjunta de 15 minutos:

1. Los tres suben lo que tengan y abren sus solicitudes.
2. Se fusiona en este orden: **A, luego B, luego C**. El núcleo primero, porque los demás dependen de él.
3. A trae `main`, ejecuta `npm test` y `npm run build`.
4. Los tres abren el juego y recorren la ruta del hito.
5. Lo que falle se anota como tarea con dueño. Si rompe `main`, se arregla antes de seguir.
6. A marca el punto:

```bash
git tag h2
```

```bash
git push origin h2
```

Las etiquetas permiten volver a una versión que funcionaba.

## 8. Varios agentes en la misma máquina

Si una persona lanza dos agentes a la vez, cada uno trabaja en su propia copia:

```bash
git worktree add ../earths-angel-b3 -b b/p0-b3-mapa
```

Cada copia tiene su rama. Al terminar, se sube la rama y se elimina la copia:

```bash
git worktree remove ../earths-angel-b3
```

Con subagentes nativos de Claude Code, el campo `isolation: worktree` hace esto por ti (ver [AGENTES.md](../AGENTES.md#6-subagentes-nativos-de-claude-code)).

## 9. Publicación

- Se publica lo que hay en `main`. Procedimiento en [DESPLIEGUE.md](../DESPLIEGUE.md).
- Después de la congelación del domingo a las 09:30 solo se fusionan arreglos de fallos que impiden jugar, y los revisan dos personas.
- La versión entregada se etiqueta:

```bash
git tag entrega-2026-11-15
```

```bash
git push origin entrega-2026-11-15
```

## 10. Reglas rápidas

- No hagas `git push --force` en `main`. Nunca.
- No subas `node_modules/` ni `dist/`. Están en `.gitignore`.
- No subas claves ni archivos `.env`. El proyecto no necesita ninguna.
- Si no sabes resolver algo de Git, pregunta antes de improvisar.
