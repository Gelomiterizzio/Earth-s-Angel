// AI-assisted: OpenAI Codex (GPT-6). Human review by C pending.
import { designCommsForecast, designOf, designStorageBonus, type DesignObjectiveId, type PayloadId } from '../core/design';
import type { CampaignState, GameData } from '../core/types';
import type { AppContext } from './app-bridge';

type DesignCopyContext = Pick<AppContext, 'data' | 't'>;

export function objectiveGoal(ctx: DesignCopyContext, id: DesignObjectiveId): string {
  const objectives = ctx.data.missionDesign?.objectives;
  if (!objectives) return '';
  const targets = {
    autosuficiente: objectives.autosuficiente.minMargin,
    hielo: objectives.hielo.minIceTiles,
    solar: objectives.solar.maxExposure,
  };
  return ctx.t(`ui.design.objective.${id}.goal`, { target: targets[id] });
}

export function payloadEffect(ctx: DesignCopyContext, id: PayloadId): string {
  const definition = ctx.data.missionDesign?.payload[id];
  return definition ? ctx.t(`ui.design.payload.${id}.desc`, { n: definition.amount }) : '';
}

export function antennaDescription(data: GameData, forecast: number) {
  return {
    days: forecast || data.levels.luna.forecastHorizonDays,
    sols: data.levels.marte?.forecastHorizonWithComms ?? data.levels.marte?.forecastHorizonDays ?? 0,
  };
}

export function onboardModules(ctx: DesignCopyContext, campaign: CampaignState) {
  const { ship = 'pequena', comms = 'estandar' } = designOf(campaign);
  const storage = designStorageBonus(campaign, ctx.data);
  const forecast = designCommsForecast(campaign, ctx.data);
  return {
    cabin: {
      name: ctx.t(`ui.design.ship.${ship}.name`),
      effect: ctx.t(storage > 0 ? 'ui.onboard.storageBonus' : 'ui.design.ship.pequena.desc', { n: storage }),
      icon: '🛸',
    },
    antenna: {
      name: ctx.t(`ui.design.comms.${comms}.name`),
      effect: ctx.t(`ui.design.comms.${comms}.desc`, antennaDescription(ctx.data, forecast)),
      icon: '📡',
    },
  };
}
