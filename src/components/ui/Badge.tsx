import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Colors, Spacing, Radius } from '../../theme/tokens';

type BadgeVariant = 'success' | 'error' | 'info' | 'accent' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.SUCCESS_MUTED, text: Colors.SUCCESS_TEXT },
  error: { bg: Colors.ERROR_MUTED, text: Colors.ERROR_TEXT },
  info: { bg: Colors.INFO_MUTED, text: Colors.INFO_TEXT },
  accent: { bg: Colors.ACCENT_MUTED, text: Colors.ACCENT_TEXT },
  neutral: { bg: Colors.SURFACE, text: Colors.TEXT_SECONDARY },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <AppText variant="BADGE" color={text}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.SM,
    borderRadius: Radius.PILL,
    alignSelf: 'flex-start',
  },
});
