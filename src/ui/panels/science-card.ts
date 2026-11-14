// AI-assisted: Cursor Grok 4.7, reviewed by C
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
}

const unlocked = new Map<string, Set<string>>();

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

export function openCards(root: HTMLElement, ctx: AppContext): () => void {
  const seed = ctx.store.getState()?.campaign.seed ?? 'session';
  const previous = document.activeElement;
  const level = ctx.store.getState()?.mission.level;
  const cards = cardsOf(ctx.data).filter((card) => {
    if (card.level !== 'all' && card.level !== level) return false;
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
    title.textContent = ctx.t('ui.cards.title');
    close.textContent = ctx.t('ui.cards.close');
    list.replaceChildren();
    if (cards.length === 0) {
      list.append(el('p', undefined, ctx.t('ui.cards.empty')));
      return;
    }
    for (const card of cards) list.append(cardView(ctx, card));
  };
  const off = on(close, 'click', dispose);
  const offLang = ctx.options.subscribe(paint);
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dispose();
    }
  });
  paint();
  close.focus();
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

function cardView(ctx: AppContext, card: ScienceCard): HTMLElement {
  const block = el('article');
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
  return block;
}
