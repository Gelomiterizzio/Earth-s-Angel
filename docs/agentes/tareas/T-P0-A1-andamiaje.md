# T-P0-A1 · Andamiaje, configuración y primera publicación

| Campo | Valor |
| --- | --- |
| ID | T-P0-A1 |
| Prioridad · hito | P0 · H1 |
| Perfil recomendado | [Motor](../prompts/motor.md) |
| Responsable · revisor | A · C |
| Base Git | Directo en `main`. Es el primer commit de código. Después, ramas. |
| Estimación | 1,0 h |
| Estado | propuesto |

## Objetivo

El repositorio instala, arranca, prueba, compila y se publica en una URL pública, aunque solo muestre una página de marcador.

## Componentes

[arranque-y-escenas](../../componentes/arranque-y-escenas.md) · [DESPLIEGUE.md](../../DESPLIEGUE.md)

## Contexto a leer

1. [ARQUITECTURA.md](../../ARQUITECTURA.md), secciones 1 a 3
2. [DESPLIEGUE.md](../../DESPLIEGUE.md)
3. [PROTOCOLO-INTEGRACION.md](../PROTOCOLO-INTEGRACION.md)

## Dependencias

Ninguna. La esperan A2 y todas las tareas que necesitan ejecutar el proyecto.

## Rutas

- **Permitidas:** `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`, `src/main.ts`, `src/vite-env.d.ts`, `tests/smoke.test.ts`, `LICENSE`, `.github/workflows/deploy.yml`, sección de comandos comprobados de `docs/DESPLIEGUE.md`, tabla de versiones de `docs/ARQUITECTURA.md`.
- **Excluidas:** `src/ui`, `src/styles`, `src/map`, `src/audio`, `src/data`, `public/assets`. No crees archivos en carpetas de B o C: evitan conflictos al fusionar.

## Contratos

- `index.html`: `<html lang="en">`, `<div id="stage"><div id="map"></div><div id="ui"></div></div>`.
- `vite.config.ts`: `base: './'`.
- Guiones de `package.json`: `dev`, `build`, `preview`, `test`, `test:watch`.

## Pasos de implementación

1. `npm init -y` y ajustar nombre (`earths-angel`), `"type": "module"`, `"private": true`.
2. Instalar versiones exactas:
   - `npm install --save-exact phaser@3.90.0`
   - `npm install --save-dev --save-exact vite@8.3.8 typescript@7.0.2 vitest@5.1.0`
3. Guiones: `"dev": "vite"`, `"build": "tsc --noEmit && vite build"`, `"preview": "vite preview"`, `"test": "vitest run"`, `"test:watch": "vitest"`.
4. `tsconfig.json`: `strict`, `target` y `module` ES2022, `moduleResolution: "bundler"`, `resolveJsonModule`, `skipLibCheck`, `noEmit`, `include: ["src", "tests"]`.
5. `vite.config.ts` con `base: './'` y bloque `test` de Vitest con `environment: 'node'`.
6. `index.html` con la estructura del contrato y un estilo mínimo en línea: fondo oscuro, `#stage` centrado en 16:9.
7. `src/main.ts`: arranca una escena Phaser de 288 × 288 dentro de `#map` que dibuja una cuadrícula de 12 × 12 y el texto "Earth's Angel". Solo para comprobar que Phaser funciona.
8. `tests/smoke.test.ts`: una prueba trivial.
9. `.gitignore`: `node_modules`, `dist`, `.env*`, `*.local`.
10. `.github/workflows/deploy.yml`: compilar y publicar `dist` en GitHub Pages con las acciones oficiales. Detalle en [DESPLIEGUE.md](../../DESPLIEGUE.md).
11. `LICENSE` con la licencia que elija el equipo. Si no han decidido, deja el archivo pendiente y anótalo.
12. Ejecutar `npm run dev`, `npm test`, `npm run build`, `npm run preview`.
13. Subir a `main`. Una persona con permisos activa Pages: Settings → Pages → Source: GitHub Actions.
14. Anotar en [DESPLIEGUE.md](../../DESPLIEGUE.md) qué comandos quedaron comprobados y con qué versiones.

**Si TypeScript 7.0.2 da errores con los tipos de Phaser:** prueba 6.0.3 y después 5.9.3. Anota la versión que funcione en la tabla de [ARQUITECTURA.md](../../ARQUITECTURA.md#1-stack).

## Entregables

- Proyecto que instala, arranca, prueba y compila.
- URL pública con la página de marcador.
- `DESPLIEGUE.md` con los comandos marcados como comprobados.

## Pruebas

- Automática: `tests/smoke.test.ts`.
- Manual M-ARR-01: la URL pública abre en ventana privada sin errores de consola.

## Criterios de aceptación

- [ ] `npm install` termina sin errores en una copia limpia.
- [ ] `npm run dev` muestra la cuadrícula y el título.
- [ ] `npm test` pasa.
- [ ] `npm run build` genera `dist/` y `npm run preview` lo sirve.
- [ ] La URL pública muestra lo mismo que la vista previa.
- [ ] `git status` no lista `node_modules` ni `dist`.

## Evidencia

Salida de los cuatro comandos y la URL pública.

## Condiciones de integración

Fusionado en `main` antes de las 13:30 del sábado. Aviso al equipo para que todos traigan `main`.

## Informe final

Usa el formato de la [plantilla](../PLANTILLA-TAREA.md#informe-final). Incluye las versiones exactas instaladas y la URL pública.
