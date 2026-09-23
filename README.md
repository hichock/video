# The Haunted Crew — Ep 1 production app

Shot-by-shot production app for *The Haunted Crew*, Episode 1 “Answer the Bell, Part 1” (9:16).
It holds every Nano Banana 2 keyframe prompt and every Kling 3.0 video prompt, and checks them
automatically against the locked script, the series bible and the production rules.

## Where things live

| File | What it is |
| --- | --- |
| `src/data/script.ts` | The locked Notion script, beat by beat, word for word. Source of truth #1. |
| `src/data/characters.ts` | Locked identities: prompt descriptors (never names), wardrobe, heights, sheet prompts, voices. |
| `src/data/assets.ts` | Locked maps for each space, looks, and every plate and prop prompt. |
| `src/data/shots.ts` | The 51 shots: script beats covered, blocking, uploads with jobs, keyframe, Veiled Woman layer, timed video beats. |
| `src/lib/prompts.ts` | Builds the final prompts from the data, so the same person or room always gets the same words. |
| `src/lib/qa.ts` | Automated QA: coverage, order, verbatim lines, timings, names, uploads, camera grammar, Woman rules. |
| `src/data/notes.ts` | What was wrong in the previous pack; deviations and producer decisions. |

Scripted lines are pulled into prompts from `script.ts` with `q('C6')`, so they can't be
paraphrased. To change a shot, edit `shots.ts` and run `npm test`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # QA; fails on any rule violation
npm run build
```

## Deploy on Vercel

Import the repository in Vercel. `vercel.json` sets the framework to Vite and runs the QA tests
before the build, so a broken script mapping or prompt fails the deploy instead of shipping.
No environment variables are needed. Progress ticks, trim proposals and settings are saved in
the viewer's browser (localStorage).
