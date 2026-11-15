// AI-assisted: OpenAI Codex (GPT-6). Team review pending.
import type { AppContext } from '../../app/context';
import type { SuitRole } from '../../map/astronaut-art';
import { el } from '../dom';
import { createLunarSecretArt } from './lunar-secret-art';
import { createLunarSecretScore } from './lunar-secret-score';
import './lunar-secret.css';

const DURATION = 50;
const ART_WIDTH = 320;
const ART_HEIGHT = 180;

export function openLunarSecret(ctx: AppContext, role: SuitRole, restoreFocus: HTMLElement): () => void {
  const dialog = el('dialog', 'lunar-secret');
  dialog.dataset.lunarSecret = '';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', ctx.t('ui.lunarSecret.title'));

  const picture = el('div', 'lunar-secret-picture');
  const art = el('canvas', 'lunar-secret-pixels');
  const lettering = el('canvas');
  for (const canvas of [art, lettering]) {
    canvas.width = ART_WIDTH;
    canvas.height = ART_HEIGHT;
    canvas.setAttribute('aria-hidden', 'true');
  }
  picture.append(art, lettering);

  const announcement = el('p', 'lunar-secret-announcement');
  announcement.setAttribute('aria-live', 'polite');
  const controls = el('div', 'lunar-secret-controls');
  const skip = el('button', 'btn', ctx.t('ui.lunarSecret.skip'));
  skip.type = 'button';
  skip.autofocus = true;
  skip.setAttribute('aria-keyshortcuts', 'Enter Escape');
  controls.append(skip);
  dialog.append(picture, controls, announcement);
  (restoreFocus.closest('#stage') ?? document.body).append(dialog);
  dialog.showModal();

  const options = ctx.options.get();
  const reduce = options.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paint = createLunarSecretArt(art, lettering, role, ctx.t, reduce, (text) => {
    announcement.textContent = text;
  });
  const volume = options.muted ? 0 : (options.volumeMaster * options.volumeMusic) / 10_000;
  const score = createLunarSecretScore(volume);
  let elapsed = 0;
  let resumedAt: number | null = null;
  let frame = 0;
  let closed = false;
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;

  function resize() {
    if (closed) return;
    const { width, height } = picture.getBoundingClientRect();
    const density = window.devicePixelRatio || 1;
    lettering.width = Math.round(width * density) || ART_WIDTH;
    lettering.height = Math.round(height * density) || ART_HEIGHT;
    paint(elapsed);
  }

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', syncPlayback);
    score.dispose();
    dialog.close();
    dialog.remove();
    if (ctx.flow.current().scene === 'mision' && ctx.store.getState()?.mission.level === 'luna') {
      ctx.audio.playMusic('music-moon');
      if (restoreFocus.isConnected && !restoreFocus.hidden) restoreFocus.focus({ preventScroll: true });
    }
  }

  function draw(now: number) {
    if (resumedAt === null || closed) return;
    elapsed += (now - resumedAt) / 1000;
    resumedAt = now;
    if (elapsed >= DURATION) {
      close();
      return;
    }
    paint(elapsed);
    frame = requestAnimationFrame(draw);
  }

  function syncPlayback() {
    if (document.hidden) {
      if (resumedAt !== null) elapsed += (performance.now() - resumedAt) / 1000;
      resumedAt = null;
      cancelAnimationFrame(frame);
      score.stop();
    } else if (resumedAt === null && !closed) {
      resumedAt = performance.now();
      score.start(elapsed);
      frame = requestAnimationFrame(draw);
    }
  }

  skip.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  });
  observer?.observe(picture);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', syncPlayback);
  void document.fonts?.load('700 12px "Pixelify Sans"').then(() => {
    if (!closed) paint(elapsed);
  }).catch(() => undefined);
  resize();
  ctx.audio.stopMusic();
  syncPlayback();
  return close;
}
