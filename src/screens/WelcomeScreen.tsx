import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PawButton } from '../components/PawButton';
import { PawSparkles } from '../components/Decorations';
import { ScreenShell } from '../components/ScreenShell';
import { colors, radius, shadows } from '../theme';

type Props = { onStart: () => void };

export function WelcomeScreen({ onStart }: Props) {
  return (
    <ScreenShell>
      <PawSparkles />
      <View style={styles.topline}>
        <Image source={require('../../assets/brand/pawart-icon.png')} style={styles.logo} />
        <Text style={styles.wordmark}>PawArt</Text>
        <View style={styles.aiBadge}><Text style={styles.aiText}>with Google AI</Text></View>
      </View>

      <View style={styles.hero}>
        <LinearGradient colors={['#F1E4FF', '#FFD9C5']} style={styles.artCard}>
          <View style={styles.ringOne} />
          <View style={styles.ringTwo} />
          <Image source={require('../../assets/brand/pawart-icon.png')} style={styles.heroImage} />
          <View style={styles.soundTag}>
            <View style={styles.soundBars}>
              {[12, 22, 34, 18, 28].map((height, index) => (
                <View key={index} style={[styles.soundBar, { height }]} />
              ))}
            </View>
            <Text style={styles.soundText}>Bark-powered</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>YOUR DOG · THEIR BARK</Text>
        <Text style={styles.title}>Every bark{`\n`}becomes <Text style={styles.art}>art.</Text></Text>
        <Text style={styles.subtitle}>Capture their portrait, record their voice, and create a masterpiece as unique as they are.</Text>
      </View>

      <View style={styles.footer}>
        <PawButton label="Create PawArt" icon="sparkles" onPress={onStart} />
        <Text style={styles.note}>One photo · One bark · One-of-a-kind art</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  logo: { width: 42, height: 42, borderRadius: 13 },
  wordmark: { marginLeft: 10, fontSize: 24, fontWeight: '900', color: colors.ink, letterSpacing: -0.8 },
  aiBadge: { marginLeft: 'auto', backgroundColor: colors.purpleSoft, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  aiText: { color: colors.purpleDark, fontSize: 11, fontWeight: '800' },
  hero: { flex: 1, minHeight: 300, maxHeight: 410, justifyContent: 'center', paddingTop: 18 },
  artCard: { height: '88%', minHeight: 275, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadows.card },
  ringOne: { position: 'absolute', width: 250, height: 250, borderRadius: 125, borderWidth: 32, borderColor: 'rgba(255,255,255,.28)', left: -70, top: -85 },
  ringTwo: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 20, borderColor: 'rgba(139,61,255,.1)', right: -50, bottom: -60 },
  heroImage: { width: 220, height: 220, borderRadius: 52 },
  soundTag: { position: 'absolute', bottom: 18, right: 18, height: 48, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 9 },
  soundBars: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 2 },
  soundBar: { width: 3, borderRadius: 4, backgroundColor: colors.coral },
  soundText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  copy: { paddingTop: 4 },
  eyebrow: { color: colors.purple, fontSize: 12, fontWeight: '900', letterSpacing: 1.8 },
  title: { marginTop: 8, color: colors.ink, fontSize: 46, lineHeight: 49, fontWeight: '900', letterSpacing: -2.1 },
  art: { color: colors.purple },
  subtitle: { marginTop: 12, color: colors.muted, fontSize: 16, lineHeight: 23, maxWidth: 350 },
  footer: { marginTop: 23, gap: 13 },
  note: { color: colors.muted, textAlign: 'center', fontSize: 11, fontWeight: '600' },
});
