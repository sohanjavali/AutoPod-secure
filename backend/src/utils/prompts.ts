import type { PodcastConfig, Voices } from "./types.ts";

// Builds a prompt to validate a user-submitted podcast topic
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

// Builds a prompt to generate research notes for a podcast episode
export const buildResearchPrompt = (podcastConfig: PodcastConfig): string => {
  return (
    `User has submitted the topic: "${podcastConfig.prompt}".
    The desired podcast duration is approximately ${podcastConfig.duration} minutes.
    The desired style is: ${podcastConfig.style}.

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

// Builds a prompt to generate a podcast script based on research notes
export const buildScriptPrompt = (
  podcastConfig: PodcastConfig,
  researchNotes: string,
  voices: Voices
): string => {
  const targetWords = podcastConfig.duration === 5 ? 500 : 1000;
  const minLines = podcastConfig.duration === 5 ? 35 : 70;
  const minWords = Math.round(targetWords * 0.9);
  const maxWords = Math.round(targetWords * 1.1);

  return (
    `User topic: "${podcastConfig.prompt}"
    Desired duration: ~${podcastConfig.duration} minutes.
    Desired style: "${podcastConfig.style}".

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
    Choose EXACTLY three unique people as hosts/speakers for the podcast from the following list:
    ['Maya', 'Leo', 'Brandon', 'Joanie', 'Judith', 'Kyle']

    These names must appear in:
    1) EVERY "speaker" in "script"
    2) the required intro

    ========================
    ### REQUIRED INTRO (FIRST LINES)
    ========================
    The script MUST begin with a shared intro by the three hosts.

    Required structure:
    1. One host says: "Welcome to AutoPod Podcast."
    2. Each host introduces themselves by name.
    3. One host clearly states the episode topic.

    ========================
    ### CONVERSATION FLOW — NO SEQUENTIAL ORDER (CRITICAL)
    ========================
    The speakers MUST NOT talk in a repeating or predictable sequence.

    Hard bans:
    - Do NOT use round-robin patterns like A→B→C→A→B→C…
    - Do NOT keep alternating in a fixed loop, even loosely.
    - If you notice yourself falling into a sequence, break it immediately.

    Random/natural requirement:
    - The next speaker must feel like a real interruption, follow-up, or jump-in.
    - Choose the next speaker *based on the moment*, not a rotation.
    - Conversations should feel slightly unpredictable, like a real podcast.

    Concrete structure constraints:
    - You MUST include frequent “sequence breaks.”
      Examples of REQUIRED break patterns (use many of these):
      - A → A → B → C
      - A → B → B → C
      - A → C → A → B
      - B → A → C → C
      - C → B → A → A
    - At least 40% of the time, the same speaker speaks twice in a row
      OR two speakers trade 2–3 turns while the third listens and re-enters later.

    Turn length:
    - Each turn should usually be 2–4 sentences.
    - A speaker may take 2 consecutive lines to finish a point or story.
    - Avoid one-sentence ping-pong.

    Balance:
    - No one disappears too long: every speaker returns at least every ~8–12 lines.

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
    - a question that shifts or explores a new angle

    Natural podcast behaviors to include:
    - “Wait, hold on…”
    - “I’m not sure I agree…”
    - “That’s actually really interesting…”
    - clarifications, follow-ups, small interjections
    - light humor if the chosen style allows

    Do NOT:
    - sound like reading bullet points
    - stack facts without commentary
    - drift into textbook tone

    ========================
    ### NOVELTY / NO-REPEAT RULE
    ========================
    Do NOT repeat the same fact or statistic unless adding NEW value.

    Allowed:
    - revisiting a fact to interpret it differently
    - adding a consequence, debate, or emotional angle

    Not allowed:
    - repeating identical numbers/events across different lines
    - using filler like “as mentioned earlier”

    Each new line MUST push the conversation forward with:
    (a) a new fact, OR
    (b) a new interpretation, OR
    (c) a probing question, OR
    (d) a human/emotional insight.

    ========================
    ### STYLE DEFINITIONS (ONLY THESE 4)
    ========================
    - conversational → relaxed, friendly, casual like friends chatting.
    - educational → clear explanations, analogies, smooth teaching flow.
    - entertaining → playful, funny, light jokes (non-cringe).
    - professional → polished, structured, confident, formal tone.

    The script MUST reflect the chosen style.

    ========================
    ### EMOTION RULES (MANDATORY)
    ========================
    Every script line MUST include an "emotion" field.

    Emotion rule:
    - If the line clearly reflects an emotion, choose that emotion.
    - If no emotion fits, use "none".

    Allowed emotion values:
    happy, excited, enthusiastic, elated, euphoric, triumphant, amazed, surprised, flirtatious,
    joking/comedic, curious, content, peaceful, serene, calm, grateful, affectionate, trust,
    sympathetic, anticipation, mysterious, angry, mad, outraged, frustrated, agitated, threatened,
    disgusted, contempt, envious, sarcastic, ironic, sad, dejected, melancholic, disappointed,
    hurt, guilty, bored, tired, rejected, nostalgic, wistful, apologetic, hesitant, insecure,
    confused, resigned, anxious, panicked, alarmed, scared, neutral, proud, confident,
    distant, skeptical, contemplative, determined, none

    Laughter:
    - If a host laughs, write it ONLY inside the text as “[laughter]”.

    ========================
    ### REQUIRED RULES
    ========================
    1. Write a complete natural script long enough for ~${podcastConfig.duration} minutes
      AND within the required word range.
      - smooth transitions
      - speakable pacing
      - natural movement between ideas

    2. Integrate the research notes naturally.
      - no bullet points
      - no “here are the notes” meta talk

    3. Real podcast dynamics:
      - all 3 hosts participate throughout
      - they ask each other questions
      - disagreements and nuanced takes

    4. Audio-only suitable:
      - no visuals
      - no markdown
      - no meta commentary about AI or instructions

    ========================
    ### TITLE & DESCRIPTION
    ========================
    - Title must clearly state the topic.
    - Description must be EXACTLY ONE sentence.

    ========================
    ### OUTPUT FORMAT — JSON ONLY
    ========================
    Return ONLY valid JSON matching EXACTLY this schema:

    {
      "title": "string",
      "description": "string",
      "script": [
        { "lineNum": number, "speaker": "string", "text": "string", "emotion": "string" }
      ]
    }`
  )
}