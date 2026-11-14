// AI-assisted: Cursor Grok 4.7, reviewed by C

export interface ToggleOptions {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function toggle(options: ToggleOptions): HTMLLabelElement {
  const wrap = document.createElement('label');
  wrap.className = 'option-row';
  const name = document.createElement('span');
  name.textContent = options.label;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = options.checked;
  input.addEventListener('change', () => options.onChange(input.checked));
  wrap.append(name, input);
  return wrap;
}

export function setToggle(wrap: HTMLLabelElement, checked: boolean): void {
  const input = wrap.querySelector('input');
  if (!input || document.activeElement === input) return;
  input.checked = checked;
}
