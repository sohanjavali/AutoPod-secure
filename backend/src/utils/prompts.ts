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