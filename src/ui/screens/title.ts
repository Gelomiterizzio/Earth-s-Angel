// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import { campaignFlow, type AppContext, type Screen } from '../app-bridge';
import { readMissionResult } from '../core-bridge';
import { button } from '../components/button';
import { openDialog } from '../components/dialog';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el, on } from '../dom';
import { mountTitleCrew } from './title-crew';
import { spaceAppsEntry } from '../components/space-apps';

let cleanup: (() => void) | null = null;

export const titleScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountTitle(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountTitle(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu title-screen');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());

  const bg = el('img', 'menu-bg');
  bg.alt = '';
  bg.src = 'assets/ui/menu-bg.png';
  bg.addEventListener('error', () => bg.remove(), { once: true });
  const landscape = el('div', 'title-landscape');
  landscape.setAttribute('aria-hidden', 'true');
  landscape.append(bg);
  const beacon = el('div', 'title-beacon');
  beacon.setAttribute('aria-hidden', 'true');
  const body = el('div', 'title-content');
  screen.append(landscape, beacon, body);
  bag.add(mountTitleCrew(landscape, ctx));

  const paint = (): void => {
    const focusId = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.action : undefined;
    screen.classList.toggle('title-still', ctx.options.get().reducedMotion);
    body.replaceChildren();
    screen.querySelector('.space-apps-entry')?.remove();
    screen.append(spaceAppsEntry(ctx));
    const brand = el('div', 'title-brand');
    const logo = el('img', 'logo');
    logo.alt = '';
    const heading = el('h1', 'game-title', ctx.t('ui.title.name'));
    logo.hidden = true;
    logo.addEventListener('load', () => {
      logo.hidden = false;
      heading.classList.add('sr-only');
    }, { once: true });
    logo.addEventListener('error', () => logo.remove(), { once: true });
    logo.src = 'assets/ui/logo.png';

    const actions = el('div', 'menu-actions');
    const flow = campaignFlow(ctx.flow);
    const canContinue = flow.canContinue?.() ?? (flow.hasActiveMission() && !readMissionResult(ctx.store.getState()));
    const continueBtn = canContinue
      ? button({
          label: ctx.t('ui.title.continue'),
          className: 'btn-primary',
          onClick: press(ctx, () => {
            if (flow.continueCampaign) flow.continueCampaign();
            else flow.go('mision');
          }),
        })
      : null;
    if (continueBtn) continueBtn.dataset.action = 'continue';
    const newGame = button({
      label: ctx.t('ui.title.newGame'),
      className: continueBtn ? '' : 'btn-primary',
      onClick: press(ctx, () => confirmOrGo(ctx, screen, 'dificultad', 'ui.title.confirmNew')),
    });
    newGame.dataset.action = 'new';
    const options = button({
      label: ctx.t('ui.title.options'),
      onClick: press(ctx, () => ctx.flow.go('opciones')),
    });
    options.dataset.action = 'options';
    const credits = button({
      label: ctx.t('ui.title.credits'),
      onClick: press(ctx, () => ctx.flow.go('creditos')),
    });
    credits.dataset.action = 'credits';
    const exit = button({
      label: ctx.t('ui.title.exit'),
      onClick: press(ctx, () => confirmOrGo(ctx, screen, 'despedida', 'ui.title.confirmExit')),
    });
    exit.dataset.action = 'exit';
    if (continueBtn) actions.append(continueBtn);
    actions.append(newGame, options, credits, exit);

    const langs = el('div', 'lang-row');
    const current = ctx.options.get().language;
    const en = button({
      label: ctx.t('ui.title.langEn'),
      pressed: current === 'en',
      onClick: press(ctx, () => ctx.options.set('language', 'en')),
    });
    en.lang = 'en';
    const es = button({
      label: ctx.t('ui.title.langEs'),
      pressed: current === 'es',
      onClick: press(ctx, () => ctx.options.set('language', 'es')),
    });
    es.lang = 'es';
    langs.append(en, es);

    const foot = el('p', 'affiliation', ctx.t('ui.title.affiliation'));
    brand.append(logo, heading, foot);
    const menu = el('div', 'title-menu');
    menu.append(actions, langs);
    body.append(brand, menu);

    const target =
      screen.querySelector<HTMLButtonElement>(`[data-action="${focusId ?? ''}"]`) ??
      continueBtn ??
      newGame;
    target.focus();
  };

  bag.add(on(screen, 'keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const buttons = [...screen.querySelectorAll<HTMLButtonElement>('.menu-actions button')];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }));
  paint();
  bag.add(ctx.options.subscribe(paint));
  const unlock = (): void => ctx.audio.unlock();
  bag.add(on(window, 'pointerdown', unlock));
  bag.add(on(window, 'keydown', unlock));
  ctx.audio.playMusic('music-menu');
  return () => bag.run();
}

function confirmOrGo(ctx: AppContext, screen: HTMLElement, scene: 'dificultad' | 'despedida', confirmKey: string): void {
  const flow = campaignFlow(ctx.flow);
  if (!(flow.canContinue?.() ?? flow.hasActiveMission())) {
    ctx.flow.go(scene);
    return;
  }
  openDialog(screen, {
    title: ctx.t('ui.dialog.confirm'),
    body: ctx.t(confirmKey),
    confirmLabel: ctx.t('ui.dialog.yes'),
    cancelLabel: ctx.t('ui.dialog.no'),
    onConfirm: () => {
      ctx.audio.playSfx('sfx-confirm');
      ctx.flow.go(scene);
    },
    onCancel: () => undefined,
  });
}
