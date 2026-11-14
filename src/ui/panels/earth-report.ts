// AI-assisted: OpenAI Codex, GPT-6. Human review by C pending.
import type { AppContext } from '../app-bridge';
import { EARTH_INDICATORS, type EarthSeasonReport } from '../core-bridge';
import { el } from '../dom';

export function earthNotices(ctx: AppContext): HTMLElement {
  const notes = el('div', 'earth-notices');
  notes.append(
    el('p', 'note', ctx.t('ui.earth.fiction')),
    el('p', 'note', ctx.t('ui.earth.simplified')),
  );
  return notes;
}

export function earthReport(ctx: AppContext, report: EarthSeasonReport): HTMLElement {
  const block = el('section', 'earth-report');
  block.append(el('h2', 'zone-title', ctx.t('ui.earth.report', { n: report.season })));
  const changes = el('ul', 'goal-list');
  const signed = new Intl.NumberFormat(ctx.options.get().language, { signDisplay: 'exceptZero' });
  for (const id of EARTH_INDICATORS) {
    changes.append(el('li', undefined, ctx.t('ui.earth.reportChange', {
      indicator: ctx.t(`ui.earth.metric.${id}`),
      gain: signed.format(report.gains[id]),
      drift: signed.format(report.drift[id]),
    })));
  }
  block.append(changes);
  if (report.causeEffectKeys.length > 0) {
    const causes = el('ul', 'goal-list earth-report-causes');
    for (const key of report.causeEffectKeys) causes.append(el('li', undefined, ctx.t(key)));
    block.append(causes);
  }
  return block;
}
