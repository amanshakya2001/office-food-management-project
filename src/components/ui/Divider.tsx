import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme/tokens';

interface DividerProps {
  indent?: number;
  style?: object;
}

export function Divider({ indent = 0, style }: DividerProps) {
  return <View style={[styles.divider, { marginLeft: indent }, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.BORDER,
  },
});
