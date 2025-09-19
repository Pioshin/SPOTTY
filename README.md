<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ddcSmsokVPfCMPvKNopYTDw_2SLRb-LM

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on GitHub Pages

This repo is preconfigured to deploy with GitHub Pages on each push to the `main` branch.

1. Ensure the Vite base is correct in `vite.config.ts`:
   - `base: '/SPOTTY/'` (matches this repo name)
2. Push to `main`.
3. In GitHub: Settings > Pages, Source: GitHub Actions.
4. The workflow `.github/workflows/deploy.yml` builds and deploys `dist`.

Live URL (after the first deploy):

https://pioshin.github.io/SPOTTY/

Notes:
- If you fork/rename the repo, update `base` accordingly (e.g., `/my-new-repo/`).
- Avoid embedding secrets in the client bundle. `GEMINI_API_KEY` in a static site becomes public.
