// THE HAUNTED CREW — Episode 1 "Answer the Bell, Part 1".
// Verbatim transcription of the locked Notion script. Source of truth #1:
// nothing here is cut, merged, reordered or paraphrased. Every beat id must be
// covered by a shot (see shots.ts); the QA suite enforces it.

import type { CharId } from './characters';

export type BeatKind =
  | 'action'
  | 'line' // on-screen or off-screen dialogue
  | 'vo' // host voice-over (clip generated silent)
  | 'lowerThird'
  | 'sound'
  | 'transition';

export interface ScriptBeat {
  id: string;
  kind: BeatKind;
  /** Exact script wording of the beat. */
  text: string;
  speaker?: CharId;
  /** Exact spoken words, for 'line' and 'vo' beats. */
  line?: string;
  /** Delivery note from the script, e.g. "dry, still tightening the same mount". */
  delivery?: string;
  /** Line is heard from off-screen (O.S.) in the shot the script assigns it to. */
  offScreen?: boolean;
}

export interface ScriptSection {
  id: string;
  time: string;
  heading: string;
  beats: ScriptBeat[];
}

export const SCRIPT_META = {
  title: 'THE HAUNTED CREW — Episode 1 “Answer the Bell, Part 1”',
  format: 'Vertical 9:16 scripted paranormal reality show',
  target: 'approximately 2:30–2:50',
  expected: 'approximately 2:38–2:45',
  url: 'https://pentagonal-lifeboat-bdc.notion.site/Script-3e211ef9fac180939e7ed2840dc556a6',
  bibleUrl: 'https://pentagonal-lifeboat-bdc.notion.site/Bible-3e211ef9fac180c2a946e2a6e82d45a8',
};

