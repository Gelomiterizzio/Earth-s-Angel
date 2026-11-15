// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Team review pending.
import { drawAstronaut, type SuitRole } from '../../map/astronaut-art';
import { TILE_PX } from '../../map/art';
import type { AppContext } from '../app-bridge';
import type { GameData, LevelId } from '../core-bridge';
import { el, on } from '../dom';

export interface ScienceCard {
  id: string;
  titleKey: string;
  bodyKey: string;
  tag: 'nasa' | 'didactic' | 'balance' | 'fiction';
  source?: { label: string; url: string };
  level: LevelId | 'all';
  /** Verified NASA fact that links the card to a real mission. Text: content.card.<id>.realLife. */
  realLife?: { source?: { label: string; url: string } };
}

const unlocked = new Map<string, Set<string>>();
const choices = ['A', 'B', 'C'] as const;
type Choice = (typeof choices)[number];
const questions: ReadonlyMap<string, { correct: Choice; role: SuitRole }> = new Map([
  ['power', { correct: 'B', role: 'engineer' }],
  ['waterLoop', { correct: 'C', role: 'engineer' }],
  ['airFromWater', { correct: 'A', role: 'engineer' }],
  ['solarStorm', { correct: 'B', role: 'medic' }],
]);

export function hasScienceQuestion(id: string): boolean {
  return questions.has(id);
}

export function cardsOf(data: GameData): ScienceCard[] {
  return (data.cards ?? []).filter(isScienceCard);
}

function isScienceCard(value: unknown): value is ScienceCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Partial<ScienceCard>;
  const { tag, level, source } = card;
  if (typeof card.id !== 'string' || typeof card.titleKey !== 'string' || typeof card.bodyKey !== 'string'
    || (tag !== 'nasa' && tag !== 'didactic' && tag !== 'balance' && tag !== 'fiction')
    || (level !== 'all' && level !== 'luna' && level !== 'marte' && level !== 'tierra')) return false;
  if (!source) return tag !== 'nasa';
  return typeof source.label === 'string' && typeof source.url === 'string' && /^https?:\/\//i.test(source.url);
}

export function unlockCard(seed: string, id: string): void {
  const set = unlocked.get(seed) ?? new Set<string>();
  set.add(id);
  unlocked.set(seed, set);
}

export function unlockAll(seed: string, cards: ScienceCard[]): void {
  for (const card of cards) unlockCard(seed, card.id);
}

export function openCards(root: HTMLElement, ctx: AppContext, practiceId?: string): () => void {
  const seed = ctx.store.getState()?.campaign.seed ?? 'session';
  const previous = document.activeElement;
  const level = ctx.store.getState()?.mission.level;
  const cards = cardsOf(ctx.data).filter((card) => {
    if (card.level !== 'all' && card.level !== level) return false;
    if (practiceId) return card.id === practiceId && hasScienceQuestion(card.id);
    if (!ctx.options.get().tutorial) return true;
    return unlocked.get(seed)?.has(card.id) === true;
  });
  const veil = el('div', 'veil');
  const dialog = el('div', 'dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = el('h2');
  title.id = 'science-cards-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const list = el('div', 'card-list');
  const close = el('button', 'btn btn-primary');
  close.type = 'button';
  dialog.append(title, list, close);
  veil.append(dialog);
  root.append(veil);

  const paint = (): void => {
    title.textContent = ctx.t(practiceId ? 'ui.practice.open' : 'ui.cards.title');
    close.textContent = ctx.t('ui.cards.close');
    list.replaceChildren();
    if (cards.length === 0) {
      list.append(el('p', undefined, ctx.t('ui.cards.empty')));
      return;
    }
    for (const card of cards) list.append(cardView(ctx, card, card.id === practiceId));
  };
  const off = on(close, 'click', dispose);
  const offLang = ctx.options.subscribe(paint);
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dispose();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button, a[href], summary, [tabindex="0"]')]
        .filter((node) => node.getClientRects().length > 0);
      const edge = event.shiftKey ? focusable[0] : focusable.at(-1);
      if (document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? focusable.at(-1) : focusable[0])?.focus();
      }
    }
  });
  paint();
  const firstAnswer = practiceId ? dialog.querySelector<HTMLButtonElement>('.science-question button') : null;
  (firstAnswer ?? close).focus({ preventScroll: true });
  return dispose;

  function dispose(): void {
    if (!veil.isConnected) return;
    off();
    offLang();
    offKeys();
    veil.remove();
    if (previous instanceof HTMLElement) previous.focus();
  }
}

