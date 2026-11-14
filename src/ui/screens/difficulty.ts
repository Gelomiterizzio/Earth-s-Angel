// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext, Screen } from '../app-bridge';
import type { DifficultyId } from '../core-bridge';
import { button } from '../components/button';
import { statusBadge } from '../components/status-badge';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el, on } from '../dom';

const ORDER: DifficultyId[] = ['facil', 'media', 'imposible'];
const STATUS = { facil: 'seguro', media: 'preventivo', imposible: 'critico' } as const;

let cleanup: (() => void) | null = null;

export const difficultyScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountDifficulty(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountDifficulty(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());
  let locked = false;

  const body = el('div', 'screen screen-menu');
  body.style.position = 'absolute';
  body.style.inset = '0';
  screen.append(body);
  screen.classList.remove('screen-menu');

  const paint = (): void => {
    body.replaceChildren();
    body.append(el('h1', 'screen-title', ctx.t('ui.difficulty.heading')));
    const grid = el('div', 'diff-grid');
    for (const id of ORDER) grid.append(card(ctx, id, () => choose(id)));
    const back = button({
      label: ctx.t('ui.difficulty.back'),
      onClick: press(ctx, () => ctx.flow.go('titulo')),
    });
    body.append(grid, el('p', 'note', ctx.t('ui.difficulty.note')), back);
    grid.querySelector('button')?.focus();
  };

  function choose(id: DifficultyId): void {
    if (locked) return;
    locked = true;
    for (const node of screen.querySelectorAll('button')) node.disabled = true;
    ctx.audio.unlock();
    ctx.audio.playSfx('sfx-confirm');
    ctx.flow.startCampaign(id);
  }

  bag.add(on(screen, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      ctx.flow.go('titulo');
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const cards = [...screen.querySelectorAll<HTMLButtonElement>('.diff-card')];
    const index = cards.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? (index + 1) % cards.length : (index - 1 + cards.length) % cards.length;
    cards[next]?.focus();
  }));
  paint();
  bag.add(ctx.options.subscribe(() => {
    if (!locked) paint();
  }));
  ctx.audio.playMusic('music-menu');
  return () => bag.run();
}

function card(ctx: AppContext, id: DifficultyId, onClick: () => void): HTMLButtonElement {
  const level = ctx.data.difficulty[id]?.levels.luna;
  const storm = level?.events.find((event) => event.type === 'tormenta-solar');
  const node = button({ label: '', className: 'diff-card', onClick: press(ctx, onClick, 'sfx-click') });
  node.replaceChildren();
  const status = STATUS[id];
  node.append(
    statusBadge(status, ctx.t(`ui.status.${status}`), ctx.t(`ui.status.mark.${status}`)),
    el('span', undefined, ctx.t(`ui.difficulty.stars.${id}`)),
    el('strong', undefined, ctx.t(`ui.difficulty.${id}.name`)),
    el('span', 'who', ctx.t(`ui.difficulty.${id}.who`)),
    el('span', undefined, level?.dayLimit == null
      ? ctx.t('ui.difficulty.windowOpen')
      : ctx.t('ui.difficulty.window', { days: level.dayLimit })),
    el('span', undefined, storm
      ? ctx.t(storm.durationDays === 1 ? 'ui.difficulty.stormOne' : 'ui.difficulty.stormMany', {
          level: ctx.t(`ui.difficulty.radiation.${storm.radiationLevel ?? 0}`),
          days: storm.durationDays,
        })
      : ctx.t('ui.difficulty.stormUnknown')),
    el('span', undefined, ctx.t('ui.difficulty.streak', { days: level?.streakDays ?? '—' })),
  );
  return node;
}
