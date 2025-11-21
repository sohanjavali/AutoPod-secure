// // backend/src/services/script.service.ts
// import Anthropic from "@anthropic-ai/sdk";
// import { env } from "../config/env";
// import logger from "../utils/logger";
// import { ScriptLine, Voice } from "../utils/types";

// export interface ScriptResult {
//   script: ScriptLine[];
//   voices: Voice[];
//   key_takeaways: string[];
//   quiz: {
//     question: string;
//     type: "mcq";
//     options: string[];
//     correct_index: number;
//     explanation: string;
//   }[];
//   title: string;
//   description: string;
// }

// const anthropic = new Anthropic({
//   apiKey: env.anthropicApiKey,
// });

// /**
//  * generateScript
//  * @param topic - main topic
//  * @param duration - minutes (15 or 30)
//  * @param style - "monologue" | "dialogue" | "debate" | "story"
//  * @param researchNotes - background notes
//  */
// export async function generateScript(
//   topic: string,
//   duration: number = 15,
//   style: string = "monologue",
//   researchNotes: string = ""
// ): Promise<ScriptResult> {
//   if (!env.anthropicApiKey) {
//     // Fallback placeholder if no key for now
//     logger.warn(
//       "ANTHROPIC_API_KEY not set – returning placeholder script instead of real LLM output."
//     );
//     return {
//       title: `Placeholder: ${topic}`,
//       description: `Placeholder episode about ${topic}.`,
//       voices: [{ name: "Host", persona: "Calm explainer" }],
//       script: [
//         {
//           speaker: "Host",
//           text: `This would be a ${duration}-minute ${style} episode about ${topic}.`,
//         },
//       ],
//       key_takeaways: [`Basic understanding of ${topic}.`],
//       quiz: [],
//     };
//   }

//   const wordBudget = duration * 160;

//   const systemPrompt = `
// You are a world-class educational podcast writer.

// You will generate a COMPLETE podcast script about a single topic.
// The script MUST be:
// - clear, accurate, and well-structured
// - optimized to be spoken aloud
// - roughly ${wordBudget} words long (for a ${duration}-minute episode)
// - informed by these research notes if helpful: ${researchNotes}
// - in the style: ${style}

// Output MUST be valid JSON only, with this exact shape:

// {
//   "title": "string",
//   "description": "string",
//   "voices": [
//     { "name": "string", "persona": "string" }
//   ],
//   "script": [
//     { "speaker": "string", "text": "string" }
//   ],
//   "key_takeaways": ["string"],
//   "quiz": [
//     {
//       "question": "string",
//       "type": "mcq",
//       "options": ["A","B","C","D"],
//       "correct_index": 0,
//       "explanation": "string"
//     }
//   ]
// }

// Rules:
// - Speakers in "script.speaker" MUST match one of the "voices.name".
// - Use light, tasteful humor if appropriate.
// - No content outside the JSON object.
// `.trim();

//   const userPrompt = `
// Generate a podcast script about:

// "${topic}"

// Return ONLY the JSON as described.
// `.trim();

//   const response = await anthropic.messages.create({
//     model: env.anthropicModel,
//     max_tokens: 6000,
//     temperature: 0.7,
//     system: systemPrompt,
//     messages: [{ role: "user", content: userPrompt }],
//   });

//   const block = response.content[0];
//   if (block.type !== "text") {
//     throw new Error("Unexpected content type from Claude");
//   }

//   const raw = block.text;
//   let parsed: ScriptResult;
//   try {
//     parsed = JSON.parse(raw);
//   } catch (e) {
//     logger.error("Failed to parse JSON from Claude:", raw);
//     throw new Error("Model output was not valid JSON");
//   }

//   return parsed;
// }