function cardView(ctx: AppContext, card: ScienceCard, practiceOnly: boolean): HTMLElement {
  const block = el('article');
  const question = questions.get(card.id);
  if (practiceOnly && question) {
    block.append(questionView(ctx, card.id, question));
    return block;
  }
  block.append(
    el('h3', undefined, ctx.t(card.titleKey)),
    el('span', `tag tag-${card.tag}`, ctx.t(`ui.cards.tag.${card.tag}`)),
    el('p', undefined, ctx.t(card.bodyKey)),
  );
  if (card.source) {
    const link = el('a', undefined, card.source.label || ctx.t('ui.cards.source'));
    link.href = card.source.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    block.append(link);
  }
  if (card.realLife) {
    // AI-assisted: Claude Code (claude-opus-5-5). Facts checked against the linked NASA pages on 15-nov-2026.
    const real = el('aside', 'science-real');
    real.append(el('strong', undefined, ctx.t('ui.cards.realLife')), el('p', undefined, ctx.t(`content.card.${card.id}.realLife`)));
    const source = card.realLife.source ?? card.source;
    if (source) {
      const link = el('a', undefined, source.label || ctx.t('ui.cards.source'));
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      real.append(link);
    }
    block.append(real);
  }
  if (question) {
    const practice = el('details', 'science-practice');
    practice.append(el('summary', undefined, ctx.t('ui.practice.open')), questionView(ctx, card.id, question));
    block.append(practice);
  }
  return block;
}

function questionView(ctx: AppContext, id: string, question: { correct: Choice; role: SuitRole }): HTMLElement {
  const key = `ui.practice.${id}`;
  const body = el('div', 'science-question');
  const prompt = el('h3', undefined, ctx.t(`${key}.prompt`));
  const answers = el('div', 'learn-options');
  body.append(prompt, answers);
  for (const choice of choices) {
    const option = el('button', 'btn', `${choice}. ${ctx.t(`${key}.${choice}`)}`);
    option.type = 'button';
    option.addEventListener('click', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx('sfx-confirm');
      const answer = ctx.t('ui.practice.answer', {
        choice: question.correct,
        label: ctx.t(`${key}.${question.correct}`),
      });
      const { feedback, speech } = scienceReply(ctx, choice === question.correct, [question.role],
        answer, ctx.t(`${key}.why`));
      answers.replaceWith(feedback);
      speech.focus({ preventScroll: true });
    }, { once: true });
    answers.append(option);
  }
  return body;
}

export function scienceReply(ctx: AppContext, correct: boolean, roles: readonly SuitRole[], answer: string, why: string) {
  const feedback = el('div', 'science-feedback');
  const crew = el('div', 'science-crew');
  crew.setAttribute('aria-hidden', 'true');
  for (const role of roles) {
    const astronaut = el('canvas', 'science-astronaut');
    astronaut.width = astronaut.height = TILE_PX;
    const g = astronaut.getContext('2d');
    if (g) drawAstronaut(g, { x: 1, y: 0 }, -1, role);
    crew.append(astronaut);
  }
  const speech = el('div', 'science-speech');
  speech.tabIndex = 0;
  speech.setAttribute('role', 'status');
  speech.append(el('strong', undefined, ctx.t(correct ? 'ui.practice.correct' : 'ui.practice.almost')),
    el('p', undefined, answer), el('p', undefined, why));
  feedback.append(crew, speech);
  return { feedback, speech };
}
