// Prompt assembly. Every keyframe and video prompt is built from the locked
// data (characters, maps, looks), so the same person or room is always
// described with the same words.

import { ASSETS, HYGIENE, LOOKS, type Asset, type Upload } from '../data/assets';
import { CHARACTERS, CAST, type CharId } from '../data/characters';
import { SHOTS, visibleOf, SIZE_TEXT, type Person, type Shot, type View } from '../data/shots';

/** How reused shot stills are described when uploaded (never by file name). */
export const KF_REFS: Record<string, string> = {
  'KF_SH14.png': 'the daytime still looking from the corridor through the nursery doorway, with the crew at work',
  'KF_SH24.png': 'the daytime still of the landing with the monitor on the small table',
  'KF_SH27.png': 'the night still of the two crew members at the monitor table, seen across the monitor',
  'KF_SH30.png': 'the night still from behind the two crew members at the nursery threshold',
  'KF_SH32.png': 'the night still inside the nursery beside the closed door, the copper-haired woman at the handle',
  'KF_SH34.png': 'the night still from the high corner of the nursery with the copper-haired woman at the door',
  'KF_SH34_W.png': 'the night still from the high corner with the veiled figure standing in the far corner',
  'KF_SH35.png': 'the night still of the corridor looking back toward the lit landing, two crew members at the closed nursery door',
  'KF_SH36.png': 'the night still of the copper-haired woman close to the closed door, in profile',
  'KF_SH37.png': 'the night still of the woman with locs with her palm on the closed nursery door',
  'KF_SH40.png': 'the night still from the high corner with the copper-haired woman at the door and a faint mark on her throat',
  'KF_SH40_W.png': 'the night still from the high corner with the veiled figure standing on the rug halfway across the room',
  'KF_SH47.png': 'the night still from the high corner with the copper-haired woman at the door, hand at her throat',
  'KF_SH47_W.png': 'the night still from the high corner with the veiled figure standing one body length behind the woman at the door',
  'KF_SH48.png': 'the night still of the corridor with three crew members at the closed nursery door',
  'KF_SH51.png': 'the night still from the high corner of the copper-haired woman at the door in the final pose, hand hooked at her throat',
};

export interface Produced {
  file: string;
  kind: 'keyframe' | 'woman' | 'clean';
  shot: string;
  prompt: string;
  uploads: Upload[];
}

/** Every image a shot produces (keyframe, Woman layer, clean frame). */
export function producedFiles(): Produced[] {
  const out: Produced[] = [];
  for (const s of SHOTS) {
    if (s.kf.mode === 'generate' || s.kf.mode === 'edit') {
      out.push({ file: s.kf.saveAs, kind: 'keyframe', shot: s.id, prompt: keyframePrompt(s), uploads: s.kf.uploads });
    }
    if (s.woman?.prompt && s.woman.uploads) {
      out.push({ file: s.woman.file, kind: 'woman', shot: s.id, prompt: womanPrompt(s), uploads: s.woman.uploads });
    }
    if (s.woman?.cleanPrompt && s.woman.cleanSaveAs) {
      out.push({ file: s.woman.cleanSaveAs, kind: 'clean', shot: s.id, prompt: s.woman.cleanPrompt, uploads: [{ file: s.kf.saveAs, job: 'the frame to clean' }] });
    }
  }
  return out;
}

export const ASSET_BY_FILE: Record<string, Asset> = Object.fromEntries(ASSETS.map((a) => [a.file, a]));

export function refFor(file: string): string | undefined {
  return ASSET_BY_FILE[file]?.ref ?? KF_REFS[file];
}

function refLine(u: Upload): string {
  return `• ${refFor(u.file) ?? `[${u.file}]`} — ${u.job}`;
}

