// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import { campaignFlow, type AppContext, type Screen } from '../app-bridge';
import { readPortalRequirements } from '../core-bridge';
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
  let closeDialog: (() => void) | undefined;
  bag.add(() => closeDialog?.());

  const paint = (): void => {
    closeDialog?.();
    const body = el('div', 'choice-content');
    const state = ctx.store.getState();
    const requirements = state ? readPortalRequirements(state, ctx.data) : undefined;
    const stay = button({
      label: ctx.t('ui.choice.stay'),
      className: 'choice-option',
      onClick: press(ctx, () => choose(ctx, 'mars'), 'sfx-confirm'),
    });
    const portal = button({
      label: ctx.t('ui.choice.portal'),
      className: 'choice-option',
      disabled: Boolean(requirements?.length),
      onClick: press(ctx, () => {
        closeDialog = openDialog(screen, {
          title: ctx.t('ui.choice.portal'),
          body: ctx.t('ui.choice.portalWarning'),
          confirmLabel: ctx.t('ui.dialog.yes'),
          cancelLabel: ctx.t('ui.dialog.no'),
          onConfirm: () => choose(ctx, 'portal'),
          onCancel: () => undefined,
        });
      }),
    });
    const grid = el('div', 'choice-grid');
    const ring = el('div', 'choice-ring');
    ring.setAttribute('aria-hidden', 'true');
    stay.replaceChildren(el('strong', undefined, ctx.t('ui.choice.stay')), el('span', undefined, ctx.t('ui.choice.stayBody')));
    portal.replaceChildren(el('strong', undefined, ctx.t('ui.choice.portal')), el('span', undefined, ctx.t('ui.choice.portalBody')), ring);
    grid.append(stay, portal);
    body.append(
      el('h1', 'screen-title', ctx.t('ui.choice.heading')),
      el('p', 'note', ctx.t('ui.choice.fiction')),
      grid,
    );
    screen.querySelector('.choice-content')?.remove();
    screen.append(body);
    stay.focus();
  };
  paint();
  bag.add(ctx.options.subscribe(paint));
  return () => bag.run();
}

function choose(ctx: AppContext, choice: 'mars' | 'portal'): void {
  const flow = campaignFlow(ctx.flow);
  if (flow.chooseEnding) {
    flow.chooseEnding(choice);
    return;
  }
  ctx.flow.go('cinematica', { id: choice === 'portal' ? 'wormhole' : 'marsVictory', choice });
}
