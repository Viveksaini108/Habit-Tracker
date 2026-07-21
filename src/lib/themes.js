export const THEMES = [
  {
    id: 'light',
    name: 'Daylight',
    description: 'Clean & bright',
    swatch: ['#f0f3f8', '#ffffff', '#6366f1'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep dark mode',
    swatch: ['#090c18', '#14182b', '#818cf8'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool cyan calm',
    swatch: ['#eaf7f9', '#ffffff', '#0891b2'],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Fresh & grounded',
    swatch: ['#eff7f1', '#ffffff', '#059669'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm evening glow',
    swatch: ['#1a1210', '#291d18', '#fb923c'],
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Playful pastels',
    swatch: ['#faf1fc', '#ffffff', '#d946ef'],
  },
];

export const THEME_IDS = new Set(THEMES.map((t) => t.id));
export const DEFAULT_THEME = 'light';
export const THEME_COOKIE = 'habitflow_theme';
