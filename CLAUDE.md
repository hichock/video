# Project notes for Claude

Production app for *The Haunted Crew* Ep 1 (see README.md).

- Before writing or changing any shot, prompt or location: read and follow
  `docs/CONTINUITY_RULES.md` (overhead map, 180° line, screen direction, eyelines, match
  cuts between consecutive shots, staging cards, approval checklists).
- Source priority: Notion script > bible > production rules. Never cut or paraphrase
  script beats; `src/data/script.ts` is the verbatim script.
- Shots live in `src/data/shots.ts`; prompts are generated in `src/lib/prompts.ts`.
- Run `npm test` after every change; it is the QA gate for the Vercel build.