export const SCRIPT: ScriptSection[] = [
  {
    id: 'A',
    time: '0:00–0:05',
    heading: 'NURSERY — NIGHT / CROPPED NURSERY FIXED FLASH-FORWARD',
    beats: [
      { id: 'A1', kind: 'action', text: 'Open immediately on a tight crop from NURSERY FIXED. Do not show the full room geography.' },
      { id: 'A2', kind: 'action', text: 'IN FRAME: Clara’s lower face, throat, one hand, and part of her shoulder. At the edge of frame behind her, show only a dark slice of the Veiled Woman’s dress and veil.' },
      { id: 'A3', kind: 'action', text: 'A faint pressure mark is forming across Clara’s throat.' },
      { id: 'A4', kind: 'action', text: 'Clara presses two fingers to the mark.' },
      { id: 'A5', kind: 'action', text: 'She tries to inhale. The breath stops halfway.' },
      { id: 'A6', kind: 'action', text: 'Do not reveal how close the Woman is.' },
      { id: 'A7', kind: 'transition', text: 'HARD CUT from Clara’s broken breath to bright daylight outside Bellweather Manor.' },
      { id: 'A8', kind: 'sound', text: 'SOUND: Clara’s interrupted inhale only. No ghost sound. Bright exterior ambience replaces the nursery room tone on the cut.' },
    ],
  },
  {
    id: 'B',
    time: '0:05–0:25',
    heading: 'BELLWEATHER MANOR — EXTERIOR TO ENTRANCE / CINEMATIC + HANDHELD',
    beats: [
      { id: 'B1', kind: 'action', text: 'Bright late-afternoon vertical wide: pale stone manor, tall windows, green grounds, gravel drive. The property looks elegant and inviting, not ruined.' },
      { id: 'B2', kind: 'action', text: 'The crew is already unloading equipment. Nobody stops for introductions. Each lower-third appears once while that person works.' },
      { id: 'B3', kind: 'action', text: 'Elias walks toward the house carrying the handheld investigation camera at chest height.' },
      { id: 'B4', kind: 'lowerThird', text: 'ELIAS VALE — FIELD LEAD / HOST' },
      { id: 'B5', kind: 'vo', speaker: 'elias', delivery: 'clear, confident, conversational', text: 'ELIAS (V.O.) — clear, confident, conversational: “We’re The Haunted Crew. We spend the night inside places people say are haunted.”', line: 'We’re The Haunted Crew. We spend the night inside places people say are haunted.' },
      { id: 'B6', kind: 'action', text: 'CUT to Mara lifting a compact fixed-camera case from the vehicle and checking the latch while walking toward the entrance.' },
      { id: 'B7', kind: 'lowerThird', text: 'MARA CHEN — CAMERA & SYSTEMS' },
      { id: 'B8', kind: 'vo', speaker: 'elias', delivery: 'clear, confident, conversational', text: 'ELIAS (V.O.): “We use cameras throughout the property, because sometimes they catch what the people inside miss.”', line: 'We use cameras throughout the property, because sometimes they catch what the people inside miss.' },
      { id: 'B9', kind: 'action', text: 'CUT to Naomi already walking beside Clara toward the front door. Clara gestures toward an upstairs window while Naomi listens.' },
      { id: 'B10', kind: 'lowerThird', text: 'NAOMI BROOKS — EVIDENCE & INTERVIEWS' },
      { id: 'B11', kind: 'action', text: 'CUT to Owen carrying the heavier equipment case through the entrance. He checks an old service door with his free hand without slowing down.' },
      { id: 'B12', kind: 'lowerThird', text: 'OWEN REYES — SAFETY & LOGISTICS' },
      { id: 'B13', kind: 'vo', speaker: 'elias', delivery: 'clear, confident, conversational', text: 'ELIAS (V.O.): “Tonight we’re at Bellweather Manor. Its old servant-bell system was disconnected years ago. Clara says it still rings by itself.”', line: 'Tonight we’re at Bellweather Manor. Its old servant-bell system was disconnected years ago. Clara says it still rings by itself.' },
      { id: 'B14', kind: 'action', text: 'Elias crosses the bright entrance hall with the handheld camera and briefly frames the central stair.' },
      { id: 'B15', kind: 'action', text: 'Naomi and Clara continue upstairs together.' },
      { id: 'B16', kind: 'action', text: 'Mara and Owen carry the equipment in behind them.' },
      { id: 'B17', kind: 'sound', text: 'SOUND: Gravel, case handles, footsteps, front-door movement. A light investigative music bed supports the host VO, then falls away as Naomi and Clara reach the upper floor.' },
      { id: 'B18', kind: 'transition', text: 'TRANSITION: Follow Naomi and Clara upstairs in the same movement.' },
    ],
  },
  {
    id: 'C',
    time: '0:25–0:40',
    heading: 'UPPER HALL → NURSERY CORRIDOR — DAY / CINEMATIC',
    beats: [
      { id: 'C1', kind: 'action', text: 'Naomi and Clara walk side by side along the bright upper corridor. They do not stop for an interview.' },
      { id: 'C2', kind: 'action', text: 'As they reach the open nursery door, Clara slows enough to look inside.' },
      { id: 'C3', kind: 'action', text: 'Through the doorway, show the room in one clean view: simple child bed, low chest, archival box. No horror props.' },
      { id: 'C4', kind: 'line', speaker: 'naomi', delivery: 'while still walking, eyes on Clara', text: 'NAOMI — while still walking, eyes on Clara: “This is the room?”', line: 'This is the room?' },
      { id: 'C5', kind: 'action', text: 'Clara looks through the doorway but keeps moving past it.' },
      { id: 'C6', kind: 'line', speaker: 'clara', delivery: 'controlled, direct', text: 'CLARA — controlled, direct: “My mother said, ‘If the nursery bell rings, do not enter.’ I didn’t believe her.”', line: 'My mother said, ‘If the nursery bell rings, do not enter.’ I didn’t believe her.' },
      { id: 'C7', kind: 'action', text: 'Clara looks back once at the archival box.' },
      { id: 'C8', kind: 'line', speaker: 'clara', delivery: 'quieter, still walking', text: 'CLARA — quieter, still walking: “Her last letter is in that box. I never opened it. The room gets cleared tomorrow.”', line: 'Her last letter is in that box. I never opened it. The room gets cleared tomorrow.' },
      { id: 'C9', kind: 'action', text: 'Naomi follows Clara’s glance to the box, then keeps pace beside her. She does not stop Clara or ask another question.' },
      { id: 'C10', kind: 'sound', text: 'SOUND: Daytime house ambience, soft footsteps, distant equipment movement.' },
      { id: 'C11', kind: 'transition', text: 'TRANSITION: As Clara and Naomi move out of frame, Mara enters the nursery carrying NURSERY FIXED. Elias follows with the handheld. Owen and Naomi continue working nearby, keeping the setup in one connected flow.' },
    ],
  },
  {
    id: 'D',
    time: '0:40–1:05',
    heading: 'NURSERY → SERVICE HALL → BACK SERVICE STAIR → CENTRAL LANDING / HANDHELD + CINEMATIC',
    beats: [
      { id: 'D1', kind: 'action', text: 'HANDHELD from Elias at the nursery doorway: Mara mounts NURSERY FIXED in the high corner.' },
      { id: 'D2', kind: 'action', text: 'She uses one stable bracket and tightens it while the camera preview clearly shows the nursery door, the archival box, and open depth behind Clara’s future position.' },
      { id: 'D3', kind: 'action', text: 'Owen passes the doorway carrying BELL BOARD FIXED and his small tool pouch. Naomi crosses the corridor behind him with her recorder.' },
      { id: 'D4', kind: 'line', speaker: 'elias', delivery: 'light, familiar, watching Mara work', text: 'ELIAS — light, familiar, watching Mara work: “Very polite house so far.”', line: 'Very polite house so far.' },
      { id: 'D5', kind: 'line', speaker: 'mara', delivery: 'dry, still tightening the same mount', text: 'MARA — dry, still tightening the same mount: “You’ve been here twenty minutes.”', line: 'You’ve been here twenty minutes.' },
      { id: 'D6', kind: 'action', text: 'Owen keeps walking past the doorway without turning around.' },
      { id: 'D7', kind: 'line', speaker: 'owen', delivery: '', text: 'OWEN: “That’s usually enough for him.”', line: 'That’s usually enough for him.' },
      { id: 'D8', kind: 'action', text: 'Naomi gives Elias one knowing smile while continuing her task.' },
      { id: 'D9', kind: 'action', text: 'Elias grins once, then immediately follows Owen.' },
      { id: 'D10', kind: 'action', text: 'Mara finishes the nursery mount, lifts the small monitor case, and follows. Nobody stops working for the joke.' },
      { id: 'D11', kind: 'action', text: 'KEEP THE MOVEMENT CONTINUOUS: Owen leads Elias, Mara, and Naomi down the public-side steps and into the ground-floor service hall. Do not cut to another unrelated room.' },
      { id: 'D12', kind: 'action', text: 'At the antique servant-bell board, Owen sets the tool pouch down and opens the lower wooden panel.' },
      { id: 'D13', kind: 'action', text: 'One clean handheld view shows old wiring physically cut and disconnected. Do not add a second wiring insert.' },
      { id: 'D14', kind: 'action', text: 'Owen closes the panel.' },
      { id: 'D15', kind: 'action', text: 'Beside him, Mara places BELL BOARD FIXED on a simple clamp position facing the board. She tightens it while Owen demonstrates the brass flag.' },
      { id: 'D16', kind: 'action', text: 'Owen manually lowers the NURSERY flag, holds it down for one beat so the label is readable, then returns it to neutral by hand.' },
      { id: 'D17', kind: 'line', speaker: 'owen', delivery: 'practical, looking at the mechanism rather than presenting to camera', text: 'OWEN — practical, looking at the mechanism rather than presenting to camera: “The wiring’s dead. The flags still reset by hand.”', line: 'The wiring’s dead. The flags still reset by hand.' },
      { id: 'D18', kind: 'action', text: 'Owen picks up the tool pouch and immediately opens the lower service door beside the bell board.' },
      { id: 'D19', kind: 'action', text: 'Elias keeps the handheld on Owen and follows.' },
      { id: 'D20', kind: 'action', text: 'Mara follows with the monitor case. Naomi follows behind her.' },
      { id: 'D21', kind: 'action', text: 'Owen enters the narrow back service stair and climbs at a normal quick walking pace. Show enough of the stair to make the geography readable: lower door behind them, one turn, then the stair continuing upward.' },
      { id: 'D22', kind: 'action', text: 'Owen reaches the top and opens the upper service door.' },
      { id: 'D23', kind: 'action', text: 'He steps directly onto the central landing.' },
      { id: 'D24', kind: 'action', text: 'The monitor table is immediately beside this upper service door.' },
      { id: 'D25', kind: 'line', speaker: 'owen', delivery: 'as he exits the stair and points back through the open door', text: 'OWEN — as he exits the stair and points back through the open door: “Straight back to the board.”', line: 'Straight back to the board.' },
      { id: 'D26', kind: 'action', text: 'Mara sets the small monitor case on the table beside the upper service door and opens it.' },
      { id: 'D27', kind: 'action', text: 'NURSERY FIXED is already live. BELL BOARD FIXED comes live beside it.' },
      { id: 'D28', kind: 'action', text: 'Owen stands next to the monitor, physically completing the route the audience has just followed.' },
      { id: 'D29', kind: 'action', text: 'Mara checks both feeds once. No extended technical sequence.' },
      { id: 'D30', kind: 'sound', text: 'SOUND: Camera bracket clicks, wood panel opening, one dry brass reset click, footsteps changing from service hall to stair, service doors opening and closing. Keep the pace practical and readable.' },
      { id: 'D31', kind: 'transition', text: 'TRANSITION: Hold on the working two-feed monitor in daylight. MATCH CUT to the same monitor position after dark.' },
    ],
  },
  {
    id: 'E',
    time: '1:05–1:10',
    heading: 'CENTRAL LANDING — DAY TO NIGHT / MATCH CUT + CINEMATIC + MONITOR',
    beats: [
      { id: 'E1', kind: 'action', text: 'MATCH CUT from the daylight monitor to the exact same monitor position at night.' },
      { id: 'E2', kind: 'action', text: 'The warm practical lamp beside it is now on. Beyond the landing windows, the exterior is dark.' },
      { id: 'E3', kind: 'action', text: 'NURSERY FIXED shows the empty nursery. BELL BOARD FIXED shows the still board.' },
      { id: 'E4', kind: 'action', text: 'Elias crosses into frame with the handheld camera lowered.' },
      { id: 'E5', kind: 'line', speaker: 'elias', delivery: 'quiet, marking the overnight start', text: 'ELIAS — quiet, marking the overnight start: “All right. We’re live for the night.”', line: 'All right. We’re live for the night.' },
      { id: 'E6', kind: 'action', text: 'Before anyone answers, the mechanical servant bell rings sharply.' },
      { id: 'E7', kind: 'sound', text: 'SOUND: Quiet night room tone, then one clean metallic servant-bell ring.' },
      { id: 'E8', kind: 'transition', text: 'TRANSITION: Cut directly on the bell to BELL BOARD FIXED.' },
    ],
  },
  {
    id: 'F',
    time: '1:10–1:23',
    heading: 'CENTRAL LANDING + BELL BOARD + NURSERY CORRIDOR — FIXED CAMERA + MONITOR + CINEMATIC',
    beats: [
      { id: 'F1', kind: 'action', text: 'BELL BOARD FIXED fills the screen. No person is touching the board.' },
      { id: 'F2', kind: 'action', text: 'The NURSERY brass flag drops by itself.' },
      { id: 'F3', kind: 'action', text: 'Hold only long enough for NURSERY to be readable.' },
      { id: 'F4', kind: 'action', text: 'CUT to Mara and Owen at the monitor station. Both lean toward the board feed.' },
      { id: 'F5', kind: 'line', speaker: 'mara', delivery: 'low, factual', text: 'MARA — low, factual: “Nursery.”', line: 'Nursery.' },
      { id: 'F6', kind: 'action', text: 'CUT to Clara in the upper corridor. She has already turned toward the nursery.' },
      { id: 'F7', kind: 'action', text: 'Her shoulders tighten and her hands go still.' },
      { id: 'F8', kind: 'line', speaker: 'clara', delivery: 'recognizing the exact warning', text: 'CLARA — recognizing the exact warning: “That’s what she said.”', line: 'That’s what she said.' },
      { id: 'F9', kind: 'action', text: 'Naomi moves beside Clara.' },
      { id: 'F10', kind: 'action', text: 'Elias approaches on Clara’s other side with the handheld camera lowered, giving her space.' },
      { id: 'F11', kind: 'line', speaker: 'elias', delivery: 'calm, direct', text: 'ELIAS — calm, direct: “You don’t have to go in.”', line: 'You don’t have to go in.' },
      { id: 'F12', kind: 'action', text: 'Clara looks through the open nursery doorway at the archival box.' },
      { id: 'F13', kind: 'action', text: 'She begins walking before she answers.' },
      { id: 'F14', kind: 'line', speaker: 'clara', delivery: 'steady while moving', text: 'CLARA — steady while moving: “If I’m ever opening that letter, it’s tonight.”', line: 'If I’m ever opening that letter, it’s tonight.' },
      { id: 'F15', kind: 'action', text: 'Elias walks beside her for two steps, then lets her lead.' },
      { id: 'F16', kind: 'action', text: 'Naomi follows one pace behind.' },
      { id: 'F17', kind: 'action', text: 'Mara and Owen remain at the monitor station.' },
      { id: 'F18', kind: 'transition', text: 'TRANSITION: Stay with Clara’s forward movement. Do not stop for another decision speech.' },
    ],
  },
  {
    id: 'G',
    time: '1:23–1:38',
    heading: 'NURSERY CORRIDOR → NURSERY THRESHOLD — CINEMATIC',
    beats: [
      { id: 'G1', kind: 'action', text: 'Clara continues toward the open nursery at a controlled pace.' },
      { id: 'G2', kind: 'action', text: 'The red recording light on NURSERY FIXED is visible inside the room.' },
      { id: 'G3', kind: 'action', text: 'She looks once toward the crew behind her, then back to her mother’s archival box.' },
      { id: 'G4', kind: 'action', text: 'Elias stops outside the threshold.' },
      { id: 'G5', kind: 'action', text: 'Naomi stops beside him.' },
      { id: 'G6', kind: 'action', text: 'Clara crosses into the nursery deliberately and takes two steps toward the low chest.' },
      { id: 'G7', kind: 'action', text: 'The nursery door suddenly slams shut behind her.' },
      { id: 'G8', kind: 'action', text: 'Elias immediately grabs the exterior handle and pulls once. It does not move.' },
      { id: 'G9', kind: 'action', text: 'Inside, Clara turns and tries the interior handle once. It also does not move.' },
      { id: 'G10', kind: 'line', speaker: 'clara', delivery: 'louder through the door, fear now present but controlled', text: 'CLARA — louder through the door, fear now present but controlled: “It’s locked.”', line: 'It’s locked.' },
      { id: 'G11', kind: 'line', speaker: 'elias', delivery: 'close to the door', offScreen: true, text: 'ELIAS — close to the door: “Stay near the door.”', line: 'Stay near the door.' },
      { id: 'G12', kind: 'action', text: 'Clara releases the handle and scans the room: bed, window, floor, archival box. Nothing appears unusual to her.' },
      { id: 'G13', kind: 'line', speaker: 'clara', delivery: '', text: 'CLARA: “I don’t see anything.”', line: 'I don’t see anything.' },
      { id: 'G14', kind: 'action', text: 'CUT to Owen at the monitor station.' },
      { id: 'G15', kind: 'action', text: 'He looks at NURSERY FIXED.' },
      { id: 'G16', kind: 'action', text: 'His casual expression disappears. His mouth closes and his shoulders become still.' },
      { id: 'G17', kind: 'action', text: 'Mara notices Owen’s face and turns to the same feed.' },
      { id: 'G18', kind: 'line', speaker: 'owen', delivery: 'quiet', text: 'OWEN — quiet: “Mara.”', line: 'Mara.' },
      { id: 'G19', kind: 'transition', text: 'TRANSITION: Cut directly from Owen and Mara’s reaction to the fixed nursery image they are seeing.' },
    ],
  },
  {
    id: 'H',
    time: '1:38–1:54',
    heading: 'NURSERY — FIRST REVEAL / NURSERY FIXED + NURSERY DOOR',
    beats: [
      { id: 'H1', kind: 'action', text: 'FIRST FULL NURSERY FIXED REVEAL. Use the exact locked wide established during setup.' },
      { id: 'H2', kind: 'action', text: 'IN FRAME: Clara stands near the closed door, facing it. The archival box is deeper in the room.' },
      { id: 'H3', kind: 'action', text: 'FAR behind Clara, the Veiled Woman stands perfectly still.' },
      { id: 'H4', kind: 'action', text: 'Clara cannot see her.' },
      { id: 'H5', kind: 'action', text: 'Do not show the Woman moving. Do not reveal her face.' },
      { id: 'H6', kind: 'line', speaker: 'owen', delivery: 'heard from the monitor station, voice lowered', offScreen: true, text: 'OWEN — heard from the monitor station, voice lowered: “There’s someone behind her.”', line: 'There’s someone behind her.' },
      { id: 'H7', kind: 'action', text: 'CUT to the corridor outside the nursery.' },
      { id: 'H8', kind: 'action', text: 'Elias looks from the locked door toward the monitor, then immediately back to Clara’s door.' },
      { id: 'H9', kind: 'action', text: 'Naomi moves close and places one palm flat against the wood so Clara has a clear point to orient toward.' },
      { id: 'H10', kind: 'line', speaker: 'naomi', delivery: 'warm, firm', text: 'NAOMI — warm, firm: “Clara, stay facing the door.”', line: 'Clara, stay facing the door.' },
      { id: 'H11', kind: 'action', text: 'Inside, Clara fixes her eyes on the door.' },
      { id: 'H12', kind: 'line', speaker: 'clara', delivery: '', text: 'CLARA: “Why?”', line: 'Why?' },
      { id: 'H13', kind: 'action', text: 'Naomi does not tell her what is behind her.' },
      { id: 'H14', kind: 'line', speaker: 'naomi', delivery: '', text: 'NAOMI: “Don’t turn around. Stay with my voice.”', line: 'Don’t turn around. Stay with my voice.' },
      { id: 'H15', kind: 'action', text: 'Clara obeys. Her hands stay low. Her breathing becomes slightly faster.' },
      { id: 'H16', kind: 'transition', text: 'TRANSITION: Cut briefly to Mara and Owen watching the feed, then return to the exact same NURSERY FIXED angle.' },
    ],
  },
  {
    id: 'I',
    time: '1:54–2:09',
    heading: 'NURSERY — SECOND REVEAL / NURSERY FIXED + MONITOR',
    beats: [
      { id: 'I1', kind: 'action', text: 'SECOND RETURN TO THE EXACT SAME NURSERY FIXED ANGLE.' },
      { id: 'I2', kind: 'action', text: 'Clara has not changed position.' },
      { id: 'I3', kind: 'action', text: 'The Veiled Woman is now visibly closer, roughly halfway between the original far position and Clara.' },
      { id: 'I4', kind: 'action', text: 'No movement into this position is shown.' },
      { id: 'I5', kind: 'action', text: 'A faint red pressure line begins across Clara’s throat.' },
      { id: 'I6', kind: 'action', text: 'Clara swallows. Her brow tightens.' },
      { id: 'I7', kind: 'action', text: 'Two fingers rise to the mark.' },
      { id: 'I8', kind: 'line', speaker: 'clara', delivery: 'confused, with a shorter breath under the words', text: 'CLARA — confused, with a shorter breath under the words: “My neck…”', line: 'My neck…' },
      { id: 'I9', kind: 'action', text: 'CUT to Naomi outside the nursery. She hears the change in Clara’s voice and presses her palm more firmly to the door.' },
      { id: 'I10', kind: 'line', speaker: 'naomi', delivery: '', text: 'NAOMI: “Stay with me.”', line: 'Stay with me.' },
      { id: 'I11', kind: 'action', text: 'CUT to Mara at the monitor.' },
      { id: 'I12', kind: 'action', text: 'Her eyes move from NURSERY FIXED to BELL BOARD FIXED beside it.' },
      { id: 'I13', kind: 'action', text: 'On BELL BOARD FIXED, the NURSERY flag is still down.' },
      { id: 'I14', kind: 'action', text: 'Mara looks back to Clara on the nursery feed, then immediately back to the down flag.' },
      { id: 'I15', kind: 'action', text: 'Recognition is fast and practical.' },
      { id: 'I16', kind: 'line', speaker: 'mara', delivery: 'low, immediate', text: 'MARA — low, immediate: “The flag.”', line: 'The flag.' },
      { id: 'I17', kind: 'action', text: 'Mara grabs her flashlight and radio from beside the monitor.' },
      { id: 'I18', kind: 'action', text: 'She is moving before Owen looks up.' },
      { id: 'I19', kind: 'action', text: 'She pushes through the upper service door beside the monitor and starts down the exact back stair established during setup.' },
      { id: 'I20', kind: 'action', text: 'As Mara disappears through the service door, Owen lifts the small battery-powered monitor from the table with both hands.' },
      { id: 'I21', kind: 'action', text: 'Owen carries the monitor toward the nursery door so Elias and Naomi can keep seeing NURSERY FIXED while Mara is away.' },
      { id: 'I22', kind: 'sound', text: 'SOUND: Clara’s shortening breath, quick equipment grab, service door opening, Mara’s first fast footsteps on the stair.' },
      { id: 'I23', kind: 'transition', text: 'TRANSITION: Follow Mara into the service route. From here to black, crosscut the rescue as an active countdown.' },
    ],
  },
  {
    id: 'J',
    time: '2:09–2:17',
    heading: 'BACK SERVICE STAIR / CINEMATIC FOLLOW',
    beats: [
      { id: 'J1', kind: 'action', text: 'Camera follows Mara from behind and slightly above shoulder level as she runs down the narrow back stair.' },
      { id: 'J2', kind: 'action', text: 'She keeps one hand free for the rail and carries the flashlight low in the other. Her radio is clipped at her body.' },
      { id: 'J3', kind: 'action', text: 'She does not stop or speak.' },
      { id: 'J4', kind: 'action', text: 'She takes the stair turn and continues down.' },
      { id: 'J5', kind: 'action', text: 'No supernatural obstacle appears.' },
      { id: 'J6', kind: 'sound', text: 'SOUND: Fast controlled footsteps, breath, radio against clothing.' },
      { id: 'J7', kind: 'transition', text: 'CUT TO: NURSERY FIXED.' },
    ],
  },
  {
    id: 'K',
    time: '2:17–2:23',
    heading: 'NURSERY — THIRD POSITION / NURSERY FIXED',
    beats: [
      { id: 'K1', kind: 'action', text: 'NURSERY FIXED, same locked wide.' },
      { id: 'K2', kind: 'action', text: 'Clara is still facing the door.' },
      { id: 'K3', kind: 'action', text: 'The Veiled Woman is now approximately ONE BODY LENGTH behind Clara.' },
      { id: 'K4', kind: 'action', text: 'This is the third and closest Woman position shown in Episode 1.' },
      { id: 'K5', kind: 'action', text: 'Do not show the Woman walking, reaching, or touching Clara.' },
      { id: 'K6', kind: 'action', text: 'Clara’s throat mark is darker than before.' },
      { id: 'K7', kind: 'action', text: 'She pulls in a short breath. It lands, but only barely.' },
      { id: 'K8', kind: 'action', text: 'Her shoulders rise.' },
      { id: 'K9', kind: 'action', text: 'One hand stays at her throat.' },
      { id: 'K10', kind: 'line', speaker: 'naomi', delivery: 'through the door, controlled', offScreen: true, text: 'NAOMI (O.S.) — through the door, controlled: “Clara. Stay with me.”', line: 'Clara. Stay with me.' },
      { id: 'K11', kind: 'action', text: 'Clara keeps her eyes on the door.' },
      { id: 'K12', kind: 'transition', text: 'CUT TO: the nursery corridor outside.' },
    ],
  },
  {
    id: 'L',
    time: '2:23–2:29',
    heading: 'NURSERY DOOR — CINEMATIC',
    beats: [
      { id: 'L1', kind: 'action', text: 'Elias braces one hand on the doorframe and tests the locked handle once more with the other. It still does not move.' },
      { id: 'L2', kind: 'action', text: 'He stops pulling instead of repeating the same action.' },
      { id: 'L3', kind: 'action', text: 'He puts his ear close to the door, listening to Clara’s breathing.' },
      { id: 'L4', kind: 'action', text: 'Naomi keeps her palm against the door directly in front of where Clara is standing inside.' },
      { id: 'L5', kind: 'action', text: 'Naomi does not add another explanation. Her job is to keep Clara oriented.' },
      { id: 'L6', kind: 'action', text: 'Owen stands several steps back with the monitor angled toward himself and the others, watching the Woman’s distance.' },
      { id: 'L7', kind: 'action', text: 'Owen’s face stays serious; he does not speak.' },
      { id: 'L8', kind: 'sound', text: 'SOUND: Muffled Clara breathing through the door. Distant fast footsteps from the service stair.' },
      { id: 'L9', kind: 'transition', text: 'CUT TO: Mara reaching the bottom of the route.' },
    ],
  },
  {
    id: 'M',
    time: '2:29–2:36',
    heading: 'BACK SERVICE STAIR — MIDDLE TURN / CINEMATIC FOLLOW',
    beats: [
      { id: 'M1', kind: 'action', text: 'Mara reaches the middle turn of the back service stair.' },
      { id: 'M2', kind: 'action', text: 'She rounds the turn without stopping.' },
      { id: 'M3', kind: 'action', text: 'Her flashlight catches the next flight of stairs descending below her.' },
      { id: 'M4', kind: 'action', text: 'The lower service door is not visible yet.' },
      { id: 'M5', kind: 'action', text: 'The servant-bell board is not visible.' },
      { id: 'M6', kind: 'action', text: 'Mara keeps running downward.' },
      { id: 'M7', kind: 'action', text: 'No supernatural obstacle appears.' },
      { id: 'M8', kind: 'sound', text: 'SOUND: Fast footsteps on the stair, Mara’s controlled breath, radio shifting against her clothing.' },
      { id: 'M9', kind: 'transition', text: 'CUT TO: nursery door for one short human beat.' },
    ],
  },
  {
    id: 'N',
    time: '2:36–2:39',
    heading: 'NURSERY DOOR — CINEMATIC',
    beats: [
      { id: 'N1', kind: 'action', text: 'Elias hears Clara’s breathing worsen and looks at Naomi.' },
      { id: 'N2', kind: 'action', text: 'Naomi keeps her palm on the door and her eyes fixed on the wood, as if Clara can see her through it.' },
      { id: 'N3', kind: 'action', text: 'No dialogue.' },
      { id: 'N4', kind: 'action', text: 'Owen glances down at the monitor, then toward the service-route door, waiting for Mara.' },
      { id: 'N5', kind: 'transition', text: 'CUT TO: full NURSERY FIXED wide.' },
    ],
  },
  {
    id: 'O',
    time: '2:39–2:44',
    heading: 'NURSERY — FINAL CLIFF / NURSERY FIXED',
    beats: [
      { id: 'O1', kind: 'action', text: 'Return to the full locked NURSERY FIXED wide.' },
      { id: 'O2', kind: 'action', text: 'Clara is still facing the door.' },
      { id: 'O3', kind: 'action', text: 'The Veiled Woman remains exactly one body length behind her.' },
      { id: 'O4', kind: 'action', text: 'She has not moved closer during the crosscuts.' },
      { id: 'O5', kind: 'action', text: 'Clara’s throat mark is dark and clearly visible.' },
      { id: 'O6', kind: 'action', text: 'Clara tries to take one full inhale.' },
      { id: 'O7', kind: 'action', text: 'The inhale fails halfway.' },
      { id: 'O8', kind: 'action', text: 'Her shoulders lift involuntarily.' },
      { id: 'O9', kind: 'action', text: 'One hand presses at her throat. The other reaches toward the locked door for balance.' },
      { id: 'O10', kind: 'action', text: 'The Veiled Woman remains completely still.' },
      { id: 'O11', kind: 'transition', text: 'HARD CUT TO BLACK on Clara’s failed breath.' },
      { id: 'O12', kind: 'action', text: 'Mara is still moving through the service route.' },
      { id: 'O13', kind: 'sound', text: 'Cut all sound on black.' },
    ],
  },
];

export const ALL_BEATS: ScriptBeat[] = SCRIPT.flatMap((s) => s.beats);
export const BEAT_INDEX: Record<string, number> = Object.fromEntries(ALL_BEATS.map((b, i) => [b.id, i]));
export const BEAT_BY_ID: Record<string, ScriptBeat> = Object.fromEntries(ALL_BEATS.map((b) => [b.id, b]));
export const SECTION_OF: Record<string, ScriptSection> = Object.fromEntries(
  SCRIPT.flatMap((s) => s.beats.map((b) => [b.id, s] as const)),
);
