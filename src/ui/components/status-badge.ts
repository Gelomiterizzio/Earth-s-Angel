// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { Status } from '../core-bridge';
import { el } from '../dom';

export function statusBadge(status: Status, label: string, markText: string): HTMLSpanElement {
  const node = el('span', `status status-${status}`);
  const mark = el('span', 'mark', markText);
  mark.setAttribute('aria-hidden', 'true');
  const text = el('span', undefined, label);
  node.append(mark, text);
  return node;
}