export function heightsLine(ids: CharId[]): string | null {
  const cast = CAST.filter((c) => ids.includes(c));
  if (cast.length < 2) return null;
  const sorted = [...cast].sort((a, b) => CHARACTERS[b].heightCm - CHARACTERS[a].heightCm);
  return `Relative heights, keep them: ${sorted.map((c) => `${CHARACTERS[c].short} (${CHARACTERS[c].heightCm} cm)`).join(' > ')}.`;
}

const VIEW_TEXT: Record<View, string> = {
  front: 'facing the camera — face visible, but the eyes are NOT on the lens',
  front34: 'three-quarter front view — face visible, eyes NOT on the lens',
  profileL: 'in profile, facing frame-LEFT',
  profileR: 'in profile, facing frame-RIGHT',
  back34: 'three-quarter view from BEHIND — back of the head and shoulder, only the edge of the cheek visible',
  back: 'seen from directly BEHIND — back of the head and back of the clothes only; the FACE IS NOT VISIBLE',
  small: 'small in the background',
  hands: 'only the hand and forearm are in frame',
};

const VIEW_SHORT: Record<View, string> = {
  front: 'facing the camera',
  front34: 'three-quarter front',
  profileL: 'in profile facing frame-left',
  profileR: 'in profile facing frame-right',
  back34: 'three-quarter from behind',
  back: 'seen from behind, face not visible',
  small: 'small in the background',
  hands: 'hand only',
};

const FACE_VISIBLE: View[] = ['front', 'front34', 'profileL', 'profileR'];

function personLine(p: Person): string {
  const ch = CHARACTERS[p.id];
  const body = FACE_VISIBLE.includes(p.view) ? ch.look : p.view === 'hands' ? 'large tattooed hand and forearm' : `${ch.fromBehind} (face not shown)`;
  const hands = p.hands ? `\n  Hands: ${p.hands}.` : '';
  return `• ${ch.short} — ${VIEW_TEXT[p.view]}.\n  Where: ${p.where}.\n  Doing: ${p.doing}.${hands}\n  Looks: ${body}.\n  Wearing: ${ch.wardrobe}.`;
}

function peopleBlock(people: Person[]): string {
  if (!people.length) return '';
  return [
    'STAGING — place and turn every person exactly as listed. The character sheets show each person standing and facing the camera: use them ONLY for identity (face, hair, build, clothes). Do NOT copy their pose or their direction.',
    ...people.map(personLine),
    'Nobody looks into the lens.',
  ].join('\n');
}

export function lookFor(s: Shot): string {
  if (s.cam === 'fixed-nursery' || s.cam === 'fixed-bellboard') return `${LOOKS.fixed} ${LOOKS.night}`;
  if (s.cam === 'handheld') return `${LOOKS.handheld} ${s.time === 'day' ? LOOKS.dayInterior : LOOKS.night}`;
  if (s.time === 'night') return LOOKS.night;
  return s.location.startsWith('LOC_EXT') ? LOOKS.day : LOOKS.dayInterior;
}

export function keyframePrompt(s: Shot): string {
  const k = s.kf;
  if (k.mode === 'plate') return `No keyframe to generate. Start frame: ${k.uploads[0].file}.`;
  if (k.mode === 'startEnd') return `No keyframe to generate. Start frame: ${k.saveAs}. End frame: ${k.endFrame}.`;

  const parts: string[] = [];
  if (k.mode === 'edit') parts.push(k.frame);
  parts.push(`REFERENCES (uploaded images; their order is not guaranteed):\n${k.uploads.map(refLine).join('\n')}`);
  parts.push(`BLOCKING (fixed — do not change): ${s.blocking}`);
  if (k.mode === 'generate') parts.push(`THE MOMENT: ${k.frame}`);
  const people = peopleBlock(s.people);
  if (people) parts.push(people);
  const h = heightsLine(visibleOf(s));
  if (h) parts.push(h);
  parts.push(`CAMERA: ${SIZE_TEXT[s.size]}, ${s.lens}.`);
  parts.push(`LOOK: ${lookFor(s)}`);
  if (k.keep?.length) parts.push(`KEEP UNCHANGED: ${k.keep.join('; ')}.`);
  parts.push(HYGIENE);
  return parts.join('\n\n');
}

