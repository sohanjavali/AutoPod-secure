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
        Respond with **ONLY** this JSON object. No explanations, no notes, no commentary:
        {
            "isValid": boolean,
            "reason": string,
            "sanitizedTopic": string
        }`
    )
}
