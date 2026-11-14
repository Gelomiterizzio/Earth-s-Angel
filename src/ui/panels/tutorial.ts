// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext } from '../app-bridge';
import type { GameData, GameState } from '../core-bridge';
import { computeForecast } from '../core-bridge';
import { el, on } from '../dom';
import { unlockCard, cardsOf } from './science-card';

interface TutorialStep {
  id: string;
  trigger: { event: string; day?: number; eventType?: string; inDays?: number };
  highlight: string | null;
  textKey: string;
  completeOn?: string;
  unlockCards?: string[];
}

const seenBySeed = new Map<string, Set<string>>();
const exploredAtStart = new Map<string, number>();
const eventLog = new Map<string, Set<string>>();

export function mountTutorial(root: HTMLElement, ctx: AppContext, notify: (text: string) => void): () => void {
  const seed = ctx.store.getState()?.campaign.seed ?? 'session';
  const seen = seenBySeed.get(seed) ?? new Set<string>();
  seenBySeed.set(seed, seen);
  if (!exploredAtStart.has(seed)) {
    exploredAtStart.set(seed, countExplored(ctx.store.getState()));
  }
  const log = eventLog.get(seed) ?? new Set<string>();
  eventLog.set(seed, log);
  const offs = [
    ctx.store.on('day/started', () => log.add('day/started')),
    ctx.store.on('building/placed', () => log.add('building/placed')),
    ctx.store.on('resource/collected', () => log.add('resource/collected')),
    ctx.store.on('tile/explored', () => log.add('tile/explored')),
    ctx.store.on('day/ended', () => log.add('day/ended')),
    ctx.store.on('decision/made', () => log.add('decision/made')),
    ctx.store.on('streak/changed', () => log.add('streak/changed')),
    ctx.store.on('event/forecast', () => log.add('event/forecast')),
    ctx.store.on('decision/required', () => log.add('decision/required')),
  ];
  let bubble: HTMLElement | null = null;
  let openId: string | null = null;

  const hide = (): void => {
    bubble?.remove();
    bubble = null;
    openId = null;
  };

  const show = (step: TutorialStep): void => {
    if (openId === step.id && bubble) {
      const text = bubble.querySelector('p');
      if (text) text.textContent = ctx.t(step.textKey);
      return;
    }
    hide();
    openId = step.id;
    bubble = el('div', 'bubble');
    bubble.setAttribute('role', 'dialog');
    const text = el('p', undefined, ctx.t(step.textKey));
    const ok = el('button', 'btn btn-primary', ctx.t('ui.tutorial.ok'));
    ok.type = 'button';
    const skip = el('button', 'btn', ctx.t('ui.tutorial.skipAll'));
    skip.type = 'button';
    bubble.append(text, el('div', 'row', ''), ok, skip);
    place(bubble, step.highlight);
    root.append(bubble);
    ok.addEventListener('click', () => finish(step));
    skip.addEventListener('click', () => skipAll(seed, steps(), seen, ctx, notify, hide));
    ok.focus();
  };

  const finish = (step: TutorialStep): void => {
    seen.add(step.id);
    for (const id of step.unlockCards ?? []) {
      unlockCard(seed, id);
      const card = cardsOf(ctx.data).find((item) => item.id === id);
      if (card) notify(ctx.t('ui.tutorial.newCard', { name: ctx.t(card.titleKey) }));
    }
    hide();
    tick();
  };

  const tick = (): void => {
    const state = ctx.store.getState();
    if (!state || !ctx.options.get().tutorial) {
      hide();
      return;
    }
    const list = steps();
    for (const step of list) {
      if (seen.has(step.id)) continue;
      if (alreadyDone(step, state, log, seed)) {
        seen.add(step.id);
        for (const id of step.unlockCards ?? []) unlockCard(seed, id);
        continue;
      }
      if (!triggerReady(step, state, ctx.data)) break;
      show(step);
      return;
    }
    if (openId && seen.has(openId)) hide();
  };

  function steps(): TutorialStep[] {
    const extra = ctx.data as GameData & { tutorial?: TutorialStep[] };
    return extra.tutorial ?? [];
  }

  const offState = ctx.store.subscribe(tick);
  const offLang = ctx.options.subscribe(tick);
  if (!ctx.options.get().tutorial) {
    for (const card of cardsOf(ctx.data)) unlockCard(seed, card.id);
  }
  tick();
  return () => {
    hide();
    offState();
    offLang();
    for (const off of offs) off();
  };
}

function triggerReady(step: TutorialStep, state: GameState, data: GameData): boolean {
  const trigger = step.trigger;
  if (trigger.event === 'day/started') return trigger.day === undefined || state.mission.day === trigger.day;
  if (trigger.event === 'decision/required') return state.mission.decisionPending !== null;
  if (trigger.event === 'streak/changed') return state.mission.streak >= 1;
  if (trigger.event === 'event/forecast') {
    try {
      return computeForecast(state, data).some((item) => {
        if (trigger.eventType && item.type !== trigger.eventType) return false;
        if (trigger.inDays !== undefined && item.inDays !== trigger.inDays) return false;
        return true;
      });
    } catch {
      return false;
    }
  }
  return false;
}

function alreadyDone(step: TutorialStep, state: GameState, log: Set<string>, seed: string): boolean {
  if (step.completeOn && log.has(step.completeOn)) return true;
  if (step.completeOn === 'building/placed') return state.mission.buildings.some((b) => b.type !== 'nave');
  if (step.completeOn === 'resource/collected') return state.mission.map.tiles.some((tile) => tile.collected);
  if (step.completeOn === 'tile/explored') return countExplored(state) > (exploredAtStart.get(seed) ?? 0);
  if (step.completeOn === 'day/ended') return state.mission.day > 1 || state.mission.phase === 'report';
  if (step.completeOn === 'decision/made') {
    return state.mission.decisionPending === null && state.mission.lastReport?.shelter.requested === true;
  }
  return false;
}

function countExplored(state: GameState | null): number {
  return state?.mission.map.tiles.filter((tile) => tile.explored).length ?? 0;
}

function place(bubble: HTMLElement, highlight: string | null): void {
  const stage = document.getElementById('stage')?.getBoundingClientRect();
  const target = highlight ? document.querySelector<HTMLElement>(`[data-tutorial="${cssEscape(highlight)}"]`) : null;
  if (!stage || !target) {
    bubble.style.left = '30%';
    bubble.style.top = '30%';
    return;
  }
  const rect = target.getBoundingClientRect();
  const left = Math.min(Math.max(8, rect.left - stage.left), stage.width - 280);
  const top = Math.min(rect.bottom - stage.top + 8, stage.height - 140);
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;
}

function cssEscape(value: string): string {
  return value.replace(/["\\]/g, '');
}

function skipAll(
  seed: string,
  steps: TutorialStep[],
  seen: Set<string>,
  ctx: AppContext,
  notify: (text: string) => void,
  hide: () => void,
): void {
  for (const step of steps) {
    seen.add(step.id);
    for (const id of step.unlockCards ?? []) {
      unlockCard(seed, id);
      const card = cardsOf(ctx.data).find((item) => item.id === id);
      if (card) notify(ctx.t('ui.tutorial.newCard', { name: ctx.t(card.titleKey) }));
    }
  }
  hide();
}
