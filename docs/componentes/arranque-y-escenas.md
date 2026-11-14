# Arranque y escenas

Fuente canónica del **contrato entre la aplicación y las pantallas**: `AppContext`, `Screen`, `Flow`, `Options` y `AudioApi`.

## 1. Identificación y límites

| Campo | Valor |
| --- | --- |
| ID | C-01 |
| Prioridad · fase | P0 · H1 a H3 |
| Objetivo | Arrancar el juego, conectar las piezas y cambiar de pantalla desde un único sitio. |
| Responsabilidad | `src/main.ts`, `src/app/flow.ts`, `src/app/context.ts`, `src/app/seed.ts`, `src/app/debug.ts` |
| Depende de | [ARQUITECTURA.md](../ARQUITECTURA.md), [persistencia](persistencia.md) |
| No incluye | El contenido de cada pantalla (fichas de menú, HUD, resultados). La simulación. |
| Responsable · revisor | A · C |
| Estado | Propuesto |

## 2. Arquitectura y funcionamiento

### Secuencia de arranque

1. `loadGameData()` valida los datos. Si falla, se muestra una pantalla de error con el archivo y la clave.
2. Se crean almacén, estado de interfaz y opciones (leídas de `ea.options.v1`).
3. Se crean las cadenas (`t`), el audio y el contexto.
4. `createMapView(#map, ctx)` y `registerScreens(flow)`.
5. `flow.go('titulo')`.

### Contratos · `src/app/context.ts`

```ts
export type SceneId =
  | 'arranque' | 'titulo' | 'opciones' | 'dificultad' | 'cinematica'
  | 'mision' | 'pausa' | 'resultado' | 'creditos' | 'despedida'
  | 'eleccion';                                  // P2

export interface Options {
  language: 'en' | 'es';        // por defecto 'en'
  volumeMaster: number;         // 0..100, por defecto 80
  volumeMusic: number;          // por defecto 60
  volumeSfx: number;            // por defecto 80
  muted: boolean;               // false
  subtitles: boolean;           // true
  reducedMotion: boolean;       // por defecto, lo que diga prefers-reduced-motion
  fullscreen: boolean;          // false
  tutorial: boolean;            // true
  learningCheck: boolean;       // true
}

export interface OptionsService {
  get(): Options;
  set<K extends keyof Options>(key: K, value: Options[K]): void;
  reset(): void;
  subscribe(listener: (o: Options) => void): () => void;
}

export interface AudioApi {
  unlock(): void;               // primera interacción del jugador
  playMusic(id: string): void;
  stopMusic(): void;
  playSfx(id: string): void;
}

export interface Screen {
  mount(root: HTMLElement, ctx: AppContext): void;
  unmount(): void;              // quita suscripciones, escuchas y nodos
}

export interface Flow {
  current(): { scene: SceneId; params: Record<string, unknown> };
  register(scene: SceneId, screen: Screen): void;
  go(scene: SceneId, params?: Record<string, unknown>): void;
  back(): void;
  startCampaign(difficulty: DifficultyId): void;
  completeCinematic(id: string): void;   // cerrojo de un solo uso
  hasActiveMission(): boolean;
  subscribe(listener: (e: { from: SceneId; to: SceneId }) => void): () => void;
}

export interface AppContext {
  store: Store;
  uiStore: UiStore;
  flow: Flow;
  options: OptionsService;
  t: (key: string, params?: Record<string, string | number>) => string;
  audio: AudioApi;
  data: GameData;
}
```

### Transiciones permitidas en P0

| Desde | Hacia |
| --- | --- |
| `arranque` | `titulo` |
| `titulo` | `dificultad`, `opciones`, `creditos`, `despedida` |
| `opciones` | la escena anterior (`titulo` o `pausa`) |
| `dificultad` | `titulo`, `cinematica` |
| `cinematica` | `mision` |
| `mision` | `pausa`, `resultado` |
| `pausa` | `mision`, `opciones`, `titulo` |
| `resultado` | `mision`, `creditos`, `titulo` |
| `creditos`, `despedida` | `titulo` |

Una transición fuera de la tabla se ignora y avisa en desarrollo. Diagrama completo con Marte y Tierra en [ARQUITECTURA.md](../ARQUITECTURA.md#9-máquina-de-estados-del-flujo).

### Cambio de escena

`go(to)`: comprueba la tabla → `unmount()` de la actual → vacía `#ui` → `mount(#ui, ctx)` de la nueva → muestra u oculta el mapa → emite `flow/changed` → mueve el foco al primer control de la pantalla.

`flow` escucha al almacén: cuando `mission.result` pasa a tener valor, va a `resultado`.

## 3. Datos y uso

- **Semilla:** `?seed=demo` → `canonical: true`, semilla `EA-DEMO`. `?seed=<texto>` → esa semilla, con variación. Sin parámetro → semilla nueva de 8 caracteres con `crypto.getRandomValues`.
- **Cerrojo de cinemática:** `flow` guarda el id de la reproducción en curso. `completeCinematic(id)` solo actúa si coincide y lo borra. Las llamadas siguientes no hacen nada.
- **Error de datos:** pantalla fija en inglés: "Earth's Angel could not load its data", con el detalle técnico debajo.
- **Depuración:** `debug.ts` solo en desarrollo. Atajo Ctrl+Shift+D abre un panel para saltar a un día, aplicar un plan y ver el estado. No existe en producción.
- **Rendimiento:** montar una pantalla no debe tardar de forma perceptible. Las pantallas no cargan imágenes de forma bloqueante.

### Casos límite

- `go` a la escena actual: no hace nada.
- `startCampaign` con una misión activa: la pantalla que llama ya pidió confirmación.
- Recarga del navegador en P0: vuelve al título. La partida no se conserva hasta P1 ([persistencia](persistencia.md)).
- Una pantalla que lanza un error al montar: `flow` lo captura, lo registra y vuelve al título.

## 4. Implementación delegable

**Tareas:** [T-P0-A1](../agentes/tareas/T-P0-A1-andamiaje.md), [T-P0-A2](../agentes/tareas/T-P0-A2-contratos-y-almacen.md), [T-P0-A5](../agentes/tareas/T-P0-A5-flujo-y-opciones.md).

**Prompt breve:**

```text
Implementa src/app/context.ts con las interfaces exactas de docs/componentes/arranque-y-escenas.md
y src/app/flow.ts con la tabla de transiciones de P0, el cerrojo de completeCinematic y la
suscripción al resultado de la misión. No importes nada de src/ui ni src/map salvo sus puntos
de entrada en src/main.ts.
```

**Pruebas:** U-FLU-01 a U-FLU-05, M-FLU-01, M-FLU-02 y M-ARR-01 en [PRUEBAS.md](../PRUEBAS.md).

**Criterios de aceptación:** recorrido título → resultado → título sin recargar; transición no permitida ignorada; doble `completeCinematic` navega una vez; un fallo de datos muestra la pantalla de error.

**Evidencia:** pruebas en verde y recorrido descrito.

**Terminado cuando:** C monta sus pantallas sin tocar `flow.ts` ni `main.ts`.

**Riesgos:** que una pantalla deje suscripciones vivas al desmontar. Mitigación: cada `mount` guarda sus funciones de limpieza y `unmount` las ejecuta todas.
