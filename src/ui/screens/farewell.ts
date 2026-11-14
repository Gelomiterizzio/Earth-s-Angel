// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext, Screen } from '../app-bridge';
import { button } from '../components/button';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el } from '../dom';

let cleanup: (() => void) | null = null;

export const farewellScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountFarewell(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountFarewell(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());
  ctx.audio.stopMusic();

  const paint = (): void => {
    screen.replaceChildren();
    const message = el('h1', 'screen-title', ctx.t('ui.farewell.thanks'));
    const close = el('p', 'note', ctx.t('ui.farewell.closeTab'));
    const back = button({
      label: ctx.t('ui.farewell.back'),
      className: 'btn-primary',
      onClick: press(ctx, () => ctx.flow.go('titulo')),
    });
    screen.append(message, close, back);
    back.focus();
  };
  paint();
  bag.add(ctx.options.subscribe(paint));
  return () => bag.run();
}
