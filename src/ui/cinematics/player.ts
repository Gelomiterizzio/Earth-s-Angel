// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
// Playback and framing updated with Codex.

export interface CinematicLayer {
  image: string;
  from: { x: number; y: number; scale: number; opacity: number };
  to: { x: number; y: number; scale: number; opacity: number };
}

export interface CinematicScene {
  durationMs: number;
  captionKey: string;
  background: string;
  layers: CinematicLayer[];
  transition: 'cut' | 'fade';
  sfx?: string;
}

export interface CinematicScript {
  id: string;
  music: string;
  scenes: CinematicScene[];
}

export interface PlayerOptions {
  script: CinematicScript;
  reducedMotion: boolean;
  showSubtitles: () => boolean;
  caption: (key: string) => string;
  onFinish: () => void;
  playSfx: (id: string) => void;
}

const FADE_MS = 400;

export function mountPlayer(stage: HTMLElement, caption: HTMLElement, options: PlayerOptions): () => void {
  const reduce = options.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panels = options.script.scenes.map(createPanel);
  let finished = false;
  let raf = 0;
  let startedAt = 0;
  let hiddenAt: number | null = null;
  let update: FrameRequestCallback;

  const stop = (): void => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVisibility);
  };

  const show = (index: number, previous?: HTMLElement): void => {
    const panel = panels[index];
    if (!panel) {
      stop();
      options.onFinish();
      return;
    }
    const { scene, frame, layers } = panel;
    caption.hidden = !options.showSubtitles();
    caption.textContent = caption.hidden ? '' : options.caption(scene.captionKey);
    frame.style.opacity = previous ? '0' : '1';
    for (const { image, layer } of layers) place(image, reduce ? { ...layer.to, x: 0, y: 0, scale: 1 } : layer.from);
    if (previous) stage.replaceChildren(previous, frame);
    else stage.replaceChildren(frame);
    if (scene.sfx) options.playSfx(scene.sfx);
    startedAt = performance.now();
    update = (now) => {
      if (finished) return;
      const elapsed = Math.max(0, now - startedAt);
      if (previous) {
        frame.style.opacity = String(Math.min(1, elapsed / FADE_MS));
        if (elapsed >= FADE_MS) {
          previous.remove();
          previous = undefined;
        }
      }
      const progress = Math.min(1, elapsed / scene.durationMs);
      if (!reduce) {
        for (const { image, layer } of layers) place(image, mix(layer.from, layer.to, progress));
      }
      if (progress === 1) {
        show(index + 1, !reduce && scene.transition === 'fade' ? frame : undefined);
        return;
      }
      raf = requestAnimationFrame(update);
    };
    if (document.hidden) hiddenAt = startedAt;
    else raf = requestAnimationFrame(update);
  };

  function onVisibility(): void {
    if (document.hidden) {
      hiddenAt = performance.now();
      cancelAnimationFrame(raf);
    } else if (hiddenAt !== null) {
      startedAt += performance.now() - hiddenAt;
      hiddenAt = null;
      raf = requestAnimationFrame(update);
    }
  }

  document.addEventListener('visibilitychange', onVisibility);
  show(0);
  return stop;
}

function createPanel(scene: CinematicScene) {
  const frame = document.createElement('div');
  frame.className = 'cine-panel';
  frame.style.background = scene.background.startsWith('#') ? scene.background : `var(--${scene.background})`;
  const layers = scene.layers.map((layer) => {
    const image = document.createElement('img');
    image.className = 'cine-layer';
    image.alt = '';
    image.decoding = 'async';
    image.addEventListener('error', () => image.remove(), { once: true });
    image.src = `assets/cinematics/${layer.image}`;
    frame.append(image);
    return { image, layer };
  });
  return { scene, frame, layers };
}

function place(image: HTMLImageElement, pose: CinematicLayer['from']): void {
  const margin = Math.max(0, (pose.scale - 1) * 50);
  const x = clamp(pose.x / 12.8, margin);
  const y = clamp(pose.y / 7.2, margin);
  image.style.transform = `translate(${x}%, ${y}%) scale(${pose.scale})`;
  image.style.opacity = String(pose.opacity);
}

function clamp(value: number, margin: number): number {
  return Math.max(-margin, Math.min(margin, value));
}

function mix(from: CinematicLayer['from'], to: CinematicLayer['from'], t: number): CinematicLayer['from'] {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
    opacity: from.opacity + (to.opacity - from.opacity) * t,
  };
}

