import * as Speech from 'expo-speech';

export async function speakCoachText(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  await Speech.speak(trimmed, {
    language: 'tr-TR',
    rate: 1,
  });
}

export function stopCoachSpeech(): void {
  Speech.stop();
}
