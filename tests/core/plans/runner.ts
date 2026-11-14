// AI-assisted: Antigravity (Gemini), reviewed by A

import {
  applyAction,
  createCampaign,
  startDay,
  validateState,
} from '../../../src/core/index';
import type {
  Action,
  DayReport,
  DifficultyId,
  GameData,
  GameState,
} from '../../../src/core/types';

export interface DayPlan {
  day: number;
  shelter?: boolean;
  actions: Action[];
}

export interface ExpectedRow {
  day: number;
  energia: number;
  capEnergia: number;
  oxigeno: number;
  agua: number;
  alimentos: number;
  materiales: number;
  streak: number;
  exposure: number;
}

export interface RunPlanResult {
  finalState: GameState;
  reports: DayReport[];
  snapshots: ExpectedRow[];
}

export function runPlan(
  difficulty: DifficultyId,
  plan: DayPlan[],
  data: GameData,
  maxDays = 30,
): RunPlanResult {
  let state = createCampaign(difficulty, 'EA-DEMO', data, { canonical: true });
  state = startDay(state, data).state;

  const reports: DayReport[] = [];
  const snapshots: ExpectedRow[] = [];
  const planByDay = new Map<number, DayPlan>(plan.map((p) => [p.day, p]));

  for (let step = 0; step < maxDays; step++) {
    if (state.mission.phase === 'ended') break;
    const currentDay = state.mission.day;
    const dayPlan = planByDay.get(currentDay);

    if (state.mission.phase === 'decision') {
      const shelterChoice = dayPlan?.shelter ?? false;
      const dec = applyAction(
        state,
        { type: 'DECIDE_SHELTER', shelter: shelterChoice, day: currentDay },
        data,
      );
      if (!dec.ok) {
        throw new Error(
          `Day ${currentDay} DECIDE_SHELTER(${String(shelterChoice)}) failed: ${dec.error.code}`,
        );
      }
      state = dec.state;
    }

    if (dayPlan) {
      for (const act of dayPlan.actions) {
        const res = applyAction(state, act, data);
        if (!res.ok) {
          throw new Error(
            `Day ${currentDay} action ${act.type} failed: ${res.error.code}`,
          );
        }
        state = res.state;
        const issues = validateState(state, data);
        if (issues.length > 0) {
          throw new Error(
            `Day ${currentDay} invalid state after ${act.type}: ${issues.join('; ')}`,
          );
        }
      }
    }

    const endRes = applyAction(state, { type: 'END_DAY', day: currentDay }, data);
    if (!endRes.ok) {
      throw new Error(`Day ${currentDay} END_DAY failed: ${endRes.error.code}`);
    }
    state = endRes.state;

    const issuesAfterEnd = validateState(state, data);
    if (issuesAfterEnd.length > 0) {
      throw new Error(
        `Day ${currentDay} invalid state after END_DAY: ${issuesAfterEnd.join('; ')}`,
      );
    }

    const rep = state.mission.lastReport!;
    reports.push(rep);
    snapshots.push({
      day: currentDay,
      energia: state.mission.resources.energia,
      capEnergia: state.mission.caps.energia,
      oxigeno: state.mission.resources.oxigeno,
      agua: state.mission.resources.agua,
      alimentos: state.mission.resources.alimentos,
      materiales: state.mission.resources.materiales,
      streak: state.mission.streak,
      exposure: Math.max(...state.mission.crew.map((c) => c.exposure)),
    });

    if (state.mission.phase === 'ended') {
      break;
    }

    const ackRes = applyAction(state, { type: 'ACK_REPORT', day: currentDay }, data);
    if (!ackRes.ok) {
      throw new Error(`Day ${currentDay} ACK_REPORT failed: ${ackRes.error.code}`);
    }
    state = ackRes.state;
  }

  return { finalState: state, reports, snapshots };
}
