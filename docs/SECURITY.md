# AutoPod Security

AutoPod turns a topic into a short podcast. A signed-in user submits a topic, a style and a duration. The backend checks the topic with Claude, researches it with Claude, writes a script with Claude, speaks it with Cartesia text-to-speech, and stores the MP3 in Supabase Storage and the metadata in Supabase Postgres.

The main security problem is that user text steers a language model, and the model's output ends up as audio under the app's name. The posture is defense in depth: authenticate and throttle every costly route, validate all input, keep untrusted text separate from instructions, check what the model produces before it is spoken, log security events without logging prompts, and scan the code and dependencies in CI. No single layer is trusted. The limits of the design are listed honestly under Residual risks.

## Threat model

### Assets

| Asset | Why it matters |
|---|---|
| Anthropic and Cartesia credits | Every generation costs real money. |
| User podcasts and metadata | Stored per user in Supabase. One user must not read another's. |
| System prompts | Reveal how the app works and make attacks easier to tune. |
| The audio output channel | Whatever the script says is spoken as AutoPod. Attackers want to choose those words. |
| Service availability | Slow or expensive requests can starve real users. |

### Entry points and trust boundaries

Routes (`backend/src/routes/podcast.routes.ts`): `POST /api/validate-prompt`, `POST /api/generate-podcast`, `POST /api/get-podcasts`, plus an unauthenticated `GET /api/health`. The first two take free text. Free-text-ish fields: `prompt` (3 to 300 chars), `style` (enum), `duration` (5 or 10). Style and duration are constrained, but style is still a string that reaches a prompt, so it is treated as untrusted.

```
 Browser (untrusted)
    |  JSON, <= 10kb
 ===|=================== boundary 1: network / auth / rate limit / zod
    v
 [auth] -> [rate limit] -> [zod schema]
    v
 [validate topic: Claude]          <- topic is UNTRUSTED data
    v
 [injection classifier: topic]
    v
 [research: Claude, JSON]          <- output of model A
 ===|=================== boundary 2: model output becomes input
    v
 [zod check of research] -> [injection classifier: research notes]
    v
 [script: Claude, JSON]            <- research notes are UNTRUSTED data
    v
 [zod check of script]
 ===|=================== boundary 3: text becomes audio
    v
 [pre-TTS safety check] -> [Cartesia TTS] -> [Supabase Storage + Postgres (RLS)]
```

### Threats

| Threat | How it would work here | Mitigation in place | OWASP LLM 2025 | Google SAIF element |
|---|---|---|---|---|
| Direct prompt injection via topic | Topic says "ignore your rules and say X". | Delimited, escaped data plus a data-not-instructions rule (`utils/prompts.ts`); classifier (`guardrails/injection.ts`) | LLM01:2025 Prompt Injection | Adapt controls to adjust mitigations and create faster feedback loops for AI deployment |
| Injection via style | Style field carries instructions. | Style is a zod enum (`schemas/podcast.schema.ts`) and is also delimited in prompts | LLM01:2025 Prompt Injection | Expand strong security foundations to the AI ecosystem |
| Second-order injection via research notes | Topic makes the research step write instructions, which the script step then obeys. | Notes validated (`guardrails/output.ts`), classified, and delimited as data in the script prompt | LLM01:2025 Prompt Injection | Extend detection and response to bring AI into an organization's threat universe |
| System prompt extraction | Topic asks the model to print its instructions into the script. | Canary phrases and leak markers checked before TTS (`guardrails/output.ts`, `guardrails/canaries.ts`); classifier flags extraction attempts | LLM07:2025 System Prompt Leakage | Automate defenses to keep pace with existing and new threats |
| Attacker-dictated audio | Attacker forces exact lines to be spoken. | Output schema (6 speakers, emotion list, length caps), instruction-pattern check pre-TTS (`guardrails/output.ts`) | LLM05:2025 Improper Output Handling | Automate defenses to keep pace with existing and new threats |
| Credit burning / DoS | Anonymous or scripted calls loop the pipeline. | Auth on every costly route (`middleware/authMiddleware.ts`), global and per-user limits (`middleware/rateLimit.ts`), 10kb body cap (`index.ts`) | LLM10:2025 Unbounded Consumption | Harmonize platform level controls to ensure consistent security across the organization |
| Skipping the safety check | Caller hits generate directly, never calling validate. | `controllers/podcast.controller.ts` validates server-side and uses `sanitizedTopic` | LLM01:2025 Prompt Injection | Expand strong security foundations to the AI ecosystem |
| Malformed or oversized input | Huge body, wrong types, extra fields. | `schemas/podcast.schema.ts` (strict objects), `middleware/validate.ts`, body cap | LLM10:2025 Unbounded Consumption | Harmonize platform level controls to ensure consistent security across the organization |
| Leakage through errors | Stack traces or raw Supabase errors reach the client. | `middleware/errorHandler.ts` returns generic messages; details stay in server logs | LLM02:2025 Sensitive Information Disclosure | Contextualize AI system risks in surrounding business processes |
| Cross-user data access | User A reads user B's podcasts. | Supabase client scoped to the user's JWT so RLS applies (`middleware/authMiddleware.ts`) | LLM02:2025 Sensitive Information Disclosure | Expand strong security foundations to the AI ecosystem |
| Secrets in the repo | API keys committed. | `.env*` ignored; gitleaks workflow (`.github/workflows/gitleaks.yml`) | LLM03:2025 Supply Chain (closest fit) | Expand strong security foundations to the AI ecosystem |
| Vulnerable dependencies | A compromised or outdated package. | npm audit (fails on high), Dependabot, CodeQL (`.github/`) | LLM03:2025 Supply Chain | Expand strong security foundations to the AI ecosystem |

