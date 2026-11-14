// AI-assisted: Cursor Grok 4.7 and OpenAI Codex, GPT-6. Human review by C pending.
import type { AppContext } from '../app-bridge';
import { bindChrome, press, showNarrow } from '../chrome';
import {
  EARTH_INDICATORS, EARTH_LINES, type Action, type CampaignData, type CampaignState, type EarthAction,
} from '../core-bridge';
import { button } from '../components/button';
import { cleaner, el, hasModal, isTypingTarget, on } from '../dom';
import { earthNotices, earthReport } from '../panels/earth-report';

export function mountEarth(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu earth-screen');
  const header = el('header', 'earth-header');
  const dashboard = el('div', 'earth-dashboard');
  const landscape = el('img', 'earth-landscape');
  landscape.alt = '';
  const note = el('p', 'earth-message');
  note.setAttribute('role', 'status');
  screen.append(header, landscape, dashboard, note);
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(() => screen.remove());

  const data = (ctx.data as CampaignData).earth;
  let acknowledgedSeason = 0;
  let announcedSeason = 0;
  let stage = -1;

  function dispatch(action: EarthAction): void {
    const response = ctx.store.dispatch(action as unknown as Action);
    note.textContent = response.ok ? '' : ctx.t(response.error.messageKey, response.error.params);
  }

  function paint(): void {
    if (!screen.isConnected) return;
    const state: CampaignState | null = ctx.store.getState();
    const earth = state?.earth;
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.earthFocus : undefined;
    const heading = el('h1', 'screen-title', ctx.t('ui.earth.heading'));
    const controls = el('div', 'row');
    controls.append(
      button({ label: ctx.t('ui.hud.options'), onClick: press(ctx, () => ctx.flow.go('opciones')) }),
      button({ label: ctx.t('ui.hud.pause'), onClick: press(ctx, () => ctx.flow.go('pausa')) }),
    );
    header.replaceChildren(heading, controls, earthNotices(ctx));
    dashboard.replaceChildren();
    landscape.hidden = !earth;
    if (!state || !earth || !data) {
      dashboard.append(el('p', undefined, ctx.t('ui.earth.waiting')));
      return;
    }

    const targets = data.difficulty[state.campaign.difficulty].targets;
    const total = EARTH_INDICATORS.reduce((sum, id) => sum + earth.indicators[id], 0);
    const nextStage = Math.max(0, Math.min(4, Math.floor(total / (EARTH_INDICATORS.length * 20))));
    if (nextStage !== stage) {
      stage = nextStage;
      landscape.src = `assets/cinematics/earth-stage-${stage}.png`;
    }
    const stats = el('div', 'earth-stats');
    stats.append(
      el('p', 'hud-stat', ctx.t('ui.earth.season', { n: earth.season, total: earth.seasons })),
      el('p', 'hud-stat', ctx.t('ui.earth.budget', { n: earth.budget })),
    );
    const meters = el('div', 'earth-meters');
    for (const id of EARTH_INDICATORS) {
      const indicator = el('div', 'earth-meter');
      const meter = el('meter');
      meter.min = 0;
      meter.max = 100;
      meter.value = earth.indicators[id];
      meter.setAttribute('aria-label', ctx.t(`ui.earth.metric.${id}`));
      indicator.append(el('p', undefined, ctx.t('ui.earth.goal', {
        indicator: ctx.t(`ui.earth.metric.${id}`), n: earth.indicators[id], target: targets[id],
      })), meter);
      meters.append(indicator);
    }
    dashboard.append(stats, meters);

    const report = earth.lastReport;
    if (earth.result) {
      if (report) dashboard.append(earthReport(ctx, report));
      dashboard.append(button({
        label: ctx.t('ui.earth.viewResult'),
        className: 'btn-primary',
        onClick: press(ctx, () => ctx.flow.go('resultado')),
      }));
      return;
    }
    if (report && report.season > acknowledgedSeason) {
      const summary = earthReport(ctx, report);
      const next = button({
        label: ctx.t('ui.earth.nextSeason'),
        className: 'btn-primary',
        onClick: press(ctx, () => {
          acknowledgedSeason = report.season;
          paint();
          dashboard.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
        }),
      });
      summary.append(next);
      dashboard.append(summary);
      if (report.season > announcedSeason) {
        announcedSeason = report.season;
        const title = summary.querySelector('h2');
        if (title) {
          title.tabIndex = -1;
          title.focus();
        }
      }
      return;
    }

    const lines = el('div', 'earth-lines');
    EARTH_LINES.forEach((line, index) => {
      const definition = data.lines[line];
      const level = earth.levels[line];
      const cost = line === 'restauracion' && earth.levels.energia >= data.combos.cleanPowerDiscountAt
        ? data.combos.restorationDiscountCost : definition.cost;
      const row = el('section', 'earth-line');
      const title = el('h2', 'zone-title', ctx.t(`ui.earth.name.${line}`));
      const icon = el('span', 'earth-icon');
      icon.style.setProperty('--frame-offset', String(-32 * index));
      icon.setAttribute('aria-hidden', 'true');
      title.prepend(icon);
      const effects = EARTH_INDICATORS.flatMap((id) => {
        const gain = definition.effects[id];
        return gain ? [ctx.t('ui.earth.effect', { n: gain, indicator: ctx.t(`ui.earth.metric.${id}`) })] : [];
      });
      const invest = button({
        label: ctx.t(level >= data.maxLevel ? 'ui.earth.maxLevel' : 'ui.earth.investCost', { n: cost }),
        disabled: level >= data.maxLevel || earth.budget < cost,
        onClick: press(ctx, () => dispatch({ type: 'EARTH_INVEST', action: line })),
      });
      invest.dataset.earthFocus = line;
      invest.setAttribute('aria-label', `${title.textContent}. ${invest.textContent}`);
      row.append(
        title,
        el('p', undefined, ctx.t('ui.earth.level', { n: level, max: data.maxLevel })),
        el('p', 'earth-effect', effects.join(' · ')),
        el('p', 'earth-effect', ctx.t(`ui.earth.connection.${line}`)),
        invest,
      );
      lines.append(row);
    });
    const end = button({
      label: ctx.t('ui.earth.endSeason'),
      className: 'btn-primary',
      onClick: press(ctx, () => dispatch({ type: 'EARTH_END_SEASON', season: earth.season })),
    });
    end.dataset.earthFocus = 'end';
    dashboard.append(lines, end);
    if (focus) {
      const replacement = dashboard.querySelector<HTMLButtonElement>(`[data-earth-focus="${CSS.escape(focus)}"]`);
      (replacement && !replacement.disabled ? replacement : end).focus({ preventScroll: true });
    }
  }

  paint();
  bag.add(ctx.store.subscribe(paint));
  bag.add(ctx.options.subscribe(paint));
  bag.add(showNarrow(screen, ctx));
  bag.add(on(window, 'keydown', (event) => {
    if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey
      || hasModal() || isTypingTarget(event.target)) return;
    if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
      event.preventDefault();
      ctx.flow.go('pausa');
    }
  }));
  ctx.audio.playMusic('music-earth');
  return () => bag.run();
}
