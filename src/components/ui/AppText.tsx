import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../theme/tokens';

type Variant = keyof typeof Typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export function AppText({ variant = 'BODY', color, style, ...props }: AppTextProps) {
  return (
    <Text
      style={[
        Typography[variant],
        { color: color ?? Colors.TEXT_PRIMARY },
        style,
      ]}
      {...props}
    />
  );
}
