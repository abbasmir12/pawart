import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  values: number[];
  active?: boolean;
  light?: boolean;
};

export function Waveform({ values, active = false, light = false }: Props) {
  const normalized = values.length ? values.slice(-34) : Array.from({ length: 34 }, (_, i) => 0.12 + ((i * 7) % 5) * 0.04);
  return (
    <View style={styles.wrap} accessibilityLabel="Audio waveform">
      {normalized.map((value, index) => (
        <View
          key={`${index}-${value}`}
          style={[
            styles.bar,
            {
              height: 10 + Math.max(0.08, Math.min(1, value)) * 76,
              opacity: active ? 0.72 + (index % 3) * 0.1 : 0.58,
              backgroundColor: light ? '#fff' : colors.purple,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 104, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  bar: { width: 4, borderRadius: 99 },
});
