// AI-assisted: Claude Code (claude-opus-5-5). Human review by C pending.
// Offers one optional quick question after the day report, about something the player
// has just lived through. It reads the closed day's report and never changes the game.
import type { AppContext } from '../app-bridge';
import type { DayReport, GameState } from '../core-bridge';
import { shouldAskPost } from './learning-check';
import { hasScienceQuestion, openCards, unlockCard } from './science-card';

/** Card ids with a quick question, in priority order when several apply on the same day. */
export const DAY_QUIZ_ORDER = ['solarStorm', 'power', 'airFromWater', 'waterLoop'] as const;
export type DayQuizId = (typeof DAY_QUIZ_ORDER)[number];

// Questions already offered, per campaign seed and level. One showing per game.
const offered = new Map<string, Set<DayQuizId>>();

/** Which question fits the day that just ended, or null. Pure, so it can be tested. */
export function quizForReport(
  report: DayReport,
  state: GameState,
  already: ReadonlySet<DayQuizId>,
  options: { skipStorm: boolean },
): DayQuizId | null {
  const recyclerRan = state.mission.buildings.some((b) =>
    b.type === 'reciclador' && b.enabled && !b.damaged && b.operationalFromDay <= report.day
    && !report.energy.unpowered.includes(b.id));
  const lived: Record<DayQuizId, boolean> = {
    solarStorm: report.radiationLevel > 0 && !options.skipStorm,
    power: report.solarFactorPct < 100,
    airFromWater: report.produced.oxigeno > 0,
    waterLoop: recyclerRan && report.produced.agua > 0 && report.crewConsumed.agua > 0,
  };
  return DAY_QUIZ_ORDER.find((id) => lived[id] && !already.has(id) && hasScienceQuestion(id)) ?? null;
}

export function mountDayQuiz(root: HTMLElement, ctx: AppContext): () => void {
  let closeQuiz: (() => void) | undefined;
  let checkedDay = -1;
  let retry: ReturnType<typeof setTimeout> | undefined;

  const check = (): void => {
    clearTimeout(retry);
    const state = ctx.store.getState();
    if (!state || state.mission.phase !== 'planning' || state.mission.result) return;
    const report = state.mission.lastReport;
    // Only right after a report was closed: the report belongs to yesterday.
    if (!report || report.day !== state.mission.day - 1 || checkedDay === report.day) return;
    // Another dialog (shelter scene, journal, field actions) has the stage: wait for it.
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
      retry = setTimeout(check, 400);
      return;
    }
    checkedDay = report.day;
    if (!ctx.options.get().learningCheck) return;

    const key = `${state.campaign.seed}:${state.mission.level}`;
    // Day 1 closing means a fresh mission (new game, retry or the next player at a demo
    // with the same seed): offer the questions again.
    if (report.day === 1) offered.delete(key);
    const already = offered.get(key) ?? new Set<DayQuizId>();
    offered.set(key, already);
    // The storm question would answer the end-of-mission learning check in advance.
    const id = quizForReport(report, state, already, { skipStorm: shouldAskPost(ctx) });
    if (!id) return;
    already.add(id);
    unlockCard(state.campaign.seed, id);
    closeQuiz?.();
    closeQuiz = openCards(root, ctx, id);
  };

  // A report that was already closed before this HUD mounted (Continue, back from Options)
  // does not get a question: only reports closed while playing do.
  const initial = ctx.store.getState()?.mission;
  if (initial?.phase === 'planning' && initial.lastReport?.day === initial.day - 1) {
    checkedDay = initial.lastReport.day;
  }
  const off = ctx.store.subscribe(() => check());
  return () => {
    clearTimeout(retry);
    off();
    closeQuiz?.();
  };
}
