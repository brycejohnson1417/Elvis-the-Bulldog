# Elvis the Bulldog

Elvis the Bulldog is a playful character-interface prototype. It explores how a voice or chat experience can feel more responsive and memorable when wrapped in a strong character concept.

View the AI Studio prototype: https://ai.studio/apps/9b967483-232b-41b8-924a-a9648e5bdb11

## What It Explores

- Character-led AI interaction.
- Lightweight entertainment UX.
- Live response loops and session state.
- How personality changes the feel of a simple assistant interface.

## Technical Notes

- React and Vite frontend.
- Gemini API integration through `@google/genai`.
- Express and local SQLite dependencies are present for prototype service experiments.
- Motion, Tailwind, and lucide-react for interface behavior.

## Current Status

This is a prototype source repo. It is an entertainment concept, not a production voice agent. Production work would require clearer content boundaries, session controls, privacy handling, and moderation rules.

## Run Locally

Prerequisite: Node.js.

1. Install dependencies:
   `npm install`
2. Create a local environment file based on `.env.example`.
3. Add your own Gemini API key locally.
4. Run the app:
   `npm run dev`

## API Key Boundary

Do not deploy this Vite app with a private Gemini key embedded into browser JavaScript. If deploying outside AI Studio, use a server-side API route or an explicit visitor-provided key flow.

## AI-Assisted Build Note

This prototype was built with AI assistance. The useful work is the character framing, interaction loop, and understanding the safety and privacy steps needed before turning a playful demo into a public service.

## Related Public Notes

See the combined prototype overview repo: https://github.com/brycejohnson1417/ai-studio-prototype-overviews
