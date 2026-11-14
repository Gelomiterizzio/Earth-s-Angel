// AI-assisted: OpenAI Codex, Earth's Angel Integrante C
// Visual fixture for the UI preview. It does not dispatch game actions.
import { drawTerrainAccent } from '../../src/map/art';

const cellSize = 24;
const cells = 12;

const atlas = {
  moon: '/assets/sprites/tiles-moon.png',
  mars: '/assets/sprites/tiles-mars.png',
  buildings: '/assets/sprites/buildings.png',
  extras: '/assets/sprites/buildings-p1.png',
  objects: '/assets/sprites/objects.png',
  build: '/assets/sprites/fx-build.png',
  collect: '/assets/sprites/fx-collect.png',
  dust: '/assets/sprites/fx-dust.png',
};

// Lunar board and a central Martian viewport from docs/niveles/.
const terrain = {
  luna: [
    '##...oo...##', '#..m.oo..?.#', '............', '..#.....#...',
    '..........m.', 'o....S......', 'oo......#...', '...m........',
    '.m..#....ii.', '.........ioo', '#.....m...oo', '##........##',
  ],
  marte: [
    '....#.......', '............', '......i.....', '.....ii....#',
    '#...........', '.....S.....m', '............', '.....#.....o',
    '...........o', '..#.........', '........m...', '............',
  ],
};

const buildings = {
  luna: [
    { x: 5, y: 5, frame: 0 }, { x: 3, y: 4, frame: 1 },
    { x: 4, y: 4, frame: 2 }, { x: 6, y: 4, frame: 3 },
    { x: 7, y: 5, frame: 4 }, { x: 9, y: 8, frame: 5 },
    { x: 4, y: 7, frame: 6 }, { x: 6, y: 7, frame: 7 },
    { x: 7, y: 8, frame: 8 },
  ],
  marte: [
    { x: 5, y: 5, frame: 0 }, { x: 3, y: 5, frame: 1 },
    { x: 5, y: 3, frame: 5 }, { x: 6, y: 7, frame: 6 },
    { x: 4, y: 7, frame: 7 }, { x: 3, y: 7, frame: 8 },
  ],
};
const marsBuildings = [
  { x: 8, y: 6, frame: 0 }, { x: 7, y: 4, frame: 1 },
  { x: 9, y: 7, frame: 2 }, { x: 8, y: 5, frame: 3 },
];

const tileIndices: Record<string, number> = { '.': 0, S: 0, '#': 1, o: 2, i: 3, m: 4, '?': 5 };
const objects = [
  { x: 1, y: 5, frame: 0 }, { x: 9, y: 1, frame: 1 }, { x: 8, y: 9, frame: 2 },
];
const effects = {
  build: { duration: 400, luna: [7, 8], marte: [3, 7] },
  collect: { duration: 300, luna: [3, 7], marte: [8, 10] },
  dust: { duration: 500, luna: [3, 4], marte: [3, 5] },
};

type Scene = 'luna' | 'marte';
type Effect = keyof typeof effects;
type Atlas = keyof typeof atlas;
type PreviewContext = {
  flow: {
    current: () => { scene: string };
    subscribe: (listener: () => void) => unknown;
  };
  options: {
    get: () => { language: string; reducedMotion: boolean };
    subscribe: (listener: () => void) => unknown;
  };
  audio: { unlock: () => void; playSfx: (id: string) => void };
  store: { getState: () => { mission: { level: string } } | null };
};

const copy = {
  en: {
    luna: 'Moon', marte: 'Mars', preview: 'Art preview · {level}',
    scene: 'Sample terrain tiles, structures and resources on {level}',
    build: 'Build effect', collect: 'Collect effect', dust: 'Dust effect',
  },
  es: {
    luna: 'Luna', marte: 'Marte', preview: 'Vista de arte · {level}',
    scene: 'Muestra de terreno, estructuras y recursos en {level}',
    build: 'Efecto de construcción', collect: 'Efecto de recolección', dust: 'Efecto de polvo',
  },
};

