// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext, Screen } from '../app-bridge';
import { button } from '../components/button';
import { openDialog } from '../components/dialog';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el } from '../dom';

let cleanup: (() => void) | null = null;

export const choiceScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountChoice(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountChoice(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());

  const paint = (): void => {
    screen.replaceChildren();
    const stay = button({
      label: ctx.t('ui.choice.stay'),
      className: 'choice-option',
      onClick: press(ctx, () => choose(ctx, 'mars'), 'sfx-confirm'),
    });
    const portal = button({
      label: ctx.t('ui.choice.portal'),
      className: 'choice-option',
      onClick: press(ctx, () => {
        openDialog(screen, {
          title: ctx.t('ui.choice.portal'),
          body: ctx.t('ui.choice.portalWarning'),
          confirmLabel: ctx.t('ui.dialog.yes'),
          cancelLabel: ctx.t('ui.dialog.no'),
          onConfirm: () => {
            ctx.audio.playSfx('sfx-portal');
            choose(ctx, 'portal');
          },
          onCancel: () => undefined,
        });
      }),
    });
    const grid = el('div', 'choice-grid');
    const ring = el('div', 'choice-ring');
    ring.setAttribute('aria-hidden', 'true');
    stay.append(el('span', undefined, ctx.t('ui.choice.stayBody')));
    portal.prepend(ring);
    portal.append(el('span', undefined, ctx.t('ui.choice.portalBody')));
    grid.append(stay, portal);
    screen.append(
      el('h1', 'screen-title', ctx.t('ui.choice.heading')),
      el('p', 'note', ctx.t('ui.choice.fiction')),
      grid,
    );
    stay.focus();
  };
  paint();
  bag.add(ctx.options.subscribe(paint));
  return () => bag.run();
}

function choose(ctx: AppContext, choice: 'mars' | 'portal'): void {
  const flow = ctx.flow as AppContext['flow'] & { chooseEnding?: (ending: 'mars' | 'portal') => void };
  if (flow.chooseEnding) {
    flow.chooseEnding(choice);
    return;
  }
  ctx.flow.go('cinematica', { id: choice === 'portal' ? 'wormhole' : 'marsVictory', choice });
}
