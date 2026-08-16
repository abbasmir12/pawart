import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export function PawSparkles() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.dot, styles.dotOne]} />
      <View style={[styles.dot, styles.dotTwo]} />
      <Ionicons name="paw" size={34} color={colors.purpleSoft} style={styles.pawOne} />
      <Ionicons name="sparkles" size={26} color={colors.orange} style={styles.sparkle} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', borderRadius: 999 },
  dotOne: { width: 18, height: 18, right: 28, top: 100, backgroundColor: colors.mint },
  dotTwo: { width: 10, height: 10, left: 22, top: 220, backgroundColor: colors.coral },
  pawOne: { position: 'absolute', right: 28, top: 250, transform: [{ rotate: '18deg' }] },
  sparkle: { position: 'absolute', left: 28, top: 92 },
});
