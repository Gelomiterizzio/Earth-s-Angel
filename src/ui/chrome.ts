// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext } from './app-bridge';

export function bindChrome(ctx: AppContext): () => void {
  const apply = (): void => {
    const options = ctx.options.get();
    document.documentElement.lang = options.language;
    document.getElementById('stage')?.classList.toggle('reduced-motion', options.reducedMotion);
  };
  apply();
  return ctx.options.subscribe(apply);
}

export function press(ctx: AppContext, action: () => void, sfx = 'sfx-click'): () => void {
  return () => {
    ctx.audio.unlock();
    ctx.audio.playSfx(sfx);
    action();
  };
}

export function demoSeed(): boolean {
  return new URLSearchParams(window.location.search).get('seed') === 'demo';
}

export function showNarrow(parent: HTMLElement, ctx: AppContext): () => void {
  const note = document.createElement('p');
  note.className = 'narrow-note hit';
  const draw = (): void => {
    const narrow = window.innerWidth < 1024;
    note.hidden = !narrow;
    note.textContent = ctx.t('ui.chrome.narrow');
  };
  draw();
  parent.append(note);
  const onResize = (): void => draw();
  window.addEventListener('resize', onResize);
  const off = ctx.options.subscribe(draw);
  return () => {
    window.removeEventListener('resize', onResize);
    off();
    note.remove();
  };
}
