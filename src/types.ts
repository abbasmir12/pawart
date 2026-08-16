export type ScreenName = 'welcome' | 'dashboard' | 'photo' | 'record' | 'generating' | 'result';

export type SelectedPhoto = {
  uri: string;
  mimeType: string;
  width: number;
  height: number;
};

export type BarkFeatures = {
  energy: number;
  pitch: 'Low' | 'Medium Low' | 'Medium' | 'Medium High' | 'High';
  rhythm: 'Slow' | 'Steady' | 'Varied' | 'Rapid';
  intensity: 'Gentle' | 'Moderate' | 'Strong';
  barkCount: number;
  pauses: number;
  durationSeconds: number;
};

export type ArtDirection = {
  style: string;
  palette: string;
  composition: string;
  brushwork: string;
  background: string;
  visualIntensity: string;
  descriptors: string[];
};

export type GenerationResult = {
  id: string;
  dogName: string;
  imageUrl: string;
  features: BarkFeatures;
  artDirection: ArtDirection;
};

export type PawArtDraft = {
  dogName: string;
  photo: SelectedPhoto | null;
  barkUri: string | null;
  barkDurationMs: number;
  waveform: number[];
};
