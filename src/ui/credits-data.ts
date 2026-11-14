// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.

export interface CreditLink {
  labelKey: string;
  url: string;
}

export const nasaLinks: CreditLink[] = [
  { labelKey: 'ui.credits.donki', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' },
  { labelKey: 'ui.credits.eclss', url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/' },
];

export const toolRows: { nameKey: string; licenseKey: string }[] = [
  { nameKey: 'ui.credits.toolPhaser', licenseKey: 'ui.credits.mit' },
  { nameKey: 'ui.credits.toolVite', licenseKey: 'ui.credits.mit' },
  { nameKey: 'ui.credits.toolTypeScript', licenseKey: 'ui.credits.apache' },
  { nameKey: 'ui.credits.toolVitest', licenseKey: 'ui.credits.mit' },
];

export const aiRows: { useKey: string; toolKey: string }[] = [
  { useKey: 'ui.credits.aiPlan', toolKey: 'ui.credits.aiClaude' },
  { useKey: 'ui.credits.aiUi', toolKey: 'ui.credits.aiGrok' },
  { useKey: 'ui.credits.aiVisualReview', toolKey: 'ui.credits.aiCodex' },
];

export const fontCredit: CreditLink = {
  labelKey: 'ui.credits.font',
  url: 'https://fonts.google.com/specimen/Pixelify+Sans',
};
