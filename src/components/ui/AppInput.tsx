import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Colors, Spacing, Radius, Typography } from '../../theme/tokens';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  mono?: boolean;
}

export function AppInput({ label, error, mono = false, style, ...props }: AppInputProps) {
  return (
    <View>
      {label ? (
        <AppText variant="CAPTION" color={Colors.TEXT_SECONDARY} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        style={[
          styles.input,
          mono && { fontFamily: 'DMMono_400Regular' },
          error ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={Colors.TEXT_TERTIARY}
        selectionColor={Colors.ACCENT}
        {...props}
      />
      {error ? (
        <AppText variant="CAPTION" color={Colors.ERROR_TEXT} style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.XS,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    borderRadius: Radius.INPUT,
    paddingHorizontal: Spacing.MD,
    paddingVertical: Spacing.SM + 4,
    color: Colors.TEXT_PRIMARY,
    fontSize: Typography.BODY.fontSize,
    fontFamily: 'DMSans_400Regular',
  },
  inputError: {
    borderColor: Colors.ERROR,
  },
  errorText: {
    marginTop: Spacing.XS,
  },
});
