# Integrante A · Simulación y arquitectura

Paquete de trabajo de **Earth's Angel** para el NASA Space Apps Challenge 2026.
Repositorio del equipo: <https://github.com/Gelomiterizzio/Earth-s-Angel>

> **Fechas que mandan (hora de Bolivia):** congelación de código el **domingo 09:30** · envío a las **11:30** · límite de la sede 12:00 · defensa 14:00.

## 1. Tu papel

Eres quien hace que el juego **funcione por dentro**. Construyes el proyecto, defines los contratos que B y C usan, programas la simulación (turnos, energía, agua, oxígeno, alimentos, tripulación, radiación, objetivos) y eres quien une el trabajo de los tres.

| Eres dueño de | No tocas |
| --- | --- |
| `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.ts` | `src/map/` y `src/data/` (B) |
| `src/core/` · simulación pura | `src/ui/`, `src/styles/`, `src/audio/`, `public/assets/` (C) |
| `src/app/` · almacén, flujo, opciones, cadenas | |
| `tests/core/` | |
| `src/data/i18n/en/sim.json` y `es/sim.json` | |

**Solo tú cambias los contratos** (`src/core/types.ts` y la API del núcleo). Si B o C necesitan un cambio, te lo piden a ti.

Revisas el trabajo de **B**. A ti te revisa **B** en el núcleo y **C** en el flujo.

## 2. Antes de empezar (una sola vez)

### 2.1 Subir la documentación al repositorio

El repositorio está vacío. **Una sola persona**, la que tenga esta carpeta con la documentación, ejecuta esto dentro de ella:

```bash
git init -b main
```

```bash
git remote add origin https://github.com/Gelomiterizzio/Earth-s-Angel.git
```

```bash
git add .
```

```bash
git commit -m "docs: planificación y diseño de Earth's Angel"
```

```bash
git push -u origin main
```

Después, el dueño del repositorio invita a los otros dos: en GitHub, **Settings → Collaborators → Add people**. Sin esa invitación no podrán subir cambios. El repositorio debe ser **público** para que el jurado lo abra.

### 2.2 Preparar tu máquina

Necesitas Git y Node.js 22.12 o posterior (recomendado 24). Compruébalo:

```bash
node --version
```

```bash
git --version
```

Clona en una ruta corta, **sin espacios ni apóstrofos**. Por ejemplo `C:\dev`:

```bash
git clone https://github.com/Gelomiterizzio/Earth-s-Angel.git earths-angel
```

```bash
cd earths-angel
```

### 2.3 Qué leer (20 minutos)

1. [docs/PLAN-EQUIPO.md](docs/PLAN-EQUIPO.md) · horarios y cortes
2. [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) · **es tu documento**: contratos, eventos, flujo
3. [docs/componentes/ciclo-de-dias.md](docs/componentes/ciclo-de-dias.md) · orden exacto de un turno, con un ejemplo en números
4. [docs/niveles/luna.md](docs/niveles/luna.md) · recorridos que tu código debe reproducir
5. [docs/agentes/PROTOCOLO-INTEGRACION.md](docs/agentes/PROTOCOLO-INTEGRACION.md) · cómo se une todo

## 3. Tu prompt para Claude Code

Abre una terminal en la carpeta del repositorio, inicia `claude` y pega esto. Sirve igual para otro asistente si le das acceso a los archivos.

