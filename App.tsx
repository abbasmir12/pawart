import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { GeneratingScreen } from './src/screens/GeneratingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PhotoScreen } from './src/screens/PhotoScreen';
import { RecordScreen } from './src/screens/RecordScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import type { GenerationResult, PawArtDraft, ScreenName, SelectedPhoto } from './src/types';

const emptyDraft: PawArtDraft = {
  dogName: '',
  photo: null,
  barkUri: null,
  barkDurationMs: 0,
  waveform: [],
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('welcome');
  const [draft, setDraft] = useState<PawArtDraft>(emptyDraft);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const updatePhoto = (photo: SelectedPhoto) => setDraft((value) => ({ ...value, photo }));

  const generationSucceeded = useCallback((nextResult: GenerationResult) => {
    setResult(nextResult);
    setScreen('result');
  }, []);

  const generationFailed = useCallback((message: string) => {
    Alert.alert('The canvas needs a moment', message, [
      { text: 'Back to recording', onPress: () => setScreen('record') },
    ]);
  }, []);

  const startOver = () => {
    setDraft(emptyDraft);
    setResult(null);
    setScreen('photo');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'welcome' ? <WelcomeScreen onStart={() => setScreen('dashboard')} /> : null}
      {screen === 'dashboard' ? <DashboardScreen onCreate={() => setScreen('photo')} /> : null}
      {screen === 'photo' ? (
        <PhotoScreen
          dogName={draft.dogName}
          photo={draft.photo}
          onNameChange={(dogName) => setDraft((value) => ({ ...value, dogName }))}
          onPhotoChange={updatePhoto}
          onContinue={() => setScreen('record')}
          onBack={() => setScreen('dashboard')}
        />
      ) : null}
      {screen === 'record' ? (
        <RecordScreen
          dogName={draft.dogName}
          initialUri={draft.barkUri}
          initialWaveform={draft.waveform}
          onComplete={(barkUri, barkDurationMs, waveform) => {
            setDraft((value) => ({ ...value, barkUri, barkDurationMs, waveform }));
            setScreen('generating');
          }}
          onBack={() => setScreen('photo')}
        />
      ) : null}
      {screen === 'generating' ? (
        <GeneratingScreen draft={draft} onSuccess={generationSucceeded} onError={generationFailed} />
      ) : null}
      {screen === 'result' && result ? (
        <ResultScreen result={result} barkUri={draft.barkUri} waveform={draft.waveform} onCreateAnother={startOver} />
      ) : null}
    </SafeAreaProvider>
  );
}
