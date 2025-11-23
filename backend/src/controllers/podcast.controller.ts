import type { Request, Response, NextFunction } from "express";
import type { PodcastConfig } from "../utils/types.ts";
import { validatePrompt } from "../services/validate.service.ts";
import { researchPrompt } from "../services/research.service.ts";
import { generateScript } from "../services/script.service.ts";
import type { ValidateResult, ResearchResult, PodcastEpisode } from "../utils/types.ts";
import { synthesizeSpeech } from "../services/tts.service.ts";

// POST /api/validate-prompt
export async function validatePromptController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { prompt } = req.body as { prompt: string };
  const validated: ValidateResult = await validatePrompt(prompt);
  
  res.status(200).json({
    success: true,
    data: validated,
  });
}

// POST /api/generate-podcast
export async function generatePodcastController(
  req: Request,
  res: Response
): Promise<void> {
  const { prompt, style, duration, user } = req.body;
  const podcastConfig = { prompt, style, duration, user } as PodcastConfig;

  const research: ResearchResult = await researchPrompt(podcastConfig);
  const script: PodcastEpisode = await generateScript(
    podcastConfig, 
    JSON.stringify(research)
  );

  const synthesizedAudio = await synthesizeSpeech(script);
  const userId = user.id;

  const safeTitle = script.title.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filePath = `podcasts/${userId}/${safeTitle}.mp3`;

  const { error: uploadError } = await req.body.supabase.storage
    .from("podcasts")
    .upload(filePath, synthesizedAudio, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    res.status(500).json({ error: uploadError.message });
    return;
  }

  const date = new Date();
  const formattedDate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();

  const { data, error: insertError } = await req.body.supabase
    .from("podcasts")
    .insert({
      created_at: formattedDate,
      title: script.title,
      description: script.description,
      duration: duration,
      style: style,
      url: filePath,
      author: userId,
    })

  if (insertError) {
    console.error("Error inserting DB row:", insertError);
    res.status(500).json({ error: insertError.message });
    return;
  }

  res.status(200).json({ success: true });
}

// POST /api/get-podcasts
export async function getPodcastsController(
  req: Request,
  res: Response
): Promise<void> {
  const user = req.body.user;
  const userId = user.id;

  const { data, error } = await req.body.supabase
    .from("podcasts")
    .select("*")
    .eq("author", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({ error: error.message });
    return;
  }

  console.log(data)

  const podcasts = Array.isArray(data) ? (data as any[]) : [];
  const result: any[] = [];

  for (const podcast of podcasts) {
    // Default to the raw stored path in case signing fails or isn't available
    let signedUrl: string | undefined = podcast.url;


    if (podcast.url) {
      const { data: signedData, error: signError } = await req.body.supabase.storage
        .from("podcasts")
        .createSignedUrl(podcast.url, 60 * 60); // 1 hour

      if (!signError && signedData && (signedData as any).signedUrl) {
        signedUrl = (signedData as any).signedUrl;
      }
    }

    // Push a shallow copy of the podcast row with the replaced url
    result.push({
      ...podcast,
      url: signedUrl,
    });
  }

  res.status(200).json({ success: true, data: result });
}