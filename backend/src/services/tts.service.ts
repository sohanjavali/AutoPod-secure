import { cartesiaClient, voices } from "../lib/cartesia.ts";
import type { PodcastTranscript } from "../utils/types.ts";
import { PassThrough } from "stream";

export async function synthesizeSpeech(script: PodcastTranscript): Promise<PassThrough> {
    const finalStream = new PassThrough();

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

    return finalStream;
}
