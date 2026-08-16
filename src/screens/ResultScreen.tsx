import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PawButton } from '../components/PawButton';
import { ScreenShell } from '../components/ScreenShell';
import { colors, radius, shadows } from '../theme';
import type { GenerationResult } from '../types';

type Props = {
  result: GenerationResult;
  barkUri: string | null;
  waveform: number[];
  onCreateAnother: () => void;
};

export function ResultScreen({ result, barkUri, waveform, onCreateAnother }: Props) {
  const barkPlayer = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const [busy, setBusy] = useState<'save' | 'share' | null>(null);
  useEffect(() => () => barkPlayer.current?.remove(), []);

  const downloadArtwork = async () => {
    const target = `${FileSystem.cacheDirectory}pawart-${result.id}.jpg`;
    const info = await FileSystem.getInfoAsync(target);
    if (info.exists) return target;
    const download = await FileSystem.downloadAsync(result.imageUrl, target);
    return download.uri;
  };

  const save = async () => {
    try {
      setBusy('save');
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) throw new Error('Photo library permission is required to save.');
      await MediaLibrary.saveToLibraryAsync(await downloadArtwork());
      Alert.alert('Saved!', `${result.dogName}'s masterpiece is now in your photo library.`);
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.');
    } finally { setBusy(null); }
  };

  const share = async () => {
    try {
      setBusy('share');
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
      await Sharing.shareAsync(await downloadArtwork(), { dialogTitle: `Share ${result.dogName}'s PawArt`, mimeType: 'image/jpeg' });
    } catch (error) {
      Alert.alert('Could not share', error instanceof Error ? error.message : 'Please try again.');
    } finally { setBusy(null); }
  };

  const replay = async () => {
    if (!barkUri) return;
    if (!barkPlayer.current) barkPlayer.current = createAudioPlayer(barkUri);
    else barkPlayer.current.replace(barkUri);
    await barkPlayer.current.seekTo(0);
    barkPlayer.current.play();
  };

  return (
    <ScreenShell>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PAWART / RESULT</Text>
          <Text style={styles.title}>Fresh from the studio</Text>
        </View>
        <View style={styles.done}><Ionicons name="sparkles" size={24} color={colors.purple} /></View>
      </View>

      <View style={[styles.artFrame, shadows.card]}>
        <Image source={{ uri: result.imageUrl }} style={styles.artwork} resizeMode="cover" />
      </View>

      <View style={styles.resultIntro}>
        <View style={styles.resultIntroCopy}>
          <Text style={styles.masterpieceTitle}>{result.dogName}'s Masterpiece</Text>
          <Text style={styles.descriptorText}>{result.artDirection.descriptors.slice(0, 3).join(' · ')}</Text>
        </View>
        <View style={styles.artId}>
          <Ionicons name="paw" size={13} color={colors.purple} />
          <Text style={styles.artIdText}>{result.id.slice(0, 6).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.actionBar}>
        <Pressable style={[styles.saveAction, styles.clayShadow]} onPress={save} disabled={busy !== null}>
          <Ionicons name="download-outline" size={19} color="#fff" />
          <Text style={styles.saveLabel}>{busy === 'save' ? 'Saving…' : 'Save artwork'}</Text>
        </Pressable>
        <Pressable style={[styles.smallAction, styles.clayShadow]} onPress={share} disabled={busy !== null} accessibilityLabel="Share artwork">
          <Ionicons name="share-outline" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.bentoHeader}>
        <View>
          <Text style={styles.bentoEyebrow}>BARK FINGERPRINT</Text>
          <Text style={styles.bentoTitle}>How the sound showed up</Text>
        </View>
        <Text style={styles.bentoMeta}>{result.features.durationSeconds.toFixed(1)} sec</Text>
      </View>

      <View style={styles.bentoGrid}>
        <View style={styles.bentoRowTall}>
          <View style={[styles.energyCard, styles.clayShadow]}>
            <View style={styles.clayGlow} />
            <View style={styles.cardIconBubble}><Ionicons name="flash" size={18} color={colors.ink} /></View>
            <Text style={styles.energyValue}>{result.features.energy}</Text>
            <Text style={styles.energyUnit}>/ 100</Text>
            <Text style={styles.bentoLabel}>Bark energy</Text>
          </View>

          <View style={[styles.pitchCard, styles.clayShadow]}>
            <View style={styles.pitchOrb}><Ionicons name="musical-note" size={20} color={colors.ink} /></View>
            <Text style={styles.pitchValue}>{result.features.pitch}</Text>
            <Text style={styles.bentoLabel}>Pitch register</Text>
          </View>
        </View>

        <View style={styles.bentoRowShort}>
          <View style={[styles.rhythmCard, styles.clayShadow]}>
            <Ionicons name="pulse" size={22} color={colors.ink} />
            <Text style={styles.rhythmValue}>{result.features.rhythm}</Text>
            <Text style={styles.bentoLabel}>Rhythm · {result.features.barkCount} {result.features.barkCount === 1 ? 'bark' : 'barks'}</Text>
          </View>

          <View style={[styles.voiceCard, styles.clayShadow]}>
            <View style={styles.voiceHeader}>
              <View>
                <Text style={styles.voiceValue}>{result.features.intensity}</Text>
                <Text style={styles.bentoLabel}>Intensity</Text>
              </View>
              <Pressable style={styles.playBubble} onPress={replay} disabled={!barkUri} accessibilityLabel="Replay original bark">
                <Ionicons name="play" size={15} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.audioWave} accessibilityLabel="Recorded bark waveform">
              {(waveform.length ? waveform.slice(-18) : Array.from({ length: 18 }, () => 0.18)).map((value, index) => (
                <View key={`${index}-${value}`} style={[styles.audioBar, { height: 4 + Math.max(0.08, Math.min(1, value)) * 22 }]} />
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.directionCard, styles.clayShadow]}>
        <View style={styles.directionBlob} />
        <View style={styles.directionHeader}>
          <View style={styles.directionIcon}><Ionicons name="color-palette" size={21} color={colors.purple} /></View>
          <View>
            <Text style={styles.directionEyebrow}>ART DIRECTION</Text>
            <Text style={styles.directionTitle}>{result.artDirection.style}</Text>
          </View>
        </View>
        <Text style={styles.paletteText}>{result.artDirection.palette}</Text>
        <View style={styles.directionChips}>
          <View style={styles.directionChip}>
            <View style={styles.directionChipIconMint}>
              <Ionicons name="scan-outline" size={19} color={colors.ink} />
            </View>
            <Text style={styles.directionChipLabel}>COMPOSITION</Text>
            <Text style={styles.directionChipText} numberOfLines={3}>{result.artDirection.composition}</Text>
          </View>
          <View style={[styles.directionChip, styles.directionChipPink]}>
            <View style={styles.directionChipIconPink}>
              <Ionicons name="brush-outline" size={19} color={colors.ink} />
            </View>
            <Text style={styles.directionChipLabel}>BRUSHWORK</Text>
            <Text style={styles.directionChipText} numberOfLines={3}>{result.artDirection.brushwork}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <PawButton label="Create another masterpiece" icon="add" variant="secondary" onPress={onCreateAnother} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8, flexDirection: 'row', alignItems: 'center' },
  kicker: { color: colors.purple, fontSize: 10, fontWeight: '900', letterSpacing: 1.45 },
  title: { marginTop: 5, color: colors.ink, fontSize: 27, fontWeight: '900', letterSpacing: -1 },
  done: { marginLeft: 'auto', width: 46, height: 46, borderRadius: 18, backgroundColor: '#E6D8FF', alignItems: 'center', justifyContent: 'center', ...shadows.card },
  artFrame: { marginTop: 18, width: '100%', aspectRatio: 0.82, borderRadius: 30, backgroundColor: colors.purpleSoft, overflow: 'hidden' },
  artwork: { width: '100%', height: '100%', borderRadius: 30, backgroundColor: colors.purpleSoft },
  resultIntro: { marginTop: 18, flexDirection: 'row', alignItems: 'center' },
  resultIntroCopy: { flex: 1 },
  masterpieceTitle: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  descriptorText: { marginTop: 5, color: colors.muted, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  artId: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#E6D8FF', flexDirection: 'row', alignItems: 'center', gap: 5 },
  artIdText: { color: colors.purpleDark, fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  actionBar: { height: 54, marginTop: 17, flexDirection: 'row', gap: 10 },
  clayShadow: { shadowColor: '#435C61', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 7 },
  saveAction: { flex: 1, borderRadius: 19, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveLabel: { color: '#fff', fontSize: 11, fontWeight: '800' },
  smallAction: { width: 54, height: 54, borderRadius: 19, backgroundColor: '#AFECE6', alignItems: 'center', justifyContent: 'center' },
  bentoHeader: { marginTop: 38, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  bentoEyebrow: { color: colors.purple, fontSize: 8, fontWeight: '900', letterSpacing: 1.35 },
  bentoTitle: { marginTop: 5, color: colors.ink, fontSize: 21, fontWeight: '900', letterSpacing: -0.55 },
  bentoMeta: { color: colors.muted, fontSize: 9, fontWeight: '800' },
  bentoGrid: { marginTop: 17, gap: 11 },
  bentoRowTall: { height: 164, flexDirection: 'row', gap: 11 },
  bentoRowShort: { height: 137, flexDirection: 'row', gap: 11 },
  energyCard: { flex: 1.2, padding: 17, borderRadius: 29, backgroundColor: '#AFECE6', overflow: 'hidden', justifyContent: 'flex-end' },
  clayGlow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, right: -32, top: -42, backgroundColor: 'rgba(255,255,255,.46)' },
  cardIconBubble: { position: 'absolute', left: 16, top: 16, width: 37, height: 37, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.72)', alignItems: 'center', justifyContent: 'center', shadowColor: '#5BAFA8', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.17, shadowRadius: 8 },
  energyValue: { color: colors.ink, fontSize: 51, lineHeight: 51, fontWeight: '900', letterSpacing: -3 },
  energyUnit: { position: 'absolute', left: 77, bottom: 41, color: '#547576', fontSize: 10, fontWeight: '900' },
  bentoLabel: { marginTop: 3, color: '#5D6370', fontSize: 8, fontWeight: '800' },
  pitchCard: { flex: 0.8, padding: 15, borderRadius: 29, backgroundColor: '#DCCEFF', justifyContent: 'flex-end', overflow: 'hidden' },
  pitchOrb: { position: 'absolute', width: 72, height: 72, borderRadius: 36, right: -8, top: -8, backgroundColor: '#F4B9E7', alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5FB3', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.16, shadowRadius: 11 },
  pitchValue: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  rhythmCard: { flex: 0.82, padding: 16, borderRadius: 27, backgroundColor: '#FFC174', justifyContent: 'flex-end', overflow: 'hidden' },
  rhythmValue: { marginTop: 'auto', color: colors.ink, fontSize: 18, fontWeight: '900' },
  voiceCard: { flex: 1.18, padding: 15, borderRadius: 27, backgroundColor: '#F4B9E7', overflow: 'hidden' },
  voiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  voiceValue: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  playBubble: { width: 35, height: 35, borderRadius: 15, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingLeft: 2, shadowColor: colors.ink, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8 },
  audioWave: { height: 45, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  audioBar: { width: 3, borderRadius: 3, backgroundColor: colors.ink },
  directionCard: { minHeight: 292, marginTop: 13, padding: 20, borderRadius: 30, backgroundColor: '#E9DFFF', overflow: 'hidden' },
  directionBlob: { position: 'absolute', width: 170, height: 170, borderRadius: 85, right: -64, bottom: -90, backgroundColor: '#AFECE6', opacity: 0.72 },
  directionHeader: { flexDirection: 'row', alignItems: 'center' },
  directionIcon: { width: 45, height: 45, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#7959A8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.13, shadowRadius: 10 },
  directionEyebrow: { marginLeft: 12, color: colors.purple, fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  directionTitle: { maxWidth: 245, marginTop: 3, marginLeft: 12, color: colors.ink, fontSize: 17, lineHeight: 21, fontWeight: '900', textTransform: 'capitalize' },
  paletteText: { maxWidth: '88%', marginTop: 14, color: '#625978', fontSize: 10, lineHeight: 15, textTransform: 'capitalize' },
  directionChips: { minHeight: 126, marginTop: 17, flexDirection: 'row', gap: 10 },
  directionChip: { flex: 1, minHeight: 126, padding: 13, borderRadius: 22, backgroundColor: '#AFECE6', justifyContent: 'flex-start', shadowColor: '#6E7E91', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.14, shadowRadius: 11, elevation: 4 },
  directionChipPink: { backgroundColor: '#F4B9E7' },
  directionChipIconMint: { width: 36, height: 36, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.72)', alignItems: 'center', justifyContent: 'center', shadowColor: '#55958F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 7 },
  directionChipIconPink: { width: 36, height: 36, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.72)', alignItems: 'center', justifyContent: 'center', shadowColor: '#A05B89', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 7 },
  directionChipLabel: { marginTop: 10, color: colors.purpleDark, fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  directionChipText: { marginTop: 4, color: colors.ink, fontSize: 9, lineHeight: 13, fontWeight: '800', textTransform: 'capitalize' },
  footer: { marginTop: 18, marginBottom: 8 },
});
