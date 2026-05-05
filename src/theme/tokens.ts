export const Colors = {
  // Backgrounds
  BG: '#F2F5F7',
  SURFACE: '#FFFFFF',
  CARD: '#FFFFFF',

  // Borders
  BORDER: '#E0E5EA',
  BORDER_LIGHT: '#EDF0F3',

  // Accent — Splitwise green
  ACCENT: '#1CC29F',
  ACCENT_TEXT: '#13967A',
  ACCENT_MUTED: '#E6F9F5',

  // Text
  TEXT_PRIMARY: '#1A2634',
  TEXT_SECONDARY: '#5C7080',
  TEXT_TERTIARY: '#9AAAB8',

  // Success
  SUCCESS: '#1CC29F',
  SUCCESS_TEXT: '#0D9E82',
  SUCCESS_MUTED: '#E6F9F5',

  // Error
  ERROR: '#E05252',
  ERROR_TEXT: '#C0392B',
  ERROR_MUTED: '#FDECEA',

  // Info
  INFO: '#3B86D8',
  INFO_TEXT: '#2563AE',
  INFO_MUTED: '#EBF3FC',

  // Misc
  WHITE: '#FFFFFF',
  TRANSPARENT: 'transparent',
} as const;

export const Typography = {
  SCREEN_TITLE: { fontSize: 22, fontWeight: '700' as const, fontFamily: 'DMSans_700Bold' },
  SECTION_HEADER: { fontSize: 11, fontWeight: '600' as const, fontFamily: 'DMSans_600SemiBold', letterSpacing: 1.0 },
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
  CHIP: 6,
  INPUT: 10,
  CARD: 14,
  BUTTON: 10,
  PILL: 20,
  FULL: 999,
} as const;

export const AvatarColors = [
  { bg: '#1CC29F', text: '#FFFFFF' },
  { bg: '#3B86D8', text: '#FFFFFF' },
  { bg: '#9B59B6', text: '#FFFFFF' },
  { bg: '#E67E22', text: '#FFFFFF' },
  { bg: '#E05252', text: '#FFFFFF' },
] as const;

export const AvatarSizes = {
  XS: 22,
  SM: 28,
  MD: 32,
  LG: 36,
  XL: 40,
} as const;

export const Shadow = {
  CARD: {
    shadowColor: '#1A2634',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  SHEET: {
    shadowColor: '#1A2634',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
