// Production order (dependencies first), timeline and markdown export.

import { ASSETS } from '../data/assets';
import { BEAT_BY_ID } from '../data/script';
import { SHOTS, type Shot } from '../data/shots';
import { approvalChecklist, keyframePrompt, klingSettings, producedFiles, videoPrompt, womanPrompt, fmt } from './prompts';
import { fmtTime } from './qa';

export interface BuildStep {
  file: string;
  stage: string;
  title: string;
  prompt: string;
  uploads: { file: string; job: string }[];
  editOf?: string;
  note?: string;
  check?: string[];
}

const STAGE: Record<string, string> = {
  character: '1 · Characters',
  lineup: '1 · Characters',
  prop: '2 · Props',
  location: '3 · Location plates',
  sheet: '3 · Location plates',
  map: '0 · Maps (download from the app)',
  overlay: '6 · Post graphics',
};

export function buildOrder(): BuildStep[] {
  const nodes = new Map<string, BuildStep>();
  for (const a of ASSETS) {
    nodes.set(a.file, { file: a.file, stage: STAGE[a.kind] ?? a.kind, title: a.title, prompt: a.prompt ?? '', uploads: a.uploads ?? [], editOf: a.editOf, note: a.note, check: a.check });
  }
  for (const p of producedFiles()) {
    const stage = p.kind === 'keyframe' ? '4 · Shot keyframes' : p.kind === 'woman' ? '5 · Veiled Woman layers' : '4 · Shot keyframes';
    const title = p.kind === 'woman' ? `${p.shot} — Veiled Woman layer` : p.kind === 'clean' ? `${p.shot} — clean start frame` : `${p.shot} — keyframe`;
    const shot = SHOTS.find((x) => x.id === p.shot)!;
    nodes.set(p.file, { file: p.file, stage, title, prompt: p.prompt, uploads: p.uploads, check: p.kind === 'keyframe' ? approvalChecklist(shot) : undefined });
  }
  const out: BuildStep[] = [];
  const seen = new Set<string>();
  const visit = (f: string) => {
    if (seen.has(f)) return;
    seen.add(f);
    const n = nodes.get(f);
    if (!n) return;
    for (const u of n.uploads) visit(u.file);
    out.push(n);
  };
  // Characters → props → plates → keyframes in shot order → overlays.
  for (const a of ASSETS.filter((a) => a.kind !== 'overlay')) visit(a.file);
  for (const p of producedFiles()) visit(p.file);
  for (const a of ASSETS.filter((a) => a.kind === 'overlay')) visit(a.file);
  return out;
}

export interface TimelineRow {
  shot: Shot;
  start: number;
  end: number;
}

export function timeline(cut: Set<string> = new Set()): TimelineRow[] {
  let t = 0;
  return SHOTS.filter((s) => !cut.has(s.id)).map((shot) => {
    const row = { shot, start: t, end: t + shot.edit };
    t += shot.edit;
    return row;
  });
}

export function linesLost(cut: Set<string>) {
  return SHOTS.filter((s) => cut.has(s.id)).flatMap((s) =>
    s.covers.map((id) => BEAT_BY_ID[id]).filter((b) => b.kind === 'line' || b.kind === 'vo'),
  );
}

export function exportMarkdown(): string {
  const out: string[] = ['# The Haunted Crew — Ep 1 “Answer the Bell, Part 1” — prompts', ''];
  out.push('## Build order', '');
  for (const b of buildOrder()) {
    out.push(`### ${b.file} — ${b.title}`, `Stage: ${b.stage}`);
    if (b.uploads.length) out.push(`Uploads: ${b.uploads.map((u) => `${u.file} (${u.job})`).join('; ')}`);
    if (b.prompt) out.push('', '```', b.prompt, '```');
    if (b.check?.length) out.push('', 'Approve only if:', ...b.check.map((c) => `- [ ] ${c}`));
    out.push('');
  }
  out.push('## Shots', '');
  for (const r of timeline()) {
    const s = r.shot;
    out.push(`### ${s.id} · ${fmtTime(r.start)}–${fmtTime(r.end)} · order ${fmt(s.order)}s / edit ${fmt(s.edit)}s`, s.title, '', `Script beats: ${s.covers.join(', ')}`);
    out.push('', '**Keyframe (Nano Banana 2)**', '```', keyframePrompt(s), '```');
    const ck = approvalChecklist(s);
    if (s.kf.mode === 'generate' || s.kf.mode === 'edit') out.push('', 'Approve the keyframe only if:', ...ck.map((c) => `- [ ] ${c}`));
    const w = womanPrompt(s);
    if (w) out.push('', '**Veiled Woman layer**', '```', w, '```');
    if (s.woman?.cleanPrompt) out.push('', '**Clean start frame**', '```', s.woman.cleanPrompt, '```');
    out.push('', `**Video (${klingSettings(s)})**`, '```', videoPrompt(s), '```', '', `Audio: ${s.audio}`);
    if (s.post) out.push(`Post: ${s.post}`);
    out.push('');
  }
  return out.join('\n');
}
