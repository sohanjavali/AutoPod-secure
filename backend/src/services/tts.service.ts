import { cartesiaClient, voices } from "../lib/cartesia.ts";
import type { PodcastEpisode } from "../utils/types.ts";
import { PassThrough, Readable } from "stream";

// Helper function to convert a Readable stream to a Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Synthesizes speech for a given podcast episode script
export async function synthesizeSpeech(script: PodcastEpisode): Promise<Buffer> {
    const finalStream = new PassThrough();

    // Call TTS for each line in the script and pipe the audio chunks into finalStream
    for (const line of script.script) {
        const response = await cartesiaClient.tts.bytes({
            modelId: "sonic-3",
            voice: {
                mode: "id",
                id: voices[line.speaker]?.id || "228fca29-3a0a-435c-8728-5cb483251068"
            },
            outputFormat: {
                container: "mp3",
                sampleRate: 44100,
                bitRate: 128000
            },
            transcript: line.text
        });

        for await (const chunk of response) {
            finalStream.write(chunk);
        }
    }

    finalStream.end();
    const audioBuffer = await streamToBuffer(finalStream);

    return audioBuffer;
}
