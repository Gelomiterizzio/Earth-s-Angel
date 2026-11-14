# Despliegue

Cómo preparar, ejecutar, probar, compilar y publicar Earth's Angel. Es la **fuente canónica de los comandos**.

## 1. Qué está comprobado y qué no

| Comando o hecho | Estado | Detalle |
| --- | --- | --- |
| `npm ci` | Comprobado | Instalación limpia del lockfile. TypeScript 5.9.3, Vite 8.3.8 y Vitest 5.1.0. |
| `npm test` | Comprobado | 22 archivos y 132 pruebas. |
| `npm run build` | Comprobado | TypeScript y Vite generan `dist/`. |
| Compilación local en subcarpeta | Comprobada en Chrome | Build servido desde `/Earth-s-Angel/` a 1366 × 768 y 1280 × 720. Apertura completa y salto con teclado y botón. En Media con `?seed=demo`: construcción, exploración, recolección, informe, refugio en el día 8 con el registro DONKI y victoria en el día 9. Derrota y reinicio verificados en español. |
| Flujo de GitHub Pages | Configurado, pendiente de publicar | `.github/workflows/deploy.yml`. |

## 2. Requisitos

- Git.
- Node.js 20.19 o posterior de la rama 20, o 22.12 o posterior. Recomendado: 24.
- Un navegador de escritorio: Chrome, Firefox o Edge.
- Sin claves, sin cuentas de terceros, sin variables de entorno.

Ejecuta los comandos desde la raíz que contiene `package.json`. La carpeta `Integrante A y B/` queda como copia de origen y está excluida de Git.

## 3. Preparación

```bash
git clone https://github.com/Gelomiterizzio/Earth-s-Angel.git earths-angel
```

```bash
cd earths-angel
```

```bash
npm ci
```

## Vista previa de interfaz

Desde la raíz, ejecuta el servidor Node y abre la vista previa con Chrome, Edge o Firefox.

```bash
node tests/ui/serve.mjs
```

