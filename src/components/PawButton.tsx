import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

export function PawButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) {
  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.purple} />
      ) : icon ? (
        <Ionicons name={icon} size={20} color={variant === 'primary' ? '#fff' : colors.purple} />
      ) : null}
      <Text style={[styles.label, variant !== 'primary' && styles.altLabel]}>{label}</Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        variant === 'primary' && shadows.button,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[colors.purple, colors.purpleDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.alternative, variant === 'ghost' && styles.ghost]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%', borderRadius: radius.md },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.94 },
  disabled: { opacity: 0.45 },
  primary: { minHeight: 58, justifyContent: 'center', borderRadius: radius.md, paddingHorizontal: 22 },
  alternative: {
    minHeight: 56,
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.purpleSoft,
  },
  ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.1 },
  altLabel: { color: colors.purple },
});
