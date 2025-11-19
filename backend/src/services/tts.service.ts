/**
 * tts.service.ts
 * - Responsible for interacting with Cartesia.ai (or another TTS provider)
 * - Exposes a function to convert a script into an audio file and return a URL
 */

export interface TtsResult {
  audioUrl: string;
  durationSeconds?: number;
}

export async function synthesizeSpeech(script: string, voice?: string): Promise<TtsResult> {
  // TODO: call Cartesia API to generate audio, upload to storage/CDN, and return URL
  throw new Error("synthesizeSpeech not implemented");
}
