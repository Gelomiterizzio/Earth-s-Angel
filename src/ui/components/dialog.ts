// AI-assisted: Cursor Grok 4.7, reviewed by C
import { el, on } from '../dom';

export interface DialogOptions {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function openDialog(parent: HTMLElement, options: DialogOptions): () => void {
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const veil = el('div', 'veil');
  const dialog = el('div', 'dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = el('h2', undefined, options.title);
  const titleId = `dlg-${Date.now()}`;
  title.id = titleId;
  dialog.setAttribute('aria-labelledby', titleId);
  const body = el('p', undefined, options.body);
  const actions = el('div', 'row');
  const confirm = el('button', 'btn btn-primary', options.confirmLabel);
  confirm.type = 'button';
  const cancel = options.cancelLabel ? el('button', 'btn', options.cancelLabel) : null;
  if (cancel) cancel.type = 'button';
  actions.append(confirm);
  if (cancel) actions.append(cancel);
  dialog.append(title, body, actions);
  veil.append(dialog);
  parent.append(veil);

  const close = (result: 'confirm' | 'cancel'): void => {
    stop();
    veil.remove();
    previous?.focus();
    if (result === 'confirm') options.onConfirm();
    else options.onCancel();
  };

  const offConfirm = on(confirm, 'click', () => close('confirm'));
  const offCancel = cancel ? on(cancel, 'click', () => close('cancel')) : () => undefined;
  const offKeys = on(dialog, 'keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close('cancel');
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => !node.hasAttribute('disabled'));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  confirm.focus();

  function stop(): void {
    offConfirm();
    offCancel();
    offKeys();
  }

  return () => {
    if (!veil.isConnected) return;
    stop();
    veil.remove();
    previous?.focus();
  };
}