```text
Soy el integrante A (simulación y arquitectura) del equipo de Earth's Angel, un juego educativo
2D por turnos para el NASA Space Apps Challenge 2026. Entregamos el domingo 15-nov a las 11:30,
hora de Bolivia, y la congelación de código es a las 09:30.

Lee, en este orden: CLAUDE.md, INTEGRANTE_A_SIMULACION.md, docs/agentes/prompts/motor.md,
docs/agentes/REGLAS-DE-TRABAJO.md, docs/ARQUITECTURA.md y docs/componentes/ciclo-de-dias.md.

Desde ahora trabajas con el perfil de motor descrito en docs/agentes/prompts/motor.md.
Te pediré mis tareas una por una: T-P0-A1, A2, A3, A4, A5, A6 y T-P0-X1. Para cada una:
1. Lee su ficha en docs/agentes/tareas/ y los documentos que la ficha lista.
2. Dime en cinco líneas qué vas a hacer y qué archivos vas a crear o tocar. Espera mi "adelante".
3. Trabaja solo en las rutas permitidas de la ficha. Escribe primero las pruebas con los números
   exactos de la documentación y después el código.
4. Ejecuta npm test y npm run build y pégame la salida.
5. Termina con el informe final de docs/agentes/PLANTILLA-TAREA.md, separando lo implementado,
   lo probado y lo pendiente.

Reglas que no se rompen:
- src/core es TypeScript puro: sin DOM, Phaser, Date, Math.random ni localStorage. Solo enteros.
- Ningún número de balance ni texto visible dentro del código.
- No cambies los valores esperados de docs/PRUEBAS.md ni de docs/niveles/luna.md para que una
  prueba pase. Si no coinciden, explícame la diferencia con el cálculo paso a paso.
- No añadas dependencias sin preguntarme.
- Puedes hacer commits en mi rama con el ID de la tarea. No hagas push ni fusiones: eso lo hago yo.

Empieza por la tarea T-P0-A1: docs/agentes/tareas/T-P0-A1-andamiaje.md
```

Para las tareas siguientes basta con:

```text
Siguiente tarea: docs/agentes/tareas/T-P0-A2-contratos-y-almacen.md. Mismo procedimiento.
```

## 4. Tus tareas, en orden

| Cuándo | Tarea | Ficha | Qué queda hecho |
| --- | --- | --- | --- |
| Sáb 12:45 – 13:30 | **A1** Andamiaje | [T-P0-A1](docs/agentes/tareas/T-P0-A1-andamiaje.md) | El proyecto instala, arranca, prueba, compila y tiene URL pública |
| Sáb 13:30 – 14:30 | **A2** Contratos y almacén | [T-P0-A2](docs/agentes/tareas/T-P0-A2-contratos-y-almacen.md) | B y C importan tipos y estados de ejemplo |
| **H1 · 14:30** | Integración | | `main` arranca, los datos de B cargan, el título de C se ve |
| Sáb 14:30 – 17:30 | **A3** Núcleo I | [T-P0-A3](docs/agentes/tareas/T-P0-A3-nucleo-recursos-y-dias.md) | Construir, explorar, cerrar días; energía, agua, oxígeno y alimentos exactos |
| **H2 · 17:30** | Integración | | Se construye un panel en el mapa y el HUD cambia al cerrar el día |
| Sáb 17:30 – 19:30 | **A4** Núcleo II | [T-P0-A4](docs/agentes/tareas/T-P0-A4-nucleo-tripulacion-y-objetivos.md) | Salud, exposición, decisión de refugio, objetivos, victoria y derrota |
| Sáb 19:30 – 21:00 | **A5** Flujo y opciones | [T-P0-A5](docs/agentes/tareas/T-P0-A5-flujo-y-opciones.md) | Del título al resultado sin recargar; opciones guardadas |
| **H3 · 21:00** | Integración y **decisión de alcance** | | Partida completa en Media. Primera versión pública jugable |
| Sáb noche o Dom 07:30 | **A6** Pruebas doradas | [T-P0-A6](docs/agentes/tareas/T-P0-A6-pruebas-doradas.md) | Los tres recorridos y las derrotas pasan como pruebas |
| **H4 · Dom 09:00** | Integración | | P0 verificado en tres navegadores |
| **Dom 09:30** | **Congelación** | | Etiqueta `entrega-2026-11-15` |
| Dom 09:30 – 11:30 | **X1** Publicación | [T-P0-X1](docs/agentes/tareas/T-P0-X1-integracion-y-publicacion.md) | URL pública verificada; enlaces entregados a C |

**Lo primero es A1 y A2.** Hasta que estén en `main`, B y C trabajan a ciegas. Súbelos pronto aunque sean mínimos.

