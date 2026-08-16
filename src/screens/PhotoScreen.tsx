import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PawButton } from '../components/PawButton';
import { ScreenShell } from '../components/ScreenShell';
import { colors, radius, shadows } from '../theme';
import type { SelectedPhoto } from '../types';
import { normalizePhoto } from '../lib/pawart';

type Props = {
  dogName: string;
  photo: SelectedPhoto | null;
  onNameChange: (name: string) => void;
  onPhotoChange: (photo: SelectedPhoto) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function PhotoScreen({ dogName, photo, onNameChange, onPhotoChange, onContinue, onBack }: Props) {
  const choosePhoto = async (camera: boolean) => {
    const permission = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', `Please allow ${camera ? 'camera' : 'photo library'} access to continue.`);
      return;
    }

    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.85 });

    if (!result.canceled && result.assets[0]) onPhotoChange(normalizePhoto(result.assets[0]));
  };

  return (
    <ScreenShell step={1} onBack={onBack}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <View>
          <Text style={styles.kicker}>FIRST, THE STAR</Text>
          <Text style={styles.title}>Meet the artist.</Text>
          <Text style={styles.subtitle}>Choose a clear photo where your dog's face and markings are easy to see.</Text>
        </View>

        <View style={[styles.photoCard, shadows.card]}>
          {photo ? (
            <>
              <Image source={{ uri: photo.uri }} style={styles.preview} />
              <Pressable style={styles.change} onPress={() => choosePhoto(false)}>
                <Ionicons name="refresh" size={18} color={colors.purple} />
                <Text style={styles.changeText}>Change</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.pawCircle}><Ionicons name="paw" size={42} color={colors.purple} /></View>
              <Text style={styles.placeholderTitle}>Add your favorite photo</Text>
              <Text style={styles.placeholderCopy}>Front-facing works beautifully</Text>
            </View>
          )}
        </View>

        {!photo ? (
          <View style={styles.choiceRow}>
            <Pressable style={styles.choice} onPress={() => choosePhoto(true)}>
              <View style={[styles.choiceIcon, { backgroundColor: colors.purpleSoft }]}><Ionicons name="camera" size={25} color={colors.purple} /></View>
              <Text style={styles.choiceTitle}>Camera</Text>
              <Text style={styles.choiceCopy}>Take a new photo</Text>
            </Pressable>
            <Pressable style={styles.choice} onPress={() => choosePhoto(false)}>
              <View style={[styles.choiceIcon, { backgroundColor: '#FFE8DC' }]}><Ionicons name="images" size={25} color={colors.coral} /></View>
              <Text style={styles.choiceTitle}>Gallery</Text>
              <Text style={styles.choiceCopy}>Choose a favorite</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.nameBlock}>
          <Text style={styles.label}>What's your dog's name?</Text>
          <TextInput
            value={dogName}
            onChangeText={onNameChange}
            placeholder="e.g. Milo"
            placeholderTextColor="#A39CB5"
            maxLength={32}
            returnKeyType="done"
            style={styles.input}
          />
        </View>

        <View style={styles.footer}>
          <PawButton label="Next: Record a bark" icon="mic" disabled={!photo || !dogName.trim()} onPress={onContinue} />
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: 12 },
  kicker: { color: colors.purple, fontSize: 12, fontWeight: '900', letterSpacing: 1.7 },
  title: { marginTop: 7, color: colors.ink, fontSize: 36, fontWeight: '900', letterSpacing: -1.3 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  photoCard: { marginTop: 22, height: 315, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#F2E9FF' },
  preview: { width: '100%', height: '100%' },
  change: { position: 'absolute', right: 14, top: 14, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(255,255,255,.94)', paddingHorizontal: 13, paddingVertical: 9, borderRadius: radius.pill },
  changeText: { color: colors.purple, fontWeight: '800', fontSize: 12 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pawCircle: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  placeholderTitle: { marginTop: 16, color: colors.ink, fontWeight: '800', fontSize: 17 },
  placeholderCopy: { marginTop: 5, color: colors.muted, fontSize: 13 },
  choiceRow: { flexDirection: 'row', gap: 12, marginTop: 15 },
  choice: { flex: 1, padding: 15, borderRadius: radius.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  choiceIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { marginTop: 11, color: colors.ink, fontWeight: '800', fontSize: 15 },
  choiceCopy: { marginTop: 2, color: colors.muted, fontSize: 11 },
  nameBlock: { marginTop: 20 },
  label: { color: colors.ink, fontWeight: '800', fontSize: 14, marginBottom: 9 },
  input: { height: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: '#fff', paddingHorizontal: 17, fontSize: 17, color: colors.ink, fontWeight: '700' },
  footer: { marginTop: 22, marginBottom: 4 },
});
