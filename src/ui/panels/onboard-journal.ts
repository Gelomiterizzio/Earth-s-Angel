// AI-assisted: OpenAI Codex (GPT-6). Human review by C pending.
import { designOf, designReserveMargin, type PayloadId } from '../../core/design';
import type { AppContext } from '../app-bridge';
import { summarizeHud, type GameState } from '../core-bridge';
import { onboardModules, payloadEffect } from '../design-copy';
import { el } from '../dom';
import { lunarSupply } from './onboard-arrival';

const ICONS: Record<PayloadId, string> = {
  oxigeno: '🫧', agua: '💧', alimentos: '🥫', materiales: '🧱', bateria: '🔋',
  espectrometro: '🔬', sensor: '☢', herramientas: '🧰', taladro: '⛏', exotraje: '🧑‍🚀',
};

type JournalContext = Pick<AppContext, 'data' | 't'>;

export function designProgress(ctx: JournalContext, state: GameState): string | null {
  const targets = ctx.data.missionDesign?.objectives;
  if (!targets || !state.campaign.design || state.mission.level !== 'luna') return null;
  const { buildings, crew, map } = state.mission;
  const present = (exists: boolean): string => ctx.t(exists ? 'ui.dialog.yes' : 'ui.dialog.no');
  switch (designOf(state.campaign).objective) {
    case 'autosuficiente':
      return ctx.t('content.map.onboard.reserve', {
        current: designReserveMargin(state, ctx.data),
        target: targets.autosuficiente.minMargin,
        days: summarizeHud(state, ctx.data).soporte.marginDays,
      });
    case 'hielo':
      return ctx.t('content.map.onboard.ice', {
        current: map.tiles.filter((tile) => tile.terrain === 'hielo' && tile.explored).length,
        target: targets.hielo.minIceTiles,
        extractor: present(buildings.some(({ type }) => type === 'extractor')),
      });
    case 'solar':
      return ctx.t('content.map.onboard.exposure', {
        current: Math.max(0, ...crew.map(({ exposure }) => exposure)),
        target: targets.solar.maxExposure,
        shelter: present(buildings.some(({ type }) => type === 'refugio')),
      });
  }
}

export function onboardJournalSection(ctx: JournalContext, state: GameState): HTMLElement | null {
  if (!state.campaign.design) return null;
  const { payload, objective } = designOf(state.campaign);
  const section = el('section');
  section.dataset.journalSection = 'onboard';
  section.append(el('h3', undefined, ctx.t('content.map.onboard.heading')));

  const list = el('ul', 'onboard-cargo');
  const { cabin, antenna } = onboardModules(ctx, state.campaign);
  const items = [cabin, antenna, ...payload.map((id) => {
    const supply = lunarSupply(id, state, ctx.data);
    return {
      name: ctx.t(`ui.design.payload.${id}.name`),
      icon: ICONS[id],
      effect: supply
        ? ctx.t('content.map.onboard.supply', { amount: supply.amount, resource: ctx.t(`ui.resource.${supply.resource}`) })
        : payloadEffect(ctx, id),
    };
  })];
  for (const item of items) {
    const row = el('li');
    const icon = el('span', undefined, item.icon);
    icon.setAttribute('aria-hidden', 'true');
    const details = el('span');
    details.append(el('strong', undefined, item.name), ' · ', item.effect);
    row.append(icon, details);
    list.append(row);
  }
  section.append(list);
  if (payload.length === 0) section.append(el('p', undefined, ctx.t('content.map.onboard.empty')));

  const progress = designProgress(ctx, state);
  if (progress !== null) {
    const title = el('p');
    title.append(el('strong', undefined, ctx.t(`ui.design.objective.${objective}.name`)));
    section.append(title, el('p', undefined, progress));
  }
  return section;
}
