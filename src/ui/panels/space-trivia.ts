// AI-assisted: Claude Code (claude-opus-5-5). Directed and approved by the team.
// A space question after a day that had no question of its own. Questions rotate at random
// without repeating until the whole bank was asked, and the answers are shuffled every time.
// UI only: it never changes the game state.
import { TRIVIA, TRIVIA_SOURCES } from '../../data/trivia';
import type { AppContext } from '../app-bridge';
import { el, on } from '../dom';
import { scienceReply } from './science-card';

const SEEN_KEY = 'ea.trivia.seen';
const LETTERS = ['A', 'B', 'C'] as const;

function readSeen(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]): void {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ }
}

/** Picks a question not asked yet; once all were asked, starts a new round. */
export function nextTriviaId(random: () => number = Math.random): string {
  let seen = readSeen();
  let left = TRIVIA.filter((q) => !seen.includes(q.id));
  if (left.length === 0) {
    seen = [];
    left = [...TRIVIA];
  }
  const pick = left[Math.floor(random() * left.length)] ?? TRIVIA[0];
  writeSeen([...seen, pick.id]);
  return pick.id;
}

function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function openTrivia(root: HTMLElement, ctx: AppContext, id = nextTriviaId()): () => void {
  const entry = TRIVIA.find((q) => q.id === id) ?? TRIVIA[0];
  const key = `ui.trivia.${entry.id}`;
  const previous = document.activeElement;
  const veil = el('div', 'veil');
  const dialog = el('div', 'dialog trivia');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = el('h2', 'report-card-title', ctx.t('ui.trivia.title'));
  title.dataset.icon = '🪐';
  title.id = 'trivia-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const body = el('div', 'science-question');
  const prompt = el('h3', undefined, ctx.t(`${key}.prompt`));
  const answers = el('div', 'learn-options');
  const order = shuffled(['right', 'wrong1', 'wrong2'] as const);
  const rightLetter = LETTERS[order.indexOf('right')];
  order.forEach((part, index) => {
    const option = el('button', 'btn', `${LETTERS[index]}. ${ctx.t(`${key}.${part}`)}`);
    option.type = 'button';
    option.addEventListener('click', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx('sfx-confirm');
      const answer = ctx.t('ui.practice.answer', { choice: rightLetter, label: ctx.t(`${key}.right`) });
      const { feedback, speech } = scienceReply(ctx, part === 'right', ['commander'], answer, ctx.t(`${key}.why`));
      answers.replaceWith(feedback);
      speech.focus({ preventScroll: true });
    }, { once: true });
    answers.append(option);
  });
  const source = TRIVIA_SOURCES[entry.source];
  const link = el('a', undefined, source.label) as HTMLAnchorElement;
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const sourceLine = el('p', 'report-sub', `${ctx.t('ui.trivia.source')}: `);
  sourceLine.append(link);
  body.append(prompt, answers);
  const close = el('button', 'btn btn-primary', ctx.t('ui.cards.close'));
  close.type = 'button';
  dialog.append(title, body, sourceLine, close);
  veil.append(dialog);
  root.append(veil);
  answers.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });

  let closed = false;
  function dispose(): void {
    if (closed) return;
    closed = true;
    offClose();
    offKeys();
    veil.remove();
    if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
  }
  const offClose = on(close, 'click', dispose);
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dispose();
    }
  });
  return dispose;
}