export function mountPreviewMap(root: HTMLElement | null, ctx: PreviewContext): void {
  if (!root) return;
  root.classList.add('preview-map');
  root.tabIndex = 0;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = cellSize * cells;
  canvas.setAttribute('role', 'img');
  const g = canvas.getContext('2d');
  if (!g) return;
  g.imageSmoothingEnabled = false;
  const mapRoot = root;
  const renderer = g;

  const title = document.createElement('span');
  title.className = 'preview-map-title';
  const controls = document.createElement('div');
  controls.className = 'preview-map-effects';

  let level: Scene = 'luna';
  let animation = 0;
  let active: { name: Effect; started: number } | null = null;
  const images = new Map<Atlas, HTMLImageElement>();

  function frame(key: Atlas, index: number, x: number, y: number, height = cellSize): void {
    const img = images.get(key);
    if (!img?.complete || !img.naturalWidth) return;
    renderer.drawImage(img, index * cellSize, 0, cellSize, height, x * cellSize, (y + 1) * cellSize - height, cellSize, height);
  }

  function paint(now: number): void {
    if (mapRoot.hidden) return;
    const lunar = level === 'luna';
    const tiles = lunar ? 'moon' : 'mars';
    renderer.clearRect(0, 0, canvas.width, canvas.height);
    terrain[level].forEach((row, y) => [...row].forEach((tile, x) => {
      frame(tiles, tileIndices[tile] ?? 0, x, y);
      if (tile === '.' || tile === 'S') drawTerrainAccent(renderer, !lunar, x, y);
      if ((x < 2 && y < 3) || (x > 9 && y > 8)) frame(tiles, 6, x, y);
    }));
    // Bottom edges in the same row share an anchor. Paint back rows first.
    const structures = buildings[level].map((item) => ({ ...item, atlas: 'buildings' as const }));
    const extras = lunar ? [] : marsBuildings.map((item) => ({ ...item, atlas: 'extras' as const }));
    [...structures, ...extras].sort((a, b) => a.y - b.y).forEach((item) =>
      frame(item.atlas, item.frame, item.x, item.y, 32));
    if (lunar) objects.forEach((item) => frame('objects', item.frame, item.x, item.y));

    if (!active) return;
    const effect = effects[active.name];
    const elapsed = now - active.started;
    if (elapsed >= effect.duration) {
      active = null;
      return;
    }
    const index = ctx.options.get().reducedMotion ? 1 : Math.floor(elapsed * 4 / effect.duration);
    const [x, y] = effect[level];
    frame(active.name, index, x, y);
  }
  function animate(now: number): void {
    paint(now);
    animation = active ? requestAnimationFrame(animate) : 0;
  }

  const buttons = (Object.keys(effects) as Effect[]).map((name) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.addEventListener('click', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx(`sfx-${name}`);
      cancelAnimationFrame(animation);
      active = { name, started: performance.now() };
      animate(active.started);
    });
    controls.append(button);
    return { name, button };
  });

  function sync(): void {
    const scene = ctx.flow.current().scene;
    const mission = ctx.store.getState()?.mission.level;
    const visible = (scene === 'mision' || scene === 'pausa') && (mission === 'luna' || mission === 'marte');
    mapRoot.hidden = !visible;
    if (!visible || level !== mission || scene !== 'mision') {
      cancelAnimationFrame(animation);
      active = null;
    }
    if (!visible) return;
    level = mission;
    const strings = copy[ctx.options.get().language === 'es' ? 'es' : 'en'];
    title.textContent = strings.preview.replace('{level}', strings[level]);
    canvas.setAttribute('aria-label', strings.scene.replace('{level}', strings[level]));
    buttons.forEach(({ name, button }) => {
      button.textContent = strings[name];
      button.hidden = name === 'dust' && level === 'luna';
    });
    paint(performance.now());
  }

  root.replaceChildren(canvas, title, controls);
  for (const key of Object.keys(atlas) as Atlas[]) {
    const img = new Image();
    images.set(key, img);
    img.addEventListener('load', () => paint(performance.now()), { once: true });
    img.src = atlas[key];
  }
  ctx.flow.subscribe(sync);
  ctx.options.subscribe(sync);
  sync();
}
