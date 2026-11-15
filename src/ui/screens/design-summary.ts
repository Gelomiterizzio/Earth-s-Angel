// AI-assisted: Claude Code (claude-opus-5-5). Human review by C pending.
// Result screen block: the mission design chosen before the launch, next to how it went.
// It closes the loop from concept to operation: objective met or not, cost, mass and payload.
import type { AppContext } from '../app-bridge';
import type { GameState, MissionResult } from '../../core/types';
import { evaluateDesign, objectiveAchieved } from '../../core/design';
import { el } from '../dom';

export function designSummary(ctx: AppContext, state: GameState | null, result: MissionResult): HTMLElement | null {
  const design = state?.campaign.design;
  if (!state || !design || result.level !== 'luna') return null;
  const t = (key: string, params?: Record<string, string | number>): string => ctx.t(`ui.design.${key}`, params);
  const check = evaluateDesign(design, state.campaign.difficulty, ctx.data);
  const met = objectiveAchieved(state, result, ctx.data);
  const box = el('section', 'design-summary');
  const items = design.payload.map((id) => t(`payload.${id}.name`)).join(', ') || t('result.none');
  box.append(
    el('h2', undefined, t('result.heading')),
    el('p', undefined, t('result.objective', { name: t(`objective.${design.objective}.name`) })),
    el('p', met ? 'is-met' : 'is-missed', `${met ? t('result.met') : t('result.missed')} · ${t(`objective.${design.objective}.goal`)}`),
    el('p', undefined, t('result.vehicle', {
      rocket: t(`rocket.${design.rocket}.name`), trajectory: t(`trajectory.${design.trajectory}.name`),
    })),
    el('p', undefined, t('result.figures', {
      cost: check.cost, budget: check.budget, mass: check.mass, capacity: check.capacity,
    })),
    el('p', undefined, t('result.payload', { items })),
  );
  return box;
}
