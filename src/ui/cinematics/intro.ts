// AI-assisted: OpenAI Codex. Uses the opening script and game artwork.
import { TILE_PX } from '../../map/art';
import { el } from '../dom';
import { createIntroArt, INTRO_HEIGHT, INTRO_WIDTH, LIFTOFF_SECONDS } from './intro-art';
import { mountPlayer, type PlayerOptions } from './player';

const SOUND_OFFSET_MS: Readonly<Record<string, number>> = {
  'sfx-launch': LIFTOFF_SECONDS * 1000,
  'sfx-landing': 2_220,
};

export function mountAnimatedIntro(stage: HTMLElement, caption: HTMLElement, options: PlayerOptions): () => void {
  const scale = 3;
  const canvas = el('canvas', 'cine-layer intro-canvas');
  canvas.width = INTRO_WIDTH * scale;
  canvas.height = INTRO_HEIGHT * scale;
  canvas.setAttribute('aria-hidden', 'true');
  const sprite = el('canvas');
  sprite.width = sprite.height = TILE_PX;
  const surface = canvas.getContext('2d');
  const suit = sprite.getContext('2d');
  if (!surface || !suit) return mountPlayer(stage, caption, options);
  surface.scale(scale, scale);

  const title = el('p', 'intro-title');
  const countdown = el('p', 'intro-countdown');
  countdown.setAttribute('aria-hidden', 'true');
  countdown.hidden = true;
  const progressBar = el('div', 'intro-progress');
  progressBar.setAttribute('aria-hidden', 'true');
  const progressFill = el('div');
  progressBar.append(progressFill);

  const { scenes } = options.script;
  const cues = scenes.map((scene, index) => ({
    scene,
    titleKey: `ui.cine.intro.title.${index + 1}`,
    start: scenes.slice(0, index).reduce((total, item) => total + item.durationMs, 0),
  }));
  const duration = cues.reduce((total, { scene }) => total + scene.durationMs, 0);
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const globe = new Image();
  const logo = new Image();
  globe.src = 'assets/ui/earth.png';
  logo.src = 'assets/ui/logo.png';

  let frame = 0;
  let startedAt: number | undefined;
  let hiddenAt: number | undefined;
  let activeCue = -1;
  let playedCue = -1;
  let wasStill = false;
  let stopped = false;
  let stopFallback: (() => void) | undefined;
  const art = createIntroArt(surface, suit, globe, logo);

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    stopFallback?.();
    document.removeEventListener('visibilitychange', onVisibility);
  };

  function draw(now: number): void {
    if (stopped) return;
    startedAt ??= now;
    const elapsed = now - startedAt;
    if (elapsed >= duration) {
      stop();
      options.onFinish();
      return;
    }
    let index = Math.max(0, activeCue);
    while (cues[index + 1]?.start <= elapsed) index++;
    const { scene, start, titleKey } = cues[index];
    const text = options.showSubtitles() ? options.caption(scene.captionKey) : '';
    const titleText = options.caption(titleKey);
    if (title.textContent !== titleText) title.textContent = titleText;
    if (caption.textContent !== text) {
      caption.hidden = !text;
      caption.textContent = text;
    }
    const sceneChanged = index !== activeCue;
    activeCue = index;
    if (scene.sfx && index !== playedCue && elapsed - start >= (SOUND_OFFSET_MS[scene.sfx] ?? 0)) {
      playedCue = index;
      options.playSfx(scene.sfx);
    }
    const still = options.reducedMotion || media.matches;
    const seconds = (elapsed - start) / 1000;
    const count = !still && scene.sfx === 'sfx-launch' && seconds < LIFTOFF_SECONDS
      ? String(Math.max(1, 3 - Math.floor(seconds * 2.25))) : '';
    if (countdown.textContent !== count) {
      countdown.hidden = !count;
      countdown.textContent = count;
    }
    if (!still || sceneChanged || !wasStill) {
      art(index, seconds, still);
      progressFill.style.transform = `scaleX(${(still ? start : elapsed) / duration})`;
    }
    wasStill = still;
    frame = requestAnimationFrame(draw);
  }

  function onVisibility(): void {
    if (document.hidden) {
      hiddenAt = performance.now();
      cancelAnimationFrame(frame);
    } else {
      if (hiddenAt !== undefined && startedAt !== undefined) startedAt += performance.now() - hiddenAt;
      hiddenAt = undefined;
      frame = requestAnimationFrame(draw);
    }
  }

  void Promise.all([globe.decode(), logo.decode()]).then(() => {
    if (stopped) return;
    caption.classList.add('intro-caption');
    caption.hidden = true;
    stage.classList.add('intro-stage');
    stage.replaceChildren(canvas, title, countdown, caption, progressBar);
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) frame = requestAnimationFrame(draw);
  }, () => {
    if (!stopped) stopFallback = mountPlayer(stage, caption, options);
  });
  return stop;
}
