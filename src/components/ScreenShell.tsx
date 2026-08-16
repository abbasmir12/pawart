import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';

type Props = {
  children: ReactNode;
  step?: number;
  onBack?: () => void;
  scroll?: boolean;
};

export function ScreenShell({ children, step, onBack, scroll = true }: Props) {
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {typeof step === 'number' ? (
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.back} hitSlop={12} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" color={colors.ink} size={23} />
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(step, 4) * 25}%` }]} />
          </View>
          <Text style={styles.step}>0{step}</Text>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.fixed}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 62, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  progressTrack: { flex: 1, height: 6, borderRadius: 99, backgroundColor: colors.purpleSoft, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.purple },
  step: { width: 26, fontSize: 13, fontWeight: '800', color: colors.muted },
  scroll: { flexGrow: 1 },
  fixed: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingBottom: 20 },
});
