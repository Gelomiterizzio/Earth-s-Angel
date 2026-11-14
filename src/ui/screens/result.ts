// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import { campaignFlow, type AppContext, type Screen } from '../app-bridge';
import { EARTH_INDICATORS, readMissionResult, readPortalRequirements, type CampaignData, type CampaignState, type MissionResult } from '../core-bridge';
import { button } from '../components/button';
import { openDialog } from '../components/dialog';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el } from '../dom';
import { earthNotices, earthReport } from '../panels/earth-report';
import { mountLearningCheck, shouldAskPost } from '../panels/learning-check';

let cleanup: (() => void) | null = null;

export const resultScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountResult(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountResult(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu result-screen');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());
  const result = readMissionResult(ctx.store.getState());
  if (result?.outcome === 'victory') ctx.audio.playMusic('music-victory');
  if (result?.outcome === 'defeat') ctx.audio.playMusic('music-defeat');

  const paint = (): void => {
    const state: CampaignState | null = ctx.store.getState();
    const current = readMissionResult(state) ?? result;
    screen.replaceChildren();
    if (!current) {
      screen.append(el('h1', 'screen-title', ctx.t('ui.result.missing')));
      return;
    }
    const victory = current.outcome === 'victory';
    const heading = el('h1', 'screen-title', ctx.t(titleKey(current)));
    heading.tabIndex = -1;
    screen.append(heading);
    if (current.level === 'tierra') {
      paintEarthResult(screen, ctx, current, state);
      heading.focus({ preventScroll: true });
      return;
    }
    if (!victory && current.cause) screen.append(el('p', undefined, ctx.t(`ui.result.cause.${current.cause}`)));
    screen.append(figures(ctx, current));
    screen.append(el('p', undefined, ctx.t(current.principleKey)));
    if (!victory) screen.append(el('p', 'suggestion', ctx.t(current.suggestionKey)));
    if (current.incidents.length > 0) {
      const list = el('ul', 'goal-list');
      for (const key of current.incidents) list.append(el('li', undefined, ctx.t(key)));
      screen.append(list);
    }
    screen.append(el('p', undefined, ctx.t('ui.result.seed', { seed: current.seed })));
    const flow = campaignFlow(ctx.flow);
    const actions = el('div', 'row');
    if (victory) {
      if (current.level === 'luna') {
        if (ctx.data.levels.marte && flow.departToMars) {
          actions.append(button({
            label: ctx.t('ui.result.departToMars'),
            className: 'btn-primary',
            onClick: press(ctx, () => flow.departToMars?.(), 'sfx-confirm'),
          }));
        } else {
          screen.append(el('p', 'note', ctx.t('ui.result.marsSoon')));
        }
      }
      if (current.level === 'marte' && flow.chooseEnding) {
        actions.append(button({
          label: ctx.t('ui.choice.stay'),
          className: 'btn-primary',
          onClick: press(ctx, () => flow.chooseEnding?.('mars'), 'sfx-confirm'),
        }));
        const missing = state && readPortalRequirements(state, ctx.data);
        if (missing?.length === 0) {
          actions.append(button({
            label: ctx.t('ui.result.portalChoice'),
            onClick: press(ctx, () => flow.go('eleccion')),
          }));
        } else if (missing?.length && (ctx.data as CampaignData).earth
          && (state?.campaign.narrativeFlags.beaconMoon || state?.campaign.narrativeFlags.beaconMars)) {
          const checklist = el('div', 'result-figures');
          checklist.append(el('h2', 'zone-title', ctx.t('ui.result.portalLocked')));
          const list = el('ul', 'goal-list');
          for (const id of missing) list.append(el('li', undefined, ctx.t(`ui.result.portal.${id}`)));
          checklist.append(list);
          screen.append(checklist);
        }
      }
      actions.append(
        button({ label: ctx.t('ui.result.again'), className: actions.childElementCount ? '' : 'btn-primary', onClick: press(ctx, () => ctx.flow.go('dificultad')) }),
        button({ label: ctx.t('ui.result.credits'), onClick: press(ctx, () => ctx.flow.go('creditos')) }),
        button({ label: ctx.t('ui.result.toTitle'), onClick: press(ctx, () => ctx.flow.go('titulo')) }),
      );
    } else {
      actions.append(
        button({
          label: ctx.t('ui.result.retry'),
          className: 'btn-primary',
          onClick: press(ctx, () => {
            openDialog(screen, {
              title: ctx.t('ui.dialog.confirm'),
              body: ctx.t('ui.result.confirmRetry'),
              confirmLabel: ctx.t('ui.dialog.yes'),
              cancelLabel: ctx.t('ui.dialog.no'),
              onConfirm: () => {
                const response = ctx.store.dispatch({ type: 'RESTART_MISSION' });
                if (response.ok) ctx.flow.go('mision');
              },
              onCancel: () => undefined,
            });
          }),
        }),
        button({ label: ctx.t('ui.result.toTitle'), onClick: press(ctx, () => ctx.flow.go('titulo')) }),
      );
    }
    actions.append(button({
      label: ctx.t('ui.result.copy'),
      onClick: press(ctx, () => void navigator.clipboard?.writeText(summaryText(ctx, current))),
    }));
    screen.append(actions);
    heading.focus({ preventScroll: true });
  };
  paint();
  bag.add(ctx.options.subscribe(paint));
  if (result?.level !== 'tierra' && shouldAskPost(ctx)) bag.add(mountLearningCheck(screen, ctx, 'post'));
  return () => bag.run();
}

function titleKey(result: MissionResult): string {
  if (result.level === 'tierra') return result.outcome === 'victory' ? 'ui.result.earthTitle' : 'ui.result.earthDefeat';
  if (result.outcome === 'defeat') return 'ui.result.defeatTitle';
  if (result.level === 'marte') return 'ui.result.marsTitle';
  return 'ui.result.victoryTitle';
}

function paintEarthResult(screen: HTMLElement, ctx: AppContext, result: MissionResult, state: CampaignState | null): void {
  screen.append(earthNotices(ctx));
  const earth = state?.earth;
  const data = (ctx.data as CampaignData).earth;
  const targets = data?.difficulty[result.difficulty].targets;
  if (earth && targets) {
    const list = el('ul', 'goal-list result-figures');
    for (const id of EARTH_INDICATORS) {
      list.append(el('li', undefined, ctx.t('ui.earth.goal', {
        indicator: ctx.t(`ui.earth.metric.${id}`), n: earth.indicators[id], target: targets[id],
      })));
    }
    screen.append(list);
  }
  if (earth?.lastReport) screen.append(earthReport(ctx, earth.lastReport));
  screen.append(el('p', undefined, ctx.t('ui.earth.closing')));
  const flow = campaignFlow(ctx.flow);
  const actions = el('div', 'row');
  const ending = (choice: 'retry' | 'mars' | 'earth', key: string, primary = false): HTMLButtonElement => button({
    label: ctx.t(key),
    className: primary ? 'btn-primary' : '',
    disabled: !flow.finishEarth,
    onClick: press(ctx, () => flow.finishEarth?.(choice), 'sfx-confirm'),
  });
  if (result.outcome === 'victory') {
    actions.append(ending('earth', 'ui.result.finishEarth', true));
  } else {
    if (result.principleKey) screen.append(el('p', undefined, ctx.t(result.principleKey)));
    if (result.suggestionKey) screen.append(el('p', 'suggestion', ctx.t(result.suggestionKey)));
    actions.append(ending('retry', 'ui.result.retryEarth'), ending('mars', 'ui.result.returnMars'));
  }
  screen.append(actions);
}

function figures(ctx: AppContext, result: MissionResult): HTMLElement {
  const block = el('div', 'result-figures');
  block.append(
    el('p', undefined, ctx.t(result.level === 'marte' ? 'ui.result.solsUsed' : 'ui.result.daysUsed', { n: result.daysUsed })),
    el('p', undefined, ctx.t('ui.result.earthLeft', { n: result.earthDaysRemaining })),
    el('p', undefined, ctx.t('ui.result.resources', {
      power: result.resources.energia,
      oxygen: result.resources.oxigeno,
      water: result.resources.agua,
      food: result.resources.alimentos,
      materials: result.resources.materiales,
    })),
    el('p', undefined, ctx.t('ui.result.margins', {
      oxygen: result.margins.oxigeno,
      water: result.margins.agua,
      food: result.margins.alimentos,
      power: result.margins.energia,
    })),
    el('p', undefined, ctx.t('ui.result.exposure', { n: result.maxExposure })),
    el('p', undefined, ctx.t('ui.result.difficulty', { name: ctx.t(`ui.difficulty.${result.difficulty}.name`) })),
  );
  return block;
}

function summaryText(ctx: AppContext, result: MissionResult): string {
  return [
    ctx.t(titleKey(result)),
    ctx.t('ui.result.seed', { seed: result.seed }),
    ctx.t(result.level === 'marte' ? 'ui.result.solsUsed' : 'ui.result.daysUsed', { n: result.daysUsed }),
    ctx.t(result.principleKey),
    ctx.t(result.suggestionKey),
  ].join('\n');
}
