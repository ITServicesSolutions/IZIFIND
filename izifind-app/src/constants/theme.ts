export const colors = {
  // Common theme colors
  primary: '#f49517',       // Primary Orange
  lost: '#FF6B6B',          // rouge doux — "Perdu"
  found: '#f49517',         // orange — "Trouvé"
  reward: '#F5A623',        // or — récompenses
  dark: '#151a31',          // Navy Blue — titres
  bg: '#FFFFFF',
  bgAlt: '#faf9f6',         // Warm Beige
  textMuted: '#6B7280',

  // Legacy mappings to prevent component breakages
  background: '#FFFFFF',
  backgroundSoft: '#faf9f6',
  surface: '#FFFFFF',
  surfaceAlt: '#faf9f6',
  border: 'rgba(21, 26, 49, 0.08)',
  text: '#151a31',
  muted: '#6B7280',
  accent: '#f49517',
  accentSoft: '#FF6B6B',
  success: '#f49517',
  danger: '#FF6B6B',
  warning: '#F5A623',
  info: '#f49517',
  white: '#ffffff',
  black: '#000000',

  // Pastel palette for category/illustration backgrounds
  pastel: {
    orange: 'rgba(244, 149, 23, 0.10)',
    red: 'rgba(255, 107, 107, 0.10)',
    blue: 'rgba(96, 165, 250, 0.10)',
    green: 'rgba(45, 212, 191, 0.10)',
    purple: 'rgba(168, 130, 255, 0.10)',
    yellow: 'rgba(251, 191, 36, 0.10)',
  },

  // Gradient endpoints for hero banner
  gradient: {
    start: '#f49517',
    end: '#F5A623',
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
};

export const shadow = {
  color: '#151a31',
  opacity: 0.06,
  offset: { width: 0, height: 2 },
  radius: 8,
  elevation: 2,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 32,
};

export const fontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const APP_NAME = 'IZIFIND';
export const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';
export const MAPBOX_ACCESS_TOKEN = ''; // Utilise maps simulées
export const GEO_MOCK_LOCATION = { latitude: 48.8566, longitude: 2.3522 };
export const LOGO_URL = './assets/images/logo.png';
