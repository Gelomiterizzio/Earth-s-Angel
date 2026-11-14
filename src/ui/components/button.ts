// AI-assisted: Cursor Grok 4.7, reviewed by C

export interface ButtonOptions {
  label: string;
  className?: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function button(options: ButtonOptions): HTMLButtonElement {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = options.className ? `btn ${options.className}` : 'btn';
  node.textContent = options.label;
  node.disabled = options.disabled === true;
  if (options.pressed !== undefined) node.setAttribute('aria-pressed', options.pressed ? 'true' : 'false');
  node.addEventListener('click', options.onClick);
  return node;
}
