// src/components/ui/Avatar.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  color?: string;
}

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const bgColors = [
  '#3C50E0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
];

function getColor(name?: string) {
  if (!name) return bgColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return bgColors[Math.abs(hash) % bgColors.length];
}

export const Avatar: React.FC<AvatarProps> = ({ name, uri, size = 36 }) => {
  const bg = getColor(name);
  const fontSize = size * 0.38;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontWeight: typography.weights.semiBold },
  img: { resizeMode: 'cover' },
});