export function womanPrompt(s: Shot): string {
  const w = s.woman;
  if (!w?.prompt || !w.uploads) return '';
  const v = CHARACTERS.veiled;
  return [
    w.prompt,
    `REFERENCES (uploaded images; their order is not guaranteed):\n${w.uploads.map(refLine).join('\n')}`,
    `THE FIGURE: ${v.look}. Wearing: ${v.wardrobe}. Calm, still, human. No glow, no transparency, no smoke, no claws, no horror makeup, no visible face.`,
    `LOOK: ${LOOKS.fixed}`,
    'KEEP UNCHANGED: the camera, the room, the lamp light and the woman at the door — pixel for pixel. Only the figure is added.',
    HYGIENE,
  ].join('\n\n');
}

export const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));

export function videoPrompt(s: Shot): string {
  const v = s.video;
  const lines: string[] = [];
  lines.push(`${v.camera} ${v.setting}`);
  if (s.people.length) {
    lines.push(`Start frame: ${s.people.map((p) => `${CHARACTERS[p.id].short} — ${VIEW_SHORT[p.view]}, ${p.where}; ${p.doing}${p.hands ? `; ${p.hands}` : ''}`).join('. ')}.`);
    lines.push('Every action continues FORWARD from the start frame; nothing that is already done in the start frame is undone or repeated.');
  }
  for (const b of v.beats) lines.push(`${fmt(b.t[0])}–${fmt(b.t[1])}s: ${b.text}`);
  if (v.vo) lines.push('Nobody on screen speaks; no one moves their mouth to talk.');
  const stays = [...v.stays];
  if (s.people.some((p) => p.view !== 'hands')) stays.push('Nobody looks into the lens.');
  lines.push(stays.join(' '));
  return lines.join('\n');
}

export function klingSettings(s: Shot): string {
  const start = s.woman?.cleanSaveAs ?? (s.kf.mode === 'plate' ? s.kf.uploads[0].file : s.kf.saveAs);
  const bits = [`Kling 3.0 image-to-video`, '9:16', `${s.order}s`, s.sound === 'native' ? 'native audio ON (voice-swap after)' : 'sound OFF', `start frame ${start}`];
  if (s.kf.endFrame) bits.push(`end frame ${s.kf.endFrame}`);
  return bits.join(' · ');
}

export function startFrame(s: Shot): string {
  return s.woman?.cleanSaveAs ?? (s.kf.mode === 'plate' ? s.kf.uploads[0].file : s.kf.saveAs);
}

/** What must be true before a keyframe is approved and sent to Kling. */
export function approvalChecklist(s: Shot): string[] {
  const out: string[] = [];
  for (const p of s.people) {
    const ch = CHARACTERS[p.id];
    const who = ch.short;
    if (p.view === 'back') out.push(`${who}: seen from BEHIND — face NOT visible`);
    else if (p.view === 'back34') out.push(`${who}: three-quarter from behind — face turned away`);
    else if (p.view === 'profileL' || p.view === 'profileR') out.push(`${who}: in profile facing frame-${p.view === 'profileL' ? 'left' : 'right'}`);
    else if (p.view === 'front' || p.view === 'front34') out.push(`${who}: face visible, eyes NOT on the lens`);
    else if (p.view === 'small') out.push(`${who}: small in the background`);
    out.push(`${who}: ${p.where}`);
    out.push(`${who}: ${p.doing}`);
    if (p.hands) out.push(`${who} hands: ${p.hands}`);
    if (p.view !== 'hands' && p.view !== 'small') out.push(`${who} wears: ${ch.mustSee}`);
  }
  out.push(...(s.check ?? []));
  if (s.people.length) out.push('Nobody looks into the lens; nobody poses');
  out.push('No text, captions, logos or overlays; vertical 9:16');
  return out;
}
