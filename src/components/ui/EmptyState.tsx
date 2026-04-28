import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Colors, Spacing } from '../../theme/tokens';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="LIST_TITLE" color={Colors.TEXT_SECONDARY} style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="BODY" color={Colors.TEXT_TERTIARY} style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.XL,
    paddingVertical: Spacing.XXL,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.SM,
  },
  subtitle: {
    textAlign: 'center',
  },
});
