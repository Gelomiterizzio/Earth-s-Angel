// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AppContext, Screen } from '../app-bridge';
import { button } from '../components/button';
import { openDialog } from '../components/dialog';
import { setSliderValue, slider } from '../components/slider';
import { setToggle, toggle } from '../components/toggle';
import { bindChrome, press, showNarrow } from '../chrome';
import { cleaner, el, on } from '../dom';
import { CONTROL_LABEL_KEYS } from '../shortcuts';

let cleanup: (() => void) | null = null;

export const optionsScreen: Screen = {
  mount(root, ctx) {
    cleanup = mountOptions(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};

function mountOptions(root: HTMLElement, ctx: AppContext): () => void {
  const bag = cleaner();
  const screen = el('section', 'screen screen-menu');
  root.append(screen);
  bag.add(bindChrome(ctx));
  bag.add(showNarrow(screen, ctx));
  bag.add(() => screen.remove());

  const list = el('div', 'options-list');
  const master = slider({
    label: ctx.t('ui.options.master'),
    value: ctx.options.get().volumeMaster,
    min: 0,
    max: 100,
    step: 5,
    onInput: (value) => ctx.options.set('volumeMaster', value),
  });
  const music = slider({
    label: ctx.t('ui.options.music'),
    value: ctx.options.get().volumeMusic,
    min: 0,
    max: 100,
    step: 5,
    onInput: (value) => ctx.options.set('volumeMusic', value),
  });
  const sfx = slider({
    label: ctx.t('ui.options.sfx'),
    value: ctx.options.get().volumeSfx,
    min: 0,
    max: 100,
    step: 5,
    onInput: (value) => ctx.options.set('volumeSfx', value),
  });
  const sfxInput = sfx.querySelector('input');
  if (sfxInput) {
    bag.add(on(sfxInput, 'change', () => {
      ctx.audio.unlock();
      ctx.audio.playSfx('sfx-click');
    }));
  }
  const muted = toggle({
    label: ctx.t('ui.options.muted'),
    checked: ctx.options.get().muted,
    onChange: (checked) => ctx.options.set('muted', checked),
  });
  const subs = toggle({
    label: ctx.t('ui.options.subtitles'),
    checked: ctx.options.get().subtitles,
    onChange: (checked) => ctx.options.set('subtitles', checked),
  });
  const motion = toggle({
    label: ctx.t('ui.options.reducedMotion'),
    checked: ctx.options.get().reducedMotion,
    onChange: (checked) => ctx.options.set('reducedMotion', checked),
  });
  const tutorial = toggle({
    label: ctx.t('ui.options.tutorial'),
    checked: ctx.options.get().tutorial,
    onChange: (checked) => ctx.options.set('tutorial', checked),
  });
  const learning = toggle({
    label: ctx.t('ui.options.learning'),
    checked: ctx.options.get().learningCheck,
    onChange: (checked) => ctx.options.set('learningCheck', checked),
  });

  const langRow = el('div', 'option-row');
  const langName = el('span', undefined, ctx.t('ui.options.language'));
  const langButtons = el('div', 'row');
  const en = button({
    label: ctx.t('ui.title.langEn'),
    pressed: ctx.options.get().language === 'en',
    onClick: press(ctx, () => ctx.options.set('language', 'en')),
  });
  const es = button({
    label: ctx.t('ui.title.langEs'),
    pressed: ctx.options.get().language === 'es',
    onClick: press(ctx, () => ctx.options.set('language', 'es')),
  });
  langButtons.append(en, es);
  langRow.append(langName, langButtons);

  list.append(master, music, sfx, muted, subs, motion, tutorial, learning, langRow);

  let fullscreenRow: HTMLLabelElement | null = null;
  let fullscreenNote = el('p', 'dim', '');
  if (document.fullscreenEnabled) {
    fullscreenRow = toggle({
      label: ctx.t('ui.options.fullscreen'),
      checked: ctx.options.get().fullscreen,
      onChange: (checked) => void setFullscreen(ctx, checked, fullscreenNote, fullscreenRow),
    });
    list.append(fullscreenRow, fullscreenNote);
  }

  const controlsTitle = el('h2', undefined, ctx.t('ui.options.controls'));
  const controls = el('ul', 'controls-list');
  for (const key of CONTROL_LABEL_KEYS) controls.append(el('li', undefined, ctx.t(key)));
  list.append(controlsTitle, controls);

  const reset = button({
    label: ctx.t('ui.options.reset'),
    onClick: press(ctx, () => {
      openDialog(screen, {
        title: ctx.t('ui.dialog.confirm'),
        body: ctx.t('ui.options.resetBody'),
        confirmLabel: ctx.t('ui.dialog.yes'),
        cancelLabel: ctx.t('ui.dialog.no'),
        onConfirm: () => {
          ctx.audio.playSfx('sfx-confirm');
          ctx.options.reset();
        },
        onCancel: () => undefined,
      });
    }),
  });
  const back = button({
    label: ctx.t('ui.options.back'),
    className: 'btn-primary',
    onClick: press(ctx, () => ctx.flow.back()),
  });
  const actions = el('div', 'row');
  actions.append(reset, back);

  const heading = el('h1', 'screen-title', ctx.t('ui.options.heading'));
  screen.append(heading, list, actions);
  back.focus();

  const relabel = (): void => {
    heading.textContent = ctx.t('ui.options.heading');
    const options = ctx.options.get();
    setSliderValue(master, options.volumeMaster);
    setSliderValue(music, options.volumeMusic);
    setSliderValue(sfx, options.volumeSfx);
    setToggle(muted, options.muted);
    setToggle(subs, options.subtitles);
    setToggle(motion, options.reducedMotion);
    setToggle(tutorial, options.tutorial);
    setToggle(learning, options.learningCheck);
    if (fullscreenRow) setToggle(fullscreenRow, options.fullscreen);
    en.setAttribute('aria-pressed', options.language === 'en' ? 'true' : 'false');
    es.setAttribute('aria-pressed', options.language === 'es' ? 'true' : 'false');
    langName.textContent = ctx.t('ui.options.language');
    labelOf(master, ctx.t('ui.options.master'));
    labelOf(music, ctx.t('ui.options.music'));
    labelOf(sfx, ctx.t('ui.options.sfx'));
    labelOf(muted, ctx.t('ui.options.muted'));
    labelOf(subs, ctx.t('ui.options.subtitles'));
    labelOf(motion, ctx.t('ui.options.reducedMotion'));
    labelOf(tutorial, ctx.t('ui.options.tutorial'));
    labelOf(learning, ctx.t('ui.options.learning'));
    if (fullscreenRow) labelOf(fullscreenRow, ctx.t('ui.options.fullscreen'));
    controlsTitle.textContent = ctx.t('ui.options.controls');
    const items = controls.querySelectorAll('li');
    CONTROL_LABEL_KEYS.forEach((key, index) => {
      const item = items[index];
      if (item) item.textContent = ctx.t(key);
    });
    reset.textContent = ctx.t('ui.options.reset');
    back.textContent = ctx.t('ui.options.back');
    en.textContent = ctx.t('ui.title.langEn');
    es.textContent = ctx.t('ui.title.langEs');
  };
  bag.add(ctx.options.subscribe(relabel));
  bag.add(on(screen, 'keydown', (event) => {
    if (event.key === 'Escape' && !document.querySelector('[role="dialog"]')) {
      event.preventDefault();
      ctx.flow.back();
    }
  }));
  bag.add(on(document, 'fullscreenchange', () => {
    ctx.options.set('fullscreen', document.fullscreenElement !== null);
  }));
  return () => bag.run();
}

function labelOf(wrap: HTMLElement, text: string): void {
  const name = wrap.querySelector('span');
  if (name) name.textContent = text;
}

async function setFullscreen(
  ctx: AppContext,
  on: boolean,
  note: HTMLElement,
  row: HTMLLabelElement | null,
): Promise<void> {
  const stage = document.getElementById('stage') ?? document.documentElement;
  try {
    if (on) await stage.requestFullscreen();
    else if (document.fullscreenElement) await document.exitFullscreen();
    note.textContent = '';
    ctx.options.set('fullscreen', document.fullscreenElement !== null);
  } catch {
    ctx.options.set('fullscreen', false);
    note.textContent = ctx.t('ui.options.fullscreenDenied');
    const box = row?.querySelector('input');
    if (box) box.checked = false;
  }
}
