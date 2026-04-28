export const Colors = {
  // Backgrounds
  BG: '#0F0E0C',
  SURFACE: '#1A1915',
  CARD: '#222118',

  // Borders
  BORDER: '#2E2C24',
  BORDER_LIGHT: '#3A3830',

  // Accent
  ACCENT: '#E8A020',
  ACCENT_TEXT: '#F5C55A',
  ACCENT_MUTED: '#2A1E08',

  // Text
  TEXT_PRIMARY: '#F0EDE6',
  TEXT_SECONDARY: '#9C9885',
  TEXT_TERTIARY: '#5C5A50',

  // Success (Splitwise synced)
  SUCCESS: '#4CAF7D',
  SUCCESS_TEXT: '#6FCF97',
  SUCCESS_MUTED: '#0F2018',

  // Error (not linked)
  ERROR: '#E05252',
  ERROR_TEXT: '#F47F7F',
  ERROR_MUTED: '#2A1010',

  // Info (linked)
  INFO: '#5B9BD5',
  INFO_TEXT: '#7BB8F0',
  INFO_MUTED: '#101825',

  // Misc
  WHITE: '#FFFFFF',
  TRANSPARENT: 'transparent',
} as const;

export const Typography = {
  SCREEN_TITLE: { fontSize: 22, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
  SECTION_HEADER: { fontSize: 13, fontWeight: '600' as const, fontFamily: 'DMSans_600SemiBold', letterSpacing: 0.8 },
  LIST_TITLE: { fontSize: 15, fontWeight: '600' as const, fontFamily: 'DMSans_600SemiBold' },
  LIST_SUBTITLE: { fontSize: 13, fontWeight: '400' as const, fontFamily: 'DMSans_400Regular' },
  BODY: { fontSize: 14, fontWeight: '400' as const, fontFamily: 'DMSans_400Regular' },
  MEAL_DESCRIPTION: { fontSize: 13, fontWeight: '400' as const, fontFamily: 'DMMono_400Regular' },
  PHONE: { fontSize: 13, fontWeight: '400' as const, fontFamily: 'DMMono_400Regular' },
  HERO_NUMBER: { fontSize: 26, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
  BUTTON: { fontSize: 15, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
  BADGE: { fontSize: 11, fontWeight: '500' as const, fontFamily: 'DMSans_500Medium' },
  CAPTION: { fontSize: 12, fontWeight: '400' as const, fontFamily: 'DMSans_400Regular' },
} as const;

export const Spacing = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 20,
  XL: 24,
  XXL: 32,
} as const;

export const Radius = {
  CHIP: 4,
  INPUT: 10,
  CARD: 12,
  BUTTON: 12,
  PILL: 20,
  FULL: 999,
} as const;

export const AvatarColors = [
  { bg: '#3D2E1E', text: '#E8A020' },
  { bg: '#1A2E20', text: '#4CAF7D' },
  { bg: '#1A1E2E', text: '#5B9BD5' },
  { bg: '#2E1A2E', text: '#C77DFF' },
  { bg: '#2E1A1A', text: '#E05252' },
] as const;

export const AvatarSizes = {
  XS: 22,
  SM: 28,
  MD: 32,
  LG: 36,
  XL: 40,
} as const;
