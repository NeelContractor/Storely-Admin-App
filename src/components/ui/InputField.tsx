// src/components/ui/InputField.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword,
  ...props
}) => {
  const { colors: themeColors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? themeColors.danger : themeColors.border,
            backgroundColor: themeColors.cardBg,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon} size={18} color={themeColors.textMuted} style={styles.leftIcon} />
        )}
        <TextInput
          style={[
            styles.input,
            { color: themeColors.textPrimary },
            leftIcon ? styles.inputWithLeft : null,
          ]}
          placeholderTextColor={themeColors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={themeColors.textMuted}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={18} color={themeColors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: themeColors.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing[4] },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing[1] + 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.lg,
    minHeight: 44,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.sizes.base,
  },
  inputWithLeft: { paddingLeft: spacing[2] },
  leftIcon: { marginLeft: spacing[3] },
  rightIcon: { marginRight: spacing[3], padding: spacing[1] },
  error: { fontSize: typography.sizes.sm, marginTop: spacing[1] },
});