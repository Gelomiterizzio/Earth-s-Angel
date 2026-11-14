// AI-assisted: Cursor Grok 4.7, reviewed by C

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function cleaner(): { add: (fn: () => void) => void; run: () => void } {
  const fns: Array<() => void> = [];
  return {
    add(fn) {
      fns.push(fn);
    },
    run() {
      while (fns.length) fns.pop()?.();
    },
  };
}

export function on<K extends keyof HTMLElementEventMap>(
  target: EventTarget,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
): () => void {
  target.addEventListener(type, handler as EventListener);
  return () => target.removeEventListener(type, handler as EventListener);
}

export function hasModal(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}
