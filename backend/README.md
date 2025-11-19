# Backend scaffold

This folder contains an Express + TypeScript backend scaffold for the AutoPod project.

Structure and responsibilities (scaffold - no real logic implemented):

- `src/index.ts` - Express bootstrap and route mounting
- `src/config/*` - environment and Supabase client creation
- `src/routes/*` - route definitions (auth, podcast, health)
- `src/controllers/*` - HTTP controllers delegating to services
- `src/services/*` - business services (research, script generation, TTS, DB)
- `src/middleware/*` - auth and error handling middleware
- `src/utils/*` - logger and shared types
- `src/models/*` - domain models (Episode)

How to run (after you implement the missing pieces):

1. Fill required keys in `.env`.
2. Install dependencies: `npm install`
3. Run in dev mode: `npx ts-node-dev --respawn --transpile-only src/index.ts`

This scaffold purposefully omits business logic. Each file contains TODO comments and function
signatures where you should implement Supabase calls, LLM and TTS integrations.
