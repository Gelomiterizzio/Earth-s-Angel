// AI-assisted: Cursor Grok 4.7, reviewed by C

export interface SliderOptions {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInput: (value: number) => void;
}

export function slider(options: SliderOptions): HTMLLabelElement {
  const wrap = document.createElement('label');
  wrap.className = 'option-row';
  const name = document.createElement('span');
  name.textContent = options.label;
  const value = document.createElement('span');
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.value);
  const field = document.createElement('span');
  field.className = 'row';
  const paint = (): void => {
    value.textContent = input.value;
  };
  paint();
  input.addEventListener('input', () => {
    paint();
    options.onInput(Number(input.value));
  });
  field.append(input, value);
  wrap.append(name, field);
  return wrap;
}

export function setSliderValue(wrap: HTMLLabelElement, next: number): void {
  const input = wrap.querySelector('input');
  const value = wrap.querySelector('span.row span');
  if (!input || document.activeElement === input) return;
  input.value = String(next);
  if (value) value.textContent = String(next);
}
