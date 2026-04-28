import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { AvatarColors, AvatarSizes } from '../../theme/tokens';

type AvatarSize = keyof typeof AvatarSizes;

interface AvatarProps {
  name: string;
  size?: AvatarSize;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getColorPair(name: string) {
  return AvatarColors[name.charCodeAt(0) % AvatarColors.length];
}

export function Avatar({ name, size = 'MD' }: AvatarProps) {
  const dim = AvatarSizes[size];
  const { bg, text } = getColorPair(name);
  const fontSize = dim * 0.38;

  return (
    <View style={[styles.base, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg }]}>
      <AppText style={{ fontSize, fontFamily: 'DMSans_700Bold', color: text, lineHeight: dim }}>
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
