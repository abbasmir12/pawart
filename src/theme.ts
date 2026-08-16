export const colors = {
  background: '#F2FAF9',
  surface: '#FFFFFF',
  ink: '#211653',
  muted: '#746C8E',
  purple: '#8B3DFF',
  purpleDark: '#6924DB',
  purpleSoft: '#EEE2FF',
  coral: '#FF6B4A',
  orange: '#FF9D2E',
  peach: '#FFDCC8',
  mint: '#A7E8E4',
  line: '#E2EAE9',
  success: '#27AE78',
  danger: '#D94F58',
} as const;

export const shadows = {
  card: {
    shadowColor: '#3A206B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 7,
  },
  button: {
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
};

export const radius = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 38,
  pill: 999,
} as const;
