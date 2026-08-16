import { Ionicons } from '@expo/vector-icons';
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PawButton } from '../components/PawButton';
import { ScreenShell } from '../components/ScreenShell';
import { Waveform } from '../components/Waveform';
import { colors, radius, shadows } from '../theme';

type Props = {
  dogName: string;
  initialUri: string | null;
  initialWaveform: number[];
  onComplete: (uri: string, durationMs: number, waveform: number[]) => void;
  onBack: () => void;
};

const recordingOptions = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

export function RecordScreen({ dogName, initialUri, initialWaveform, onComplete, onBack }: Props) {
  const recorder = useAudioRecorder(recordingOptions);
  const recorderState = useAudioRecorderState(recorder, 90);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const [recordedUri, setRecordedUri] = useState(initialUri);
  const [durationMs, setDurationMs] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(initialWaveform);
  const stoppingRef = useRef(false);

  useEffect(() => () => playerRef.current?.remove(), []);

  useEffect(() => {
    if (!recorderState.isRecording || typeof recorderState.metering !== 'number') return;
    const level = Math.max(0.08, Math.min(1, (recorderState.metering + 58) / 58));
    setWaveform((current) => [...current.slice(-33), level]);
  }, [recorderState.isRecording, recorderState.metering]);

  useEffect(() => {
    if (recorderState.isRecording && recorderState.durationMillis >= 10000 && !stoppingRef.current) {
      void stopRecording();
    }
  }, [recorderState.durationMillis, recorderState.isRecording]);

  const startRecording = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone needed', 'Allow microphone access so PawArt can record a short bark.');
      return;
    }
    playerRef.current?.pause();
    setRecordedUri(null);
    setDurationMs(0);
    setWaveform([]);
    stoppingRef.current = false;
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    const capturedDuration = recorderState.durationMillis;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    setDurationMs(capturedDuration);
    setRecordedUri(recorder.uri);
  };

  const playRecording = async () => {
    if (!recordedUri) return;
    if (!playerRef.current) playerRef.current = createAudioPlayer(recordedUri);
    else playerRef.current.replace(recordedUri);
    await playerRef.current.seekTo(0);
    playerRef.current.play();
  };

  const retry = () => {
    playerRef.current?.pause();
    setRecordedUri(null);
    setDurationMs(0);
    setWaveform([]);
    stoppingRef.current = false;
  };

  const currentDuration = recorderState.isRecording ? recorderState.durationMillis : durationMs;
  const canContinue = Boolean(recordedUri && currentDuration >= 2800);
  const seconds = (currentDuration / 1000).toFixed(1);

  return (
    <ScreenShell step={2} onBack={onBack}>
      <View style={styles.body}>
        <View>
          <Text style={styles.kicker}>NOW, THEIR VOICE</Text>
          <Text style={styles.title}>Let {dogName || 'your dog'} speak.</Text>
          <Text style={styles.subtitle}>Record 3–10 seconds. We use sound characteristics only to shape the artwork.</Text>
        </View>

        <View style={[styles.recorder, shadows.card]}>
          <View style={styles.recordArtwork}>
            <View style={styles.artworkBlob} />
            <Image
              source={require('../../assets/illustrations/bark-to-art.png')}
              style={styles.recordDog}
              resizeMode="contain"
            />
            <View style={styles.timerPill}>
              <Text style={styles.timer}>{seconds}s</Text>
              <Text style={styles.limit}> / 10s</Text>
            </View>
          </View>
          <View style={[styles.soundDeck, recorderState.isRecording && styles.soundDeckActive]}>
            <View style={styles.deckHeader}>
              <Text style={[styles.deckEyebrow, recorderState.isRecording && styles.deckTextActive]}>
                {recorderState.isRecording ? 'CAPTURING THE BARK' : recordedUri ? 'BARK CAPTURED' : 'LIVE BARK CANVAS'}
              </Text>
              <Text style={[styles.deckStatus, recorderState.isRecording && styles.deckTextActive]}>
                {recorderState.isRecording ? 'REC' : 'READY'}
              </Text>
            </View>
            <Waveform values={waveform} active={recorderState.isRecording} light={recorderState.isRecording} />
            <Pressable
              onPress={recorderState.isRecording ? stopRecording : startRecording}
              style={[styles.recordButton, recorderState.isRecording && styles.stopButton]}
              accessibilityLabel={recorderState.isRecording ? 'Stop recording' : 'Start recording'}
            >
              <View style={recorderState.isRecording ? styles.stopIcon : styles.micIcon}>
                {!recorderState.isRecording ? <Ionicons name="mic" size={31} color="#fff" /> : null}
              </View>
            </Pressable>
            <Text style={[styles.recordLabel, recorderState.isRecording && styles.recordLabelActive]}>
              {recorderState.isRecording ? 'Listening… tap to finish' : recordedUri ? 'Tap to record another take' : 'Tap when your dog is ready'}
            </Text>
          </View>
        </View>

        {recordedUri ? (
          <View style={styles.playbackCard}>
            <Pressable style={styles.play} onPress={playRecording}><Ionicons name="play" size={22} color="#fff" /></Pressable>
            <View style={styles.playCopy}>
              <Text style={styles.playTitle}>Bark captured!</Text>
              <Text style={styles.playMeta}>{seconds} seconds · Ready to become art</Text>
            </View>
            <Pressable onPress={retry} hitSlop={10}><Ionicons name="refresh" size={23} color={colors.purple} /></Pressable>
          </View>
        ) : null}

        <Text style={styles.honestNote}>Sound guides the artwork only. PawArt never claims to translate thoughts or feelings.</Text>

        <View style={styles.footer}>
          <PawButton
            label="Turn this bark into art"
            icon="color-palette"
            disabled={!canContinue}
            onPress={() => recordedUri && onComplete(recordedUri, currentDuration, waveform)}
          />
          {recordedUri && currentDuration < 2800 ? <Text style={styles.warning}>Record at least 3 seconds to continue.</Text> : null}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: 12 },
  kicker: { color: colors.purple, fontSize: 12, fontWeight: '900', letterSpacing: 1.7 },
  title: { marginTop: 7, color: colors.ink, fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  recorder: { marginTop: 24, borderRadius: radius.lg, backgroundColor: '#F2E8FF', overflow: 'hidden' },
  recordArtwork: { height: 155, justifyContent: 'center', overflow: 'hidden' },
  artworkBlob: { position: 'absolute', right: -40, top: -45, width: 180, height: 180, borderRadius: 90, backgroundColor: '#FFE2D3' },
  recordDog: { position: 'absolute', width: '125%', aspectRatio: 1.777, right: -28, top: -35 },
  timerPill: { position: 'absolute', left: 14, top: 13, height: 38, borderRadius: radius.pill, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,.94)', flexDirection: 'row', alignItems: 'baseline', zIndex: 3 },
  timer: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  limit: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  soundDeck: { minHeight: 277, margin: 8, marginTop: 0, paddingHorizontal: 18, paddingTop: 15, paddingBottom: 17, borderRadius: 23, backgroundColor: '#fff', alignItems: 'center' },
  soundDeckActive: { backgroundColor: colors.purple },
  deckHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deckEyebrow: { color: colors.purple, fontSize: 8, fontWeight: '900', letterSpacing: 1.25 },
  deckStatus: { color: colors.coral, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  deckTextActive: { color: '#fff' },
  recordButton: { width: 78, height: 78, borderRadius: 39, backgroundColor: colors.coral, borderWidth: 7, borderColor: '#FFE4DB', alignItems: 'center', justifyContent: 'center' },
  stopButton: { backgroundColor: '#fff', borderColor: 'rgba(255,255,255,.28)' },
  micIcon: { alignItems: 'center', justifyContent: 'center' },
  stopIcon: { width: 25, height: 25, borderRadius: 6, backgroundColor: colors.purple },
  recordLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  recordLabelActive: { color: '#fff' },
  playbackCard: { marginTop: 16, padding: 15, borderRadius: radius.md, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  play: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', paddingLeft: 3 },
  playCopy: { flex: 1, marginLeft: 12 },
  playTitle: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  playMeta: { marginTop: 3, color: colors.muted, fontSize: 11 },
  honestNote: { marginTop: 14, paddingHorizontal: 8, color: colors.muted, fontSize: 9, lineHeight: 14, textAlign: 'center', fontStyle: 'italic' },
  footer: { marginTop: 'auto', paddingTop: 22 },
  warning: { marginTop: 8, color: colors.danger, textAlign: 'center', fontSize: 11 },
});
