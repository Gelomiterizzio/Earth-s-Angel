// AI-assisted: OpenAI Codex (GPT-6). Human review by C pending.
import { designCommsForecast, designOf, designStorageBonus, type PayloadId } from '../../core/design';
import type { Resources } from '../../core/types';
import type { AppContext } from '../app-bridge';
import { openDialog } from '../components/dialog';
import type { GameData, GameState } from '../core-bridge';
import { onboardModules } from '../design-copy';
import { el, hasModal } from '../dom';

const SUPPLIES: Partial<Record<PayloadId, keyof Resources>> = {
  oxigeno: 'oxigeno', agua: 'agua', alimentos: 'alimentos', materiales: 'materiales', bateria: 'energia',
};

export function lunarSupply(id: PayloadId, state: GameState, data: GameData) {
  const resource = SUPPLIES[id];
  const payload = data.missionDesign?.payload[id];
  if (!resource || !payload) return null;
  const initial = data.difficulty[state.campaign.difficulty].levels.luna.initial[resource];
  const storage = resource === 'energia' ? 0 : designStorageBonus(state.campaign, data);
  const capacity = data.levels.luna.baseCaps[resource] + storage;
  return { resource, amount: Math.max(0, Math.min(payload.amount, capacity - initial)) };
}

// Each landing generates its own schedule, shared across HUD remounts during day 1.
const seenLandings = new WeakSet<GameState['mission']['schedule']>();

export function mountOnboardArrival(root: HTMLElement, ctx: AppContext): () => void {
  const state = ctx.store.getState();
  if (!state || state.mission.level !== 'luna' || state.mission.day !== 1 || !state.campaign.design) {
    return () => undefined;
  }
  const { campaign } = state;
  const design = designOf(campaign);
  if (design.payload.length === 0 && !designStorageBonus(campaign, ctx.data) && !designCommsForecast(campaign, ctx.data)) {
    return () => undefined;
  }
  const { schedule } = state.mission;
  if (seenLandings.has(schedule)) return () => undefined;

  const host = el('div');
  host.dataset.onboardArrival = '';
  let timer: ReturnType<typeof setTimeout>;
  let closeDialog: (() => void) | undefined;
  const check = (): void => {
    const current = ctx.store.getState()?.mission;
    if (!current || current.schedule !== schedule || current.day !== 1 || current.phase === 'report') return;
    if (current.phase !== 'planning' || hasModal()) {
      timer = setTimeout(check, 150);
      return;
    }

    const cargo = design.payload.map((id) => {
      const supply = lunarSupply(id, state, ctx.data);
      return supply
        ? ctx.t('ui.onboard.supply', { amount: supply.amount, resource: ctx.t(`ui.resource.${supply.resource}`) })
        : ctx.t(`ui.design.payload.${id}.name`);
    }).join(', ') || ctx.t('ui.design.result.none');
    const objective = ctx.t(`ui.design.objective.${design.objective}.name`);
    const { cabin, antenna } = onboardModules(ctx, campaign);
    const dismiss = (): void => {
      seenLandings.add(schedule);
      host.remove();
      document.getElementById('map')?.focus({ preventScroll: true });
    };
    root.append(host);
    closeDialog = openDialog(host, {
      title: ctx.t('ui.onboard.arrival'),
      body: ctx.t('ui.onboard.arrivalBody', { cabin: cabin.name, antenna: antenna.name, cargo, objective }),
      confirmLabel: ctx.t('ui.report.continue'),
      onConfirm: dismiss,
      onCancel: dismiss,
    });
  };
  timer = setTimeout(check, 0);

  return () => {
    clearTimeout(timer);
    closeDialog?.();
    host.remove();
  };
}
