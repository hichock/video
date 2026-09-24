// The shotlist. One shot per generation, keyframe first, in script order.
// People are referred to by what is visible (CHARACTERS[x].short); scripted
// lines are inserted with q(beatId) so they can never drift from the script.

import { BEAT_BY_ID } from './script';
import { CHARACTERS, type CharId } from './characters';
import { MAPS, type Upload } from './assets';

/** Shot size, from the widest to the tightest. */
export type Size = 'EWS' | 'WS' | 'MWS' | 'MS' | 'MCU' | 'CU' | 'ECU' | 'INSERT';

/** Plain-language framing for each shot size (used in the keyframe CAMERA line). */
export const SIZE_TEXT: Record<Size, string> = {
  EWS: 'extreme wide shot — people small in the location',
  WS: 'wide shot — full figures with room around them',
  MWS: 'medium-wide shot — figures from the knees up',
  MS: 'medium shot — from the waist up',
  MCU: 'medium close-up — chest and head',
  CU: 'close-up — the face fills the frame',
  ECU: 'extreme close-up — one detail fills the frame',
  INSERT: 'insert — the object or hands fill the frame',
};

export type CamKind = 'cinematic' | 'handheld' | 'tripod' | 'fixed-nursery' | 'fixed-bellboard';

/** How a person is seen in the frame. Controls what the prompt may describe. */
export type View = 'front' | 'front34' | 'profileL' | 'profileR' | 'back34' | 'back' | 'small' | 'hands';

export interface Person {
  id: CharId;
  view: View;
  /** Position against landmarks in the frame. */
  where: string;
  /** Action and eyeline at the start frame, including how far along the action is. */
  doing: string;
  /** What each hand holds and how it stays visible from this angle. */
  hands?: string;
}

export interface VBeat {
  t: [number, number];
  text: string;
}

export interface Keyframe {
  /** generate: new image from references. edit: edit of the first upload. plate: an existing plate is the start frame. startEnd: two plates as start and end frames. */
  mode: 'generate' | 'edit' | 'plate' | 'startEnd';
  uploads: Upload[];
  frame: string;
  keep?: string[];
  saveAs: string;
  endFrame?: string;
}

export interface WomanLayer {
  /** Still image the figure is masked out of. */
  file: string;
  position: 'P1' | 'P2' | 'P3';
  /** Present when this shot generates the layer. */
  prompt?: string;
  uploads?: Upload[];
  /** Tight-crop shot: separate clean frame with the figure removed. */
  cleanPrompt?: string;
  cleanSaveAs?: string;
}

export interface Shot {
  id: string;
  section: string;
  covers: string[];
  title: string;
  cam: CamKind;
  operator?: CharId;
  location: string;
  time: 'day' | 'night';
  lens: string;
  /** Shot size. Consecutive shots must not repeat the same setup at the same size. */
  size: Size;
  /** Camera setup ID (one per camera position in the scene map). */
  setup: string;
  /** Deliberate same-setup, same-size cut (e.g. a day-to-night match cut). */
  matchCut?: boolean;
  blocking: string;
  people: Person[];
  /** Extra things to verify before approving the keyframe. */
  check?: string[];
  /** Top-down shot map image (public/maps). */
  map?: string;
  kf: Keyframe;
  woman?: WomanLayer;
  video: {
    camera: string;
    setting: string;
    beats: VBeat[];
    /** Host VO laid over this clip in the edit. */
    vo?: string;
    stays: string[];
  };
  order: number;
  edit: number;
  sound: 'off' | 'native';
  audio: string;
  lowerThird?: string;
  post?: string;
  note?: string;
  trim?: string;
}

// ---- helpers --------------------------------------------------------------

