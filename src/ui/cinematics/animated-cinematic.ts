// AI-assisted: OpenAI Codex. Canvas playback for the opening and Mars victory.
import { TILE_PX } from '../../map/art';
import { el } from '../dom';
import { createIntroArt, INTRO_HEIGHT, INTRO_WIDTH, LIFTOFF_SECONDS } from './intro-art';
import { createMarsArrivalArt } from './mars-arrival-art';
import { createMarsVictoryArt } from './mars-victory-art';
import { mountPlayer, type PlayerOptions } from './player';

const SOUND_OFFSET_MS: Readonly<Record<string, number>> = {
  'sfx-launch': LIFTOFF_SECONDS * 1000,
  'sfx-landing': 2_220,
};

export function mountAnimatedCinematic(stage: HTMLElement, caption: HTMLElement, options: PlayerOptions): () => void {
  const isMarsVictory = options.script.id === 'marsVictory';
  const isMarsArrival = options.script.id === 'moonToMars';
  const scale = 3;
  const canvas = el('canvas', 'cine-layer intro-canvas');
  if (isMarsVictory) canvas.classList.add('mars-victory-canvas');
  if (isMarsArrival) canvas.classList.add('mars-arrival-canvas');
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
  const victory = el('div', 'mars-victory-heading');
  const victoryTitle = el('h1');
  const victoryLine = el('p');
  victory.append(victoryTitle, victoryLine);
  victory.hidden = true;
  const countdown = el('p', 'intro-countdown');
  countdown.setAttribute('aria-hidden', 'true');
  countdown.hidden = true;
  const progressBar = el('div', 'intro-progress');
  progressBar.setAttribute('aria-hidden', 'true');
  const progressFill = el('div');
  progressBar.append(progressFill);

  const { scenes } = options.script;
  let duration = 0;
  const cues = scenes.map((scene, index) => {
    const start = duration;
    duration += scene.durationMs;
    const shot = isMarsVictory ? Math.floor(index / 2) : index;
    const titleKey = isMarsArrival ? 'ui.cine.moonToMars.arrivalTitle' : `ui.cine.${options.script.id}.title.${shot + 1}`;
    return { scene, start, shot, titleKey };
  });
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const globe = new Image();
  const logo = new Image();
  if (!isMarsArrival) globe.src = 'assets/ui/earth.png';
  if (!isMarsVictory && !isMarsArrival) logo.src = 'assets/ui/logo.png';

  let frame = 0;
  let startedAt: number | undefined;
  let hiddenAt: number | undefined;
  let activeCue = -1;
  let playedCue = -1;
  let wasStill = false;
  let stopped = false;
  let stopFallback: (() => void) | undefined;
  const art = isMarsArrival ? createMarsArrivalArt(surface, suit)
    : isMarsVictory ? createMarsVictoryArt(surface, suit, globe) : createIntroArt(surface, suit, globe, logo);

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
    const { scene, start, shot, titleKey } = cues[index];
    const text = options.showSubtitles() ? options.caption(scene.captionKey) : '';
    const titleText = options.caption(titleKey);
    if (title.textContent !== titleText) title.textContent = titleText;
    if (caption.textContent !== text) {
      caption.hidden = !text;
      caption.textContent = text;
    }
    const shotChanged = shot !== cues[activeCue]?.shot;
    activeCue = index;
    const soundDelay = isMarsArrival ? 0 : (SOUND_OFFSET_MS[scene.sfx ?? ''] ?? 0);
    if (scene.sfx && index !== playedCue && elapsed - start >= soundDelay) {
      playedCue = index;
      options.playSfx(scene.sfx);
    }
    const still = options.reducedMotion || media.matches;
    const shotStart = isMarsArrival ? 0 : isMarsVictory ? cues[shot * 2].start : start;
    const seconds = (elapsed - shotStart) / 1000;
    const count = !still && scene.sfx === 'sfx-launch' && seconds < LIFTOFF_SECONDS
      ? String(Math.max(1, 3 - Math.floor(seconds * 2.25))) : '';
    if (countdown.textContent !== count) {
      countdown.hidden = !count;
      countdown.textContent = count;
    }
    if (isMarsVictory && shot === 3 && victory.hidden) {
      victoryTitle.textContent = options.caption('ui.cine.marsVictory.banner');
      victoryLine.textContent = options.caption('ui.cine.marsVictory.bannerLine');
      victory.classList.toggle('still', still);
      victory.hidden = false;
    }
    if (!still || shotChanged || !wasStill) {
      art(shot, seconds, still);
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

  const images = isMarsArrival ? [] : isMarsVictory ? [globe] : [globe, logo];
  void Promise.all(images.map((image) => image.decode())).then(() => {
    if (stopped) return;
    caption.classList.add('intro-caption');
    caption.hidden = true;
    stage.classList.add('intro-stage');
    stage.replaceChildren(canvas, title, countdown, caption, progressBar);
    if (isMarsVictory) stage.append(victory);
    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) frame = requestAnimationFrame(draw);
  }, () => {
    if (!stopped) stopFallback = mountPlayer(stage, caption, options);
  });
  return stop;
}