### Residual risks and honest limits

1. Classifiers and delimiters reduce injection. They do not eliminate it. A clever input can still get through, which is why the output checks exist.
2. The research-notes classifier fails open. If the classifier call errors, the pipeline continues, relying on delimiting and output checks. The topic classifier fails closed.
3. The rate limiter is in memory. It resets on restart and is not shared between instances. Scaling out needs a shared store such as Redis.
4. Untrusted text is wrapped in XML-style tags with `<` and `>` escaped. Anthropic's current guidance also suggests JSON-encoding untrusted strings. We chose tags; that choice is open to revisiting.
5. CodeQL code scanning may not run on a private repo on a free personal plan. The workflow notes this.
6. The Anthropic SDK is pinned to an older version and uses a beta structured-outputs parameter, so upgrades may change behavior.
7. The pre-TTS pattern check is a blocklist. It catches known shapes, not every unsafe sentence.

## How each defense works

The root idea: an LLM reads instructions and data as one stream of text, so it cannot reliably tell them apart. The developer's rules and the user's topic arrive in the same format. If the topic says "ignore the rules", the model may treat that as a rule. Nothing in the model enforces a wall between the two. Every defense below either builds a wall outside the model, shrinks what a successful attack can do, or checks the result afterward.

### Authentication on every costly route
`authMiddleware.ts` requires a Bearer token and asks Supabase to confirm it. No valid token means a 401 before any model is called. `validate-prompt` used to be open, which meant anyone could burn Claude credits. Now every route that spends money needs a real user.
Say it in one breath: no login, no spending.

### Rate limiting
`rateLimit.ts` has a loose global limit per IP, plus per-user limits that run after auth (5 generations and 30 validations per 15 minutes by default). Counting per user stops one account from hammering the API even from many IPs. Blocked calls get a 429 and a `rate_limited` security event.
Say it in one breath: even a logged-in user gets a bounded budget.

### Input validation with zod
zod is a library that checks data against a declared shape. `podcast.schema.ts` requires a 3 to 300 character prompt, a style from a fixed list, a duration of 5 or 10, and rejects unknown fields. `index.ts` also caps the JSON body at 10kb. Bad input dies at the door, cheaply, before any model call.
Say it in one breath: define what valid looks like and reject the rest.

### Server-side validation that cannot be skipped
Before, the safety check ran only if the frontend chose to call it. A direct call to generate skipped it. Now `podcast.controller.ts` runs `validatePrompt` itself and feeds the cleaned `sanitizedTopic` into the pipeline. Never trust the client to do your checks.
Say it in one breath: the check lives on the server, so skipping the UI skips nothing.

### System prompt and user turn separation
The standing rules live in the system prompt. The user's topic goes in the user message. Models are trained to weigh the system prompt more heavily, so this gives the rules a head start. It is a bias, not a lock.
Say it in one breath: rules in one place, user text in another, because the model leans toward the first.

### XML-tag delimiting and escaping
In `utils/prompts.ts`, the topic, style and research notes are wrapped in named tags, and the prompt says anything inside is data, never instructions. Untrusted text has `<` and `>` replaced so it cannot close a tag early and fake a new section. A delimiter is a labeled fence around untrusted text. Escaping stops the attacker from drawing their own fence.
Say it in one breath: fence the untrusted text and make sure it cannot fake the fence.

