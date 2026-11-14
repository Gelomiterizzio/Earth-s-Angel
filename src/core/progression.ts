// AI-assisted: Antigravity (Gemini), reviewed by A

import type { ActionResult, GameData, GameState, TransferManifest } from './types';
import { startDay } from './day-cycle';
import { createMission } from './mission';

export function applyTransition(
  state: GameState,
  id: 'luna->marte' | 'marte->tierra' | 'tierra->marte',
  data: GameData,
): ActionResult {
  const { campaign, mission } = state;

  if (campaign.appliedTransitions.includes(id)) {
    return {
      ok: false,
      state,
      error: {
        code: 'WRONG_PHASE',
        messageKey: 'sim.error.WRONG_PHASE',
      },
    };
  }

  if (id === 'luna->marte') {
    if (mission.level !== 'luna' || mission.result?.outcome !== 'victory') {
      return {
        ok: false,
        state,
        error: {
          code: 'WRONG_PHASE',
          messageKey: 'sim.error.WRONG_PHASE',
        },
      };
    }

    const diffBlock = data.difficulty[campaign.difficulty];
    const bonusDays = diffBlock.bonusDays;
    const manifest: TransferManifest = {
      crew: mission.crew.map((c) => ({ ...c })),
      supplies: { ...mission.resources },
      discoveries: [...mission.discoveries],
      clues: [...campaign.clues],
      bonusDaysApplied: bonusDays,
    };

    const nextLevel = data.levels.marte ? 'marte' : 'luna';
    const nextMission = createMission(
      nextLevel,
      campaign.difficulty,
      campaign.seed,
      campaign.canonical,
      data,
    );

    const transitioned: GameState = {
      campaign: {
        ...campaign,
        level: nextLevel,
        earthDaysRemaining: campaign.earthDaysRemaining + bonusDays,
        appliedTransitions: [...campaign.appliedTransitions, id],
        manifest,
      },
      mission: nextMission,
    };

    const opened = startDay(transitioned, data);
    return {
      ok: true,
      state: opened.state,
      events: [{ type: 'transition/applied', id }, ...opened.events],
    };
  }

  return {
    ok: false,
    state,
    error: {
      code: 'WRONG_PHASE',
      messageKey: 'sim.error.WRONG_PHASE',
    },
  };
}
