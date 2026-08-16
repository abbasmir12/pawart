import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { colors, radius, shadows } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Props = { onCreate: () => void };

const gallery: Array<{
  name: string;
  mood: string;
  style: string;
  accent: string;
  image: ImageSourcePropType;
}> = [
  {
    name: "Sunny's Symphony",
    mood: 'Bright · Energetic',
    style: 'Impressionist',
    accent: '#FF8B3D',
    image: require('../../assets/gallery/sunny-impressionist.png'),
  },
  {
    name: "Luna's Echo",
    mood: 'Calm · Steady',
    style: 'Watercolor',
    accent: '#4866C9',
    image: require('../../assets/gallery/luna-watercolor.png'),
  },
  {
    name: "Poppy's Pop",
    mood: 'Playful · Rapid',
    style: 'Modern Gouache',
    accent: '#EF4778',
    image: require('../../assets/gallery/poppy-gouache.png'),
  },
];

export function DashboardScreen({ onCreate }: Props) {
  return (
    <ScreenShell>
      <View style={styles.topbar}>
        <View style={styles.brandWrap}>
          <Image source={require('../../assets/brand/pawart-icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.hello}>WELCOME TO YOUR STUDIO</Text>
            <Text style={styles.brand}>PawArt</Text>
          </View>
        </View>
        <Pressable style={styles.profile} accessibilityLabel="PawArt studio">
          <Ionicons name="paw" size={21} color={colors.purple} />
        </Pressable>
      </View>

      <LinearGradient
        colors={['#8B3DFF', '#6D25D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, shadows.card]}
      >
        <View style={styles.heroCircleOne} />
        <View style={styles.heroCircleTwo} />
        <View style={styles.heroCopy}>
          <View style={styles.liveBadge}>
            <Ionicons name="sparkles" size={11} color="#fff" />
            <Text style={styles.liveText}>STUDIO READY</Text>
          </View>
          <Text style={styles.heroTitle}>Ready when{`\n`}they bark.</Text>
          <Text style={styles.heroSubtitle}>One photo + one little woof = a completely original masterpiece.</Text>
          <Pressable style={styles.heroButton} onPress={onCreate} accessibilityRole="button">
            <Ionicons name="sparkles" size={18} color={colors.purple} />
            <Text style={styles.heroButtonText}>Create new PawArt</Text>
            <Ionicons name="arrow-forward" size={17} color={colors.purple} />
          </Pressable>
        </View>
        <View style={styles.heroArtWrap}>
          <Image source={gallery[0].image} style={styles.heroArt} />
          <View style={styles.waveBadge}>
            {[10, 19, 29, 16, 24, 12].map((height, index) => (
              <View key={index} style={[styles.waveBar, { height }]} />
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.flowCard}>
        <FlowStep icon="camera" label="Photo" color={colors.coral} bg="#FFE8E0" />
        <Ionicons name="chevron-forward" size={16} color="#C2BACE" />
        <FlowStep icon="mic" label="Bark" color={colors.purple} bg={colors.purpleSoft} />
        <Ionicons name="chevron-forward" size={16} color="#C2BACE" />
        <FlowStep icon="color-palette" label="Art" color={colors.orange} bg="#FFF0DC" />
      </View>

      <View style={styles.sectionHead}>
        <View>
          <Text style={styles.sectionEyebrow}>BARK-POWERED INSPIRATION</Text>
          <Text style={styles.sectionTitle}>Fresh from the gallery</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countText}>03</Text></View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}
        decelerationRate="fast"
        snapToInterval={218}
      >
        {gallery.map((piece, index) => (
          <View key={piece.name} style={[styles.artCard, index === 0 && styles.artCardFeatured]}>
            <Image source={piece.image} style={styles.artImage} />
            <LinearGradient colors={['transparent', 'rgba(19,9,48,.92)']} style={styles.artOverlay}>
              <View style={[styles.stylePill, { backgroundColor: piece.accent }]}>
                <Text style={styles.stylePillText}>{piece.style}</Text>
              </View>
              <Text style={styles.artName}>{piece.name}</Text>
              <View style={styles.artMetaRow}>
                <Ionicons name="pulse" size={14} color="#D8CCFF" />
                <Text style={styles.artMood}>{piece.mood}</Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionHeadCompact}>
        <Text style={styles.sectionEyebrow}>THE PAWART METHOD</Text>
        <Text style={styles.sectionTitle}>Hear the bark. See the art.</Text>
      </View>
      <View style={[styles.barkStory, shadows.card]}>
        <View style={styles.storyHeader}>
          <Text style={styles.storyKicker}>SOUND IN. STYLE OUT.</Text>
          <Text style={styles.storyTitle}>A bark becomes{`\n`}a brushstroke.</Text>
          <Text style={styles.storyCopy}>The character of the sound gives every portrait its own movement, color and energy.</Text>
        </View>
        <View style={styles.barkIllustrationStage}>
          <View style={styles.storyBlobOne} />
          <View style={styles.storyBlobTwo} />
          <Image
            source={require('../../assets/illustrations/bark-to-art.png')}
            style={styles.barkIllustration}
            resizeMode="contain"
          />
        </View>
        <View style={styles.traitShuffle}>
          <View style={[styles.traitCard, styles.pitchCard]}>
            <Text style={styles.traitNumber}>01</Text>
            <Text style={styles.traitLabel}>PITCH</Text>
            <Text style={styles.traitValue}>colors it</Text>
          </View>
          <View style={[styles.traitCard, styles.rhythmCard]}>
            <Text style={styles.traitNumber}>02</Text>
            <Text style={styles.traitLabel}>RHYTHM</Text>
            <Text style={styles.traitValue}>moves it</Text>
          </View>
          <View style={[styles.traitCard, styles.energyCard]}>
            <Text style={styles.traitNumber}>03</Text>
            <Text style={styles.traitLabel}>ENERGY</Text>
            <Text style={styles.traitValue}>shapes it</Text>
          </View>
        </View>
        <Text style={styles.storyNote}>We shape art from sound — we don't translate what dogs think or feel.</Text>
      </View>

      <Pressable onPress={onCreate} accessibilityRole="button" style={({ pressed }) => [styles.creationPressable, pressed && styles.creationPressed]}>
        <LinearGradient
          colors={['#FFE2D3', '#FFC6B2', '#FF9B76']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creationCard}
        >
          <View style={styles.creationRing} />
          <View style={styles.creationCopy}>
            <View style={styles.creationBadge}>
              <Ionicons name="sparkles" size={12} color={colors.coral} />
              <Text style={styles.creationBadgeText}>YOUR TURN</Text>
            </View>
            <Text style={styles.creationTitle}>Make something{`\n`}only your dog could.</Text>
            <Text style={styles.creationSubtitle}>Bring the portrait. Capture the bark. We'll prepare the canvas.</Text>
            <View style={styles.creationAction}>
              <Text style={styles.creationActionText}>Open the studio</Text>
              <Ionicons name="arrow-forward" size={17} color="#fff" />
            </View>
          </View>
          <View style={styles.miniCanvasBack} />
          <View style={styles.miniCanvas}>
            <Image source={gallery[2].image} style={styles.miniCanvasImage} />
            <View style={styles.miniCanvasTag}><Ionicons name="paw" size={12} color={colors.purple} /></View>
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.powered}>
        <Ionicons name="logo-google" size={15} color={colors.ink} />
        <Text style={styles.poweredText}>CREATED WITH GOOGLE GEMINI</Text>
      </View>
    </ScreenShell>
  );
}

function FlowStep({ icon, label, color, bg }: { icon: IconName; label: string; color: string; bg: string }) {
  return (
    <View style={styles.flowStep}>
      <View style={[styles.flowIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={21} color={color} /></View>
      <Text style={styles.flowLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { paddingTop: 7, paddingBottom: 18, flexDirection: 'row', alignItems: 'center' },
  brandWrap: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 46, height: 46, borderRadius: 14, marginRight: 11 },
  hello: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.25 },
  brand: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -0.7 },
  profile: { marginLeft: 'auto', width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  hero: { height: 286, borderRadius: radius.lg, overflow: 'hidden', padding: 22, flexDirection: 'row' },
  heroCircleOne: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,.07)', left: -80, top: -75 },
  heroCircleTwo: { position: 'absolute', width: 210, height: 210, borderRadius: 105, borderWidth: 30, borderColor: 'rgba(255,255,255,.07)', right: -65, bottom: -85 },
  heroCopy: { width: '62%', zIndex: 2 },
  liveBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,.15)', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6 },
  liveText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { marginTop: 15, color: '#fff', fontSize: 31, lineHeight: 33, fontWeight: '900', letterSpacing: -1.2 },
  heroSubtitle: { marginTop: 8, color: '#EDE2FF', fontSize: 11, lineHeight: 16, maxWidth: 190 },
  heroButton: { marginTop: 15, height: 43, borderRadius: radius.pill, paddingHorizontal: 13, backgroundColor: '#fff', alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroButtonText: { color: colors.purple, fontSize: 11, fontWeight: '900' },
  heroArtWrap: { position: 'absolute', width: 145, height: 214, right: -15, bottom: 0, transform: [{ rotate: '3deg' }] },
  heroArt: { width: '100%', height: '100%', borderTopLeftRadius: 68, borderTopRightRadius: 12 },
  waveBadge: { position: 'absolute', left: -21, bottom: 20, height: 45, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 2 },
  waveBar: { width: 3, borderRadius: 3, backgroundColor: colors.coral },
  flowCard: { marginTop: 14, height: 82, borderRadius: radius.md, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line },
  flowStep: { alignItems: 'center', gap: 5 },
  flowIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  flowLabel: { color: colors.ink, fontWeight: '800', fontSize: 10 },
  sectionHead: { marginTop: 28, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end' },
  sectionHeadCompact: { marginTop: 26, marginBottom: 12 },
  sectionEyebrow: { color: colors.purple, fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  sectionTitle: { marginTop: 4, color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.6 },
  countBadge: { marginLeft: 'auto', width: 34, height: 25, borderRadius: radius.pill, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.purple, fontSize: 10, fontWeight: '900' },
  gallery: { gap: 12, paddingRight: 24 },
  artCard: { width: 206, height: 274, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.purpleSoft },
  artCardFeatured: { width: 222 },
  artImage: { width: '100%', height: '100%' },
  artOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, padding: 15, justifyContent: 'flex-end' },
  stylePill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, marginBottom: 7 },
  stylePillText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  artName: { color: '#fff', fontSize: 17, fontWeight: '900' },
  artMetaRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  artMood: { color: '#D8CCFF', fontSize: 10, fontWeight: '700' },
  barkStory: { borderRadius: radius.lg, backgroundColor: '#F3E9FF', overflow: 'hidden', borderWidth: 1, borderColor: '#E4D2FA' },
  storyHeader: { paddingHorizontal: 21, paddingTop: 21, zIndex: 2 },
  storyKicker: { color: colors.purple, fontSize: 8, fontWeight: '900', letterSpacing: 1.55 },
  storyTitle: { marginTop: 6, color: colors.ink, fontSize: 26, lineHeight: 28, fontWeight: '900', letterSpacing: -0.9 },
  storyCopy: { marginTop: 8, maxWidth: 285, color: colors.muted, fontSize: 11, lineHeight: 17 },
  barkIllustrationStage: { height: 225, marginTop: -5, overflow: 'hidden', justifyContent: 'center' },
  storyBlobOne: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: '#FFE3D7', right: -38, bottom: -35 },
  storyBlobTwo: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0D7', left: -30, top: 18 },
  barkIllustration: { width: '112%', height: 220, marginLeft: '-6%' },
  traitShuffle: { height: 90, marginTop: -10, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  traitCard: { width: 105, height: 76, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 18, justifyContent: 'flex-end', shadowColor: colors.ink, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5 },
  pitchCard: { backgroundColor: '#3D18D6', transform: [{ rotate: '-5deg' }] },
  rhythmCard: { marginLeft: -7, backgroundColor: '#FF6755', transform: [{ rotate: '3deg' }], zIndex: 2 },
  energyCard: { marginLeft: -7, backgroundColor: '#FFA51F', transform: [{ rotate: '-3deg' }] },
  traitNumber: { position: 'absolute', right: 10, top: 8, color: 'rgba(255,255,255,.55)', fontSize: 8, fontWeight: '900' },
  traitLabel: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1.05 },
  traitValue: { marginTop: 3, color: 'rgba(255,255,255,.86)', fontSize: 10, fontWeight: '700', fontStyle: 'italic' },
  storyNote: { marginHorizontal: 21, paddingTop: 12, paddingBottom: 18, color: '#87758F', fontSize: 8, lineHeight: 13, textAlign: 'center' },
  creationPressable: { marginTop: 15, borderRadius: radius.lg, ...shadows.card },
  creationPressed: { transform: [{ scale: 0.988 }], opacity: 0.96 },
  creationCard: { height: 262, padding: 20, borderRadius: radius.lg, overflow: 'hidden' },
  creationRing: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 32, borderColor: 'rgba(255,255,255,.22)', right: -80, bottom: -95 },
  creationCopy: { width: '63%', zIndex: 2 },
  creationBadge: { alignSelf: 'flex-start', height: 28, paddingHorizontal: 9, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,.72)', flexDirection: 'row', alignItems: 'center', gap: 5 },
  creationBadgeText: { color: colors.coral, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  creationTitle: { marginTop: 12, color: colors.ink, fontSize: 24, lineHeight: 27, fontWeight: '900', letterSpacing: -0.8 },
  creationSubtitle: { marginTop: 7, color: '#624460', fontSize: 10, lineHeight: 15 },
  creationAction: { marginTop: 13, height: 39, paddingHorizontal: 13, borderRadius: radius.pill, alignSelf: 'flex-start', backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: 8 },
  creationActionText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  miniCanvasBack: { position: 'absolute', width: 111, height: 157, right: 0, top: 58, borderRadius: 20, backgroundColor: 'rgba(255,255,255,.4)', transform: [{ rotate: '10deg' }] },
  miniCanvas: { position: 'absolute', width: 117, height: 174, right: -5, top: 42, padding: 5, borderRadius: 21, backgroundColor: '#fff', transform: [{ rotate: '4deg' }] },
  miniCanvasImage: { width: '100%', height: '100%', borderRadius: 17 },
  miniCanvasTag: { position: 'absolute', left: -12, bottom: 15, width: 33, height: 33, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  powered: { paddingVertical: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  poweredText: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
});