## 5. Guardar y subir tu trabajo

A1 va directo a `main` porque es el primer código. Desde A2, una rama por tarea:

```bash
git checkout main
```

```bash
git pull origin main
```

```bash
git checkout -b a/p0-a2-contratos
```

Guarda a menudo:

```bash
git add .
```

```bash
git commit -m "T-P0-A2: tipos, almacén y datos de prueba"
```

Antes de pedir revisión:

```bash
git pull origin main
```

```bash
npm test
```

```bash
npm run build
```

```bash
git push -u origin a/p0-a2-contratos
```

En GitHub abre la solicitud de fusión hacia `main`, pega el informe del agente y pide revisión a B (o a C si es A5). Quien revisa fusiona con **Squash and merge**.

## 6. Cómo se une todo: tu responsabilidad

Tú diriges los cuatro puntos de integración. Procedimiento completo en [T-P0-X1](docs/agentes/tareas/T-P0-X1-integracion-y-publicacion.md). En corto:

1. Avisa 20 minutos antes. Todos suben.
2. Fusiona en orden **A → B → C**.
3. Ejecuta `npm test` y `npm run build`.
4. Cablea en `src/main.ts` lo que haya llegado:

| Llega de | Archivo | Qué exporta |
| --- | --- | --- |
| B | `src/data/index.ts` | `loadGameData()` |
| B | `src/map/index.ts` | `createMapView(parent, ctx)` |
| C | `src/ui/index.ts` | `registerScreens(flow)` |
| C | `src/audio/index.ts` | `createAudio(options)` |
| C | `src/styles/index.css` | estilos |

5. Jugad los tres la ruta del hito.
6. Etiqueta: `git tag h2` y `git push origin h2`.

**Si alguien te pide un cambio de contrato:** hazlo tú, en `types.ts` y en `docs/ARQUITECTURA.md` en el mismo commit, fusiónalo enseguida y avisa para que todos traigan `main`.

## 7. Lo que revisas de B

- Los JSON de `src/data/` coinciden con las tablas de la documentación.
- `sourceRef` de los eventos apunta a registros que existen en el extracto DONKI.
- El mapa no calcula reglas: todo pasa por `previewAction` y `dispatch`.
- Nada fuera de `src/map` importa Phaser.

## 8. Si te atascas

| Problema | Qué hacer |
| --- | --- |
| TypeScript 7 da errores con los tipos de Phaser | Baja a 6.0.3, luego a 5.9.3. Anota la versión en `docs/ARQUITECTURA.md`. |
| Una prueba no reproduce un número de la documentación | No cambies el número. Sigue el cálculo de `ciclo-de-dias.md` paso a paso. Si crees que el documento está mal, háblalo con B. |
| A las 17:30 el núcleo no pasa la prueba del día 8 | No empieces A5. B y C siguen con los datos de prueba. |
| A las 21:00 no hay URL pública | Deja todo lo demás y publica. Es bloqueante. |
| GitHub Pages no despliega | Plan B en [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md). |
| No llegas a A6 completo | Deja al menos el recorrido de Media como prueba. Es el de la demo. |

Cortes generales: [docs/PLAN-EQUIPO.md](docs/PLAN-EQUIPO.md#6-criterios-para-cortar-alcance).

## 9. Lista final (domingo 09:30)

- [ ] `npm test` y `npm run build` en verde en `main`.
- [ ] El recorrido de Media con `?seed=demo` gana el día 9 en la URL pública.
- [ ] La URL pública abre en ventana privada, en inglés, sin errores de consola.
- [ ] El repositorio es público y tiene `LICENSE`.
- [ ] La compilación no incluye el código de depuración.
- [ ] `docs/DESPLIEGUE.md` dice qué comandos están comprobados.
- [ ] Etiqueta `entrega-2026-11-15` creada y subida.
- [ ] C tiene la URL del juego y la del repositorio.
- [ ] Tu uso de IA está anotado en tu sección de [docs/IA-Y-CREDITOS.md](docs/IA-Y-CREDITOS.md).
