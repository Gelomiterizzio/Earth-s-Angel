// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AppContext, Screen } from '../app-bridge';
import type { CampaignState } from '../core-bridge';
import { button } from '../components/button';
import { openDialog } from '../components/dialog';
import { bindChrome, press } from '../chrome';
import { cleaner, el, on } from '../dom';

let cleanup: (() => void) | null = null;

export const pauseScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountPause(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountPause(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(() => screen.remove());

  const paint = (): void => {
    screen.replaceChildren();
    const resume = button({
      label: ctx.t('ui.pause.resume'),
      className: 'btn-primary',
      onClick: press(ctx, () => ctx.flow.go('mision')),
    });
    const options = button({
      label: ctx.t('ui.pause.options'),
      onClick: press(ctx, () => ctx.flow.go('opciones')),
    });
    const retry = button({
      label: ctx.t('ui.pause.retry'),
      onClick: press(ctx, () => confirm(ctx, screen, 'ui.pause.confirmRetry', () => {
        const result = ctx.store.dispatch({ type: 'RESTART_MISSION' });
        if (result.ok) ctx.flow.go('mision');
      })),
    });
    const exit = button({
      label: ctx.t('ui.pause.exit'),
      onClick: press(ctx, () => confirm(ctx, screen, 'ui.pause.confirmExit', () => ctx.flow.go('titulo'))),
    });
    resume.dataset.icon = '▶';
    options.dataset.icon = '⚙';
    retry.dataset.icon = '↻';
    exit.dataset.icon = '⏏';
    exit.classList.add('pause-exit');
    const actions = el('div', 'menu-actions pause-actions');
    actions.append(resume, options);
    const state: CampaignState | null = ctx.store.getState();
    if (state?.campaign.level !== 'tierra') actions.append(retry);
    actions.append(exit);
    const card = el('div', 'pause-card');
    const head = el('div', 'pause-head');
    head.append(el('h1', 'screen-title', ctx.t('ui.pause.heading')));
    const day = state?.mission.day;
    if (day !== undefined) {
      const chip = el('span', 'pause-day', ctx.t(state?.mission.level === 'marte' ? 'ui.report.solTitle' : 'ui.report.title', { day }));
      head.append(chip);
    }
    card.append(head, el('p', 'pause-subtitle', ctx.t('ui.pause.subtitle')), actions);
    screen.append(card);
    resume.focus();
  };
  paint();
  bag.add(ctx.options.subscribe(paint));
  bag.add(on(screen, 'keydown', (event) => {
    if (event.key === 'Escape' && !document.querySelector('[role="dialog"]')) {
      event.preventDefault();
      ctx.flow.go('mision');
    }
  }));
  return () => bag.run();
}

function confirm(ctx: AppContext, screen: HTMLElement, bodyKey: string, action: () => void): void {
  openDialog(screen, {
    title: ctx.t('ui.dialog.confirm'),
    body: ctx.t(bodyKey),
    confirmLabel: ctx.t('ui.dialog.yes'),
    cancelLabel: ctx.t('ui.dialog.no'),
    onConfirm: () => {
      ctx.audio.playSfx('sfx-confirm');
      action();
    },
    onCancel: () => undefined,
  });
}
