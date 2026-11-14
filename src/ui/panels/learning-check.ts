// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AppContext } from '../app-bridge';
import { el, on } from '../dom';

export type LearnAnswer = 'A' | 'B' | 'C';

interface LearningTotals {
  version: 1;
  sessions: number;
  pre: Record<LearnAnswer, number>;
  post: Record<LearnAnswer, number>;
  changedToB: number;
}

const EMPTY: LearningTotals = {
  version: 1,
  sessions: 0,
  pre: { A: 0, B: 0, C: 0 },
  post: { A: 0, B: 0, C: 0 },
  changedToB: 0,
};

let preAnswer: LearnAnswer | null = null;
let preSkipped = false;

export function shouldAskPre(ctx: AppContext): boolean {
  const mission = ctx.store.getState()?.mission;
  return mission?.level === 'luna' && mission.day === 1
    && ctx.options.get().learningCheck && preAnswer === null && !preSkipped;
}

export function shouldAskPost(ctx: AppContext): boolean {
  return ctx.options.get().learningCheck && preAnswer !== null && !preSkipped;
}

export function readTotals(): LearningTotals {
  try {
    const raw = localStorage.getItem('ea.learning.v1');
    if (!raw) return structuredClone(EMPTY);
    const parsed: unknown = JSON.parse(raw);
    if (!isTotals(parsed)) return structuredClone(EMPTY);
    return parsed;
  } catch {
    return structuredClone(EMPTY);
  }
}

export function clearTotals(): void {
  try {
    localStorage.removeItem('ea.learning.v1');
  } catch {
    /* session only */
  }
}

export function mountLearningCheck(root: HTMLElement, ctx: AppContext, phase: 'pre' | 'post'): () => void {
  const veil = el('div', 'veil');
  const dialog = el('div', 'dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = el('h2');
  title.id = 'learn-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const options = el('div', 'learn-options');
  const skip = el('button', 'btn');
  skip.type = 'button';
  dialog.append(title, options, skip);
  veil.append(dialog);
  root.append(veil);
  let closed = false;

  const close = (): void => {
    if (closed) return;
    closed = true;
    stop();
    veil.remove();
  };

  const paint = (): void => {
    title.textContent = ctx.t('ui.learn.prompt');
    skip.textContent = ctx.t('ui.learn.skip');
    options.replaceChildren();
    for (const id of ['A', 'B', 'C'] as const) {
      const choice = el('button', 'btn', ctx.t(`ui.learn.${id}`));
      choice.type = 'button';
      choice.addEventListener('click', () => {
        ctx.audio.unlock();
        ctx.audio.playSfx('sfx-confirm');
        record(phase, id);
        if (phase === 'post') {
          options.replaceChildren(el('p', 'suggestion', ctx.t('ui.learn.after')));
          skip.textContent = ctx.t('ui.learn.continue');
          return;
        }
        close();
      });
      options.append(choice);
    }
  };

  const offSkip = on(skip, 'click', () => {
    if (phase === 'pre' && preAnswer === null) preSkipped = true;
    close();
  });
  const offLang = ctx.options.subscribe(paint);
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (phase === 'pre') preSkipped = true;
      close();
    }
  });
  function stop(): void {
    offSkip();
    offLang();
    offKeys();
  }
  paint();
  options.querySelector('button')?.focus();
  return close;
}

function record(phase: 'pre' | 'post', answer: LearnAnswer): void {
  if (phase === 'pre') {
    preAnswer = answer;
    return;
  }
  const totals = readTotals();
  if (preAnswer) totals.pre[preAnswer] += 1;
  totals.post[answer] += 1;
  totals.sessions += 1;
  if (preAnswer && preAnswer !== 'B' && answer === 'B') totals.changedToB += 1;
  try {
    localStorage.setItem('ea.learning.v1', JSON.stringify(totals));
  } catch {
    /* counts stay on this screen only */
  }
  preAnswer = null;
}

function isTotals(value: unknown): value is LearningTotals {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as LearningTotals;
  return row.version === 1 && typeof row.sessions === 'number' && typeof row.changedToB === 'number'
    && countRow(row.pre) && countRow(row.post);
}

function countRow(value: unknown): value is Record<LearnAnswer, number> {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.A === 'number' && typeof row.B === 'number' && typeof row.C === 'number';
}
