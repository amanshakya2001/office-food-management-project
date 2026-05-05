import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Colors, Spacing, Radius } from '../../theme/tokens';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label, onPress, variant = 'primary', loading = false, disabled = false, style,
}: AppButtonProps) {
  const styles = getStyles(variant, disabled || loading);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.button, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.WHITE : Colors.ACCENT} size="small" />
      ) : (
        <AppText
          variant="BUTTON"
          color={variant === 'primary' ? Colors.WHITE : variant === 'secondary' ? Colors.ACCENT : Colors.ACCENT_TEXT}
        >
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
}

function getStyles(variant: string, disabled: boolean) {
  return StyleSheet.create({
    button: {
      height: 48,
      borderRadius: Radius.BUTTON,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.LG,
      opacity: disabled ? 0.5 : 1,
      backgroundColor:
        variant === 'primary' ? Colors.ACCENT :
        variant === 'secondary' ? Colors.ACCENT_MUTED : Colors.TRANSPARENT,
      borderWidth: variant === 'secondary' ? 1 : 0,
      borderColor: variant === 'secondary' ? Colors.ACCENT : undefined,
    },
  });
}