const D = (id: CharId) => CHARACTERS[id].short;
const Cap = (id: CharId) => {
  const s = CHARACTERS[id].short;
  return s[0].toUpperCase() + s.slice(1);
};
const V = (id: CharId) => CHARACTERS[id].voiceInPrompt ?? '';
export const q = (beatId: string) => {
  const b = BEAT_BY_ID[beatId];
  if (!b?.line) throw new Error(`Beat ${beatId} has no line`);
  return `“${b.line}”`;
};
const sheet = (id: CharId, job = 'identity: face, hair, build and full wardrobe'): Upload => ({ file: CHARACTERS[id].sheetFile, job });
const bg = (id: CharId) => sheet(id, 'identity of a smaller background figure');
const up = (file: string, job: string): Upload => ({ file, job });
const mapUp = (id: string): Upload =>
  up(`MAP_${id}.png`, 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image');
const LINEUP_BG = up('CH_LINEUP.png', 'identities of the small background figures and everyone’s relative heights');

const STAY_PEOPLE = 'Faces, hair, body size and full wardrobe stay exactly as in the start frame.';
const STAY_LOCKED = 'The camera stays perfectly locked like a security camera: no zoom, no drift, no shake.';
const STAY_NO_FIGURE = 'The room stays empty apart from her: no figure, shadow or shape appears anywhere.';
const STAY_NO_TURN = 'She never turns around and never looks behind her.';
const STAY_FACES_ONLY_MOVE = 'Only she moves. Every object in the room stays exactly where it is.';

const vo = (beatId: string) =>
  `The host’s warm, confident American male voice, ${BEAT_BY_ID[beatId].delivery}, says: ${q(beatId)}`;

const NURSERY_NIGHT_REF = up('LOC_NURSERY_FIXED_NIGHT.png', 'the exact camera, room, furniture and lamp light — change nothing');
const WOMAN_REF = up('CH_VEILED_sheet.png', 'the figure: dress, veil, proportions');

// ---------------------------------------------------------------------------

export const SHOTS: Shot[] = [
  // ======================= A — COLD OPEN ===================================
  {
    id: 'SH01',
    section: 'A',
    covers: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
    title: 'Cold open: tight crop of NURSERY FIXED. Clara’s throat, two fingers on a faint mark, broken breath; a dark slice of the Woman at the edge.',
    cam: 'fixed-nursery',
    location: 'LOC_NURSERY_FIXED_NIGHT.png',
    time: 'night',
    lens: 'Tight crop of the NURSERY FIXED wide',
    size: 'ECU',
    setup: 'NUR-FIXED-CROP',
    blocking:
      'A tight crop out of the NURSERY FIXED frame, same high corner camera looking down, same warm lamp spill from frame-right. Only the copper-haired woman’s lower face, throat, right hand and part of her right shoulder, seen from above and behind her right shoulder. She faces the door (out of frame to the left). The top-right corner of the crop clips a dark slice of the veiled figure’s dress and veil. No door, no furniture, no room geography.',
    people: [
      { id: 'clara', view: 'back34', where: 'fills the frame from above and behind her right shoulder; the door is just out of frame to the left', doing: 'right hand hooked at her own throat, two fingers pressed into the faint mark; eyes locked forward on the door' },
    ],
    check: ['No door or furniture visible', 'The dark slice at the top-right has no face and no depth cue'],
    kf: {
      mode: 'edit',
      uploads: [
        up('KF_SH51.png', 'the exact final-cliff frame to crop from: camera angle, light, pose, blouse'),
        up('KF_SH47_W.png', 'the veiled figure standing one body length behind her — only a slice of her will show'),
        up('MARK_STAGES.png', 'use the LEFT panel (faint thin red line) for the throat'),
        sheet('clara', 'face, freckles and skin detail at close range'),
      ],
      frame:
        'Re-render a tight vertical crop of the uploaded high-corner night frame of the copper-haired woman at the door, at full detail, as if the same security camera had zoomed in: same angle from above and behind her right shoulder, same warm lamp spill from the right, same pose. In frame ONLY: the right side of her lower face and jaw, her throat, her right hand and part of her right shoulder in the ice-blue blouse. Her right hand is hooked at her own throat with two fingers pressed into a faint thin red pressure line that is just forming across it (the left panel of the throat reference), as if pulling at an invisible grip from behind; her chin is dragged up and back, neck straining, lips parted on a stopped breath. At the top-right edge of the frame, cut off by the edge, a dark slice of the veiled figure’s black dress and smoke-grey veil, flat and ambiguous against the shadow — no face, no way to judge how close she stands. No door, no furniture.',
      keep: ['the camera angle and lamp direction of the uploaded final frame', 'her blouse, freckles and hair colour'],
      saveAs: 'KF_SH01.png',
    },
    woman: {
      file: 'KF_SH01.png',
      position: 'P3',
      cleanPrompt:
        'Edit the uploaded tight crop: remove the dark slice of black dress and grey veil at the top-right edge and replace it with the plain dark wall shadow that would be there. Change nothing else.',
      cleanSaveAs: 'KF_SH01_CLEAN.png',
    },
    video: {
      camera: 'Fixed high-corner security camera, tight crop, completely static.',
      setting: 'Night. A dark room lit only by weak warm lamp spill from the right.',
      beats: [
        { t: [0, 1.5], text: `The copper-haired woman’s two fingers press into the faint red line on her throat, pulling at something that is not there; her jaw tightens, chin dragged up and back.` },
        { t: [1.5, 3.5], text: 'She tries to inhale: her shoulder lifts, the breath catches and stops halfway with a small choked sound; her lips stay parted, her throat works against it.' },
        { t: [3.5, 5], text: 'She holds there, straining, fingers still pressed to the mark, eyes fixed forward. She does not turn her head.' },
      ],
      stays: [STAY_LOCKED, 'The dark edge at the top right stays black and completely still.', STAY_PEOPLE],
    },
    order: 5,
    edit: 4,
    sound: 'off',
    audio: 'Clara’s interrupted inhale only (recorded/ElevenLabs SFX, cut exactly where the breath stops). No ghost sound. HARD CUT on the broken breath to bright exterior ambience.',
    post: 'Animate from KF_SH01_CLEAN.png; composite the slice from KF_SH01.png as a masked still over the whole clip. NURSERY FIXED overlay + grain.',
    note: 'Script: faint mark forming, two fingers at the mark. Rules: cold open = the final-cliff pose. Built as the final pose, cropped, with the script’s faint mark. See Decisions.',
  },

  // ======================= B — ARRIVAL =====================================
  {
    id: 'SH02',
    section: 'B',
    covers: ['B1', 'B2'],
    title: 'Bright wide of the manor. The crew are already unloading at the SUV; Elias heads for the steps.',
    cam: 'cinematic',
    location: 'LOC_EXT_DAY.png',
    time: 'day',
    lens: '24mm',
    size: 'EWS',
    setup: 'EXT-A behind SUV',
    blocking:
      'Master view: the camera stands on the gravel a few metres behind the SUV and slightly to its RIGHT, at eye level, looking at the facade. FRAME LAYOUT: the dark green SUV fills the LEFT half of the frame, its REAR toward the camera, nose toward the house, tailgate lifted open. The RIGHT half of the frame is open gravel leading to the front steps and the front door (right of centre, background). The two unloading stand at the two corners of the open tailgate. The tall man is in the RIGHT third of the frame, in the midground, on the open gravel already past the SUV’s rear bumper, about halfway to the front steps, walking away from the camera toward the front door — nothing stands between him and the steps. Low sun from frame-left, long shadows falling right. The people are small in frame; the manor dominates the upper two thirds.',
    people: [
      { id: 'owen', view: 'profileR', where: 'left third of the frame, at the LEFT corner of the open tailgate, full body', doing: 'the heavy black case is ALREADY OUT of the boot: he holds it at thigh height just clear of the bumper, body turning away from the car toward frame-left', hands: 'both hands on the case handle; the case is clearly outside the car' },
      { id: 'mara', view: 'profileL', where: 'left half of the frame, at the RIGHT corner of the open tailgate, full body', doing: 'reaching into the boot; a compact black case is STILL INSIDE the boot and her hands are on its handle, eyes on the case', hands: 'both hands inside the boot on the compact case' },
      { id: 'elias', view: 'back', where: 'RIGHT third of the frame, midground, on open gravel past the SUV’s rear, about halfway to the front steps', doing: 'mid-stride AWAY from the camera toward the front door, head up toward the facade', hands: 'his RIGHT hand holds the black handheld camera by its top handle at chest height, held out to his right side so the camera body and its handle clearly show beyond his right arm from behind; left arm swinging free' },
    ],
    check: ['The SUV’s REAR faces the camera and the tailgate is open toward us (not parked side-on)', 'The tall man’s FACE IS NOT VISIBLE: only the back of his head and jacket', 'The SUV fills the LEFT half; the tall man is in the RIGHT third on open gravel past the car, nothing between him and the steps', 'The bearded man’s case is already OUT of the car; the small woman’s case is still INSIDE the boot', 'The tall man’s camera is clearly visible in his right hand from behind'],
    map: '/maps/SH02_map.png',
    kf: {
      mode: 'generate',
      uploads: [
        up('LOC_EXT_DAY.png', 'location, exact framing, SUV position and light — keep exactly'),
        sheet('owen'),
        sheet('mara'),
        sheet('elias'),
        up('MAP_SH02.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image'),
      ],
      frame: 'A documentary moment caught mid-action, nobody posing: the crew already at work and already moving toward the house. The manor is bright, elegant and inviting.',
      keep: ['the manor, the SUV (rear toward camera, tailgate open) and the light exactly as in the uploaded photo'],
      saveAs: 'KF_SH02.png',
    },
    video: {
      camera: 'Slow smooth crane-down push-in toward the manor.',
      setting: 'Bright late afternoon, gravel drive in front of a pale stone manor.',
      beats: [
        { t: [0, 3], text: `${Cap('owen')} turns away from the car and lowers the heavy case he is already holding onto the gravel beside the rear wheel; it stays on the ground. ${Cap('mara')} lifts the compact case up and out of the boot and holds it at her side. On the right, ${D('elias')} keeps walking away from the camera toward the front steps, the camera still in his right hand, and is still a few metres short of the steps when the shot ends. He never turns round. No one speaks.` },
      ],
      stays: ['The manor, the SUV and the light stay exactly as in the start frame.', 'The tall man’s face is never seen in this shot. The camera stays in his right hand. Nothing is put back into the car.', STAY_PEOPLE],
    },
    order: 3,
    edit: 2,
    sound: 'off',
    audio: 'Gravel, case handles, a car door. Light investigative music bed starts here and runs under the whole intro.',
    trim: 'Could shrink to 1s; the wide is required by B1.',
  },
  {
    id: 'SH03',
    section: 'B',
    covers: ['B3', 'B4', 'B5'],
    title: 'Elias walks toward the house with the handheld at chest height; SUV and crew behind him. VO 1.',
    cam: 'cinematic',
    location: 'LOC_EXT_REV_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MS',
    setup: 'EXT-B reverse, tracking',
    blocking:
      'Reverse view: the camera is on the gravel between the SUV and the house with its BACK TO THE HOUSE (the house is behind the camera, out of frame), moving backward ahead of him. He walks toward the camera — toward the house — in three-quarter front view, handheld camera at chest height, eyes lifted past the lens to the upstairs windows. Behind him, a few metres back and soft, on the RIGHT half of the frame: the dark green SUV seen from its front, and at its far end the huge bearded man and the small woman in rust unloading at the open tailgate. Low sun from frame-RIGHT, rim-lighting his right side.',
    people: [
      { id: 'elias', view: 'front', where: 'in the centre of the frame on the gravel, framed from the waist up, walking toward the camera (and toward the house behind the camera)', doing: 'mid-stride, handheld camera at chest height, eyes lifted ABOVE the lens to the upstairs windows', hands: 'right hand holds the black handheld camera at chest height in front of him, lens forward, clearly visible' },
      { id: 'owen', view: 'small', where: 'behind him in the soft background, at the far end of the SUV, half hidden by it', doing: 'unloading a case at the open tailgate', hands: 'both hands on a black case at the tailgate' },
      { id: 'mara', view: 'small', where: 'behind him in the soft background beside the bearded man at the far end of the SUV', doing: 'lifting a small case out of the boot', hands: 'both hands on a small black case' },
    ],
    check: ['The manor is NOT in frame; we look away from it', 'The SUV is seen from its FRONT, on the RIGHT half of the frame', 'Sun on frame-right'],
    map: '/maps/SH03_map.png',
    kf: {
      mode: 'generate',
      uploads: [
        up('LOC_EXT_REV_DAY.png', 'location and light: the view away from the house, SUV front-on'),
        sheet('elias'),
        up('MAP_SH03.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image'),
        bg('owen'),
        bg('mara'),
      ],
      frame: 'He looks curious and at ease, a small half-smile, weight forward, mid-stride. The house is NOT in the frame: it is behind the camera, where he is looking.',
      saveAs: 'KF_SH03.png',
    },
    video: {
      camera: 'Gimbal moving slowly backward ahead of him at walking pace; the house is behind the camera.',
      setting: 'Bright late afternoon on the gravel drive, looking away from the house toward the SUV.',
      beats: [
        { t: [0, 5], text: `${Cap('elias')} walks steadily toward the camera across the gravel, handheld camera at chest height, glancing up past the lens at the upstairs windows with a small curious half-smile. Behind him the two at the SUV keep unloading cases.` },
      ],
      vo: vo('B5'),
      stays: [STAY_PEOPLE, 'The SUV stays parked where it is.'],
    },
    order: 5,
    edit: 4.5,
    sound: 'off',
    audio: `Laid in the edit — host VO (Elias voice, clear, confident, conversational): ${q('B5')} ` + 'VO 1 (ElevenLabs, Elias voice) starts on the cut. Gravel footsteps. Music bed under.',
    lowerThird: 'ELIAS VALE — FIELD LEAD / HOST',
  },
  {
    id: 'SH04',
    section: 'B',
    covers: ['B6', 'B7', 'B8'],
    title: 'Mara lifts the compact fixed-camera case from the SUV and checks the latch while walking toward the entrance. VO 2.',
    cam: 'cinematic',
    location: 'LOC_EXT_DAY.png',
    time: 'day',
    lens: '50mm',
    size: 'MCU',
    setup: 'EXT-C side-on at the boot',
    blocking:
      'Camera on the gravel beside the rear of the SUV, chest height, looking ACROSS the car side-on: the SUV’s open rear is on frame-LEFT, its nose points frame-RIGHT toward the manor, whose front steps are soft in the background on the RIGHT of frame. The small woman in rust stands at the open boot at the left end of the car, facing into it (toward frame-right), in profile. The huge bearded man is partly cut off at the left edge, also at the boot. The low sun is ahead of the camera, backlighting her hair.',
    people: [
      { id: 'mara', view: 'profileR', where: 'at the open boot at the LEFT end of the car (the SUV’s rear), facing into it toward frame-right', doing: 'the compact black hard case is STILL INSIDE the boot; she has just gripped it, thumb on its latch, eyes on the latch', hands: 'both hands on the case, which is still inside the boot' },
      { id: 'owen', view: 'profileR', where: 'at the left edge of frame, partly cut off by the edge, beside her at the boot', doing: 'dragging a larger black case out, eyes on the case', hands: 'both hands on the handle of a larger black case still half inside the boot' },
    ],
    check: ['The manor is soft in the background on frame-RIGHT', 'Backlight: the sun is ahead of the camera'],
    map: '/maps/SH04_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_EXT_DAY.png', 'the SUV, gravel, manor and light'), sheet('mara'), bg('owen'), up('MAP_SH04.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image')],
      frame: 'Focused, practical, a faint unimpressed half-frown. Nobody looks at the camera.',
      saveAs: 'KF_SH04.png',
    },
    video: {
      camera: 'Smooth gimbal, drifting right with her as she turns toward the house.',
      setting: 'Late afternoon at the open tailgate of the SUV, the manor behind.',
      beats: [
        { t: [0, 2], text: `${Cap('mara')} lifts the compact black case up and out of the boot and holds it against her hip.` },
        { t: [2, 5], text: 'She steps back from the boot and walks along the side of the SUV toward frame-right, toward the house and its steps, thumbing the latch open and shut once to check it, eyes on the latch, her profile to the camera.' },
      ],
      vo: vo('B8'),
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 5,
    sound: 'off',
    audio: `Laid in the edit — host VO (Elias voice): ${q('B8')} ` + 'VO 2 (ElevenLabs). Case latch click, gravel.',
    lowerThird: 'MARA CHEN — CAMERA & SYSTEMS',
  },
  {
    id: 'SH05',
    section: 'B',
    covers: ['B9', 'B10'],
    title: 'Naomi already walking beside Clara toward the front door; Clara gestures to an upstairs window, Naomi listens.',
    cam: 'cinematic',
    location: 'LOC_EXT_REV_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MWS',
    setup: 'EXT-B reverse, tracking',
    blocking:
      'Medium-wide two-shot, knees up. Reverse view, back to the house: camera moving backward ahead of two women walking toward it — toward the house, which is behind the camera. On the left, the very tall woman with locs in the camel coat; on the right, half a step ahead, the copper-haired woman in the ice-blue blouse, her right arm raised pointing up past the camera at an upstairs window. The SUV soft, a few metres behind them on the RIGHT of frame. Low sun from frame-right.',
    people: [
      { id: 'naomi', view: 'front', where: 'on the LEFT, walking toward the camera, clearly taller', doing: 'listening, eyes following her companion’s raised arm up past the camera' },
      { id: 'clara', view: 'front', where: 'on the RIGHT, half a step ahead, walking toward the camera', doing: 'right arm raised, pointing up past the camera at an upstairs window, lips parted mid-sentence, eyes on the window above the lens' },
    ],
    check: ['The manor is NOT in frame; they walk toward the camera', 'She points ABOVE the camera'],
    map: '/maps/SH05_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_EXT_REV_DAY.png', 'location and light'), sheet('naomi'), sheet('clara'), up('CH_LINEUP.png', 'relative heights'), up('MAP_SH05.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image')],
      frame: 'The woman with locs is clearly taller and listens with warm attention; the copper-haired woman is composed and guarded, explaining.',
      saveAs: 'KF_SH05.png',
    },
    video: {
      camera: 'Gimbal moving backward ahead of them; the house is behind the camera.',
      setting: 'Late afternoon on the gravel drive, looking away from the house.',
      beats: [
        { t: [0, 3], text: `${Cap('clara')} points up past the camera at an upstairs window as she walks, talking quietly — no voice is heard; ${D('naomi')} follows the gesture with her eyes, listening, and keeps walking beside her.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 3,
    edit: 2,
    sound: 'off',
    audio: 'Music bed and footsteps; VO 2 may tail over the head of this shot.',
    lowerThird: 'NAOMI BROOKS — EVIDENCE & INTERVIEWS',
  },
  {
    id: 'SH06',
    section: 'B',
    covers: ['B11', 'B12', 'B13'],
    title: 'Owen carries the heavier case into the hall and checks the old service door with his free hand without slowing. VO 3.',
    cam: 'cinematic',
    location: 'LOC_HALL_DAY.png',
    time: 'day',
    lens: '50mm, low angle',
    size: 'MS',
    setup: 'HALL-B by the service door, looking back',
    blocking:
      'A NEW ANGLE on the same hall: the camera stands low against the right-hand wall of the hall, just past the service door, looking BACK toward the bright open front door (the stair is behind the camera). The plain panelled service door is right beside the camera at the LEFT edge of frame. The tall window is on the RIGHT of frame, laying a bar of low sun across the floor. The huge bearded man has just come in and walks toward the camera, framed from the waist up, the bright doorway behind him.',
    people: [
      { id: 'owen', view: 'front34', where: 'left of centre, waist-up, one step before the service door at the left edge of frame, the bright open front door behind him', doing: 'walking toward the camera, eyes on the service-door knob; the door is still CLOSED', hands: 'heavy black case in his LEFT hand (frame-right side), clearly visible; RIGHT hand reaching out toward the knob at the left edge of frame, a hand’s width from it' },
    ],
    check: ['Camera looks BACK at the bright front door; the stair is NOT in frame', 'Service door at the LEFT edge, knob within his reach', 'Waist-up medium shot, not a full-body wide'],
    map: '/maps/SH06_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_HALL_DAY.png', 'the same hall: floor, walls, service door, light'), up('LOCSHEET_HALL.png', 'the TOP-RIGHT panel (day, view B) is the hall looking back toward the front door — the direction of this shot'), sheet('owen'), mapUp('SH06')],
      frame: 'Mid-stride, not slowing, deadpan and practical; backlit by the doorway, face readable.',
      saveAs: 'KF_SH06.png',
    },
    video: {
      camera: 'Static low camera, slight pan left with him.',
      setting: 'The entrance hall of a manor being cleared, bright front door behind him.',
      beats: [
        { t: [0, 1.5], text: `${Cap('owen')} takes one more step with the heavy case and his right hand closes on the service-door knob.` },
        { t: [1.5, 3.5], text: 'Without slowing he turns the knob; the door gives a crack; he glances at it and pulls it shut again.' },
        { t: [3.5, 5], text: 'He walks on past the camera, out of frame on the left, toward the stair behind the camera.' },
      ],
      vo: vo('B13'),
      stays: [STAY_PEOPLE, 'The service door stays at the left edge of frame.'],
    },
    order: 5,
    edit: 3.5,
    sound: 'off',
    audio: `Laid in the edit — host VO (Elias voice, runs on over SH07): ${q('B13')} ` + 'VO 3 (≈7s) starts here and runs on over SH07. Door knob, case, footsteps on stone.',
    lowerThird: 'OWEN REYES — SAFETY & LOGISTICS',
    note: 'The service door he checks is the one the crew take to the service hall in SH17.',
  },
  {
    id: 'SH07',
    section: 'B',
    covers: ['B14', 'B15', 'B16', 'B17', 'B18'],
    title: 'Elias frames the central stair with the handheld; Naomi and Clara go up; Mara and Owen carry the gear in behind them.',
    cam: 'cinematic',
    location: 'LOC_HALL_DAY.png',
    time: 'day',
    lens: '24mm, high angle',
    size: 'WS',
    setup: 'HALL-C top of the stair, high angle',
    blocking:
      'A NEW ANGLE: high up at the top of the central stair, looking DOWN the stair into the hall toward the bright open front door at the far end. From here the service door is on the LEFT wall of the hall and the tall window with its bar of sun on the RIGHT. Halfway up the stair, climbing toward the camera: the copper-haired woman on the RIGHT, the very tall woman with locs on the LEFT. At the foot of the stair the huge bearded man starts up behind them with the heavy case. In the middle of the hall the tall man in olive stands looking up the stair, his handheld raised toward it. Far away at the front door, the small woman in rust is just coming in with her compact case.',
    people: [
      { id: 'clara', view: 'front', where: 'halfway up the stair on the RIGHT, climbing toward the camera', doing: 'climbing, eyes on the steps ahead of her, one hand on the banister' },
      { id: 'naomi', view: 'front', where: 'halfway up the stair on the LEFT, beside her, clearly taller', doing: 'climbing, glancing at her companion' },
      { id: 'owen', view: 'small', where: 'at the foot of the stair, starting up behind the two women', doing: 'climbing with the heavy case', hands: 'heavy black case in his right hand' },
      { id: 'elias', view: 'small', where: 'in the middle of the hall below, facing up the stair', doing: 'framing the stair with his handheld, eyes on its flip-out monitor', hands: 'both hands hold the handheld camera up in front of his face, pointed up the stair' },
      { id: 'mara', view: 'small', where: 'far below at the open front door, just coming in', doing: 'walking into the hall', hands: 'compact black case in her right hand' },
    ],
    check: ['High angle from the top of the stair: we look DOWN into the hall', 'The women climb TOWARD the camera, faces visible, eyes not on the lens', 'Service door on the LEFT wall, window and sun on the RIGHT, front door at the far end'],
    map: '/maps/SH07_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOCSHEET_HALL.png', 'the TOP-RIGHT panel (day, view B) is the hall looking back toward the front door — seen here from high on the stair'), sheet('clara'), sheet('naomi'), LINEUP_BG, mapUp('SH07')],
      frame: 'Busy, moving, nobody posing.',
      saveAs: 'KF_SH07.png',
    },
    video: {
      camera: 'High camera at the top of the stair; as the two women reach the top it pans with them as they pass, following them onto the upper floor.',
      setting: 'The entrance hall seen from the top of the central stair.',
      beats: [
        { t: [0, 1.5], text: `Below, ${D('elias')} raises his handheld to frame the stair; ${D('owen')} starts up behind the women; far away ${D('mara')} comes in at the front door.` },
        { t: [1.5, 5], text: `${Cap('clara')} and ${D('naomi')} climb the last steps toward the camera and pass it; the camera turns with them as they walk onto the upper floor toward the corridor.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3.5,
    sound: 'off',
    audio: 'VO 3 finishes over this shot. The music bed falls away as the two women reach the upper floor.',
  },

  // ======================= C — CORRIDOR, DAY ===============================
  {
    id: 'SH08',
    section: 'C',
    covers: ['C1', 'C2', 'C10'],
    title: 'Naomi and Clara walk the bright upper corridor side by side; Clara slows at the open nursery door to look inside.',
    cam: 'cinematic',
    location: 'LOC_CORRIDOR_REV_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'WS',
    setup: 'COR-REV far-window end',
    blocking:
      'Wide, full figures, 24mm. Reverse corridor view from the far-window end looking back toward the landing. The two women walk side by side toward camera, the landing behind them. The copper-haired woman is on frame-RIGHT, nearest the wall with the open white nursery door; the very tall woman with locs on frame-left. They are one step before the open doorway, which is on the right wall right beside the copper-haired woman. Daylight from behind the camera, soft on their faces.',
    people: [
      { id: 'clara', view: 'front', where: 'on frame-RIGHT, nearest the wall with the open nursery door, walking toward the camera', doing: 'eyes ahead down the corridor, composed and guarded' },
      { id: 'naomi', view: 'front', where: 'on frame-LEFT beside her, walking toward the camera, clearly taller', doing: 'eyes on her companion, not on the camera' },
    ],
    check: ['The open nursery door is on the RIGHT wall right beside the copper-haired woman', 'The landing is visible behind them at the far end'],
    map: '/maps/SH08_map.png',
    kf: {
      mode: 'generate',
      uploads: [
        up('LOC_CORRIDOR_REV_DAY.png', 'the corridor, nursery door position and light — keep'),
        sheet('clara'),
        sheet('naomi'),
        up('LOC_NURSERY_DOORWAY_DAY.png', 'what is visible through the nursery doorway'),
        up('MAP_SH08.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image'),
      ],
      frame: 'Walking, not posing, not an interview. The woman with locs is clearly taller, eyes on her companion.',
      saveAs: 'KF_SH08.png',
    },
    video: {
      camera: 'Gimbal moving slowly backward ahead of them; they never stop walking.',
      setting: 'Bright upper corridor of the manor, daytime.',
      beats: [
        { t: [0, 2.5], text: `${Cap('clara')} and ${D('naomi')} walk side by side toward the camera, easy pace, not stopping.` },
        { t: [2.5, 5], text: `As they reach the open doorway, ${D('clara')} slows just enough to look to her left through it into the room, her face going still and guarded.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3,
    sound: 'off',
    audio: 'Daytime house ambience, soft footsteps, distant equipment movement (whole corridor section).',
  },
  {
    id: 'SH09',
    section: 'C',
    covers: ['C3'],
    title: 'Through the doorway: the room in one clean view — child bed, low chest, archival box.',
    cam: 'cinematic',
    location: 'LOC_NURSERY_DOORWAY_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'INSERT',
    setup: 'COR-DOOR through the doorway',
    blocking: 'Plate framing: from the corridor straight through the open white door into the nursery. The iron bed straight ahead along the far wall (foot to the right), the window and curtains ahead-right, the chest with the grey box ahead-left on the rug, the bedside table and lamp at the bed head, the dust-sheeted armchair deep left; the high corner ahead-right above the window is still empty.',
    people: [],
    map: '/maps/SH09_map.png',
    kf: {
      mode: 'plate',
      uploads: [up('LOC_NURSERY_DOORWAY_DAY.png', 'start frame as is')],
      frame: 'No new keyframe. The plate is the start frame.',
      saveAs: 'LOC_NURSERY_DOORWAY_DAY.png',
    },
    video: {
      camera: 'Gimbal gliding slowly left to right past the open doorway at eye level.',
      setting: 'A small, sunlit child’s room seen from the corridor.',
      beats: [
        { t: [0, 3], text: 'The camera glides past the open doorway, holding one clean view into the room: the simple white iron bed, the low wooden chest, the grey archival box on its lid. Dust hangs in the pale light. Nothing in the room moves.' },
      ],
      stays: ['The room stays exactly as in the start frame; no person, figure or shadow appears.'],
    },
    order: 3,
    edit: 1.5,
    sound: 'off',
    audio: 'House ambience continues.',
    trim: 'Candidate: can be covered by the view through the door in SH08.',
  },
  {
    id: 'SH10',
    section: 'C',
    covers: ['C4', 'C5', 'C6'],
    title: 'NAOMI: “This is the room?” Clara looks in but keeps moving past it: “My mother said, ‘If the nursery bell rings, do not enter.’ I didn’t believe her.”',
    cam: 'cinematic',
    location: 'LOC_CORRIDOR_REV_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MS',
    setup: 'COR-REV far-window end',
    blocking:
      'Same corridor direction, TIGHTER: a medium two-shot from the waist up. The two women are level with the open nursery doorway on the right wall. The copper-haired woman on frame-right, still looking through the doorway to her left; the woman with locs on frame-left, walking, eyes on her.',
    people: [
      { id: 'clara', view: 'front34', where: 'on frame-RIGHT, level with the open nursery doorway, walking toward the camera', doing: 'head turned to her left (frame-right), looking through the open doorway into the room' },
      { id: 'naomi', view: 'front34', where: 'on frame-LEFT, walking toward the camera', doing: 'eyes on her companion' },
    ],
    map: '/maps/SH10_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_REV_DAY.png', 'the corridor and light — keep'), sheet('clara'), sheet('naomi'), up('MAP_SH10.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image')],
      frame: 'Controlled and direct on the outside; grief held underneath.',
      saveAs: 'KF_SH10.png',
    },
    video: {
      camera: 'Gimbal moving backward ahead of them.',
      setting: 'Bright upper corridor, daytime.',
      beats: [
        { t: [0, 1.5], text: `${Cap('naomi')}, still walking, eyes on her, asks gently in ${V('naomi')}: ${q('C4')}` },
        { t: [1.5, 2.5], text: `${Cap('clara')} keeps looking through the doorway but keeps moving past it without slowing.` },
        { t: [2.5, 8], text: `Walking, controlled and direct, in ${V('clara')}: ${q('C6')} On the last words a thin, tight half-smile that does not reach her eyes. ${Cap('naomi')} listens, walking, eyes on her.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 8,
    edit: 6,
    sound: 'native',
    audio: 'Naomi and Clara lines, native then voice-swapped.',
  },
  {
    id: 'SH11',
    section: 'C',
    covers: ['C7', 'C8', 'C9'],
    title: 'Clara looks back once at the box. “Her last letter is in that box…” Naomi follows her glance, keeps pace, asks nothing.',
    cam: 'cinematic',
    location: 'LOC_CORRIDOR_REV_DAY.png',
    time: 'day',
    lens: '85mm',
    size: 'MCU',
    setup: 'COR-REV far-window end, 85mm',
    blocking:
      'Same corridor direction, much TIGHTER: a medium close-up single on the copper-haired woman from the chest up, walking toward the camera, the corridor soft behind her. The open nursery doorway, now a couple of metres behind her, is a soft bright shape on the RIGHT of frame. The very tall woman with locs is a soft shoulder and cheek at the LEFT edge of frame.',
    people: [
      { id: 'clara', view: 'front', where: 'centre-right, chest-up, walking toward the camera', doing: 'eyes forward, about to glance back over her LEFT shoulder toward the doorway behind her' },
      { id: 'naomi', view: 'front34', where: 'soft at the LEFT edge of frame, only her shoulder and cheek', doing: 'walking beside her, eyes on her' },
    ],
    map: '/maps/SH11_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_REV_DAY.png', 'the corridor behind her, soft — keep'), sheet('clara'), sheet('naomi'), mapUp('SH11')],
      frame: 'Quieter now, the guard slipping; eyes starting to shine.',
      saveAs: 'KF_SH11.png',
    },
    video: {
      camera: 'Gimbal moving backward ahead of her, tight on her face.',
      setting: 'Bright upper corridor, daytime.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} looks back once over her left shoulder toward the open doorway behind her — at the box inside — then turns forward again.` },
        { t: [1.5, 7], text: `Quieter, still walking, her voice thinning, in ${V('clara')}: ${q('C8')}` },
        { t: [7, 8], text: `At the left edge, ${D('naomi')} glances back toward the doorway, then keeps pace beside her and says nothing.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 8,
    edit: 6,
    sound: 'native',
    audio: 'Clara’s line, native then voice-swapped.',
  },
  {
    id: 'SH12',
    section: 'C',
    covers: ['C11'],
    title: 'Transition: Clara and Naomi move out of frame; Mara carries NURSERY FIXED into the nursery, Elias follows with the handheld; Owen works nearby.',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_DAY.png',
    time: 'day',
    lens: '24mm',
    size: 'WS',
    setup: 'COR-FWD landing end',
    blocking:
      'A NEW ANGLE: deep wide down the corridor from the LANDING end, looking toward the far window (plate direction). The open nursery door is on the LEFT wall in the midground. The small woman in rust walks away from the camera in the left-centre foreground carrying a compact black camera and a small metal bracket, heading for the nursery door; the tall man in olive a step behind her with his handheld. Far down the corridor the copper-haired woman and the very tall woman with locs walk away toward the far window. At the far end on the right, the huge bearded man kneels at an open case.',
    people: [
      { id: 'mara', view: 'back', where: 'left-centre foreground, walking away from the camera toward the open nursery door on the left wall', doing: 'walking, eyes on the door ahead', hands: 'compact black camera in her right hand and a small metal bracket in her left, both visible at her sides' },
      { id: 'elias', view: 'back34', where: 'a step behind her on the right', doing: 'following her, raising his handheld', hands: 'handheld camera in his right hand, visible beside his right shoulder' },
      { id: 'clara', view: 'small', where: 'far down the corridor near the far window, walking away', doing: 'walking away beside the taller woman' },
      { id: 'naomi', view: 'small', where: 'far down the corridor beside her, walking away', doing: 'walking away' },
      { id: 'owen', view: 'small', where: 'at the far end on the right, kneeling at an open black case', doing: 'unpacking', hands: 'both hands in the open case' },
    ],
    map: '/maps/SH12_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_DAY.png', 'the corridor from the landing end — keep'), sheet('mara'), sheet('elias'), LINEUP_BG, mapUp('SH12')],
      frame: 'One connected flow of work, nobody posing.',
      saveAs: 'KF_SH12.png',
    },
    video: {
      camera: 'Locked tripod.',
      setting: 'Bright upper corridor, daytime.',
      beats: [
        { t: [0, 1.5], text: `Far down the corridor ${D('clara')} and ${D('naomi')} walk on toward the far window and turn out of sight through a door on the right.` },
        { t: [1.5, 4], text: `In the foreground ${D('mara')} reaches the open nursery door on the left wall and turns in through it; ${D('elias')} follows her in, raising his handheld camera.` },
        { t: [4, 5], text: `At the far end ${D('owen')} keeps unpacking his case and does not look up.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3,
    sound: 'off',
    audio: 'House ambience, distant cases.',
    note: 'Owen works near the far-window end; in SH14 he walks from there toward the landing. Naomi is back in the corridor in SH14 (“Owen and Naomi continue working nearby”).',
    trim: 'Candidate.',
  },

  // ======================= D — SETUP ROUTE =================================
  {
    id: 'SH13',
    section: 'D',
    covers: ['D1', 'D2'],
    title: 'Handheld from Elias at the doorway: Mara mounts NURSERY FIXED in the high corner; its preview shows door, box and open depth.',
    cam: 'handheld',
    operator: 'elias',
    location: 'LOC_NURSERY_DOORWAY_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MS',
    setup: 'NUR-DOOR handheld from the doorway',
    blocking:
      'Handheld view from the doorway, looking in: ahead-right, high in the corner above the window, the small woman in rust stands on a small step stool beside the foot of the iron bed, arms up, tightening a compact black camera onto one small metal wall bracket. The camera’s tiny flip-out preview screen faces us. Below her the window with thin white curtains; straight ahead the white iron bed along the far wall; ahead-left the dark chest with the grey box on the rug. Daylight from the window.',
    people: [
      { id: 'mara', view: 'back34', where: 'ahead-right, high in the corner above the window, standing on a small step stool', doing: 'arms raised, tightening a compact black camera onto a wall bracket, face turned up to the mount in partial profile', hands: 'both arms raised, both hands on the compact camera and its bracket, the camera clearly visible above her hands' },
    ],
    check: ['No person other than her; the doorway operator is never seen', 'The bracket is in the corner above the window, ahead-right'],
    map: '/maps/SH13_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_NURSERY_DOORWAY_DAY.png', 'the room seen from the doorway — keep'), sheet('mara'), up('PROP_FIXED_CAM.png', 'the camera on its wall bracket'), up('MAP_SH13.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image')],
      frame: 'Concentrated, quick, precise hands.',
      saveAs: 'KF_SH13.png',
    },
    video: {
      camera: 'Handheld investigation camera held by the host standing in the doorway (he is never seen): gentle natural sway, slight push in.',
      setting: 'A sunlit child’s nursery.',
      beats: [
        { t: [0, 3], text: `${Cap('mara')} tightens the bracket with short firm twists, eyes on the mount, then angles the camera down toward the door and the box.` },
        { t: [3, 5], text: 'She checks the tiny preview screen once and gives the bracket one last twist.' },
      ],
      stays: [STAY_PEOPLE, 'The bracket stays in that one high corner.'],
    },
    order: 5,
    edit: 2,
    sound: 'off',
    audio: 'Bracket clicks (SFX).',
    post: 'Track and replace the tiny preview screen with LOC_NURSERY_FIXED_DAY so it clearly shows the door, the box and the open depth.',
    note: 'Operator is established in SH12 (Elias follows her in raising the handheld).',
  },
  {
    id: 'SH14',
    section: 'D',
    covers: ['D3', 'D4', 'D5'],
    title: 'Corridor angle: Owen passes with BELL BOARD FIXED and his pouch, Naomi behind with her recorder. ELIAS: “Very polite house so far.” MARA: “You’ve been here twenty minutes.”',
    cam: 'tripod',
    location: 'LOC_NURSERY_DOORWAY_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MWS',
    setup: 'COR-DOOR corridor into the doorway',
    blocking:
      'Camera in the corridor with its back to the wall opposite the nursery door, eye level. In the open doorway, back three-quarter to camera, the tall man in olive stands filming into the room, handheld raised toward the far corner. Through the doorway, high in the corner ahead-right above the window, the small woman in rust on a step stool tightening the compact camera onto its bracket. In the corridor foreground, entering from frame-RIGHT and walking LEFT (toward the landing): the huge bearded man carrying a second compact black camera and a small canvas tool pouch; a few steps behind him, the very tall woman with locs holding her silver cassette recorder.',
    people: [
      { id: 'elias', view: 'back34', where: 'standing in the open nursery doorway in the midground, facing into the room', doing: 'handheld camera raised, pointed at the far corner ahead-right', hands: 'both hands hold the handheld camera raised in front of his face, its body visible beyond his right shoulder' },
      { id: 'mara', view: 'small', where: 'seen through the doorway, high in the corner ahead-right above the window, on a step stool', doing: 'tightening the compact camera on its bracket, face in partial profile', hands: 'both hands on the camera on its bracket' },
      { id: 'owen', view: 'profileL', where: 'in the corridor foreground, entering from frame-RIGHT, full body', doing: 'walking slowly toward frame-LEFT carrying a compact black camera and a small canvas tool pouch, eyes ahead down the corridor', hands: 'compact black camera in his right hand, canvas tool pouch in his left, both clearly visible' },
      { id: 'naomi', view: 'profileL', where: 'in the corridor foreground a few steps behind him, on the right', doing: 'walking toward frame-LEFT, looking down at the cassette recorder in her hands', hands: 'silver cassette recorder held in both hands in front of her' },
    ],
    check: ['The bearded man walks toward frame-LEFT (the landing side)', 'The doorway is in the corridor wall; the room is seen through it'],
    map: '/maps/SH14_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_NURSERY_DOORWAY_DAY.png', 'corridor, doorway and room — keep'), sheet('elias'), sheet('owen'), up('CH_LINEUP.png', 'identities of the woman in the corner and the woman with locs, and everyone’s heights'), up('MAP_SH14.png', 'BLOCKING ONLY: where the camera stands and looks, where each person stands, which way they face and move, and where things land in the frame. It is a diagram — do NOT draw it, no arrows, circles or labels in the image')],
      frame: 'Relaxed crew banter while everyone keeps working.',
      saveAs: 'KF_SH14.png',
    },
    video: {
      camera: 'Locked tripod in the corridor.',
      setting: 'Sunlit upper corridor, looking into the nursery doorway.',
      beats: [
        { t: [0, 2], text: `${Cap('owen')} walks slowly into the foreground from the right carrying the compact camera and tool pouch, heading left; ${D('naomi')} follows a few steps behind, checking her cassette recorder.` },
        { t: [2, 4], text: `In the doorway ${D('elias')}, watching the woman in the corner work, says lightly and fondly in ${V('elias')}: ${q('D4')}` },
        { t: [4, 7], text: `Up in the corner, without looking down and still tightening the same mount, ${D('mara')} answers dryly in ${V('mara')}: ${q('D5')}` },
      ],
      stays: [STAY_PEOPLE, 'The bearded man keeps walking slowly and never turns his head; nobody stops working.'],
    },
    order: 7,
    edit: 3.5,
    sound: 'native',
    audio: 'Elias and Mara lines, native then voice-swapped.',
  },
  {
    id: 'SH15',
    section: 'D',
    covers: ['D6', 'D7', 'D8', 'D9'],
    title: 'Owen keeps walking without turning: “That’s usually enough for him.” Naomi’s knowing smile to Elias; Elias grins and follows Owen.',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_DAY.png',
    time: 'day',
    lens: '50mm',
    size: 'MS',
    setup: 'COR-FWD2 corridor looking north',
    blocking:
      'A NEW ANGLE: in the corridor a couple of metres on the landing side of the nursery door, looking up the corridor toward the far window. The open nursery door is on the LEFT wall in the midground, the tall man in olive standing in it, turned into the room. The huge bearded man walks down the corridor TOWARD the camera, waist-up, carrying a compact camera and a tool pouch; a few steps behind him the very tall woman with locs with her recorder.',
    people: [
      { id: 'owen', view: 'front', where: 'centre, waist-up, walking toward the camera down the corridor', doing: 'walking, eyes ahead past the camera, deadpan, not turning his head to the doorway', hands: 'compact black camera in his right hand, canvas tool pouch in his left, both visible' },
      { id: 'naomi', view: 'front34', where: 'a few steps behind him, right of centre', doing: 'walking toward the camera, about to turn her head to the doorway on the left', hands: 'silver cassette recorder in both hands in front of her' },
      { id: 'elias', view: 'profileL', where: 'in the open nursery doorway on the LEFT wall, midground', doing: 'facing into the room, filming the woman in the corner', hands: 'handheld camera raised in both hands, visible in profile' },
    ],
    map: '/maps/SH15_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_DAY.png', 'the corridor and the open nursery door — keep'), sheet('owen'), sheet('naomi'), sheet('elias'), mapUp('SH15')],
      frame: 'Relaxed crew banter while everyone keeps working.',
      saveAs: 'KF_SH15.png',
    },
    video: {
      camera: 'Static, 50mm.',
      setting: 'Sunlit upper corridor, the open nursery door on the left.',
      beats: [
        { t: [0, 2.5], text: `${Cap('owen')} keeps walking toward the camera without turning his head and says, low and deadpan, in ${V('owen')}: ${q('D7')}` },
        { t: [2.5, 3.5], text: `Behind him ${D('naomi')} turns her head to the man in the doorway with one knowing smile and keeps walking.` },
        { t: [3.5, 5], text: `${Cap('elias')} turns his head from the room toward the corridor, grins once, lowers his camera and steps out after the bearded man; the bearded man passes the camera and leaves frame on the right.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 2.5,
    sound: 'native',
    audio: 'Owen’s line, native then voice-swapped.',
  },
  {
    id: 'SH16',
    section: 'D',
    covers: ['D10'],
    title: 'Mara finishes the mount, lifts the small monitor case and follows.',
    cam: 'tripod',
    location: 'LOC_NURSERY_FIXED_DAY.png',
    time: 'day',
    lens: '28mm',
    size: 'MWS',
    setup: 'NUR-IN far end looking north',
    blocking:
      'A NEW ANGLE inside the nursery: camera at eye level at the far end of the room beside the dust-sheeted armchair, looking back toward the camera corner. The white iron bed runs along the LEFT wall from the foreground, the window with thin curtains at its far end; high in the corner above the window, the small woman in rust on a step stool; the open white door on the RIGHT wall; the chest with the grey box on the rug in the foreground.',
    people: [
      { id: 'mara', view: 'back34', where: 'upper left, on the step stool in the corner above the window', doing: 'giving the mounted camera a final twist; the small black monitor case on the floor below her', hands: 'both hands on the mounted camera, which is clearly visible on its wall bracket' },
    ],
    map: '/maps/SH16_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOCSHEET_NUR.png', 'the TOP-RIGHT panel (day, view B) is this room seen from the far end — the direction of this shot'), sheet('mara'), up('PROP_MONITOR.png', 'the monitor case on the floor'), up('PROP_FIXED_CAM.png', 'the mounted camera'), mapUp('SH16')],
      frame: 'Only she is in the room.',
      saveAs: 'KF_SH16.png',
    },
    video: {
      camera: 'Locked tripod.',
      setting: 'Sunlit nursery.',
      beats: [
        { t: [0, 1.5], text: `${Cap('mara')} gives the mounted camera a final twist.` },
        { t: [1.5, 2.5], text: 'She steps down off the stool.' },
        { t: [2.5, 3.5], text: 'She lifts the small black monitor case off the floor.' },
        { t: [3.5, 5], text: 'She walks to the open door on the right and out into the corridor, out of frame.' },
      ],
      stays: [STAY_PEOPLE, 'The mounted camera stays on its bracket in the corner.'],
    },
    order: 5,
    edit: 1.5,
    sound: 'off',
    audio: 'Last bracket click, footsteps.',
    trim: 'Candidate: could be covered by her following in SH17.',
  },
  {
    id: 'SH17',
    section: 'D',
    covers: ['D11'],
    title: 'Continuous: Owen leads Elias, Mara and Naomi down the main stair and through the hall service door.',
    cam: 'cinematic',
    location: 'LOC_HALL_DAY.png',
    time: 'day',
    lens: '24mm',
    size: 'WS',
    setup: 'HALL-A front-door view',
    blocking:
      'Entrance hall from near the front door (plate direction): the central staircase ahead, the plain service door on the RIGHT-hand wall. Coming down the stair toward camera in single file: the huge bearded man in front with the tool pouch and compact camera, then the tall man in olive with his handheld raised on him, then the small woman in rust with the monitor case, then the very tall woman with locs.',
    people: [
      { id: 'owen', view: 'front', where: 'first in line, on the last steps of the central staircase, coming down toward the camera', doing: 'tool pouch and compact camera in hand, eyes on the service door on the right-hand wall (to HIS left, frame-right)', hands: 'tool pouch in his left hand, compact black camera in his right hand, both visible' },
      { id: 'elias', view: 'front', where: 'second in line, a few steps above him', doing: 'handheld camera raised on the bearded man', hands: 'handheld camera raised in both hands in front of his chest, lens toward the bearded man' },
      { id: 'mara', view: 'front', where: 'third in line', doing: 'carrying the small black monitor case', hands: 'small black monitor case in her right hand' },
      { id: 'naomi', view: 'front', where: 'last, near the top of the visible stair', doing: 'coming down behind them' },
    ],
    check: ['The service door is on the RIGHT-hand wall', 'They come DOWN the stair toward the camera'],
    map: '/maps/SH17_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_HALL_DAY.png', 'the hall, stair and service door — keep'), sheet('owen'), sheet('elias'), sheet('mara'), sheet('naomi')],
      frame: 'Brisk, practical movement down the stair.',
      saveAs: 'KF_SH17.png',
    },
    video: {
      camera: 'Smooth gimbal, slow pan right with them.',
      setting: 'Bright entrance hall with a central staircase.',
      beats: [
        { t: [0, 2], text: 'The four come down the last steps of the stair in single file.' },
        { t: [2, 4], text: `At the bottom ${D('owen')} turns toward frame-right to the service door on the right-hand wall, opens it and goes through without breaking stride.` },
        { t: [4, 5], text: 'The others follow him through it in the same order.' },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 2,
    sound: 'off',
    audio: 'Footsteps on the stair, service door.',
    trim: 'Candidate, but it is the geography link between the upper floor and the service hall.',
  },
  {
    id: 'SH18',
    section: 'D',
    covers: ['D12'],
    title: 'At the bell board Owen sets the tool pouch down and opens the lower wooden panel.',
    cam: 'cinematic',
    location: 'LOC_BELLBOARD_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'WS',
    setup: 'SVC-A passage entrance',
    blocking:
      'Service hall from the passage entrance (plate direction): the bell board on the back wall, the lower wooden panel below it, the narrow lower service door immediately to its right. The huge bearded man stands at the board, about to crouch, the tool pouch still in his hand. The tall man in olive stands just behind his left shoulder, handheld raised on him. The small woman in rust sets the monitor case down by the left wall; the very tall woman with locs stands behind her. Cold shaft of light from the small high window on the left.',
    people: [
      { id: 'owen', view: 'back34', where: 'standing at the foot of the bell board on the back wall', doing: 'about to crouch; the lower wooden panel is still CLOSED', hands: 'tool pouch and the compact camera still in his right hand, clearly visible at his side' },
      { id: 'elias', view: 'back34', where: 'standing just behind the bearded man’s left shoulder', doing: 'handheld camera aimed at the panel', hands: 'handheld camera raised in both hands, visible beyond his right shoulder, pointed at the panel' },
      { id: 'mara', view: 'profileL', where: 'by the left wall', doing: 'setting the monitor case down on the floor', hands: 'both hands on the monitor case handle as it touches the floor' },
      { id: 'naomi', view: 'back34', where: 'behind the small woman, nearer the camera', doing: 'watching the board' },
    ],
    map: '/maps/SH18_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_BELLBOARD_DAY.png', 'the service hall, board, panel and door — keep'), sheet('owen'), sheet('elias'), sheet('mara'), sheet('naomi')],
      frame: 'Everyone focused on the board.',
      saveAs: 'KF_SH18.png',
    },
    video: {
      camera: 'Smooth gimbal, slight drift in.',
      setting: 'Ground-floor service hall with an antique servant-bell board.',
      beats: [
        { t: [0, 2], text: `${Cap('owen')} crouches, sets the tool pouch and the compact camera on the floor beside the board.` },
        { t: [2, 4], text: 'He swings open the hinged lower wooden panel below the board.' },
        { t: [4, 5], text: `${Cap('elias')} leans in with his handheld toward the opening; ${D('mara')} picks up the compact camera and a spring clamp.` },
      ],
      stays: [STAY_PEOPLE, 'The board and the lower service door stay where they are.'],
    },
    order: 5,
    edit: 1.5,
    sound: 'off',
    audio: 'Wood panel opening (SFX).',
  },
  {
    id: 'SH19',
    section: 'D',
    covers: ['D13', 'D14'],
    title: 'One clean handheld view of the cut wiring; Owen closes the panel.',
    cam: 'handheld',
    operator: 'elias',
    location: 'LOC_BELLBOARD_DAY.png',
    time: 'day',
    lens: '50mm',
    size: 'INSERT',
    setup: 'SVC-INS lower panel',
    blocking:
      'Close handheld insert from the host’s camera looking down into the open lower panel under the bell board: bundles of old cloth-covered bell wires hanging inside, clearly cut straight through, frayed copper ends; the bearded man’s large tattooed hand and indigo cuff hold the panel open on the right.',
    people: [
      { id: 'owen', view: 'hands', where: 'only his large tattooed hand and indigo cuff, on the right of frame', doing: 'holding the open lower panel' },
    ],
    map: '/maps/SH19_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_BELLBOARD_DAY.png', 'wood, board and light'), sheet('owen', 'his hand, forearm tattoos and indigo sleeve only'), mapUp('SH19')],
      frame: 'The cut is unmistakable: clean severed ends, a gap between them.',
      saveAs: 'KF_SH19.png',
    },
    video: {
      camera: 'Handheld investigation camera, close, slight natural sway.',
      setting: 'Inside the lower panel of an antique bell board.',
      beats: [
        { t: [0, 2], text: 'The panel is held open; the cut wires hang still; the camera eases in on the severed ends.' },
        { t: [2, 3], text: 'The large hand swings the panel shut.' },
      ],
      stays: ['The wires stay clearly cut.'],
    },
    order: 3,
    edit: 1.5,
    sound: 'off',
    audio: 'Panel closing.',
    note: 'The only wiring insert, as scripted.',
  },
  {
    id: 'SH20',
    section: 'D',
    covers: ['D15', 'D16', 'D17'],
    title: 'Mara clamps BELL BOARD FIXED facing the board while Owen lowers the NURSERY flag, holds it, resets it. OWEN: “The wiring’s dead. The flags still reset by hand.”',
    cam: 'handheld',
    operator: 'elias',
    location: 'LOC_BELLBOARD_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MS',
    setup: 'SVC-B over his shoulder',
    blocking:
      'Handheld from the host, just behind the huge bearded man’s right shoulder: he stands square in front of the board, facing it, so we see the back of his right shoulder and his right profile, his right index finger on the small brass flag in the centre window of the board, directly above the readable NURSERY label. Beside the board on the left, the small woman in rust faces the board at an angle, tightening a compact camera onto a simple spring clamp on a pipe, aimed at the board. The narrow lower service door is to the right of the board.',
    people: [
      { id: 'owen', view: 'back34', where: 'standing square in front of the board; the camera is just behind his right shoulder so his right profile shows', doing: 'the NURSERY flag is still in the neutral UP position; eyes on the mechanism', hands: 'right index finger resting on the brass flag in the centre window, just above the NURSERY label, not yet pressing' },
      { id: 'mara', view: 'front34', where: 'on the left of the board, beside it', doing: 'tightening a compact camera onto a spring clamp on a pipe, eyes on the clamp', hands: 'both hands on the spring clamp and the compact camera' },
    ],
    check: ['NURSERY label readable', 'The lower service door is to the RIGHT of the board'],
    map: '/maps/SH20_map.png',
    kf: {
      mode: 'generate',
      uploads: [up('LOC_BELLBOARD_DAY.png', 'board, labels, door — keep; NURSERY must stay readable'), sheet('owen'), sheet('mara'), up('PROP_FIXED_CAM.png', 'the camera on its spring clamp'), mapUp('SH20')],
      frame: 'He looks at the mechanism, never at the camera.',
      saveAs: 'KF_SH20.png',
    },
    video: {
      camera: 'Handheld investigation camera, slight natural sway.',
      setting: 'Service hall at the antique servant-bell board.',
      beats: [
        { t: [0, 1], text: `${Cap('mara')} tightens the clamp on the camera.` },
        { t: [1, 2], text: `${Cap('owen')} pushes the brass flag in the centre window, above the NURSERY label, down with one finger.` },
        { t: [2, 3], text: 'He holds it down; the NURSERY label is clearly readable.' },
        { t: [3, 4], text: 'He pushes it back up to neutral by hand: a dry brass click.' },
        { t: [4, 7], text: `Looking at the mechanism, not at the camera, practical and unhurried, in ${V('owen')}: ${q('D17')}` },
      ],
      stays: [STAY_PEOPLE, 'The woman keeps working on the clamp throughout.'],
    },
    order: 7,
    edit: 4.5,
    sound: 'native',
    audio: 'Owen’s line, native then voice-swapped. One dry brass reset click.',
  },
  {
    id: 'SH21',
    section: 'D',
    covers: ['D18', 'D19', 'D20', 'D30'],
    title: 'Owen picks up the pouch and opens the lower service door beside the board; Elias follows with the handheld, Mara with the monitor case, Naomi behind.',
    cam: 'cinematic',
    location: 'LOC_BELLBOARD_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'WS',
    setup: 'SVC-A passage entrance',
    blocking:
      'Service hall from the passage entrance, slightly left: the bearded man at the board picking up his tool pouch; the narrow lower service door immediately to the RIGHT of the board; the tall man in olive at his shoulder with the handheld raised; the small woman in rust by the left wall with the monitor case; the very tall woman with locs behind her.',
    people: [
      { id: 'owen', view: 'profileR', where: 'at the board, beside the narrow lower door on its right', doing: 'the lower door is still CLOSED; he is turning to it', hands: 'tool pouch already in his LEFT hand; RIGHT hand on the lower door’s handle' },
      { id: 'elias', view: 'back34', where: 'just behind the bearded man', doing: 'handheld camera raised on him', hands: 'handheld camera raised in both hands, visible beyond his right shoulder' },
      { id: 'mara', view: 'profileR', where: 'by the left wall', doing: 'bending to lift the monitor case', hands: 'right hand reaching for the monitor case handle; the case still on the floor' },
      { id: 'naomi', view: 'back34', where: 'behind the small woman, nearer the camera', doing: 'waiting to follow' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_BELLBOARD_DAY.png', 'service hall, board, lower door — keep'), sheet('owen'), sheet('elias'), sheet('mara'), sheet('naomi')],
      frame: 'Moving on immediately.',
      saveAs: 'KF_SH21.png',
    },
    video: {
      camera: 'Smooth gimbal, slight pan right.',
      setting: 'Ground-floor service hall.',
      beats: [
        { t: [0, 1.5], text: `${Cap('owen')} immediately opens the narrow door to the right of the board, revealing the foot of a narrow wooden stair, and steps through.` },
        { t: [1.5, 3], text: `${Cap('elias')} follows right behind him, handheld camera held up on him.` },
        { t: [3, 5], text: `${Cap('mara')} lifts the monitor case and follows; ${D('naomi')} follows behind her.` },
      ],
      stays: [STAY_PEOPLE, 'The lower service door is to the right of the board.'],
    },
    order: 5,
    edit: 2,
    sound: 'off',
    audio: 'Camera bracket clicks, wood panel, one dry brass reset click, footsteps changing from service hall to stair, service doors opening and closing (D30 sound design for the whole route).',
  },
  {
    id: 'SH22',
    section: 'D',
    covers: ['D21'],
    title: 'The narrow back stair: lower door behind them, one turn, the stair continuing up.',
    cam: 'cinematic',
    location: 'LOC_STAIR_LOWER_DAY.png',
    time: 'day',
    lens: '24mm',
    size: 'MWS',
    setup: 'STAIR-TURN looking down',
    blocking:
      'Camera on the middle-turn landing at chest height looking DOWN the lower flight (handrail on frame-left; the upper flight begins just off frame-right). Climbing toward camera at a quick walking pace: the huge bearded man two steps from the top, tool pouch in hand; behind him the tall man in olive with the handheld up on him; behind him the small woman in rust with the monitor case; at the bottom, the very tall woman with locs just stepping in through the open lower service door.',
    people: [
      { id: 'owen', view: 'front', where: 'two steps below the camera, climbing toward it, first in line', doing: 'tool pouch in hand, eyes on the turn above him', hands: 'tool pouch in his left hand; right hand on the handrail' },
      { id: 'elias', view: 'front', where: 'behind the bearded man', doing: 'handheld camera held up on him', hands: 'handheld camera held up in both hands in front of his chest, lens up toward the bearded man' },
      { id: 'mara', view: 'front', where: 'behind the tall man', doing: 'carrying the monitor case', hands: 'monitor case in her right hand' },
      { id: 'naomi', view: 'small', where: 'at the bottom of the flight', doing: 'just stepping in through the open lower service door' },
    ],
    check: ['Handrail on frame-LEFT', 'The open lower door is visible at the bottom'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_STAIR_LOWER_DAY.png', 'the stair, rail side and lower door — keep, never flip'), sheet('owen'), sheet('elias'), sheet('mara'), sheet('naomi')],
      frame: 'Tight stairwell, bodies close, quick purposeful climb.',
      saveAs: 'KF_SH22.png',
    },
    video: {
      camera: 'Static on the turn landing, slight tilt up as they arrive.',
      setting: 'Narrow wooden back service stair, daylight from a small window at the turn.',
      beats: [
        { t: [0, 2], text: 'They climb toward the camera in single file.' },
        { t: [2, 4], text: `${Cap('owen')} reaches the landing, turns to his left (frame-right) and starts up the next flight out of frame; the man with the handheld follows him round the turn.` },
        { t: [4, 5], text: 'The other two keep climbing; the open lower door stays visible at the bottom.' },
      ],
      stays: [STAY_PEOPLE, 'The handrail stays on the left side of frame.'],
    },
    order: 5,
    edit: 2.5,
    sound: 'off',
    audio: 'Footsteps change from stone to wooden stair.',
  },
  {
    id: 'SH23',
    section: 'D',
    covers: ['D22', 'D23', 'D24', 'D25'],
    title: 'Owen opens the upper service door onto the landing, beside the monitor table: “Straight back to the board.”',
    cam: 'tripod',
    location: 'LOC_LANDING_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MWS',
    setup: 'LAND-A plate framing',
    blocking:
      'Landing plate framing (tripod, eye level, facing the panelled wall): the narrow upper service door now open away from camera into the dark stairwell; the huge bearded man half out of it, stepping onto the landing; the small wooden table immediately to the LEFT of the door, lamp off, nothing on it; in the stairwell behind him, the tall man in olive with his handheld.',
    people: [
      { id: 'owen', view: 'front34', where: 'half out of the open service door, stepping onto the landing, the table immediately to the left of the door', doing: 'mid-step, eyes on the landing, tool pouch in hand', hands: 'tool pouch in his left hand; right hand free, about to point back' },
      { id: 'elias', view: 'small', where: 'in the dark stairwell behind him, framed by the door', doing: 'handheld camera up', hands: 'handheld camera held up in both hands' },
    ],
    check: ['The table is immediately LEFT of the door; nothing on it but the lamp (lamp off)'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_DAY.png', 'exact framing: door, table to its left, window — keep'), sheet('owen'), sheet('elias')],
      frame: 'He is mid-step onto the landing, the stairwell dark behind him.',
      saveAs: 'KF_SH23.png',
    },
    video: {
      camera: 'Locked tripod.',
      setting: 'The central upper landing of the manor, daytime.',
      beats: [
        { t: [0, 1], text: `${Cap('owen')} steps out of the narrow service door onto the landing.` },
        { t: [1, 3.5], text: `He turns and points back through the open door with his thumb, saying low and matter-of-fact in ${V('owen')}: ${q('D25')}` },
        { t: [3.5, 5], text: `${Cap('elias')} steps out behind him with his handheld camera up.` },
      ],
      stays: [STAY_PEOPLE, 'The table stays immediately to the left of the door.'],
    },
    order: 5,
    edit: 2.5,
    sound: 'native',
    audio: 'Owen’s line, native then voice-swapped. Upper service door.',
  },
  {
    id: 'SH24',
    section: 'D',
    covers: ['D26', 'D27', 'D28', 'D29', 'D31'],
    title: 'Mara opens the monitor case on the table: NURSERY FIXED already live, BELL BOARD FIXED comes live; Owen beside the monitor; she checks both once. Hold.',
    cam: 'tripod',
    location: 'LOC_LANDING_DAY.png',
    time: 'day',
    lens: '35mm',
    size: 'MWS',
    setup: 'LAND-A plate framing',
    blocking:
      'EXACT landing plate framing, locked (this is the match-cut frame): camera facing the panelled wall, the closed service door on the right, the small table immediately to its left, the dust-sheeted chair at the table’s left end, the window further left. The small black hard-case monitor stands on the table beside the lamp, angled toward the chair on the left so both screens are also partly visible to the camera. The small woman in rust stands at the left end of the table by the chair, in profile facing frame-right, hands on the case latches. The huge bearded man stands to the right of the table, between the table and the door, in profile facing frame-left, looking at the monitor.',
    people: [
      { id: 'mara', view: 'profileR', where: 'standing at the LEFT end of the table beside the dust-sheeted chair', doing: 'the monitor case lid is still CLOSED', hands: 'both hands on the latches of the small black hard-case monitor she has just set on the table, angled toward her' },
      { id: 'owen', view: 'profileL', where: 'standing to the RIGHT of the table, between the table and the closed service door', doing: 'looking down at the monitor' },
    ],
    check: ['Framing identical to the landing plate (match cut)', 'The monitor is angled toward the chair on the left, both screens partly visible to the camera'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_DAY.png', 'EXACT framing for the match cut — do not move the camera'), sheet('mara'), sheet('owen'), up('PROP_MONITOR.png', 'the monitor case')],
      frame: 'Practical, quick.',
      keep: ['the framing of the uploaded landing photo exactly'],
      saveAs: 'KF_SH24.png',
    },
    video: {
      camera: 'Locked tripod — this framing must match the night version exactly.',
      setting: 'The central upper landing, daytime.',
      beats: [
        { t: [0, 1.5], text: `${Cap('mara')} flips the latches and opens the lid.` },
        { t: [1.5, 3], text: 'The left screen is already lit; she presses a switch and the right screen lights up beside it.' },
        { t: [3, 5], text: `She checks both screens once, left then right, with a small satisfied nod; ${D('owen')} stands beside the table looking at the screens.` },
        { t: [5, 7], text: 'Both stay still at the monitor. Hold.' },
      ],
      stays: [STAY_PEOPLE, 'Both screens show plain flat light (they are replaced in the edit).'],
    },
    order: 7,
    edit: 3.5,
    sound: 'off',
    audio: 'Case latches, a switch.',
    post: 'Screens: left = LOC_NURSERY_FIXED_DAY (already live), right = LOC_BELLBOARD_FIXED_DAY (comes live at ~1.5s). Hold on the working two-feed monitor, then MATCH CUT to SH25.',
    note: 'Elias and Naomi have walked on into the corridor, off-frame right.',
  },

  // ======================= E — NIGHT MATCH CUT =============================
  {
    id: 'SH25',
    section: 'E',
    covers: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
    title: 'Match cut to the same monitor at night. Elias crosses in: “All right. We’re live for the night.” The bell rings.',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MWS',
    setup: 'LAND-A plate framing (match cut)',
    matchCut: true,
    blocking:
      'Exact same locked framing as SH24, now night: window black-blue, brass lamp ON, the service door on the right closed. The small woman in rust now sits on the uncovered chair at the LEFT end of the table, in profile facing frame-right toward the open monitor (angled toward her). The huge bearded man stands just behind her left shoulder on the window side, arms folded, eyes on the screens. At the RIGHT edge of frame, just stepping in from the corridor opening, the tall man in olive with his handheld lowered at his side.',
    people: [
      { id: 'mara', view: 'profileR', where: 'seated on the chair at the LEFT end of the table', doing: 'facing the open monitor, which is angled toward her' },
      { id: 'owen', view: 'profileR', where: 'standing just behind her left shoulder, on the window side', doing: 'arms folded, eyes on the screens' },
      { id: 'elias', view: 'front34', where: 'at the RIGHT edge of frame, just stepping in from the corridor opening', doing: 'handheld camera lowered at his side, looking toward the table', hands: 'handheld camera lowered in his right hand, clearly visible at his side' },
    ],
    check: ['Framing identical to the day shot', 'Window black, lamp on'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_NIGHT.png', 'EXACT framing and night light — match cut'), sheet('mara'), sheet('owen'), sheet('elias')],
      frame: 'Quiet, settled, the night has begun.',
      keep: ['the framing of the uploaded landing photo exactly'],
      saveAs: 'KF_SH25.png',
    },
    video: {
      camera: 'Locked tripod, identical framing to the daylight shot.',
      setting: 'The same landing at night, one warm lamp.',
      beats: [
        { t: [0, 2], text: `${Cap('elias')} crosses into frame from the right, handheld camera lowered, and stops by the table.` },
        { t: [2, 4.5], text: `Quietly, marking the start of the night, in ${V('elias')}: ${q('E5')}` },
        { t: [4.5, 5], text: 'Before anyone answers, one sharp metallic servant-bell ring sounds from somewhere below; all three go still and turn their heads toward the closed service door, the way down to the board.' },
      ],
      stays: [STAY_PEOPLE, 'Screens stay plain glowing grey.'],
    },
    order: 5,
    edit: 4,
    sound: 'native',
    audio: 'Quiet night room tone; Elias’s line (voice-swapped); then one clean metallic servant-bell ring (SFX). Cut directly on the bell.',
    post: 'Screens: left = LOC_NURSERY_FIXED_NIGHT (empty nursery), right = LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL (still board).',
  },

  // ======================= F — THE CALL ====================================
  {
    id: 'SH26',
    section: 'F',
    covers: ['F1', 'F2', 'F3'],
    title: 'BELL BOARD FIXED: nobody touching it, the NURSERY flag drops by itself.',
    cam: 'fixed-bellboard',
    location: 'LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL.png',
    time: 'night',
    lens: 'Fixed clamp camera',
    size: 'MWS',
    setup: 'BB-FIXED',
    blocking: 'BELL BOARD FIXED locked view of the whole board at night, one bare bulb above. No person anywhere.',
    people: [],
    check: ['Only the NURSERY flag changes between start and end frame'],
    kf: {
      mode: 'startEnd',
      uploads: [up('LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL.png', 'start frame'), up('LOC_BELLBOARD_FIXED_NIGHT_DOWN.png', 'end frame')],
      frame: 'No keyframe to generate: the two plates go in the start and end frame slots.',
      saveAs: 'LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL.png',
      endFrame: 'LOC_BELLBOARD_FIXED_NIGHT_DOWN.png',
    },
    video: {
      camera: 'Static security camera on an antique servant-bell board at night.',
      setting: 'No person present anywhere.',
      beats: [
        { t: [0, 1], text: 'Nothing moves.' },
        { t: [1, 1.5], text: 'The small brass flag in the centre window, above the NURSERY label, drops sharply by itself: its round brass face swings down into the window and settles.' },
        { t: [1.5, 3], text: 'Stillness.' },
      ],
      stays: [STAY_LOCKED, 'Every other flag stays exactly where it is. No hand, shadow or person appears.'],
    },
    order: 3,
    edit: 1.5,
    sound: 'off',
    audio: 'One brass flag clack (SFX).',
    post: 'BELL BOARD FIXED overlay, running timecode, grain.',
  },
  {
    id: 'SH27',
    section: 'F',
    covers: ['F4', 'F5'],
    title: 'Mara and Owen at the monitor lean toward the board feed. MARA: “Nursery.”',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'MCU',
    setup: 'LAND-B reverse at the table',
    blocking:
      'Reverse angle on the monitor station: camera beside the service door at the right end of the table, looking back along the table toward the dark window. The open monitor stands in the soft lower-right foreground with its screens facing AWAY from camera, toward them. Beyond it, the small woman in rust sits on the chair at the far end of the table, face to camera in three-quarter; the huge bearded man stands just behind her left shoulder. Cold screen glow and warm lamp light on their faces. Their LEFT-hand screen is the nursery feed, their RIGHT-hand screen is the bell-board feed.',
    people: [
      { id: 'mara', view: 'front34', where: 'seated at the far end of the table, facing the monitor and, beyond it, the camera', doing: 'leaning toward her right-hand screen, eyes on it' },
      { id: 'owen', view: 'front34', where: 'standing just behind her left shoulder', doing: 'leaning in toward the same screen' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_NIGHT.png', 'the landing at night, lamp and monitor'), sheet('mara'), sheet('owen'), up('PROP_MONITOR.png', 'the monitor case')],
      frame: 'Both suddenly alert.',
      saveAs: 'KF_SH27.png',
    },
    video: {
      camera: 'Static tripod.',
      setting: 'The monitor station on the landing at night.',
      beats: [
        { t: [0, 1], text: 'Both lean in toward their right-hand screen (the bell-board feed), eyes narrowing.' },
        { t: [1, 3], text: `${Cap('mara')} says low and factual in ${V('mara')}: ${q('F5')}` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 3,
    edit: 1.5,
    sound: 'native',
    audio: 'Mara’s line, native then voice-swapped.',
  },
  {
    id: 'SH28',
    section: 'F',
    covers: ['F6', 'F7', 'F8', 'F9', 'F10', 'F11'],
    title: 'Clara in the corridor has already turned toward the nursery: “That’s what she said.” Naomi beside her; Elias on her other side: “You don’t have to go in.”',
    cam: 'cinematic',
    location: 'LOC_CORRIDOR_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MWS',
    setup: 'COR-FWD landing end',
    blocking:
      'Night corridor from the landing end. The open nursery door is on the LEFT wall in the left foreground, dim lamp spill coming out of it. About two metres beyond the door, on the far-window side, the copper-haired woman stands already turned toward the doorway — facing camera-left, face in three-quarter — shoulders tight, hands still at her sides; the very tall woman with locs a step behind her. In the right foreground, walking away from camera toward her, back three-quarter: the tall man in olive with his handheld lowered. Warm sconce on the right wall near camera.',
    people: [
      { id: 'clara', view: 'front34', where: 'about two metres beyond the open nursery door, on the far-window side, standing still', doing: 'turned toward the open doorway (camera-left), shoulders tight, hands still at her sides, eyes on the doorway' },
      { id: 'naomi', view: 'front34', where: 'a step behind her', doing: 'eyes on her' },
      { id: 'elias', view: 'back', where: 'in the right foreground, walking away from the camera toward her', doing: 'walking, head toward her', hands: 'his right hand carries the handheld camera lowered at his side, clearly visible beside his right thigh' },
    ],
    check: ['The open nursery door is on the LEFT wall in the foreground', 'Her face is toward the doorway, not toward the lens'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_NIGHT.png', 'the night corridor and nursery door position — keep'), sheet('clara'), sheet('naomi'), sheet('elias')],
      frame: 'Her fear is visible under the control: eyes wide and wet, lips pressed together.',
      saveAs: 'KF_SH28.png',
    },
    video: {
      camera: 'Gimbal, very slow push-in.',
      setting: 'The upper corridor at night, one warm sconce, lamp spill from the open nursery door.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} stares at the open doorway; her shoulders tighten, her hands go still, her breath stops.` },
        { t: [1.5, 3], text: `Recognising the exact warning, barely above a whisper, in ${V('clara')}: ${q('F8')}` },
        { t: [3, 4.5], text: `${Cap('naomi')} steps in beside her; ${D('elias')} comes up on her other side with his camera lowered and stops a respectful step away.` },
        { t: [4.5, 7], text: `Calm and direct, in ${V('elias')}: ${q('F11')}` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 7,
    edit: 5,
    sound: 'native',
    audio: 'Clara and Elias lines, native then voice-swapped. Night room tone, no music.',
  },
  {
    id: 'SH29',
    section: 'F',
    covers: ['F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18'],
    title: 'Clara looks through the doorway at the box and starts walking before she answers: “If I’m ever opening that letter, it’s tonight.” Elias two steps beside her, then lets her lead; Naomi one pace behind.',
    cam: 'cinematic',
    location: 'LOC_CORRIDOR_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MS',
    setup: 'COR-FWD landing end, closer',
    blocking:
      'Same night corridor from the landing end, camera lower and closer. The copper-haired woman in the centre, facing the open nursery door, which is just ahead of her in the left foreground; the tall man in olive at her shoulder on the frame-right side (the side he arrived on, nearest the landing), camera lowered; the very tall woman with locs one pace behind her on the far-window side. The small woman in rust and the huge bearded man stay at the monitor on the landing behind the camera, out of frame.',
    people: [
      { id: 'clara', view: 'front', where: 'in the centre, the open nursery door just ahead of her on the left wall', doing: 'facing the doorway, jaw set, eyes shining' },
      { id: 'elias', view: 'profileL', where: 'at her shoulder on the frame-right side, nearest the landing', doing: 'camera lowered, eyes on her' },
      { id: 'naomi', view: 'front34', where: 'one pace behind her, on the far-window side', doing: 'eyes on her' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_NIGHT.png', 'the night corridor — keep'), sheet('clara'), sheet('elias'), sheet('naomi')],
      frame: 'Frightened, deliberate, courageous: jaw set, eyes shining.',
      saveAs: 'KF_SH29.png',
    },
    video: {
      camera: 'Gimbal drifting slowly backward ahead of them.',
      setting: 'The upper corridor at night.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} looks through the open doorway at the grey box inside, jaw set, eyes shining.` },
        { t: [1.5, 2.5], text: 'She starts walking toward the door before she answers.' },
        { t: [2.5, 5.5], text: `Steady while moving, a tremble held under it, in ${V('clara')}: ${q('F14')}` },
        { t: [5.5, 7], text: `${Cap('elias')} walks beside her for two steps, then drops back and lets her lead; ${D('naomi')} follows one pace behind.` },
      ],
      stays: [STAY_PEOPLE, 'Nobody else appears; no one stops for a speech.'],
    },
    order: 7,
    edit: 5,
    sound: 'native',
    audio: 'Clara’s line, native then voice-swapped.',
    note: 'F17 (Mara and Owen remain at the monitor) is a blocking fact: they are behind the camera; SH33 picks them up there.',
  },

  // ======================= G — THRESHOLD ===================================
  {
    id: 'SH30',
    section: 'G',
    covers: ['G1', 'G2', 'G3', 'G4', 'G5'],
    title: 'Clara walks into the doorway; red REC light visible; she looks back once at the crew, then at the box. Elias and Naomi stop at the threshold.',
    cam: 'cinematic',
    location: 'LOC_NURSERY_DOORWAY_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MS',
    setup: 'COR-DOOR behind them at the threshold',
    blocking:
      'Night, camera in the corridor at shoulder height behind the tall man in olive (left) and the very tall woman with locs (right), both seen from behind. Between them, a step ahead, the copper-haired woman walking into the open nursery doorway, back to camera. Through the doorway: the lamp glowing on the bedside table at the bed head (ahead-left), its pool over the rug and the chest with the grey box; the iron bed straight ahead; high in the corner ahead-right above the dark window, the compact camera with its small red REC light.',
    people: [
      { id: 'elias', view: 'back', where: 'in the left foreground, from the shoulders up', doing: 'facing the doorway', hands: 'handheld camera lowered in his right hand, its top just visible at the bottom edge' },
      { id: 'naomi', view: 'back', where: 'in the right foreground, from the shoulders up, taller', doing: 'facing the doorway' },
      { id: 'clara', view: 'back', where: 'between them, a step ahead, in the open doorway', doing: 'walking into the room' },
    ],
    check: ['The small red REC light is high in the far corner ahead-right, above the window', 'The chest and box are ahead-LEFT inside the room; the bed straight ahead'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_NURSERY_DOORWAY_NIGHT.png', 'doorway, room, lamp and red REC light — keep'), sheet('clara'), sheet('elias'), sheet('naomi')],
      frame: 'A controlled pace, not hesitant, not rushed.',
      saveAs: 'KF_SH30.png',
    },
    video: {
      camera: 'Static at shoulder height behind the two in the corridor.',
      setting: 'Night; the nursery lamp glows through the open door.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} walks into the doorway at a controlled pace; the small red REC light glows high in the far corner.` },
        { t: [1.5, 3], text: 'At the threshold she looks back once over her shoulder at the two of them — frightened, decided — then turns her eyes to the grey box.' },
        { t: [3, 5], text: `${Cap('elias')} stops just outside the threshold; ${D('naomi')} stops beside him.` },
      ],
      stays: [STAY_PEOPLE, 'No figure appears in the room.'],
    },
    order: 5,
    edit: 3,
    sound: 'off',
    audio: 'Footsteps, night room tone.',
  },
  {
    id: 'SH31',
    section: 'G',
    covers: ['G6', 'G7', 'G8'],
    title: 'Clara crosses in, two steps toward the chest. The door slams. Elias pulls the exterior handle once; it does not move.',
    cam: 'cinematic',
    location: 'LOC_NURSERY_DOORWAY_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MS',
    setup: 'COR-DOOR behind them at the threshold',
    blocking:
      'Same angle as SH30: the tall man in olive and the woman with locs at the threshold, from behind; the copper-haired woman just inside the room, back to camera, heading for the low chest.',
    people: [
      { id: 'elias', view: 'back', where: 'at the threshold, left', doing: 'facing the room' },
      { id: 'naomi', view: 'back', where: 'at the threshold, right', doing: 'facing the room' },
      { id: 'clara', view: 'back', where: 'just inside the room beyond them', doing: 'walking toward the low chest on the left inside the room' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH30.png', 'exact framing and everyone’s look — continue'), sheet('clara'), sheet('elias'), sheet('naomi')],
      frame: 'Continue the uploaded frame a moment later.',
      saveAs: 'KF_SH31.png',
    },
    video: {
      camera: 'Static at shoulder height.',
      setting: 'Night; the nursery doorway.',
      beats: [
        { t: [0, 2], text: `${Cap('clara')} crosses into the nursery deliberately and takes two steps toward the low chest.` },
        { t: [2, 3], text: 'The white door swings shut by itself and slams, cutting her off; the two at the threshold flinch.' },
        { t: [3, 5], text: `${Cap('elias')} grabs the outside handle at once and pulls once, hard, with his whole weight; it does not move. He stares at it.` },
      ],
      stays: [STAY_PEOPLE, 'No figure appears anywhere.'],
    },
    order: 5,
    edit: 3,
    sound: 'off',
    audio: 'Door slam, one handle rattle (SFX).',
  },
  {
    id: 'SH32',
    section: 'G',
    covers: ['G9', 'G10', 'G11', 'G12', 'G13'],
    title: 'Inside: Clara tries the handle. “It’s locked.” ELIAS (through the door): “Stay near the door.” She scans the room: “I don’t see anything.”',
    cam: 'tripod',
    location: 'LOC_NURSERY_DOOR_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MS',
    setup: 'NUR-DOOR-IN beside the door',
    blocking:
      'Inside the nursery at night, camera at eye level about a metre from the door, looking along the door wall toward the far end: the closed white four-panel door in three-quarter view on the LEFT. The copper-haired woman stands a step from the door in profile, facing it (facing frame-left), her right hand reaching for the brass knob. Behind her to the right the room: rug, chest with the grey box, the iron bed along the right wall, the lamp on the bedside table far right, the dust-sheeted armchair far left — empty.',
    people: [
      { id: 'clara', view: 'profileL', where: 'a step from the closed door, in profile facing frame-LEFT; the empty room behind her on the right', doing: 'right hand reaching for the brass handle, eyes on the door' },
    ],
    check: ['The room behind her is EMPTY', 'The door is on the LEFT in three-quarter view'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_NURSERY_DOOR_NIGHT.png', 'the room, door and lamp light — keep'), sheet('clara')],
      frame: 'Fear arriving but controlled: eyes wide, breath quick.',
      saveAs: 'KF_SH32.png',
    },
    video: {
      camera: 'Locked tripod, very slow push-in. Never handheld.',
      setting: 'Inside the nursery at night, one small lamp.',
      beats: [
        { t: [0, 2], text: `${Cap('clara')} grips the interior handle and pulls once; it does not move.` },
        { t: [2, 3.5], text: `Louder, fear now present but controlled, in ${V('clara')}: ${q('G10')}` },
        { t: [3.5, 5], text: 'She goes still, listening to someone on the other side of the door, her hand still near the handle.' },
        { t: [5, 8], text: 'She lets go of the handle and scans the room — bed, window, floor, the box — eyes darting, breathing fast through her nose, hands low.' },
        { t: [8, 10], text: `Unsteady: ${q('G13')}` },
      ],
      stays: [STAY_NO_FIGURE, STAY_PEOPLE],
    },
    order: 10,
    edit: 7,
    sound: 'native',
    audio: `Laid in the edit at 3.5s — ELIAS through the door (muffled, Elias voice): ${q('G11')} ` + 'Clara’s lines native (voice-swapped); Elias through the door: record/voice-swap and muffle with an EQ.',
    note: 'Cinematic angle: the Woman never appears here.',
  },
  {
    id: 'SH33',
    section: 'G',
    covers: ['G14', 'G15', 'G16', 'G17', 'G18', 'G19'],
    title: 'Owen at the monitor looks at NURSERY FIXED; his casual expression dies. Mara turns to the feed. OWEN: “Mara.”',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '85mm',
    size: 'CU',
    setup: 'LAND-B reverse at the table',
    blocking:
      'Same reverse angle on the monitor station, tighter (camera beside the service door looking back along the table): close on the huge bearded man standing behind the seated woman, face to camera in three-quarter, lit by the cold glow of the screens and the warm lamp; she is soft in the foreground. The back of the monitor is out of focus at the lower edge. His eyes are on his LEFT-hand screen (the nursery feed).',
    people: [
      { id: 'owen', view: 'front34', where: 'close, filling the right half of frame, standing behind the seated woman', doing: 'eyes on his LEFT-hand screen (the nursery feed), face still relaxed' },
      { id: 'mara', view: 'front34', where: 'seated in front of him, soft focus', doing: 'eyes on the screens' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_NIGHT.png', 'the landing at night'), sheet('owen'), sheet('mara')],
      frame: 'At the very start he still looks relaxed.',
      saveAs: 'KF_SH33.png',
    },
    video: {
      camera: 'Static tripod.',
      setting: 'The monitor station at night.',
      beats: [
        { t: [0, 2], text: `${Cap('owen')}’s easy expression dies: his mouth closes, his eyes lock on his left-hand screen, his shoulders go dead still.` },
        { t: [2, 3], text: `${Cap('mara')} notices his face and turns to the same screen.` },
        { t: [3, 5], text: `Without blinking, quiet, dread under the low voice, in ${V('owen')}: ${q('G18')}` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3,
    sound: 'native',
    audio: 'Owen’s line, native then voice-swapped. Cut directly to the image they are seeing.',
  },

  // ======================= H — FIRST REVEAL ================================
  {
    id: 'SH34',
    section: 'H',
    covers: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
    title: 'FIRST FULL NURSERY FIXED REVEAL: Clara at the closed door, facing it; the Woman FAR behind her. OWEN (from the monitor): “There’s someone behind her.”',
    cam: 'fixed-nursery',
    location: 'LOC_NURSERY_FIXED_NIGHT.png',
    time: 'night',
    lens: 'NURSERY FIXED locked wide',
    size: 'WS',
    setup: 'NUR-FIXED',
    blocking: `${MAPS.nursery.text} The copper-haired woman stands on the bare floor half a step from the closed door in the lower-left, facing it, back to the room, hands low at her sides. The Woman is added as a still layer at P1 (far end, between the armchair and the bedside table).`,
    people: [
      { id: 'clara', view: 'back34', where: 'half a step from the closed door in the lower-left, facing it', doing: 'hands low at her sides; three-quarter rear from above: her right cheek, jaw and the right side of her throat face the camera' },
    ],
    check: ['Frame matches the empty night plate at 50% opacity', 'No mark on her throat', 'No figure in the room (the Woman is a separate layer)'],
    kf: {
      mode: 'edit',
      uploads: [NURSERY_NIGHT_REF, sheet('clara')],
      frame:
        'Edit the uploaded night photo of the empty nursery seen from the high corner; keep the camera, room, furniture and lamp light exactly unchanged. Add only the copper-haired woman: standing on the bare floorboards half a step in front of the closed white door in the lower-left, facing the door, her back to the room, hands low at her sides, shoulders tight. The camera sees her from behind her right shoulder in three-quarter rear view: her right cheek, jaw and the right side of her throat face the camera. Lit only by weak warm lamp spill from the right. No mark on her throat yet. Nobody else in the room.',
      keep: ['the camera, lens, furniture and lamp light exactly'],
      saveAs: 'KF_SH34.png',
    },
    woman: {
      file: 'KF_SH34_W.png',
      position: 'P1',
      uploads: [up('KF_SH34.png', 'the exact frame — change nothing but adding the figure'), WOMAN_REF],
      prompt:
        'Edit the uploaded high-corner night frame of the woman at the door; keep everything exactly unchanged. Add ONE figure: the veiled woman from the veiled-figure reference, standing perfectly still at the far end of the room, on the open floor between the dust-sheeted armchair (far-left corner) and the bedside table (far-right corner), back near the far wall, facing toward the woman at the door, arms straight at her sides, black mourning dress to the floor, smoke-grey veil over her whole face. Half swallowed by shadow but readable as a woman; scaled correctly for the distance. No glow, no transparency.',
    },
    video: {
      camera: 'Fixed high-corner security camera, completely static.',
      setting: 'The nursery at night, one small lamp on the right.',
      beats: [
        { t: [0, 2], text: `${Cap('clara')} stands close to the closed door in the lower-left, facing it, hands low at her sides, shoulders tight, breath shallow and quick. She does not know anything is wrong yet.` },
        { t: [2, 4.5], text: 'She stays exactly where she is, facing the door, breathing shallowly. Nobody in frame speaks.' },
        { t: [4.5, 5], text: 'She stays facing the door.' },
      ],
      stays: [STAY_LOCKED, STAY_NO_TURN, STAY_FACES_ONLY_MOVE, STAY_PEOPLE],
    },
    order: 5,
    edit: 3.5,
    sound: 'off',
    audio: `Laid in the edit at 2s — OWEN from the monitor station (lowered, Owen voice): ${q('H6')} ` + 'Owen’s line laid in post (ElevenLabs, Owen voice, slightly roomy as if heard from the monitor station). Night room tone.',
    post: 'Composite the Woman at P1: mask her out of KF_SH34_W.png and lay her as a STILL over the whole clip. NURSERY FIXED overlay, cold grade, grain.',
  },
  {
    id: 'SH35',
    section: 'H',
    covers: ['H7', 'H8', 'H9', 'H10'],
    title: 'Corridor: Elias looks from the door to the monitor and back. Naomi puts a palm flat on the wood: “Clara, stay facing the door.”',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_REV_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'MWS',
    setup: 'COR-REV night',
    blocking:
      'Night corridor from the far-window side looking back toward the landing. The closed white nursery door on the RIGHT wall in the midground. At the door: the tall man in olive on the landing side, hand still near the handle, and the very tall woman with locs on the camera side, facing the door. At the far end, the lamp-lit landing with the small monitor table where the huge bearded man and the small woman in rust watch the glowing screens.',
    people: [
      { id: 'elias', view: 'profileR', where: 'at the closed nursery door on the right wall, on the landing side of it', doing: 'hand near the handle, about to look down the corridor toward the landing' },
      { id: 'naomi', view: 'profileR', where: 'at the door on the camera side, nearest the camera', doing: 'facing the door, stepping close to it' },
      { id: 'owen', view: 'small', where: 'at the far end on the lit landing, at the monitor table', doing: 'watching the screens' },
      { id: 'mara', view: 'small', where: 'seated at the monitor table on the landing', doing: 'watching the screens' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_CORRIDOR_REV_NIGHT.png', 'corridor, closed door, lit landing — keep'), sheet('elias'), sheet('naomi'), LINEUP_BG],
      frame: 'Both at the door tense and focused.',
      saveAs: 'KF_SH35.png',
    },
    video: {
      camera: 'Static, 50mm.',
      setting: 'The upper corridor at night; the landing lamp glows at the end.',
      beats: [
        { t: [0, 1.5], text: `${Cap('elias')} looks from the locked door down the corridor toward the monitor on the landing, then immediately back to the door.` },
        { t: [1.5, 2.5], text: `${Cap('naomi')} steps close and puts one palm flat against the wood.` },
        { t: [2.5, 5], text: `Her own eyes are wide and scared but her voice is warm and firm, in ${V('naomi')}: ${q('H10')}` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3.5,
    sound: 'native',
    audio: 'Naomi’s line, native then voice-swapped.',
  },
  {
    id: 'SH36',
    section: 'H',
    covers: ['H11', 'H12'],
    title: 'Inside: Clara fixes her eyes on the door. “Why?”',
    cam: 'tripod',
    location: 'LOC_NURSERY_DOOR_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'MCU',
    setup: 'NUR-DOOR-IN beside the door',
    blocking:
      'Same inside angle as SH32, a little tighter: the copper-haired woman close to the closed door in profile, facing it, hands low. The empty lamp-lit room behind her to the right.',
    people: [
      { id: 'clara', view: 'profileL', where: 'right at the closed door, in profile facing frame-LEFT, close to the wood', doing: 'hands low, eyes fixed on the door' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH32.png', 'exact angle, light and her look — tighter'), sheet('clara')],
      frame: 'Tighter version of the uploaded frame: she is right at the door now.',
      saveAs: 'KF_SH36.png',
    },
    video: {
      camera: 'Locked tripod.',
      setting: 'Inside the nursery at night.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} fixes her eyes on the door, very still, breath held.` },
        { t: [1.5, 3], text: `Thin and frightened, to the door, in ${V('clara')}: ${q('H12')}` },
      ],
      stays: [STAY_NO_FIGURE, STAY_NO_TURN, STAY_PEOPLE],
    },
    order: 3,
    edit: 2,
    sound: 'native',
    audio: 'Clara’s line, native then voice-swapped.',
  },
  {
    id: 'SH37',
    section: 'H',
    covers: ['H13', 'H14'],
    title: 'Naomi does not tell her what is behind her: “Don’t turn around. Stay with my voice.”',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_REV_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'MCU',
    setup: 'COR-REV night, closer',
    blocking: 'Night corridor, closer on the very tall woman with locs at the closed nursery door (right wall), palm flat on the wood, face close to it; the tall man in olive beside her, soft.',
    people: [
      { id: 'naomi', view: 'profileR', where: 'close, at the closed door, face near the wood', doing: 'palm flat on the door' },
      { id: 'elias', view: 'profileR', where: 'soft, just beyond her at the door', doing: 'listening' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH35.png', 'the corridor, door and light — closer'), sheet('naomi'), sheet('elias')],
      frame: 'Scared eyes, steady voice.',
      saveAs: 'KF_SH37.png',
    },
    video: {
      camera: 'Static, 50mm.',
      setting: 'The upper corridor at night, at the closed nursery door.',
      beats: [
        { t: [0, 1.5], text: `${Cap('naomi')} does not explain; she swallows and presses her palm harder against the wood.` },
        { t: [1.5, 5], text: `Urgent but gentle, in ${V('naomi')}: ${q('H14')}` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3.5,
    sound: 'native',
    audio: 'Naomi’s line, native then voice-swapped.',
  },
  {
    id: 'SH38',
    section: 'H',
    covers: ['H15'],
    title: 'Clara obeys. Hands low. Breathing slightly faster.',
    cam: 'tripod',
    location: 'LOC_NURSERY_DOOR_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'MCU',
    setup: 'NUR-DOOR-IN beside the door',
    blocking: 'Same inside angle as SH36.',
    people: [
      { id: 'clara', view: 'profileL', where: 'right at the closed door, in profile facing frame-LEFT', doing: 'hands low, eyes on the door' },
    ],
    kf: {
      mode: 'plate',
      uploads: [up('KF_SH36.png', 'start frame as is')],
      frame: 'Reuse KF_SH36 as the start frame.',
      saveAs: 'KF_SH36.png',
    },
    video: {
      camera: 'Locked tripod.',
      setting: 'Inside the nursery at night.',
      beats: [
        { t: [0, 3], text: `${Cap('clara')} obeys: eyes on the door, hands staying low at her sides, her breathing slightly faster — shoulders and chest rising quicker, nostrils flaring, a hard swallow.` },
      ],
      stays: [STAY_NO_FIGURE, STAY_NO_TURN, STAY_PEOPLE],
    },
    order: 3,
    edit: 2,
    sound: 'off',
    audio: 'Her faster breathing (SFX).',
  },
  {
    id: 'SH39',
    section: 'H',
    covers: ['H16'],
    title: 'Brief cut to Mara and Owen watching the feed.',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'MS',
    setup: 'LAND-B reverse at the table',
    blocking: 'Same reverse angle as SH27: the small woman in rust seated, the huge bearded man standing behind her left shoulder, both staring at their LEFT-hand screen (the nursery feed).',
    people: [
      { id: 'mara', view: 'front34', where: 'seated at the far end of the table behind the monitor', doing: 'eyes on her LEFT-hand screen' },
      { id: 'owen', view: 'front34', where: 'standing behind her left shoulder', doing: 'eyes on the same screen' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH27.png', 'exact angle and light'), sheet('mara'), sheet('owen')],
      frame: 'Both completely still, faces lit by the screen.',
      saveAs: 'KF_SH39.png',
    },
    video: {
      camera: 'Static tripod.',
      setting: 'The monitor station at night.',
      beats: [{ t: [0, 3], text: 'Both watch their left-hand screen without moving; her eyes narrow slightly; his jaw tightens.' }],
      stays: [STAY_PEOPLE],
    },
    order: 3,
    edit: 1,
    sound: 'off',
    audio: 'Room tone.',
  },

  // ======================= I — SECOND REVEAL ===============================
  {
    id: 'SH40',
    section: 'I',
    covers: ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8'],
    title: 'SECOND RETURN, same NURSERY FIXED angle: Clara unchanged; the Woman halfway. Faint red line; two fingers rise: “My neck…”',
    cam: 'fixed-nursery',
    location: 'LOC_NURSERY_FIXED_NIGHT.png',
    time: 'night',
    lens: 'NURSERY FIXED locked wide',
    size: 'WS',
    setup: 'NUR-FIXED',
    blocking: `${MAPS.nursery.text} The copper-haired woman exactly where she was in SH34. The Woman is a still layer at P2 (on the rug, just left of the chest).`,
    people: [
      { id: 'clara', view: 'back34', where: 'exactly where she was: half a step from the closed door in the lower-left, facing it', doing: 'hands low, head tipped very slightly down; three-quarter rear from above: her right cheek, jaw and the right side of her throat face the camera' },
    ],
    check: ['Frame matches SH34 exactly except the faint mark and head angle', 'No figure in the room'],
    kf: {
      mode: 'edit',
      uploads: [up('KF_SH34.png', 'the exact frame — change only what is listed'), up('MARK_STAGES.png', 'use the LEFT panel (faint thin red line)')],
      frame:
        'Edit the uploaded high-corner night frame of the woman at the door; keep the camera, room, lamp light and her position exactly unchanged. Change only: a faint thin red pressure line now crosses her throat, visible on the right side of her neck (like the left panel of the throat reference); her head is tipped very slightly down as if swallowing; hands still low at her sides.',
      keep: ['her exact position at the door', 'everything else in the frame'],
      saveAs: 'KF_SH40.png',
    },
    woman: {
      file: 'KF_SH40_W.png',
      position: 'P2',
      uploads: [up('KF_SH40.png', 'the exact frame'), up('KF_SH34_W.png', 'the identical veiled figure — same look, only moved')],
      prompt:
        'Edit the first uploaded frame; keep everything exactly unchanged. Add the SAME veiled figure as in the second uploaded frame — identical dress, veil, height and pose — now standing on the rug just LEFT of the dark chest (the door side), halfway between the far end of the room and the woman at the door, facing her back, arms at her sides. Scaled correctly for the distance: clearly closer and larger than before. Still, readable, face fully covered.',
    },
    video: {
      camera: 'Fixed high-corner security camera, completely static.',
      setting: 'The nursery at night, one small lamp on the right.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} swallows hard; her brow tightens.` },
        { t: [1.5, 3], text: 'Two fingers of her right hand rise to her throat and touch the faint red line there.' },
        { t: [3, 5], text: `Confused, with a shorter breath under the words, in ${V('clara')}: ${q('I8')}` },
      ],
      stays: [STAY_LOCKED, STAY_NO_TURN, STAY_FACES_ONLY_MOVE, STAY_PEOPLE],
    },
    order: 5,
    edit: 3.5,
    sound: 'off',
    audio: 'Clara’s line laid in post in the Clara voice. Shortening breath.',
    post: 'Composite the Woman at P2 from KF_SH40_W.png as a STILL. Check P1/P2/P3 side by side. Track the faint mark if the clip loses it.',
  },
  {
    id: 'SH41',
    section: 'I',
    covers: ['I9', 'I10'],
    title: 'Naomi hears the change and presses her palm more firmly: “Stay with me.”',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_REV_NIGHT.png',
    time: 'night',
    lens: '85mm',
    size: 'CU',
    setup: 'COR-REV night, close',
    blocking: 'Close on the very tall woman with locs at the closed nursery door, palm flat on the wood, her face close to it, profile toward camera.',
    people: [
      { id: 'naomi', view: 'profileR', where: 'close, at the closed nursery door, profile toward the door', doing: 'palm flat on the wood, listening' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH37.png', 'corridor, door and light — closer'), sheet('naomi')],
      frame: 'She is listening hard through the wood.',
      saveAs: 'KF_SH41.png',
    },
    video: {
      camera: 'Static, 85mm.',
      setting: 'At the closed nursery door at night.',
      beats: [
        { t: [0, 1], text: `${Cap('naomi')} hears the change in the voice inside; her palm presses harder, fingers spreading on the wood.` },
        { t: [1, 3], text: `Warm, firm, in ${V('naomi')}: ${q('I10')}` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 3,
    edit: 2,
    sound: 'native',
    audio: 'Naomi’s line, native then voice-swapped.',
  },
  {
    id: 'SH42',
    section: 'I',
    covers: ['I11', 'I12'],
    title: 'Mara at the monitor: her eyes move from NURSERY FIXED to BELL BOARD FIXED.',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '85mm',
    size: 'CU',
    setup: 'LAND-B reverse at the table',
    blocking: 'Same reverse angle as SH27, close on the small woman in rust seated at the far end of the table, face to camera in three-quarter, screen glow on her face.',
    people: [
      { id: 'mara', view: 'front34', where: 'close, seated behind the monitor', doing: 'eyes on her LEFT-hand screen' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH27.png', 'exact angle and light — closer'), sheet('mara')],
      frame: 'Eyes on the left screen.',
      saveAs: 'KF_SH42.png',
    },
    video: {
      camera: 'Static tripod.',
      setting: 'The monitor station at night.',
      beats: [{ t: [0, 3], text: `${Cap('mara')}’s eyes move from her left-hand screen (the nursery feed) to her right-hand screen (the bell-board feed) and stop.` }],
      stays: [STAY_PEOPLE],
    },
    order: 3,
    edit: 1.5,
    sound: 'off',
    audio: 'Room tone.',
  },
  {
    id: 'SH43',
    section: 'I',
    covers: ['I13'],
    title: 'Insert: BELL BOARD FIXED on the monitor — the NURSERY flag is still down.',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '50mm',
    size: 'INSERT',
    setup: 'LAND monitor insert',
    blocking: 'Close insert on the open two-screen monitor case on the table, screens filling most of the frame, the lamp glow at the edge.',
    people: [],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_NIGHT.png', 'the table, lamp and monitor at night'), up('PROP_MONITOR.png', 'the monitor case')],
      frame: 'Both screens glowing flat grey, square to camera for easy screen replacement.',
      saveAs: 'KF_SH43.png',
    },
    video: {
      camera: 'Static insert.',
      setting: 'The monitor on the landing table at night.',
      beats: [{ t: [0, 3], text: 'Static insert on the two glowing screens; nothing moves.' }],
      stays: ['The camera stays still.'],
    },
    order: 3,
    edit: 1,
    sound: 'off',
    audio: 'Room tone.',
    post: 'Screens: left = SH40 composite (P2), right = LOC_BELLBOARD_FIXED_NIGHT_DOWN, both with their feed overlays.',
  },
  {
    id: 'SH44',
    section: 'I',
    covers: ['I14', 'I15', 'I16', 'I17', 'I18'],
    title: 'Mara looks back to Clara, back to the flag. “The flag.” She grabs flashlight and radio and is moving before Owen looks up.',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MS',
    setup: 'LAND-B reverse at the table',
    blocking:
      'Same reverse angle as SH27, a little wider: the small woman in rust seated at the far end of the table, a black flashlight and a radio on the table by her right hand; the huge bearded man standing behind her left shoulder, staring at his LEFT-hand screen. The service door is just behind the camera on the right.',
    people: [
      { id: 'mara', view: 'front34', where: 'seated at the far end of the table behind the monitor', doing: 'eyes on the screens; a black flashlight and a radio on the table by her right hand', hands: 'both hands empty and resting on the table; the flashlight and radio lie on the table by her right hand' },
      { id: 'owen', view: 'front34', where: 'standing behind her left shoulder', doing: 'eyes on the LEFT-hand screen' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH27.png', 'the angle and light — a little wider'), sheet('mara'), sheet('owen')],
      frame: 'Flashlight and radio clearly on the table by her hand.',
      saveAs: 'KF_SH44.png',
    },
    video: {
      camera: 'Static tripod, slight push-in.',
      setting: 'The monitor station at night.',
      beats: [
        { t: [0, 1], text: `${Cap('mara')}’s eyes go back to her left-hand screen,` },
        { t: [1, 1.5], text: 'and immediately back to her right-hand screen.' },
        { t: [1.5, 2.5], text: `Recognition, fast and practical — her eyes snap wide; low and immediate, in ${V('mara')}: ${q('I16')}` },
        { t: [2.5, 4], text: 'She grabs the flashlight and the radio from beside the monitor.' },
        { t: [4, 5], text: `She rises and moves toward the camera, heading for the service door just out of frame on the right, while ${D('owen')} is still staring at the left-hand screen.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3.5,
    sound: 'native',
    audio: 'Mara’s line (voice-swapped). Quick equipment grab.',
  },
  {
    id: 'SH45',
    section: 'I',
    covers: ['I19', 'I20', 'I21', 'I22', 'I23'],
    title: 'Mara pushes through the upper service door onto the stair; Owen lifts the monitor with both hands and carries it toward the nursery door.',
    cam: 'tripod',
    location: 'LOC_LANDING_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MWS',
    setup: 'LAND-A plate framing',
    blocking:
      'Landing plate framing at night (as SH25): the small woman in rust at the narrow service door on the right, back three-quarter to camera, one hand pushing it open into the black stairwell, flashlight and radio in the other hand; the huge bearded man beside the empty chair at the table, hands going to the glowing monitor; the corridor opening at the right edge.',
    people: [
      { id: 'mara', view: 'back34', where: 'at the narrow service door to the RIGHT of the table', doing: 'the door is just starting to open into the dark stairwell', hands: 'one hand pushing the door; the flashlight and the radio in the other hand, both visible' },
      { id: 'owen', view: 'profileR', where: 'at the table beside the empty chair', doing: 'the monitor is still ON the table', hands: 'both hands just reaching the glowing monitor' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_LANDING_NIGHT.png', 'exact framing and night light'), sheet('mara'), sheet('owen')],
      frame: 'Urgent, not panicked.',
      saveAs: 'KF_SH45.png',
    },
    video: {
      camera: 'Locked tripod.',
      setting: 'The landing at night.',
      beats: [
        { t: [0, 2], text: `${Cap('mara')} pushes through the narrow service door beside the table into the black stairwell, clipping the radio to her vest as she goes; she is gone.` },
        { t: [2, 3.5], text: `${Cap('owen')} lifts the small glowing monitor off the table with both hands.` },
        { t: [3.5, 5], text: 'He carries it out of frame to the right, toward the corridor and the nursery door.' },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 5,
    edit: 3,
    sound: 'off',
    audio: 'Clara’s shortening breath (from the monitor speaker, faint), service door, Mara’s first fast footsteps on the stair.',
  },

  // ======================= J — STAIR (UPPER FLIGHT) =======================
  {
    id: 'SH46',
    section: 'J',
    covers: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7'],
    title: 'Following Mara from behind, slightly above shoulder level, down the narrow back stair; hand free for the rail, flashlight low; she takes the turn.',
    cam: 'cinematic',
    location: 'LOC_STAIR_UPPER_NIGHT.png',
    time: 'night',
    lens: '24mm',
    size: 'MS',
    setup: 'STAIR-TOP follow',
    blocking:
      'Upper flight at night from the top (handrail on frame-LEFT, the turn at the bottom goes RIGHT). Camera behind the small woman in rust and slightly above her shoulder: she is on the top steps, left hand free near the rail, flashlight held low in her right hand, beam on the steps below, radio clipped on her vest.',
    people: [
      { id: 'mara', view: 'back', where: 'on the top steps, just below and ahead of the camera', doing: 'running down, left hand free near the rail, flashlight low in her right hand, radio clipped on her vest', hands: 'left hand free, skimming the rail; right hand holds the flashlight low, beam visible on the steps; radio clipped to her vest' },
    ],
    check: ['Handrail on frame-LEFT; the stair turns RIGHT at the bottom'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_STAIR_UPPER_NIGHT.png', 'the stair at night — keep, never flip'), sheet('mara')],
      frame: 'Mid-stride, fast but controlled.',
      saveAs: 'KF_SH46.png',
    },
    video: {
      camera: 'Stabilized follow camera behind her, slightly above shoulder level.',
      setting: 'A narrow wooden back stair at night, one weak bulb at the turn.',
      beats: [
        { t: [0, 3.5], text: `${Cap('mara')} runs down the narrow stair fast but controlled, left hand skimming the rail, flashlight beam low on the steps, radio bouncing on her vest. She does not stop or speak.` },
        { t: [3.5, 5], text: 'At the bottom of the flight she swings right into the turn and continues down out of view.' },
      ],
      stays: ['Nothing else is on the stair.', 'The handrail stays on the left.', STAY_PEOPLE],
    },
    order: 5,
    edit: 4,
    sound: 'off',
    audio: 'Fast controlled footsteps, breath, radio against clothing.',
    note: 'Script says she “takes the stair turn” here and “reaches the middle turn” at 2:29. Built as one continuous turn: SH46 ends as she swings into it; SH49 shows her rounding it.',
  },

  // ======================= K — THIRD POSITION ==============================
  {
    id: 'SH47',
    section: 'K',
    covers: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12'],
    title: 'NURSERY FIXED, same wide: the Woman one body length behind Clara. Mark darker; a short breath barely lands. NAOMI (O.S.): “Clara. Stay with me.”',
    cam: 'fixed-nursery',
    location: 'LOC_NURSERY_FIXED_NIGHT.png',
    time: 'night',
    lens: 'NURSERY FIXED locked wide',
    size: 'WS',
    setup: 'NUR-FIXED',
    blocking: `${MAPS.nursery.text} The copper-haired woman exactly where she was. The Woman is a still layer at P3 (one body length behind her).`,
    people: [
      { id: 'clara', view: 'back34', where: 'exactly where she was, at the closed door in the lower-left, facing it', doing: 'right hand resting at her throat, shoulders slightly raised; three-quarter rear from above: her right cheek, jaw and the right side of her throat face the camera' },
    ],
    check: ['Frame matches SH40 exactly except the darker mark and hand', 'No figure in the room'],
    kf: {
      mode: 'edit',
      uploads: [up('KF_SH40.png', 'the exact frame — change only what is listed'), up('MARK_STAGES.png', 'use the MIDDLE panel (darker red line)')],
      frame:
        'Edit the uploaded high-corner night frame of the woman at the door; keep the camera, room, lamp light and her position exactly unchanged. Change only: the mark on her throat is now darker, like the middle panel of the throat reference; her right hand rests at her throat; her shoulders are slightly raised; still facing the door.',
      keep: ['her exact position at the door', 'everything else in the frame'],
      saveAs: 'KF_SH47.png',
    },
    woman: {
      file: 'KF_SH47_W.png',
      position: 'P3',
      uploads: [up('KF_SH47.png', 'the exact frame'), up('KF_SH40_W.png', 'the identical veiled figure — same look, only moved')],
      prompt:
        'Edit the first uploaded frame; keep everything exactly unchanged. Add the SAME veiled figure as in the second uploaded frame — identical dress, veil, height and pose — now standing one body length directly behind the woman at the door, just off the rug, facing her back, arms at her sides, not touching her. Scaled correctly: about the same size as the woman. Still, readable, face fully covered.',
    },
    video: {
      camera: 'Fixed high-corner security camera, completely static.',
      setting: 'The nursery at night, one small lamp on the right.',
      beats: [
        { t: [0, 2], text: `${Cap('clara')} pulls in a short breath; it lands, but only barely — her shoulders rise with it, eyes wide and wet.` },
        { t: [2, 3], text: 'One hand stays pressed at her throat; she keeps her eyes on the door.' },
        { t: [3, 5], text: 'She holds still, listening toward the door, her hand still at her throat. Nobody in frame speaks.' },
      ],
      stays: [STAY_LOCKED, STAY_NO_TURN, STAY_FACES_ONLY_MOVE, STAY_PEOPLE],
    },
    order: 5,
    edit: 4,
    sound: 'off',
    audio: `Laid in the edit at 3s — NAOMI through the door (muffled, controlled, Naomi voice): ${q('K10')} ` + 'Naomi’s line laid in post (Naomi voice, muffled through wood). Clara’s barely-landing breath.',
    post: 'Composite the Woman at P3 from KF_SH47_W.png as a STILL. The same layer is reused, untouched, in SH51.',
  },

  // ======================= L — DOOR BEAT 1 =================================
  {
    id: 'SH48',
    section: 'L',
    covers: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'],
    title: 'Elias braces on the frame, tests the handle once more, stops, listens at the door. Naomi’s palm on the wood. Owen several steps back with the monitor, silent.',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_REV_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MWS',
    setup: 'COR-REV night',
    blocking:
      'Night corridor from the far-window side looking toward the landing; the closed nursery door on the RIGHT wall. The tall man in olive at the door, one hand braced on the doorframe, the other on the handle; the very tall woman with locs beside him, palm flat on the door; several steps further toward the landing, the huge bearded man holding the small glowing monitor angled toward himself and the others.',
    people: [
      { id: 'elias', view: 'profileR', where: 'at the closed nursery door on the right wall', doing: 'one hand braced on the doorframe, the other on the handle' },
      { id: 'naomi', view: 'profileR', where: 'beside him at the door, nearest the camera', doing: 'palm flat on the door' },
      { id: 'owen', view: 'front34', where: 'several steps further toward the landing, beyond the other two, facing them and the camera side', doing: 'holding the small glowing monitor angled toward himself, eyes on its screen', hands: 'both hands hold the small glowing monitor at chest height, screen toward himself' },
    ],
    kf: {
      mode: 'generate',
      uploads: [up('KF_SH35.png', 'the corridor angle and night light'), sheet('elias'), sheet('naomi'), sheet('owen'), up('PROP_MONITOR.png', 'the monitor he holds')],
      frame: 'Helpless, focused, nobody speaking.',
      saveAs: 'KF_SH48.png',
    },
    video: {
      camera: 'Static.',
      setting: 'The upper corridor at night, at the closed nursery door.',
      beats: [
        { t: [0, 1.5], text: `${Cap('elias')} tests the locked handle once more; it does not move; he stops pulling.` },
        { t: [1.5, 3], text: `He puts his ear close to the door, eyes shut, listening; ${D('naomi')} keeps her palm flat on the wood in front of where the woman inside is standing.` },
        { t: [3, 5], text: `${Cap('owen')} watches the monitor screen, face serious. No one speaks.` },
      ],
      stays: [STAY_PEOPLE, 'The door stays shut.'],
    },
    order: 5,
    edit: 4,
    sound: 'off',
    audio: 'Muffled Clara breathing through the door. Distant fast footsteps from the service stair.',
  },

  // ======================= M — STAIR TURN ==================================
  {
    id: 'SH49',
    section: 'M',
    covers: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9'],
    title: 'Mara rounds the middle turn without stopping; her flashlight catches the next flight; the lower door is not visible yet.',
    cam: 'cinematic',
    location: 'LOC_STAIR_LOWER_NIGHT.png',
    time: 'night',
    lens: '24mm',
    size: 'MWS',
    setup: 'STAIR-TURN looking down',
    blocking:
      'On the middle-turn landing at night, camera at shoulder height looking DOWN the lower flight (handrail on frame-LEFT; the upper flight comes in from frame-RIGHT). The small woman in rust is entering frame from the right mid-stride, coming off the upper flight, flashlight beam sweeping down the lower steps. The bottom of the flight is black; no door visible.',
    people: [
      { id: 'mara', view: 'back34', where: 'entering the turn landing from frame-RIGHT, coming off the upper flight', doing: 'mid-stride, turning to run down the lower flight, flashlight beam sweeping down the steps', hands: 'flashlight in her right hand, beam visible on the lower steps; left hand free' },
    ],
    check: ['Handrail on frame-LEFT; the bottom of the stair is black — no door visible'],
    kf: {
      mode: 'generate',
      uploads: [up('LOC_STAIR_LOWER_NIGHT.png', 'the turn and lower flight at night — keep, never flip'), sheet('mara')],
      frame: 'Moving fast; the flashlight is the main light on the steps.',
      saveAs: 'KF_SH49.png',
    },
    video: {
      camera: 'Stabilized camera on the turn landing, panning to follow her down.',
      setting: 'The middle turn of a narrow back stair at night.',
      beats: [
        { t: [0, 1.5], text: `${Cap('mara')} comes off the upper flight and rounds the turn without stopping.` },
        { t: [1.5, 3], text: 'Her flashlight beam catches the next flight of steps descending below her.' },
        { t: [3, 5], text: 'She keeps running down, away from camera, into the dark; the bottom of the stair stays black.' },
      ],
      stays: ['No door, board or anything else appears below.', 'The handrail stays on the left.', STAY_PEOPLE],
    },
    order: 5,
    edit: 4,
    sound: 'off',
    audio: 'Fast footsteps, controlled breath, radio shifting on her clothing.',
  },

  // ======================= N — DOOR BEAT 2 =================================
  {
    id: 'SH50',
    section: 'N',
    covers: ['N1', 'N2', 'N3', 'N4', 'N5'],
    title: 'Elias hears Clara’s breathing worsen and looks at Naomi; Naomi’s eyes on the wood; Owen glances at the monitor, then toward the service door.',
    cam: 'tripod',
    location: 'LOC_CORRIDOR_REV_NIGHT.png',
    time: 'night',
    lens: '35mm',
    size: 'MWS',
    setup: 'COR-REV night',
    blocking: 'Same corridor angle as SH48, same positions: the tall man and the woman with locs at the closed door; the huge bearded man with the monitor several steps behind them toward the landing, the upper service door visible at the far end.',
    people: [
      { id: 'elias', view: 'profileR', where: 'at the closed nursery door, ear near the wood', doing: 'listening' },
      { id: 'naomi', view: 'profileR', where: 'beside him, nearest the camera', doing: 'palm flat on the door, eyes on the wood' },
      { id: 'owen', view: 'front34', where: 'several steps further toward the landing', doing: 'holding the glowing monitor', hands: 'both hands hold the glowing monitor at chest height' },
    ],
    kf: {
      mode: 'plate',
      uploads: [up('KF_SH48.png', 'start frame as is')],
      frame: 'Reuse KF_SH48 as the start frame.',
      saveAs: 'KF_SH48.png',
    },
    video: {
      camera: 'Static.',
      setting: 'The upper corridor at night.',
      beats: [
        { t: [0, 1], text: `${Cap('elias')} hears the breathing inside get worse and looks at ${D('naomi')}.` },
        { t: [1, 2], text: 'She keeps her palm on the door and her eyes fixed on the wood, as if the woman inside can see her through it.' },
        { t: [2, 3], text: `${Cap('owen')} glances down at the monitor, then over his shoulder toward the service door at the landing, waiting. No one speaks.` },
      ],
      stays: [STAY_PEOPLE],
    },
    order: 3,
    edit: 2.5,
    sound: 'off',
    audio: 'Clara’s worsening muffled breath through the door.',
  },

  // ======================= O — FINAL CLIFF =================================
  {
    id: 'SH51',
    section: 'O',
    covers: ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'O11', 'O12', 'O13'],
    title: 'FINAL CLIFF: full locked NURSERY FIXED wide. The Woman exactly one body length behind, unmoved. Mark dark. Clara’s inhale fails halfway. HARD CUT TO BLACK.',
    cam: 'fixed-nursery',
    location: 'LOC_NURSERY_FIXED_NIGHT.png',
    time: 'night',
    lens: 'NURSERY FIXED locked wide',
    size: 'WS',
    setup: 'NUR-FIXED',
    blocking: `${MAPS.nursery.text} The copper-haired woman exactly where she was. The Woman is the SAME still P3 layer as SH47, untouched.`,
    people: [
      { id: 'clara', view: 'back34', where: 'exactly where she was, at the closed door in the lower-left, facing it', doing: 'right hand hooked at her throat, chin dragged up and back, left hand splayed on the door beside the handle, knees starting to bend; three-quarter rear from above: her right cheek, jaw and the right side of her throat face the camera' },
    ],
    check: ['Frame matches SH47 exactly except pose and dark mark', 'No figure in the room'],
    kf: {
      mode: 'edit',
      uploads: [up('KF_SH47.png', 'the exact frame — change only what is listed'), up('MARK_STAGES.png', 'use the RIGHT panel (dark bruised band)')],
      frame:
        'Edit the uploaded high-corner night frame of the woman at the door; keep the camera, room, lamp light and her position exactly unchanged. Change only: the mark on her throat is now a dark red bruised band, clearly visible on the right side of her neck (right panel of the throat reference); her right hand is hooked at her own throat; her chin is dragged up and back, neck stretched; her left hand is splayed on the door beside the handle; her knees are just starting to bend; her eyes stay on the door.',
      keep: ['her exact position at the door', 'everything else in the frame'],
      saveAs: 'KF_SH51.png',
    },
    woman: {
      file: 'KF_SH47_W.png',
      position: 'P3',
    },
    video: {
      camera: 'Fixed high-corner security camera, completely static.',
      setting: 'The nursery at night, one small lamp on the right.',
      beats: [
        { t: [0, 1.5], text: `${Cap('clara')} tries to take one full inhale.` },
        { t: [1.5, 2.5], text: 'It fails halfway in a silent, strangled catch.' },
        { t: [2.5, 4], text: 'Her shoulders lift involuntarily; one hand presses hard at her throat; the other reaches for the door beside the handle for balance, fingers catching at the paint; her knees start to give.' },
        { t: [4, 5], text: 'Her eyes stay on the door.' },
      ],
      stays: [STAY_LOCKED, STAY_NO_TURN, STAY_FACES_ONLY_MOVE, 'No screaming.', STAY_PEOPLE],
    },
    order: 5,
    edit: 4,
    sound: 'off',
    audio: 'Breath only. HARD CUT TO BLACK on the failed breath; cut all sound on black. No cut back to Mara: she is still on the route.',
    post: 'Same P3 layer as SH47, untouched (the Woman has not moved during the crosscuts).',
  },
];

export const visibleOf = (s: Shot): CharId[] => s.people.map((p) => p.id);

export const SHOT_BY_ID: Record<string, Shot> = Object.fromEntries(SHOTS.map((s) => [s.id, s]));
