import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { Waveform } from '../components/Waveform';
import { generatePawArt } from '../lib/pawart';
import { colors, radius } from '../theme';
import type { GenerationResult, PawArtDraft } from '../types';

type Props = {
  draft: PawArtDraft;
  onSuccess: (result: GenerationResult) => void;
  onError: (message: string) => void;
};

const phases = [
  'Listening to the artist…',
  'Reading the bark…',
  'Finding its colors…',
  'Preparing the canvas…',
  'Creating the masterpiece…',
];

export function GeneratingScreen({ draft, onSuccess, onError }: Props) {
  const [phase, setPhase] = useState(0);
  const pulse = useRef(new Animated.Value(0.96)).current;
  const started = useRef(false);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 1050, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.96, duration: 1050, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((value) => Math.min(phases.length - 1, value + 1));
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    generatePawArt(draft).then(onSuccess).catch((error: unknown) => {
      onError(error instanceof Error ? error.message : 'Something interrupted the creative process.');
    });
  }, [draft, onError, onSuccess]);

  return (
    <ScreenShell scroll={false}>
      <View style={styles.body}>
        <View style={styles.brandRow}>
          <Ionicons name="paw" size={22} color={colors.purple} />
          <Text style={styles.brand}>PawArt studio</Text>
        </View>

        <Animated.View style={[styles.canvasWrap, { transform: [{ scale: pulse }] }]}> 
          <LinearGradient colors={['#8B3DFF', '#FF6B4A', '#FFB640']} style={styles.canvas}>
            <View style={styles.orbitOne} />
            <View style={styles.orbitTwo} />
            <View style={styles.centerPhoto}>
              {draft.photo ? <Image source={{ uri: draft.photo.uri }} style={styles.dogPhoto} /> : null}
              <View style={styles.photoWash} />
              <Ionicons name="color-palette" size={28} color="#fff" style={styles.paletteIcon} />
            </View>
            <Waveform values={draft.waveform.slice(-18)} active light />
          </LinearGradient>
          <View style={styles.sparkle}><Ionicons name="sparkles" size={24} color={colors.orange} /></View>
        </Animated.View>

        <Text style={styles.message}>{phases[phase]}</Text>
        <Text style={styles.submessage}>{draft.dogName}'s bark is shaping every brushstroke.</Text>

        <View style={styles.phaseRail} accessibilityLabel={`${phases[phase]} Step ${phase + 1} of ${phases.length}`}>
          {phases.map((_, index) => (
            <View key={index} style={[styles.phaseMark, index <= phase && styles.phaseMarkActive]} />
          ))}
        </View>

        <View style={styles.barkPrint}>
          <View style={styles.printHeader}>
            <View>
              <Text style={styles.printEyebrow}>ORIGINAL BARK PRINT</Text>
              <Text style={styles.printTitle}>{draft.dogName || 'Your dog'}'s one-of-one signal</Text>
            </View>
            <View style={styles.durationStamp}>
              <Text style={styles.durationValue}>{(draft.barkDurationMs / 1000).toFixed(1)}</Text>
              <Text style={styles.durationUnit}>SEC</Text>
            </View>
          </View>
          <View style={styles.miniWave}>
            <Waveform values={draft.waveform.slice(-34)} active />
          </View>
          <View style={styles.traitDeck}>
            <View style={[styles.traitTicket, styles.energyTicket]}>
              <Ionicons name="flash" size={15} color="#AA4328" />
              <Text style={styles.traitName}>Energy</Text>
              <Text style={styles.traitState}>measuring</Text>
            </View>
            <View style={[styles.traitTicket, styles.pitchTicket]}>
              <Ionicons name="musical-notes" size={15} color="#5C2AAA" />
              <Text style={styles.traitName}>Pitch</Text>
              <Text style={styles.traitState}>tracing</Text>
            </View>
            <View style={[styles.traitTicket, styles.rhythmTicket]}>
              <Ionicons name="pulse" size={15} color="#166F72" />
              <Text style={styles.traitName}>Rhythm</Text>
              <Text style={styles.traitState}>mapping</Text>
            </View>
          </View>
          <Text style={styles.realValuesNote}>Exact traits arrive with the finished masterpiece.</Text>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandRow: { position: 'absolute', top: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { color: colors.ink, fontWeight: '900', fontSize: 15 },
  canvasWrap: { width: 248, height: 250, marginTop: 20 },
  canvas: { flex: 1, borderRadius: 70, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  orbitOne: { position: 'absolute', width: 280, height: 180, borderRadius: 140, borderWidth: 30, borderColor: 'rgba(255,255,255,.12)', transform: [{ rotate: '25deg' }] },
  orbitTwo: { position: 'absolute', width: 140, height: 240, borderRadius: 120, borderWidth: 18, borderColor: 'rgba(255,255,255,.1)', transform: [{ rotate: '-35deg' }] },
  centerPhoto: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#fff', borderWidth: 5, borderColor: 'rgba(255,255,255,.88)', overflow: 'hidden' },
  dogPhoto: { width: '100%', height: '100%' },
  photoWash: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(91,29,176,.12)' },
  paletteIcon: { position: 'absolute', right: 5, bottom: 4, textShadowColor: 'rgba(33,22,83,.35)', textShadowRadius: 8 },
  sparkle: { position: 'absolute', right: -8, top: 12, width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  message: { marginTop: 22, color: colors.ink, fontWeight: '900', fontSize: 25, letterSpacing: -0.7 },
  submessage: { marginTop: 8, color: colors.muted, fontSize: 14, textAlign: 'center' },
  phaseRail: { marginTop: 20, width: 156, flexDirection: 'row', gap: 6 },
  phaseMark: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: '#E4D8EF' },
  phaseMarkActive: { backgroundColor: colors.coral },
  barkPrint: { width: '100%', marginTop: 20, padding: 16, borderRadius: 25, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F1E8F7' },
  printHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  printEyebrow: { color: colors.purple, fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  printTitle: { marginTop: 4, color: colors.ink, fontSize: 14, fontWeight: '900' },
  durationStamp: { width: 49, height: 49, borderRadius: 16, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '3deg' }] },
  durationValue: { color: '#fff', fontSize: 16, fontWeight: '900', lineHeight: 17 },
  durationUnit: { color: '#C9BDE8', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  miniWave: { height: 56, marginTop: -8, overflow: 'hidden', justifyContent: 'center', transform: [{ scaleY: 0.46 }] },
  traitDeck: { height: 64, marginTop: -5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  traitTicket: { width: '31%', minHeight: 57, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 15 },
  energyTicket: { backgroundColor: '#FFD7C9', transform: [{ rotate: '-3deg' }, { translateX: 4 }] },
  pitchTicket: { zIndex: 2, backgroundColor: '#E9D9FF', transform: [{ rotate: '2deg' }, { translateY: -4 }] },
  rhythmTicket: { backgroundColor: '#C9F0ED', transform: [{ rotate: '-1.5deg' }, { translateX: -4 }] },
  traitName: { marginTop: 2, color: colors.ink, fontSize: 11, fontWeight: '900' },
  traitState: { color: colors.muted, fontSize: 8, fontWeight: '700' },
  realValuesNote: { marginTop: 5, color: colors.muted, fontSize: 9, fontStyle: 'italic', textAlign: 'center' },
});
