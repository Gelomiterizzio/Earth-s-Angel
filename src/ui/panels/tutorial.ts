// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { AppContext } from '../app-bridge';
import type { GameData, GameState } from '../core-bridge';
import { computeForecast } from '../core-bridge';
import { el, on } from '../dom';
import { unlockCard, cardsOf, hasScienceQuestion, openCards } from './science-card';

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
  let placementFrame = 0;
  let closePractice: (() => void) | undefined;

  const hide = (): void => {
    cancelAnimationFrame(placementFrame);
    bubble?.remove();
    bubble = null;
    openId = null;
  };

  const show = (step: TutorialStep): void => {
    if (openId === step.id && bubble) {
      const text = bubble.querySelector('p');
      if (text) text.textContent = ctx.t(stepText(ctx, step.textKey));
      const practice = bubble.querySelector('.tutorial-practice');
      if (practice) practice.textContent = ctx.t('ui.practice.open');
      return;
    }
    hide();
    openId = step.id;
    bubble = el('div', 'bubble');
    bubble.setAttribute('role', 'dialog');
    bubble.toggleAttribute('data-modal-tip', step.highlight === 'panel-decision');
    const text = el('p', undefined, ctx.t(stepText(ctx, step.textKey)));
    const ok = el('button', 'btn btn-primary', ctx.t('ui.tutorial.ok'));
    ok.type = 'button';
    const skip = el('button', 'btn', ctx.t('ui.tutorial.skipAll'));
    skip.type = 'button';
    const actions = el('div', 'row bubble-actions');
    actions.append(ok);
    const questionId = step.unlockCards?.find(hasScienceQuestion);
    if (questionId) {
      const practice = el('button', 'btn tutorial-practice', ctx.t('ui.practice.open'));
      practice.type = 'button';
      practice.addEventListener('click', () => {
        closePractice?.();
        closePractice = openCards(root, ctx, questionId);
      });
      actions.append(practice);
    }
    actions.append(skip);
    bubble.append(text, actions);
    root.append(bubble);
    const followAnchor = (): void => {
      if (!bubble) return;
      place(bubble, tutorialAnchor(step.highlight, ctx.store.getState()));
      placementFrame = requestAnimationFrame(followAnchor);
    };
    followAnchor();
    ok.addEventListener('click', () => finish(step));
    skip.addEventListener('click', () => skipAll(seed, steps(), seen, ctx, notify, hide));
    if (
      !document.querySelector('[role="dialog"][aria-modal="true"]') &&
      !document.querySelector('#map[data-walk-input]')
    ) {
      ok.focus();
    }
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
      if (alreadyDone(step, state, log, seed) ||
        (step.trigger.event === 'day/started' && step.trigger.day !== undefined && state.mission.day > step.trigger.day)) {
        seen.add(step.id);
        for (const id of step.unlockCards ?? []) unlockCard(seed, id);
        continue;
      }
      if (!triggerReady(step, state, ctx.data)) continue;
      show(step);
      return;
    }
    hide();
  };

  function steps(): TutorialStep[] {
    if (ctx.store.getState()?.mission.level === 'marte') {
      return [{
        id: 'mars-field',
        trigger: { event: 'day/started', day: 1 },
        highlight: 'btn-base',
        textKey: 'ui.walk.marsArrival',
        unlockCards: ['sol', 'marsDust', 'sameStormMars'],
      }];
    }
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
    closePractice?.();
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

function tutorialAnchor(highlight: string | null, state: GameState | null): HTMLElement[] {
  const anchors: HTMLElement[] = [];
  const add = (selector: string) => {
    const anchor = document.querySelector<HTMLElement>(selector);
    if (anchor) anchors.push(anchor);
  };
  if (highlight === 'panel-decision') add('[data-tutorial="panel-decision"] .dialog');
  else if (highlight) add(`[data-tutorial="${cssEscape(highlight)}"]`);
  if (state?.mission.level === 'luna') {
    if (highlight === 'tool-explore' || highlight === 'tool-collect' || highlight === 'palette-extractor') {
      const terrain = highlight === 'tool-collect' ? 'mineral' : 'hielo';
      // The nearest deposit to the astronaut, preferring one already in view (reachable on foot).
      const from = state.mission.map.tiles.find((t) => t.terrain === 'nave') ?? { x: 0, y: 0 };
      const near = (t: { x: number; y: number }) => Math.abs(t.x - from.x) + Math.abs(t.y - from.y);
      const tile = state.mission.map.tiles
        .filter((t) => t.terrain === terrain && !t.collected && (terrain === 'hielo' || t.explored))
        .sort((a, b) => Number(b.explored) - Number(a.explored) || near(a) - near(b))[0];
      if (tile) add(`#map .map-cell[data-x="${tile.x}"][data-y="${tile.y}"]`);
    }
    if (highlight === 'hud-forecast' || highlight === 'hud-objectives') add('[data-hud-focus="base"]');
    if (highlight?.startsWith('palette-') || highlight?.startsWith('tool-')) add('.walk-hint-menu');
    add('#map .walk-avatar');
  }
  return anchors;
}

function place(bubble: HTMLElement, anchors: HTMLElement[]): void {
  const stage = document.getElementById('stage')?.getBoundingClientRect();
  if (!stage?.width || !stage.height) return;
  const margin = 12;
  const gap = 12;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
  const { width, height } = bubble.getBoundingClientRect();
  const rect = anchors.map((anchor) => anchor.getBoundingClientRect()).find((rect) =>
    rect.width > 0 && rect.height > 0 && rect.left >= stage.left && rect.right <= stage.right
    && rect.top >= stage.top && rect.bottom <= stage.bottom);
  const anchorX = rect ? (rect.left + rect.right) / 2 - stage.left : stage.width / 2;
  const left = clamp(anchorX - width / 2, margin, stage.width - width - margin);
  const below = rect ? rect.bottom - stage.top + gap : margin;
  const above = rect ? rect.top - stage.top - height - gap : margin;
  if (rect && below + height + margin > stage.height && above < margin) {
    const right = rect.right - stage.left + gap;
    const leftOfTarget = rect.left - stage.left - width - gap;
    if (right + width + margin <= stage.width || leftOfTarget >= margin) {
      const toRight = right + width + margin <= stage.width;
      const anchorY = (rect.top + rect.bottom) / 2 - stage.top;
      const top = clamp(anchorY - height / 2, margin, stage.height - height - margin);
      bubble.style.left = `${Math.round(toRight ? right : leftOfTarget)}px`;
      bubble.style.top = `${Math.round(top)}px`;
      bubble.style.setProperty('--tutorial-arrow-y', `${clamp(anchorY - top, 15, height - 15)}px`);
      bubble.dataset.arrow = toRight ? 'left' : 'right';
      return;
    }
  }
  const opensUp = Boolean(rect && below + height + margin > stage.height &&
    (above >= margin || stage.height - below < rect.top - stage.top));
  const top = clamp(opensUp ? above : below, margin, stage.height - height - margin);
  bubble.style.left = `${Math.round(left)}px`;
  bubble.style.top = `${Math.round(top)}px`;
  bubble.style.setProperty('--tutorial-arrow-x', `${clamp(anchorX - left, 15, width - 15)}px`);
  bubble.dataset.arrow = rect ? opensUp ? 'bottom' : 'top' : 'none';
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

/** On a random map the ice is not where the fixed tutorial says: use the neutral line. */
function stepText(ctx: AppContext, key: string): string {
  return key === 'content.tutorial.t04' && ctx.store.getState()?.campaign.randomMap ? 'content.tutorial.t04random' : key;
}
