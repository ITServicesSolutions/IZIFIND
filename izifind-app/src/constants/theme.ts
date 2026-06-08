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
  xl: 24,
};

export const shadow = {
  color: '#151a31',
  opacity: 0.08,
  offset: { width: 0, height: 4 },
  radius: 12,
  elevation: 3,
};

export const APP_NAME = 'IZIFIND';
export const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';
export const MAPBOX_ACCESS_TOKEN = ''; // Utilise maps simulées
export const GEO_MOCK_LOCATION = { latitude: 48.8566, longitude: 2.3522 };
