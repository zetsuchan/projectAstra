// Video settings
export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920; // Vertical format for social
export const VIDEO_FPS = 60;

// Duration in seconds
export const PROMO_DURATION_SECONDS = 30;
export const PROMO_DURATION_FRAMES = PROMO_DURATION_SECONDS * VIDEO_FPS;

// Scene durations (in seconds)
export const SCENE_DURATIONS = {
  intro: 4,
  tagline: 3,
  chatDemo: 5,
  feedDemo: 4,
  diaryDemo: 4,
  marketsDemo: 4,
  outro: 6,
} as const;

// Colors - matching Astra's design system
export const COLORS = {
  // Backgrounds
  bgDark: "#0b0a0e",
  bgCard: "#151219",
  bgGlow: "#1a1520",

  // Accents
  rose: "#f472b6",
  lilac: "#d8b4fe",
  amber: "#fde68a",
  emerald: "#6ee7b7",
  violet: "#8b5cf6",

  // Text
  textPrimary: "#fafaf9",
  textSecondary: "#a8a29e",
  textMuted: "#78716c",
} as const;

// Fonts
export const FONTS = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
} as const;
