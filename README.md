# AutoPod

AI‑powered podcasts in seconds — learning at light speed.

## Tech Stack

- Frontend: Next.js (React), TypeScript, Tailwind CSS
- Backend: Node.js, TypeScript, Express
- Auth and Database: Supabase
- APIs: Anthropic Claude (LLM) and Cartesia (TTS)

## Quick Overview

AutoPod converts prompts into short, production-ready podcast episodes using Anthropic Claude for research and script generation, and synthesizes speech with the Cartesia TTS API.

## How to run (local)

1. Backend

     - Change into the backend directory and install dependencies:

         ```bash
         cd backend
         npm install
         ```

     - Create a `.env` file in the `backend/` folder with the following values (replace <YOUR-KEY> with your secrets):

         ```env
         PORT=8000
         CARTESIA_API_KEY=<YOUR-KEY>
         ANTHROPIC_API_KEY=<YOUR-KEY>
         SUPABASE_URL=<YOUR-KEY>
         SUPABASE_PUBLISHABLE_KEY=<YOUR-KEY>
         ```

     - Start the backend in development:

         ```bash
         npm run dev
         ```

2. Frontend

     - Change into the frontend directory and install dependencies:

         ```bash
         cd frontend
         npm install
         ```

     - Create a `.env` file in the `frontend/` folder with the following values (replace <YOUR-KEY> with your secrets):

         ```env
         NEXT_PUBLIC_SUPABASE_URL=<YOUR-KEY>
         NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<YOUR-KEY>
         NEXT_PUBLIC_API_URL=http://localhost:8000
         ```

     - Start the frontend in development:

         ```bash
         npm run dev
         ```
