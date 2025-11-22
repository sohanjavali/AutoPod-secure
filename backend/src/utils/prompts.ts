import type { PodcastConfig } from "./types.ts";

export const buildValidatePrompt = (prompt: string): string => {
    return (
        `A user has submitted the following topic for a podcast episode: "${prompt}"

        Your tasks **in order**:

        ### STEP 1 — Clean the topic (sanitization)
        Clean up the user's topic ONLY if needed:

        - Fix grammar and spelling.
        - Remove filler words (“umm”, “idk”, “like”, etc.).
        - Keep the meaning EXACTLY the same.
        - Do NOT add new information.
        - Do NOT remove meaningful information.
        - Do NOT expand or shorten beyond what is necessary.

        If the meaning cannot be preserved while cleaning, the topic should be rejected.

        Call the result **sanitizedTopic**.

        ### STEP 2 — Evaluate the sanitized topic
        Reflect on possible risks, then evaluate according to:

        1. **SAFETY:** No violence, self-harm, hate, extremism, sexual content, or illegal activities.
        2. **PRIVACY:** No personal/private details about non-public individuals.
        3. **FACTUALITY:** Must not encourage harmful or misleading claims.
        4. **FEASIBILITY:** Must be concrete enough to support an informative podcast.
        - Acceptable: “Projecting the 2026 FIFA World Cup”
        - Too broad/vague: “Soccer”
        5. **LENGTH & CLARITY:** Must be understandable and not random or incomplete.

        If rejected:
        - "reason" must be a brief user friendly error message explaining why the topic was rejected.
        - "sanitizedTopic" must be an empty string.
        
        If accepted:
        - "sanitizedTopic" must be the cleaned-up topic from STEP 1.
        - "reason" must be an empty string.

        ### OUTPUT FORMAT
        Respond with **ONLY** this JSON object. No explanations, commentary, or text outside the JSON object.

        {
            "isValid": boolean,
            "reason": string,
            "sanitizedTopic": string
        }`
    )
}

import type { PodcastConfig } from "./types.ts";

export const buildScriptPrompt = (
  podcastConfig: PodcastConfig,
  researchNotes: string
): string => {
  return `
User topic: "${podcastConfig.prompt}"
Desired duration: ~${podcastConfig.duration} minutes.
Desired style: "${podcastConfig.style}".
Desired language: "${podcastConfig.language}".

Research notes to use:
${researchNotes}

You are writing a FULL 3-person podcast script meant for audio narration.

========================
### SPEAKERS (RANDOM NAMES)
========================
Choose EXACTLY three unique, realistic English first names at random.
Rules for names:
- simple/common first names only (e.g., Maya, Ryan, Chloe, Daniel)
- no last names
- no fantasy/sci-fi names
- all three names must be different
- once chosen, they MUST be used consistently everywhere
Do NOT label them host1/host2/host3.

These names must appear in:
1) the "voices" array
2) EVERY "speaker" in "script"
3) the required intro

========================
### REQUIRED INTRO (FIRST LINES)
========================
The script MUST begin with a shared intro by the three hosts.

Required structure:
1. One host says: "Welcome to AutoPod Podcast."
2. Each host introduces themselves by name.
3. One host clearly states the episode topic.

Example structure (write your own wording):
- Speaker A: "Welcome to AutoPod Podcast. I'm ____."
- Speaker B: "Hey everyone, I'm ____."
- Speaker C: "And I'm ____. Today we’re talking about ____."

========================
### STYLE DEFINITIONS (ONLY THESE 4)
========================
- **conversational** → relaxed, friendly, casual like friends chatting.
- **educational** → teaching/explaining clearly with examples & analogies.
- **entertaining** → funny, lighthearted, playful jokes (not cringe).
- **professional** → formal, polished, confident, structured tone.

The script MUST reflect the selected style consistently.

========================
### EMOTION RULES (MANDATORY)
========================
Every single script line MUST include an "emotion" field.

Emotion rule:
- If it is very clear the line aligns with an emotion, you MUST use that emotion.
- If none fit well, the emotion MUST be "none".

Allowed emotion values (MUST match exactly):
happy, excited, enthusiastic, elated, euphoric, triumphant, amazed, surprised, flirtatious,
joking/comedic, curious, content, peaceful, serene, calm, grateful, affectionate, trust,
sympathetic, anticipation, mysterious, angry, mad, outraged, frustrated, agitated, threatened,
disgusted, contempt, envious, sarcastic, ironic, sad, dejected, melancholic, disappointed,
hurt, guilty, bored, tired, rejected, nostalgic, wistful, apologetic, hesitant, insecure,
confused, resigned, anxious, panicked, alarmed, scared, neutral, proud, confident,
distant, skeptical, contemplative, determined, none

Laughter:
- If a host laughs, write it ONLY inside text as: [laughter]

========================
### REQUIRED RULES 
========================
1. Write a complete natural script long enough for ~${podcastConfig.duration} minutes.
   - smooth transitions
   - short, speakable sentences
   - pacing that feels like a real podcast

2. The script MUST follow the chosen style.

3. It MUST feel like a real 3-person podcast:
   - all 3 hosts contribute throughout
   - they occasionally ask each other questions
   - avoid one person talking for more than ~6 lines straight

4. Integrate the research notes naturally:
   - facts, context, examples, perspectives
   - no bullet points
   - no “here are the notes” meta talk

8. Audio-only suitability:
   - no visual-only references
   - no markdown
   - no meta commentary about being an AI

========================
### TITLE & DESCRIPTION
========================
- Title must be clear and literally tell the listener what the podcast is about.
  (No vague titles.)
- Description must be EXACTLY ONE sentence summarizing the episode.

========================
### OUTPUT FORMAT — JSON ONLY
========================
Return ONLY valid JSON matching EXACTLY this schema:

{
  "title": "string",
  "description": "string",
  "voices": [
    { "name": "string", "persona": "string" }
  ],
  "script": [
    { "lineNum": number, "speaker": "string", "text": "string", "emotion": "string" }
  ]
}

  `
};

