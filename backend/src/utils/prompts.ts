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

export const buildResearchPrompt = (podcastConfig: PodcastConfig): string => {
  return (
    `User has submitted the topic: "${podcastConfig.prompt}".
    The desired podcast duration is approximately ${podcastConfig.duration} minutes.
    The desired style is: ${podcastConfig.style}.
    The desired language is: ${podcastConfig.language}.

    Your task is to produce **research notes that could later be turned into a natural multi-person discussion**. The notes should contain the substance of what each participant could talk about in a real podcast. Include multiple perspectives, discussion points, and suggested facts.

    Rules:
    1. Notes should cover enough content to support a ${podcastConfig.duration}-minute podcast.
    2. Notes should reflect the desired style.
    3. Include multiple perspectives or angles for discussion, so that a script with multiple speakers can be created later.
    4. Include:
    - Key facts or statistics
    - Interesting anecdotes or examples
    - Potential questions one speaker could ask another
    - Opinions, arguments, or counterpoints
    - Context or background where necessary
    5. Be factual and suitable for a general audience. Indicate uncertainty where appropriate.
    6. Do NOT generate full dialogue or a podcast script — only structured notes with overall citations.

    ### OUTPUT FORMAT
    Respond with **ONLY** a JSON object with this format. No explanations, commentary, or text outside the JSON object.

    {
      "topic": "string",  // the topic provided by the user
      "duration": number, // the duration provided by the user
      "style": "string",  // the style provided by the user
      "language": "string", // the language provided by the user           
      "discussionPoints": [
          {
              "title": "string",         
              "facts": ["string", ...],    
              "perspectives": ["string", ...], 
              "questions": ["string", ...]
          },
      ],
        "citations": ["string", ...]
    }`
  )
}

export const buildScriptPrompt = (
  podcastConfig: PodcastConfig,
  researchNotes: string,
  targetWords: number,
  minLines: number
): string => {
  const minWords = Math.round(targetWords * 0.9);
  const maxWords = Math.round(targetWords * 1.1);

  return (
    `User topic: "${podcastConfig.prompt}"
    Desired duration: ~${podcastConfig.duration} minutes.
    Desired style: "${podcastConfig.style}".
    Desired language: "${podcastConfig.language}".

    Research notes to use:
    ${researchNotes}

    You are writing a FULL 3-person podcast script meant for audio narration.

    ========================
    ### LENGTH REQUIREMENT (HARD CONSTRAINT)
    ========================
    The final JSON "script" content MUST be approximately ${targetWords} words total
    (across ALL "text" fields combined). Acceptable range: ${minWords}–${maxWords} words.

    You MUST produce at least ${minLines} script lines.

    If you are below ${minWords} words, you MUST continue the conversation.
    Do not end early. Keep generating new lines until you reach the target range.

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

    ========================
    ### TURN-LENGTH & CONVERSATION FLOW (VERY IMPORTANT)
    ========================
    This should feel like 3 people talking in a room, not a textbook ping-pong.

    Rules:
    - Speakers MUST NOT follow a strict repeating order (no round-robin).
    - Vary who speaks next naturally. It is normal for:
      - one person to jump in twice in a row
      - two people to back-and-forth while the third listens, then re-enters
    - Each speaker turn should usually be 2–4 sentences.
    - It is OK for a speaker to speak for 2 consecutive lines to finish a point.
    - Avoid “one line each” cycles. Break the pattern.
    - No speaker should disappear for too long: everyone re-enters at least every ~8–12 lines.

    ========================
    ### PODCAST FEEL (MANDATORY)
    ========================
    Write like a real podcast, not a lecture.

    Every discussion segment must include:
    - facts + context (from notes)
    - host reactions
    - opinions / takes
    - at least one disagreement or contrast of viewpoints
    - a quick example / analogy / story
    - a question that changes direction slightly

    Natural podcast behaviors to include:
    - “Wait, hold on…” / “That’s a good point…” / “I’m not sure I agree…”
    - small clarifications or follow-ups
    - occasional light humor if style allows

    Do NOT sound like reading bullet points.
    Do NOT stack facts back-to-back without human commentary.

    ========================
    ### NOVELTY / NO-REPEAT RULE
    ========================
    Do not repeat the same fact or statistic unless you add NEW value.

    Allowed:
    - revisiting a fact to interpret it differently
    - adding a consequence, debate, or human angle

    Not allowed:
    - restating identical numbers or events in multiple places
    - “as we said earlier…” filler

    Each new line should push the conversation forward with:
    (a) a new fact, OR
    (b) a new interpretation, OR
    (c) a new question, OR
    (d) a new emotional/human angle.

    ========================
    ### STYLE DEFINITIONS (ONLY THESE 4)
    ========================
    - conversational → relaxed, friendly, casual like friends chatting.
    - educational → teaching/explaining clearly with examples & analogies.
    - entertaining → funny, lighthearted, playful jokes (not cringe).
    - professional → formal, polished, confident, structured tone.

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
    1. Write a complete natural script long enough for ~${podcastConfig.duration} minutes
      AND within the required word range.
      - smooth transitions
      - short, speakable sentences
      - pacing that feels like a real podcast

    2. Integrate the research notes naturally:
      - facts, context, examples, perspectives
      - no bullet points
      - no meta talk like “here are the notes”

    3. Real podcast dynamics:
      - all 3 hosts contribute throughout
      - they ask each other questions
      - occasional disagreement / debate where appropriate

    4. Audio-only suitability:
      - no visual-only references
      - no markdown
      - no meta commentary about being an AI

    ========================
    ### TITLE & DESCRIPTION
    ========================
    - Title must be clear and literal about the topic.
    - Description must be EXACTLY ONE sentence.

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
    }`
  )
}