[Abrir vista previa local](http://127.0.0.1:4173/tests/ui/preview.html).

Si el puerto 4173 está ocupado, ejecuta `node tests/ui/serve.mjs 0` y abre la URL que imprime el servidor.

- **Nueva partida** → dificultad → apertura → interfaz lunar del día 1. El control **Saltar (Intro)** responde al clic o a Enter. La pregunta inicial de aprendizaje tiene su propio botón **Omitir**.
- Con `?day=8` puedes abrir la muestra lunar del día 8 y probar un informe. El mapa de arte incluye controles de construcción y recolección para reproducir los efectos.
- Con `?cinematic=moonToMars`, inicia una partida para pasar por el manifiesto y la secuencia que lleva a la muestra de Marte. Marte incluye un control adicional para probar el polvo.
- Con `?cinematic=marsVictory`, `?cinematic=wormhole` o `?cinematic=earthVictory`, inicia una partida para abrir esas secuencias. Sus destinos de prueba son Créditos, la pantalla de Tierra pendiente de simulación y Créditos, respectivamente.

`tests/ui/preview-bundle.js` se incluye listo para servir. Si cambias TypeScript o un guion JSON, vuelve a generarlo con un esbuild instalado aparte. `ESBUILD_MAIN` acepta la ruta absoluta a `esbuild/lib/main.js`.

```powershell
$env:ESBUILD_MAIN = 'C:/ruta/a/esbuild/lib/main.js'
node tests/ui/bundle.mjs
```

Comprobado en Chrome a 1366 × 768 y 1280 × 720. Se recorrió la apertura de principio a fin, se probó saltarla con botón y teclado, se abrieron los destinos de las cinco secuencias y se verificó la carga de los PNG y el audio Web Audio. El arnés usa datos de prueba para revisar arte y cinemáticas. El build de producción ejecuta la simulación lunar de P0. Marte y Tierra quedan como muestras.

## 4. Ejecución en desarrollo

```bash
npm run dev
```

Abre la URL que indica Vite, normalmente `http://localhost:5173`. El juego guarda preferencias en el navegador y conserva la partida mientras la pestaña está abierta.

Parámetros útiles en la URL:

| Parámetro | Efecto |
| --- | --- |
| `?seed=demo` | Programa de eventos canónico. Es el de las pruebas y la demo |
| `?seed=<texto>` | Esa semilla, con variación |

Con Ctrl+Mayús+D se abre el panel de depuración. Solo existe en desarrollo.

## 5. Pruebas

```bash
npm test
```

```bash
npm run test:watch
```

Plan completo y vectores esperados: [PRUEBAS.md](PRUEBAS.md).

## 6. Compilación

```bash
npm run build
```

Comprueba los tipos y genera el sitio estático en `dist/`. Para verlo tal como quedará publicado:

```bash
npm run preview
```

`vite.config.ts` usa `base: './'`. Las rutas son relativas, así que el sitio funciona en cualquier subcarpeta.

## 7. Publicación

### Opción principal · GitHub Pages con GitHub Actions

Cada cambio en `main` prueba, compila y publica. El flujo `.github/workflows/deploy.yml` de A está incluido. Su primera ejecución pública queda pendiente.

```yaml
name: Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Pasos manuales, una vez:

1. El repositorio debe ser **público**.
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Subir a `main` y esperar a que termine la ejecución en la pestaña **Actions**.
4. URL prevista: `https://gelomiterizzio.github.io/Earth-s-Angel/` · `[POR COMPLETAR: confirmar la URL real]`

No se usa la opción "publicar desde la carpeta `/docs`": esa carpeta contiene la documentación.

### Plan B · rama `gh-pages`

Si las acciones fallan. Previsto, **sin ejecutar**.

```bash
npm run build
```

```bash
npx gh-pages -d dist
```

Después: **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**. `npx` descarga la herramienta para esa ejecución y no la añade al proyecto.

### Plan C · otro alojamiento estático

Subir la carpeta `dist/` a cualquier servicio de sitios estáticos que dé una URL pública sin registro para quien la visita. Solo si A y B fallan. Anotar aquí cuál se usó.

## 8. Comprobación tras publicar

- [ ] La URL abre en una **ventana privada**, sin iniciar sesión.
- [ ] Aparece en **inglés**.
- [ ] La consola no muestra errores ni rutas con 404.
- [ ] `?seed=demo` en Media gana el día 9.
- [ ] Abre desde un teléfono con datos móviles, aunque el juego sea de escritorio.
- [ ] La compilación no incluye el panel de depuración ni datos de prueba.
- [ ] La versión publicada coincide con la etiqueta de Git.

## 9. Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| Página en blanco tras publicar | Rutas absolutas | Comprobar `base: './'` |
| Imágenes o audio con 404 | Ruta que no empieza en `assets/` o mayúsculas distintas | GitHub Pages distingue mayúsculas |
| Se ve una versión antigua | Caché | Recargar con Ctrl+F5 |
| `tsc` falla en los tipos de Phaser | TypeScript 7 | Bajar a 6.0.3 y luego a 5.9.3; anotarlo en [ARQUITECTURA.md](ARQUITECTURA.md#1-stack) |
| `npm ci` falla en Actions | Falta `package-lock.json` en el repositorio | Subirlo |
| El flujo no puede publicar | Pages sin activar o permisos | Revisar el paso 2 de la opción principal |
| El sitio no abre en la red de quien evalúa | Filtro web | La guía de entrega recomienda pedir clasificación en FortiGuard. Es opcional |

## 10. Versión de entrega

Tras la congelación del domingo a las 09:30:

```bash
git tag entrega-2026-11-15
```

```bash
git push origin entrega-2026-11-15
```

En el formulario van dos enlaces distintos: la demo y el proyecto final. Detalle en [ENTREGA.md](ENTREGA.md).
