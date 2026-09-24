// Automated QA against the script and the production rules. The same checks
// run in the app (QA tab) and in `npm test`, which gates the Vercel build.

import { ALL_BEATS, BEAT_BY_ID, BEAT_INDEX, SCRIPT } from '../data/script';
import { ASSETS } from '../data/assets';
import { CHARACTERS, NAMES } from '../data/characters';
import { SHOTS, THINGS, visibleOf, type Shot, type Thing } from '../data/shots';
import { keyframePrompt, producedFiles, refFor, videoPrompt, womanPrompt } from './prompts';

export type Severity = 'error' | 'warn' | 'info';
export interface Finding {
  severity: Severity;
  rule: string;
  shot?: string;
  msg: string;
}

const norm = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/\s+/g, ' ').trim();
const stripQuotes = (s: string) => s.replace(/“[^”]*”/g, '').replace(/"[^"]*"/g, '');
const words = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;

export const WPS_WARN = 3.0;
export const WPS_ERROR = 3.6;

export function runQA(): Finding[] {
  const f: Finding[] = [];
  const add = (severity: Severity, rule: string, msg: string, shot?: string) => f.push({ severity, rule, msg, shot });

  // 1. Script coverage and order -------------------------------------------
  const coveredBy: Record<string, string[]> = {};
  let last = -1;
  for (const s of SHOTS) {
    for (const id of s.covers) {
      if (!(id in BEAT_INDEX)) add('error', 'Script coverage', `Covers unknown beat ${id}`, s.id);
      (coveredBy[id] ??= []).push(s.id);
      // SOUND notes describe a whole section; they don't pin an order.
      if (BEAT_BY_ID[id]?.kind === 'sound') continue;
      const idx = BEAT_INDEX[id];
      if (idx <= last) add('error', 'Script order', `Beat ${id} is out of script order`, s.id);
      last = Math.max(last, idx);
    }
  }
  for (const b of ALL_BEATS) {
    if (!coveredBy[b.id]) add('error', 'Script coverage', `Beat ${b.id} is not covered by any shot: “${b.text}”`);
    else if (coveredBy[b.id].length > 1) add('warn', 'Script coverage', `Beat ${b.id} is covered twice (${coveredBy[b.id].join(', ')})`);
  }

  const produced = producedFiles();
  const producedSet = new Set(produced.map((p) => p.file));
  const assetSet = new Set(ASSETS.map((a) => a.file));

  for (const s of SHOTS) {
    const vp = videoPrompt(s);
    const kp = keyframePrompt(s);
    const lineBeats = s.covers.map((id) => BEAT_BY_ID[id]).filter((b) => b && (b.kind === 'line' || b.kind === 'vo'));

    // 2. Every scripted line verbatim in the video prompt ---------------------
    // On-screen dialogue goes in the video prompt; VO and off-screen lines only in the edit notes.
    for (const b of lineBeats) {
      const inShot = b.kind === 'line' && !b.offScreen;
      if (inShot && !norm(vp).includes(norm(b.line!))) add('error', 'Lines in prompt', `Line ${b.id} missing from the video prompt: “${b.line}”`, s.id);
      if (!inShot && norm(vp).includes(norm(b.line!))) add('error', 'Lines in prompt', `${b.id} is VO/off-screen and must not be in the video prompt`, s.id);
      if (!inShot && !norm(s.audio).includes(norm(b.line!))) add('error', 'Lines in edit', `${b.id} (VO/off-screen) missing from the audio notes: “${b.line}”`, s.id);
    }
    // 3. VO clips silent and say so
    if (lineBeats.some((b) => b.kind === 'vo')) {
      if (s.sound !== 'off') add('error', 'VO', 'VO shot must be generated with sound off', s.id);
      if (!vp.includes('Nobody on screen speaks')) add('error', 'VO', 'VO shot must say nobody on screen speaks', s.id);
    }
    // 4. Max two speakers per clip
    const speakers = new Set(lineBeats.filter((b) => b.kind === 'line' && !b.offScreen).map((b) => b.speaker));
    if (speakers.size > 2) add('error', 'Speakers', `${speakers.size} speakers in one clip; split it`, s.id);

    // 5. Timing: beats tile 0 → order length
    const beats = [...s.video.beats].sort((a, b) => a.t[0] - b.t[0]);
    let t = 0;
    for (const b of beats) {
      if (Math.abs(b.t[0] - t) > 1e-6) add('error', 'Timing', `Gap/overlap at ${t}s → ${b.t[0]}s`, s.id);
      if (b.t[1] <= b.t[0]) add('error', 'Timing', `Empty beat ${b.t[0]}–${b.t[1]}s`, s.id);
      t = b.t[1];
    }
    if (Math.abs(t - s.order) > 1e-6) add('error', 'Timing', `Beats end at ${t}s but the clip is ordered at ${s.order}s`, s.id);
    if (s.order < 3 || s.order > 15) add('error', 'Timing', `Kling length ${s.order}s is outside 3–15s`, s.id);
    if (s.edit > s.order || s.edit <= 0) add('error', 'Timing', `Edit length ${s.edit}s must be >0 and ≤ order ${s.order}s`, s.id);
    if (s.order - s.edit > 3.5) add('warn', 'Timing', `Ordering ${s.order}s to keep ${s.edit}s wastes generation`, s.id);

    // 6. Line speed inside its beat
    for (const b of beats) {
      const quoted = (b.text.match(/“[^”]*”/g) ?? []).join(' ');
      if (!quoted) continue;
      const wps = words(quoted) / (b.t[1] - b.t[0]);
      if (wps > WPS_ERROR) add('error', 'Line speed', `${wps.toFixed(1)} words/s in ${b.t[0]}–${b.t[1]}s — the line cannot fit`, s.id);
      else if (wps > WPS_WARN) add('warn', 'Line speed', `${wps.toFixed(1)} words/s in ${b.t[0]}–${b.t[1]}s — tight`, s.id);
    }
    if (s.video.vo) {
      const vw = words((s.video.vo.match(/“[^”]*”/g) ?? []).join(' '));
      if (vw / 3 > s.edit + 3.5) add('warn', 'VO length', `VO needs ~${(vw / 3).toFixed(1)}s; it spills well past this shot`, s.id);
    }

    // 7. No names in prompts (outside quoted dialogue)
    for (const [label, text] of [
      ['video', vp],
      ['keyframe', kp],
      ['woman', womanPrompt(s)],
    ] as const) {
      const bare = stripQuotes(text);
      for (const n of NAMES) if (new RegExp(`\\b${n}\\b`).test(bare)) add('error', 'Names', `Name “${n}” in the ${label} prompt`, s.id);
      if (/\b(CH|LOC|KF|PROP|MARK)_[A-Z0-9_]+\.png\b/.test(text.replace(/^No keyframe.*$/m, ''))) add('error', 'References', `File name used as a reference in the ${label} prompt`, s.id);
    }

    // 8. Uploads
    const needsUploads = s.kf.mode === 'generate' || s.kf.mode === 'edit';
    if (needsUploads && (s.kf.uploads.length < 2 || s.kf.uploads.length > 5)) add('error', 'Uploads', `${s.kf.uploads.length} uploads; use 2–5`, s.id);
    const allUploads = [...s.kf.uploads, ...(s.woman?.uploads ?? [])];
    for (const u of allUploads) {
      if (!assetSet.has(u.file) && !producedSet.has(u.file)) add('error', 'Uploads', `Unknown upload ${u.file}`, s.id);
      else if (!refFor(u.file) && needsUploads) add('error', 'Uploads', `No visual description for ${u.file}`, s.id);
      if (!u.job) add('error', 'Uploads', `Upload ${u.file} has no job`, s.id);
    }
    if (s.kf.endFrame && !assetSet.has(s.kf.endFrame) && !producedSet.has(s.kf.endFrame)) add('error', 'Uploads', `Unknown end frame ${s.kf.endFrame}`, s.id);

    // 9. Identity source for everyone visible
    if (needsUploads) {
      const files = new Set(s.kf.uploads.map((u) => u.file));
      const continuing = s.kf.uploads.some((u) => u.file.startsWith('KF_'));
      for (const c of visibleOf(s)) {
        if (!files.has(CHARACTERS[c].sheetFile) && !files.has('CH_LINEUP.png') && !continuing)
          add('error', 'Identity', `${CHARACTERS[c].name} is visible but no sheet, lineup or approved frame is uploaded`, s.id);
      }
    }

    // 9b. Staging: everyone placed and turned; the video prompt restates the start frame
    const ids = visibleOf(s);
    if (new Set(ids).size !== ids.length) add('error', 'Staging', 'A person is staged twice', s.id);
    for (const p of s.people) {
      if (!p.where || !p.doing) add('error', 'Staging', `${CHARACTERS[p.id].name} has no position or action`, s.id);
      if ((p.view === 'back' || p.view === 'back34') && /\b(looks?|looking|eyes) (at|into) the (camera|lens)\b/i.test(p.doing)) add('error', 'Staging', `${CHARACTERS[p.id].name} is seen from behind but told to look at the camera`, s.id);
    }
    // Props must be visible from the camera's side; a prop carried by someone seen from behind needs its visibility stated.
    for (const p of s.people) {
      const carries = /\b(handheld|compact (black )?camera|case|pouch|flashlight|radio|recorder)\b|glowing monitor/i.test(p.doing);
      if (carries && !p.hands) add('error', 'Hands', `${CHARACTERS[p.id].name} carries a prop but the hands are not staged`, s.id);
      if ((p.view === 'back' || p.view === 'back34') && p.hands && /camera/i.test(p.hands) && !/visible|show/i.test(p.hands))
        add('error', 'Hands', `${CHARACTERS[p.id].name} is seen from behind; say how the camera stays visible`, s.id);
      if (/only (his|her) elbows show|hidden/i.test(`${p.doing} ${p.hands ?? ''}`)) add('error', 'Hands', `${CHARACTERS[p.id].name}: a hidden prop will vanish in the video`, s.id);
    }
    // Action phase: the first video beat must not restate an action the start frame already shows as done.
    const first = s.video.beats[0]?.text ?? '';
    for (const p of s.people) {
      if (/ALREADY OUT/.test(p.doing) && /\b(hauls|lifts|takes|pulls)\b[^.]*\bout\b/i.test(first.split(';')[0]) && first.includes(CHARACTERS[p.id].short))
        add('error', 'Action phase', `${CHARACTERS[p.id].name}: start frame shows the action done, but the video repeats it`, s.id);
    }
    if (s.people.length && !vp.includes('Start frame:')) add('error', 'Staging', 'Video prompt does not describe the start frame', s.id);
    if (s.people.some((p) => p.view !== 'hands') && !vp.includes('Nobody looks into the lens')) add('error', 'Staging', 'Video prompt must keep eyes off the lens', s.id);
    if (s.cam === 'handheld' && s.operator && ids.includes(s.operator)) add('error', 'Camera grammar', 'The handheld operator cannot be in his own shot', s.id);

    // 10. Veiled Woman only on NURSERY FIXED, never generated in motion
    const usesVeiled = visibleOf(s).includes('veiled') || allUploads.some((u) => u.file === CHARACTERS.veiled.sheetFile);
    if ((usesVeiled || s.woman) && s.cam !== 'fixed-nursery') add('error', 'Veiled Woman', 'The Woman may only appear on NURSERY FIXED', s.id);
    if (s.kf.uploads.some((u) => u.file === CHARACTERS.veiled.sheetFile)) add('error', 'Veiled Woman', 'The Woman must not be in the animated start frame; composite her as a still', s.id);
    if (/veil/i.test(vp)) add('error', 'Veiled Woman', 'Video prompt mentions the figure; she is composited, never animated', s.id);

    // 11. Camera grammar
    if (s.cam === 'handheld') {
      if (!s.operator) add('error', 'Camera grammar', 'Handheld shot without an operator', s.id);
      else {
        const i = SHOTS.indexOf(s);
        const prev = SHOTS[i - 1];
        const established = prev && (visibleOf(prev).includes(s.operator) || (prev.cam === 'handheld' && prev.operator === s.operator));
        if (!established) add('error', 'Camera grammar', 'Handheld operator is not established by the previous shot', s.id);
      }
      if (visibleOf(s).length === 1 && visibleOf(s)[0] === 'clara') add('error', 'Camera grammar', 'Clara alone is never handheld', s.id);
    }
    if (s.cam.startsWith('fixed') && !vp.includes('perfectly locked')) add('error', 'Camera grammar', 'Fixed camera prompt must lock the camera', s.id);
    if (s.cam === 'fixed-nursery' && !s.woman && s.id !== 'SH01') add('warn', 'Veiled Woman', 'NURSERY FIXED shot without a Woman layer', s.id);

    // 12. Clara at the door on NURSERY FIXED never turns
    if (s.cam === 'fixed-nursery' && s.id !== 'SH01' && !/never turns around/.test(vp)) add('error', 'Performance', 'Clara must be told not to turn around', s.id);

    // 13. Performance: no flat or camp directions
    if (/\b(scream|screams|screaming|shrieks)\b/i.test(stripQuotes(vp).replace(/No screaming\./g, ''))) add('error', 'Performance', 'Screaming is not allowed', s.id);
  }

  // 14. Mark progression
  const markOrder = ['SH34', 'SH40', 'SH47', 'SH51'];
  const expect = [null, 'LEFT', 'MIDDLE', 'RIGHT'];
  markOrder.forEach((id, i) => {
    const s = SHOTS.find((x) => x.id === id);
    if (!s) return;
    const m = s.kf.uploads.find((u) => u.file === 'MARK_STAGES.png');
    if (expect[i] === null ? !!m : !m?.job.includes(expect[i]!)) add('error', 'Throat mark', `Wrong mark stage (expected ${expect[i] ?? 'none'})`, id);
  });

  // 15. Woman positions progress P1 → P2 → P3 → P3
  const pos = SHOTS.filter((s) => s.woman && s.id !== 'SH01').map((s) => `${s.id}:${s.woman!.position}`);
  if (pos.join(',') !== 'SH34:P1,SH40:P2,SH47:P3,SH51:P3') add('error', 'Veiled Woman', `Position order is ${pos.join(', ')}`);
  const p3 = SHOTS.filter((s) => s.woman?.position === 'P3' && s.id !== 'SH01').map((s) => s.woman!.file);
  if (new Set(p3).size !== 1) add('error', 'Veiled Woman', 'SH47 and SH51 must share the same untouched P3 layer');

  // 16. Build graph has no cycles
  const deps = new Map<string, string[]>();
  for (const a of ASSETS) deps.set(a.file, (a.uploads ?? []).map((u) => u.file));
  for (const p of produced) deps.set(p.file, p.uploads.map((u) => u.file));
  const state = new Map<string, number>();
  const visit = (n: string, path: string[]): void => {
    if (state.get(n) === 2) return;
    if (state.get(n) === 1) {
      add('error', 'Build order', `Cycle: ${[...path, n].join(' → ')}`);
      return;
    }
    state.set(n, 1);
    for (const d of deps.get(n) ?? []) visit(d, [...path, n]);
    state.set(n, 2);
  };
  for (const n of deps.keys()) visit(n, []);

  // 16b. Coverage: vary size and setup between consecutive shots (continuity rules §12)
  const setupKey = (x: string) => x.split(' ')[0];
  SHOTS.forEach((s, i) => {
    if (!s.size || !s.setup) add('error', 'Coverage', 'Every shot needs a size and a camera setup', s.id);
    const prev = SHOTS[i - 1];
    if (!prev || s.matchCut) return;
    if (setupKey(prev.setup) === setupKey(s.setup) && prev.size === s.size) {
      // Test scope is SH01–SH20; later shots are flagged for rework but do not block the build yet.
      add(i < 20 ? 'error' : 'warn', 'Coverage', `Same setup (${setupKey(s.setup)}) and size (${s.size}) as ${prev.id} — the cut will jump. Change the size or the angle.`, s.id);
    }
    const prev2 = SHOTS[i - 2];
    if (prev2 && prev2.size === prev.size && prev.size === s.size) add('warn', 'Coverage', `Third ${s.size} in a row (${prev2.id}, ${prev.id}, ${s.id})`, s.id);
  });

  // 16c. Establish every new location: one of its first two shots must be wide enough to show
  // the geography (continuity rules §7d). The cold open is exempt.
  const seenLoc = new Map<string, Shot[]>();
  for (const s of SHOTS.slice(1)) {
    const loc = setupKey(s.setup).split('-')[0];
    const list = seenLoc.get(loc) ?? [];
    list.push(s);
    seenLoc.set(loc, list);
  }
  for (const [loc, list] of seenLoc) {
    const first = list.slice(0, 2);
    if (!first.some((s) => ['EWS', 'WS', 'MWS'].includes(s.size))) {
      const inScope = SHOTS.indexOf(first[0]) < 20;
      add(inScope ? 'error' : 'warn', 'Coverage', `Location ${loc} is never established: its first shots (${first.map((s) => `${s.id} ${s.size}`).join(', ')}) are all close. Make one of them WS/MWS.`, first[0].id);
    }
  }

  // 16d. Continuity ledger: every door and key prop starts where the last shot that showed it left it,
  // unless the shot says what happened off screen (continuity rules §8).
  const ledger = new Map<Thing, { shot: string; end: string }>();
  for (const s of SHOTS) {
    for (const st of s.states ?? []) {
      const prev = ledger.get(st.thing);
      if (prev && prev.end !== st.start && !st.between)
        add('error', 'Continuity', `${THINGS[st.thing]} starts ${st.start}, but ${prev.shot} left it ${prev.end}. Fix the state or say what happened in between.`, s.id);
      if (prev && prev.end === st.start && st.between) add('warn', 'Continuity', `${THINGS[st.thing]}: "between" given but nothing changed since ${prev.shot}`, s.id);
      ledger.set(st.thing, { shot: s.id, end: st.end ?? st.start });
    }
  }

  // 16e. Test scope (SH01–SH20): flag uploads that are keyframes of later shots, so they get built first.
  SHOTS.slice(0, 20).forEach((s) => {
    const later = s.kf.uploads.map((u) => u.file).filter((f) => {
      const m = /^KF_(SH\d+)/.exec(f);
      return m && SHOTS.findIndex((x) => x.id === m[1]) >= 20;
    });
    if (later.length) add('warn', 'Build order', `Needs later-shot images first: ${later.join(', ')} (see Build order).`, s.id);
  });

  // 17. Runtime vs script
  const total = SHOTS.reduce((a, s) => a + s.edit, 0);
  add('info', 'Runtime', `Full script cut: ${total.toFixed(1)}s (${fmtTime(total)}). Script expects ~2:38–2:45.`);
  for (const sec of SCRIPT) {
    const [a, b] = sec.time.split('–').map(parseTime);
    const got = SHOTS.filter((s) => s.section === sec.id).reduce((x, s) => x + s.edit, 0);
    if (Math.abs(got - (b - a)) > 4) add('warn', 'Runtime', `Section ${sec.id} (${sec.time}) runs ${got.toFixed(1)}s vs ${b - a}s in the script`);
  }

  return f;
}

export function parseTime(s: string): number {
  const [m, sec] = s.split(':').map(Number);
  return m * 60 + sec;
}

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
}

export function shotFindings(findings: Finding[], s: Shot) {
  return findings.filter((x) => x.shot === s.id);
}