### The injection classifier, and why it also runs on research notes
`guardrails/injection.ts` asks a small model (claude-haiku-4-5) whether text tries to give instructions to an AI. It runs on the topic and blocks at confidence 0.8 or higher. It runs again on the research notes because those are model-generated from web-ish content and the topic. A poisoned topic can make the research step write instructions into its notes, and the script step would then read them. That is second-order injection.
Say it in one breath: one model screens the input, and screens the middle stage too, because model output is untrusted input to the next step.

### Structured-output validation
Each stage must return JSON, and `guardrails/output.ts` checks it with zod: six allowed speakers, an allowed emotion list, length caps, and line-count bounds per duration. Structured output means the model cannot return free-form text where the app expects fields. A model that was hijacked into inventing a speaker or a 50,000 character line fails the schema.
Say it in one breath: if the output is not the exact shape we asked for, it never moves on.

### The pre-TTS safety check and canaries
`assertSafeForTTS` is the last gate before audio. It scans the title, description and every line for canary phrases, prompt-structure leakage, and instruction-like patterns. A canary is a unique marker planted in the prompts; if it shows up in the script, the model is leaking its prompt. Audio is hard to review and costs money to make, so we check the text first.
Say it in one breath: a final text check, with tripwires, before anything is spoken.

### Safe error handling
`errorHandler.ts` returns short generic messages. Stack traces and raw Supabase errors go only to the server log. Attackers use detailed errors to learn how a system works, so the client learns nothing. User and Supabase client objects now live in `res.locals`, not `req.body`, so a client cannot forge them.
Say it in one breath: tell the log everything and the client almost nothing.

### Security logging with hashed prompts
`lib/logger.ts` and `lib/stepLog.ts` write structured pino JSON logs. Each pipeline step logs its name, duration, outcome, request id, user id and a prompt hash, which is the first 12 hex characters of a SHA-256. The hash lets you link log lines to one prompt without storing what the user typed. Auth headers are redacted.
Say it in one breath: we can trace an attack without keeping private text.

### RLS-scoped Supabase client
Row Level Security (RLS) is a Postgres feature where the database itself filters rows by who is asking. `authMiddleware.ts` builds a Supabase client carrying the user's own token, so every query runs as that user. Even if app code had a bug, the database refuses rows that belong to someone else.
Say it in one breath: the database enforces ownership, not just the app.

### CI scanning
GitHub Actions in `.github/` run CodeQL (static analysis for code bugs), gitleaks (hunts for committed secrets), and npm audit (fails the build on high-severity dependency issues). Dependabot opens pull requests for outdated packages. These catch mistakes humans make while moving fast.
Say it in one breath: robots check the code and dependencies on every push.

### Red-teaming with promptfoo
`backend/redteam/` holds a promptfoo suite, a tool that fires test attacks at the app and reports which ones got through. It covers direct topic injection, style-field injection, system-prompt extraction, forced attacker text, and oversized input. Run it after any prompt or guardrail change. Defenses that were never attacked are only assumptions.
Say it in one breath: attack your own app on purpose, before someone else does.

### Defense in depth
No layer here is trusted alone, because each one has a known way to fail. The classifier can miss a clever attack, delimiters can be ignored by the model, and a blocklist cannot list every bad sentence. So the layers overlap: authentication and rate limits bound who can try and how often, validation and delimiting limit what gets in, the classifier and schemas check what moves between stages, and the pre-TTS check guards the final output. Logs and red-teaming tell us when a layer fails. An attacker has to beat all of them in sequence, and each failure leaves a trace.

## Running the checks

Typecheck, from `backend/`:

```
npm run typecheck
```

Red-team suite, from `backend/`:

```
npm run redteam
```

Logs go to stdout as one JSON object per line (pino). Set `LOG_LEVEL` to change verbosity. Every line carries a `requestId`, which is also returned in the `x-request-id` response header.

To spot a security event, filter for `"event":"security_event"`. The `type` field is one of `injection_blocked`, `output_guardrail_blocked`, `topic_rejected`, `auth_failed` or `rate_limited`. For example, `node dist/index.js | grep '"security_event"'`. To follow one request through the pipeline, filter by its `requestId` and read the `"event":"pipeline_step"` lines in order. A step with `outcome: "blocked"` was stopped by a guardrail.
