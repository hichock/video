// Every image asset used anywhere: character sheets, location plates, props,
// overlays. Shot keyframes are registered from shots.ts. Upload references in
// prompts are generated from `ref`, never from file names.

import { CHARACTERS, LINEUP_PROMPT, type CharId } from './characters';

export type AssetKind = 'character' | 'lineup' | 'location' | 'prop' | 'overlay' | 'keyframe' | 'comp';

export interface Upload {
  file: string;
  job: string;
}

export interface Asset {
  file: string;
  kind: AssetKind;
  title: string;
  /** How a prompt describes this image when it is uploaded. */
  ref: string;
  prompt?: string;
  uploads?: Upload[];
  /** Built by editing this file (same camera and geometry). */
  editOf?: string;
  note?: string;
  group?: string;
  /** Approve the image only if all of these are true. */
  check?: string[];
}

// ---------------------------------------------------------------------------
// Locked maps. One per space. Every keyframe prompt for that space repeats it.
// ---------------------------------------------------------------------------

export const MAPS = {
  exterior: {
    title: 'Exterior — arrival',
    text: 'Master view: camera on the gravel looking straight at the pale limestone facade. Front door at the top of five wide stone steps, centre. The dark green SUV is parked on the gravel a few metres from the foot of the steps, slightly left of centre, nose toward the house, tailgate open on the side away from the house. Low warm late-afternoon sun from the LEFT of the master view, so in any reverse view (camera with its back to the house) the sun comes from the RIGHT. Owen and Mara unload at the tailgate. Elias, then Naomi and Clara, walk from the SUV to the front door: the house is always ahead of the person walking, the SUV behind them.',
  },
  hall: {
    title: 'Entrance hall',
    text: 'Seen from the front door: worn black-and-white stone floor, the wide central staircase straight ahead rising to the central landing, a plain panelled SERVICE DOOR on the RIGHT-hand wall (it leads to the ground-floor service hall), a tall window on the left wall laying one bar of low sun across the floor.',
  },
  serviceHall: {
    title: 'Service hall and bell board',
    text: 'Ground floor, reached through the hall service door. Facing the back wall: the antique mahogany servant-bell board with NURSERY readable in the middle row, a hinged lower wooden panel at knee height below it (the cut wiring is behind it), and the narrow LOWER SERVICE DOOR immediately to the RIGHT of the board. Small high window on the left gives a cold shaft of light. BELL BOARD FIXED is clamped to the left of the board, slightly above it, facing it.',
  },
  stair: {
    title: 'Back service stair (never flip)',
    text: 'Lower service door (beside the board) → lower flight (about twelve steps) → small middle-turn landing with a small window → the stair doubles back → upper flight (about ten steps) → upper service door onto the central landing. Handrail: on the CLIMBER’S RIGHT and the DESCENDER’S LEFT on both flights. Climbing, the turn goes to the LEFT; descending, the turn goes to the RIGHT. Seen from the turn landing looking down the lower flight, the handrail is on frame-left and the upper flight begins just off frame-right. Seen from the top looking down the upper flight, the handrail is on frame-left and the stair turns right at the landing.',
  },
  landing: {
    title: 'Central landing — monitor station',
    text: 'Top of the main staircase. Facing the panelled wall: the narrow UPPER SERVICE DOOR (opens away from the landing, into the stairwell); immediately to its LEFT the small wooden monitor table with a brass lamp; a tall landing window further left; a dust-sheeted chair by the table; the opening into the upper corridor on the RIGHT edge. Monitor layout, always: LEFT screen = NURSERY FIXED, RIGHT screen = BELL BOARD FIXED.',
  },
  corridor: {
    title: 'Upper corridor',
    text: 'Runs straight from the central landing to a tall window at the far end. Walking from the landing toward the far window, the NURSERY DOOR is on the LEFT wall about four metres from the landing; it is a white panelled door that opens INTO the nursery. At night one warm wall sconce is lit between the landing and the nursery door. From the nursery door you can see the landing, the monitor table and the upper service door down the corridor.',
  },
  nursery: {
    title: 'Nursery (NURSERY FIXED geometry)',
    text: 'NURSERY FIXED is mounted about 2.6 m high in the corner where the WINDOW WALL meets the RIGHT-HAND WALL; the window is behind the camera; it looks diagonally across and down the room at about 30°, very wide lens without fisheye. In its frame: the single white panelled door with a brass handle is on the LEFT-HAND wall near the camera end, fully visible in the LOWER-LEFT third, with a strip of bare floorboards in front of it. The room runs away up the frame: worn faded rug in the middle; low wooden chest on the rug at frame centre with the grey archival box on its lid; small side table with the practical lamp against the right-hand wall at mid-depth; white iron child’s bed against the far wall; dust-sheeted armchair in the far-LEFT corner; the far-RIGHT corner is empty bare floor. From the corridor looking in through the doorway, the camera and its red REC light are high in the far corner across the room, ahead-right, above the window. When the copper-haired woman stands at the door facing it, the camera sees her from behind her right shoulder in three-quarter rear view: her right cheek, jaw and the right side of her throat face the camera.',
  },
  veiled: {
    title: 'Veiled Woman positions (NURSERY FIXED only)',
    text: 'P1 FAR: standing in the empty far-right corner at the top of the frame, half swallowed by shadow but readable as a woman. P2 HALFWAY: standing on the rug to the right of the low chest, halfway between the far-right corner and the woman at the door. P3 ONE BODY LENGTH: standing one body length directly behind the woman’s back, just off the rug, same size as the woman in frame. Always the same still pose: facing the woman’s back, arms straight at her sides, veil over the face. The move between positions is never shown.',
  },
} as const;

// ---------------------------------------------------------------------------
// Style blocks.
// ---------------------------------------------------------------------------

export const LOOKS = {
  day: 'Bright, warm late-afternoon light, natural realistic colour, soft contrast. Elegant, inviting, lived-in-once. Photorealistic, cinema camera, shallow natural depth of field.',
  dayInterior:
    'Warm readable daylight. Elegant real English manor being cleared for sale: white dust sheets over furniture, removal boxes, pale rectangles where paintings hung, a stopped long-case clock. Not a ruin. No fog, no cobwebs, no candles, no horror props, no dolls. Photorealistic, cinema camera.',
  night:
    'Night. Dark by design but readable: one motivated warm practical far from the subject, everything else in deep soft shadow, faces and eyes still readable. Photorealistic, fine grain, cinema camera.',
  fixed:
    'Security-camera image: locked, very wide lens without fisheye, slightly high, slightly cold and desaturated, fine sensor noise, slight softness. No overlay, no text, no timestamp, no REC graphic.',
  handheld: 'Handheld investigation-camera footage: natural colour, slight softness, real operator sway. No overlay, no text.',
};

export const HYGIENE =
  'Vertical 9:16. Do not copy the grey studio backgrounds from the character sheets. No text, captions, labels, logos, watermarks or overlays in the image.';

// ---------------------------------------------------------------------------
// Assets.
// ---------------------------------------------------------------------------

const charAssets: Asset[] = (Object.keys(CHARACTERS) as CharId[]).map((id) => ({
  file: CHARACTERS[id].sheetFile,
  kind: 'character',
  title: `${CHARACTERS[id].name} — ${CHARACTERS[id].role}`,
  ref: CHARACTERS[id].sheetRef,
  prompt: CHARACTERS[id].sheetPrompt,
  group: 'Characters',
  note: 'Text only, no uploads. Reroll until the face is right; then never regenerate.',
}));

const STAIR_WALLS = 'close scuffed whitewashed walls with old handprints near the rail, a simple dark wooden handrail, worn dips in the treads';

export const ASSETS: Asset[] = [
  ...charAssets,
  {
    file: 'CH_LINEUP.png',
    kind: 'lineup',
    title: 'Height lineup',
    ref: 'the height lineup photo of the five people side by side',
    prompt: LINEUP_PROMPT,
    uploads: (['elias', 'owen', 'naomi', 'clara', 'mara'] as CharId[]).map((c) => ({ file: CHARACTERS[c].sheetFile, job: 'identity and full outfit' })),
    group: 'Characters',
    note: 'Upload with group keyframes when a slot is free, so heights stay right.',
  },

  // --- Props -------------------------------------------------------------
  {
    file: 'PROP_HANDHELD_CAM.png',
    kind: 'prop',
    title: 'Elias handheld camera',
    ref: 'the product photo of the battered compact black handheld cinema camera with a top handle, flip-out side monitor and faded stickers',
    prompt: 'Photorealistic product photo on a plain neutral grey surface, 50mm: a battered compact black handheld cinema camera with a top handle, a small flip-out side monitor, a small red REC light, and faded location stickers on its body. No text, no logos.',
    group: 'Props',
  },
  {
    file: 'PROP_FIXED_CAM.png',
    kind: 'prop',
    title: 'Fixed camera (NURSERY FIXED / BELL BOARD FIXED)',
    ref: 'the product photo of the compact black fixed camera with a small red REC light on a metal wall bracket and on a spring clamp',
    prompt: 'Photorealistic product photo on a plain neutral grey surface, 50mm: two identical compact black box cameras, each about the size of a fist with a small red REC light on the front and a tiny flip-out preview screen on the side. The left one is mounted on a small metal wall bracket with a ball head; the right one is on a simple black spring clamp. No text, no logos.',
    group: 'Props',
  },
  {
    file: 'PROP_MONITOR.png',
    kind: 'prop',
    title: 'Two-feed battery monitor',
    ref: 'the product photo of the small black hard-case field monitor with two screens side by side in the open lid',
    prompt: 'Photorealistic product photo on a plain neutral grey surface, 50mm: a small battery-powered field monitor built into a black hard case with a carry handle; the lid is open showing two 7-inch screens side by side under a short hinged sun hood, a few toggle switches and a small battery indicator below them. Screens switched off. No text, no logos.',
    group: 'Props',
  },
  {
    file: 'PROP_ARCHIVAL_BOX.png',
    kind: 'prop',
    title: 'Archival box',
    ref: 'the photo of the grey archival document box on a low wooden chest',
    prompt: 'Photorealistic photo, 50mm, soft daylight: a grey archival document box with its lid on, resting on a low worn wooden chest. Plain, no labels, no writing.',
    group: 'Props',
    note: 'The letter is never readable. The box stays closed in Ep 1.',
  },
  {
    file: 'MARK_STAGES.png',
    kind: 'prop',
    title: 'Throat mark stages',
    ref: 'the three-panel close-up of the copper-haired woman’s throat showing the pressure mark at three strengths',
    prompt: `Using ${CHARACTERS.clara.sheetRef}, same face, freckles, hair and ice-blue open-collar blouse: three close-ups side by side of her jaw and throat, identical framing and light, differing only in a thin horizontal pressure mark around the throat. LEFT: a faint thin red line. MIDDLE: a clearly visible darker red line. RIGHT: a dark red bruised band. No blood, no broken skin, no swelling, no deformation. Photorealistic skin. No text.`,
    uploads: [{ file: CHARACTERS.clara.sheetFile, job: 'her face, skin and blouse' }],
    group: 'Props',
    note: 'Faint: SH01 (script says “faint … forming”) and SH40. Middle: SH47. Dark: SH51. No mark before SH40.',
  },
  {
    file: 'FEED_OVERLAY_NURSERY.png',
    kind: 'overlay',
    title: 'Feed overlay — NURSERY FIXED',
    ref: 'overlay',
    prompt: 'Vertical 9:16 graphic on pure black: a clean, minimal camera-feed overlay for a documentary paranormal show, thin matte white elements, no glow. Top-left in small monospaced capitals on two lines: NURSERY FIXED / CAM 02. Top-right: a small solid red dot and the white word REC. Bottom-left: a monospaced timecode 23:41:07:12. Bottom-right: a tiny battery icon and 1080p 25fps. Thin white corner brackets inset from all four corners. Nothing else.',
    group: 'Post graphics',
    note: 'Edit only (screen blend). Keyframes and clips stay clean. Animate the timecode and blink the REC dot in the edit.',
  },
  {
    file: 'FEED_OVERLAY_BELLBOARD.png',
    kind: 'overlay',
    title: 'Feed overlay — BELL BOARD FIXED',
    ref: 'overlay',
    prompt: 'Same as FEED_OVERLAY_NURSERY but the top-left label reads BELL BOARD FIXED / CAM 03.',
    group: 'Post graphics',
  },

  // --- Exterior ----------------------------------------------------------
  {
    file: 'LOC_EXT_DAY.png',
    kind: 'location',
    title: 'Exterior master, late afternoon',
    ref: 'the daytime photo of the pale stone manor front with the dark green SUV on the gravel, tailgate open toward the camera',
    prompt: `Photorealistic location plate, vertical 9:16, no people. Late afternoon, bright warm sunlight. Camera at eye level on the gravel drive, 24mm, looking straight at the front of a large pale limestone three-storey English manor: tall sash windows, light ivy on one corner, a central front door at the top of five wide stone steps, clipped box hedges, mature green lawns and trees. On the gravel a few metres from the foot of the steps, slightly left of centre, a dark green SUV with its nose toward the house and its rear toward the camera, tailgate lifted open, black equipment cases inside. Low sun from the LEFT of frame throws long warm shadows to the right. A few upper windows have their inside shutters closed — the only hint that nobody lives here now. Elegant, inviting, well kept, realistic colour. No fog, no storm, no cemetery, no dead plants, no broken windows, no text.`,
    check: ['The SUV’s REAR faces the camera, nose toward the house, tailgate lifted open toward us — NOT parked side-on', 'The front door and steps are centre, a few metres beyond the SUV', 'Sun from frame-LEFT, shadows falling right', 'Bright and well kept: no weeds, no dead plants, no heavy ivy'],
    group: 'Exterior',
    note: MAPS.exterior.text,
  },
  {
    file: 'LOC_EXT_REV_DAY.png',
    kind: 'location',
    title: 'Exterior reverse (back to the house)',
    ref: 'the daytime photo looking out along the gravel drive from the foot of the manor steps, with the front of the dark green SUV a few metres ahead',
    prompt: 'Using the uploaded photo of the manor and the SUV for the gravel, lawns, trees, SUV and light: show the reverse view. Camera at chest height on the gravel near the foot of the front steps with its back to the house (the house is behind the camera and not visible), 35mm, looking out along the drive. The same dark green SUV is a few metres ahead with its FRONT toward the camera; its tailgate is open on the far side. The gravel drive curves away between green lawns and mature trees. Low warm sun now comes from the RIGHT of frame. No people, no text.',
    uploads: [{ file: 'LOC_EXT_DAY.png', job: 'same place, SUV, materials and light — reverse the view' }],
    check: ['The house is NOT in frame', 'The SUV is seen from its FRONT', 'Sun from frame-RIGHT'],
    group: 'Exterior',
  },

  // --- Hall / service hall --------------------------------------------
  {
    file: 'LOC_HALL_DAY.png',
    kind: 'location',
    title: 'Entrance hall, day',
    ref: 'the daytime photo of the entrance hall with the black-and-white floor, the central staircase and the plain service door on the right-hand wall',
    prompt: `Photorealistic location plate, vertical 9:16, no people. Camera just inside the open front door at eye level, 24mm, looking into the entrance hall of an old English manor: a worn black-and-white stone floor; a wide central staircase straight ahead with a dark wood banister rising to an upper landing; on the RIGHT-hand wall a plain panelled service door, closed, with a small brass knob; on the left wall a tall window laying one long warm bar of late sun across the floor. Furniture under white dust sheets, stacked cardboard removal boxes against a wall, pale rectangles where portraits used to hang, a tall long-case clock stopped. Warm, bright, elegant. ${LOOKS.dayInterior}`,
    check: ['The service door is on the RIGHT-hand wall', 'The central stair is straight ahead'],
    group: 'Hall & service side',
    note: MAPS.hall.text,
  },
  {
    file: 'LOC_BELLBOARD_DAY.png',
    kind: 'location',
    title: 'Service hall with bell board, day',
    ref: 'the daytime photo of the service hall with the antique mahogany servant-bell board, the lower wooden panel under it and the narrow service door to its right',
    prompt: `Photorealistic location plate, vertical 9:16, no people. Ground-floor service hall of an old English manor, camera at eye level, 35mm, facing the back wall: a mounted antique mahogany servant-bell board with rows of small glass windows, each with a small brass flag and a painted room label; the label NURSERY is clearly readable in the middle row; the brass is slightly tarnished; every flag is in the neutral up position. Below the board, at knee height, a hinged lower wooden panel, closed. Immediately to the RIGHT of the board, a narrow plain panelled service door, closed. Chipped whitewashed walls, worn stone floor, an old enamel sign, a small high window on the LEFT giving one cold shaft of daylight. ${LOOKS.dayInterior}`,
    check: ['NURSERY readable in the middle row', 'Lower wooden panel below the board', 'Narrow service door immediately RIGHT of the board'],
    group: 'Hall & service side',
    note: `${MAPS.serviceHall.text} Use a text-capable image model so NURSERY is readable; fix the label in post if needed.`,
  },
  {
    file: 'LOC_BELLBOARD_FIXED_DAY.png',
    kind: 'location',
    title: 'BELL BOARD FIXED view, day',
    ref: 'the locked camera view of the bell board in daylight',
    editOf: 'LOC_BELLBOARD_DAY.png',
    prompt: 'Edit the uploaded photo of the servant-bell board: reframe to a tight locked view that shows only the whole board, from slightly to the left of it and slightly above, as seen by a small camera clamped beside it. All brass flags in the neutral up position. NURSERY label sharp and readable in the middle row. Same daylight. Slightly cold, desaturated security-camera image, fine sensor noise. No people, no text overlay.',
    uploads: [{ file: 'LOC_BELLBOARD_DAY.png', job: 'the board itself: exact labels, brass and wood' }],
    group: 'Hall & service side',
    note: 'Used only as the day screen image on the monitor in SH24.',
  },
  {
    file: 'LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL.png',
    kind: 'location',
    title: 'BELL BOARD FIXED, night, flag neutral',
    ref: 'the locked night view of the bell board with every flag up',
    editOf: 'LOC_BELLBOARD_FIXED_DAY.png',
    prompt: 'Edit the uploaded locked view of the bell board: identical framing and geometry, nothing moved. Night: lit only by one bare warm bulb above the board; the walls around fall into darkness. Every brass flag in the neutral up position. NURSERY label readable. Slightly cold, desaturated security-camera image, fine sensor noise. No text overlay.',
    uploads: [{ file: 'LOC_BELLBOARD_FIXED_DAY.png', job: 'exact framing and board' }],
    group: 'Hall & service side',
    note: 'Start frame of SH26; right screen in SH25.',
  },
  {
    file: 'LOC_BELLBOARD_FIXED_NIGHT_DOWN.png',
    kind: 'location',
    title: 'BELL BOARD FIXED, night, NURSERY down',
    ref: 'the locked night view of the bell board with the NURSERY flag down',
    editOf: 'LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL.png',
    prompt: 'Edit the uploaded night view of the bell board: change ONLY the brass flag under the NURSERY label so it has dropped into the down position, showing its brass face in its little window. Nothing else changes — same framing, light, labels and every other flag.',
    uploads: [{ file: 'LOC_BELLBOARD_FIXED_NIGHT_NEUTRAL.png', job: 'everything except the NURSERY flag' }],
    group: 'Hall & service side',
    note: 'End frame of SH26; right screen in SH27, SH43, SH44.',
  },

  // --- Stair --------------------------------------------------------------
  {
    file: 'LOC_STAIR_LOWER_DAY.png',
    kind: 'location',
    title: 'Back stair, lower flight from the turn, day',
    ref: 'the daytime photo of the narrow back service stair seen from the middle-turn landing looking down the lower flight to the open lower door',
    prompt: `Photorealistic location plate, vertical 9:16, no people. The narrow wooden back service stair of an old English manor, seen from the small middle-turn landing, camera at chest height, 24mm, looking DOWN the lower flight: about twelve worn wooden steps between ${STAIR_WALLS}; the handrail runs along the wall on the LEFT of frame. At the bottom a plain panelled lower service door stands open onto a bright stone-floored service hall. Daylight from a small dusty window on the turn landing behind the camera. The stair doubles back here: the upper flight begins just off the RIGHT edge of frame, going up. ${LOOKS.dayInterior}`,
    check: ['Handrail on frame-LEFT', 'Open lower door at the bottom', 'The upper flight goes off frame-RIGHT'],
    group: 'Back stair',
    note: MAPS.stair.text,
  },
  {
    file: 'LOC_STAIR_UPPER_DAY.png',
    kind: 'location',
    title: 'Back stair, upper flight from the top, day',
    ref: 'the daytime photo of the narrow back stair seen from the top step looking down the upper flight to the turn',
    prompt: `Using the uploaded photo of the lower flight for walls, treads, handrail, colours and light: the same stair seen from the top step just inside the narrow upper service door, camera slightly above shoulder height, 24mm, looking DOWN the upper flight: about ten worn wooden steps between ${STAIR_WALLS}; the handrail on the wall on the LEFT of frame; at the bottom the small middle-turn landing with its small dusty window, where the stair turns to the RIGHT and continues down out of sight. No people, no text.`,
    uploads: [{ file: 'LOC_STAIR_LOWER_DAY.png', job: 'same stair: walls, treads, rail, window' }],
    check: ['Handrail on frame-LEFT', 'The stair turns RIGHT at the landing below'],
    group: 'Back stair',
    note: 'Handrail frame-left; turn goes right. Never flipped.',
  },
  {
    file: 'LOC_STAIR_UPPER_NIGHT.png',
    kind: 'location',
    title: 'Back stair, upper flight, night',
    ref: 'the night photo of the narrow back stair seen from the top looking down to the turn',
    editOf: 'LOC_STAIR_UPPER_DAY.png',
    prompt: 'Edit the uploaded photo of the upper flight of the narrow back stair: identical camera and geometry, nothing moved, handrail still on the left, turn still to the right. Night: the small window at the turn is black; one weak bare bulb high on the turn landing; the steps in deep but readable shadow. No people, no text.',
    uploads: [{ file: 'LOC_STAIR_UPPER_DAY.png', job: 'exact geometry' }],
    group: 'Back stair',
    note: 'Flashlight light comes from the clip, not the plate.',
  },
  {
    file: 'LOC_STAIR_LOWER_NIGHT.png',
    kind: 'location',
    title: 'Back stair, lower flight from the turn, night',
    ref: 'the night photo from the middle-turn landing looking down the lower flight into darkness',
    editOf: 'LOC_STAIR_LOWER_DAY.png',
    prompt: 'Edit the uploaded photo of the lower flight seen from the turn landing: identical camera and geometry, nothing moved, handrail still on the left. Night: the small window behind the camera is black; one weak bare bulb on the turn landing lights only the top few steps; the rest of the flight falls into darkness, so the bottom of the stair and the lower door are NOT visible. No people, no text.',
    uploads: [{ file: 'LOC_STAIR_LOWER_DAY.png', job: 'exact geometry' }],
    group: 'Back stair',
    note: 'Script 2:29: the lower service door is not visible yet.',
  },

  // --- Landing ------------------------------------------------------------
  {
    file: 'LOC_LANDING_DAY.png',
    kind: 'location',
    title: 'Central landing, monitor station, day (match-cut framing)',
    ref: 'the daytime photo of the upper landing with the narrow service door and the small wooden table immediately to its left',
    prompt: `Photorealistic location plate, vertical 9:16, no people. The central upper landing of an old English manor, camera on a tripod at eye level, 35mm, facing a dark panelled wall: in it a narrow plain panelled service door, closed; immediately to the LEFT of the door a small wooden side table with a brass table lamp (switched off) and nothing else on it; a dust-sheeted chair beside the table; further left a tall landing window with thin pale daylight; on the right edge of frame the opening into an upper corridor. ${LOOKS.dayInterior}`,
    check: ['Service door with the table immediately to its LEFT', 'Table empty except the lamp (switched off)', 'Corridor opening at the right edge'],
    group: 'Landing',
    note: `${MAPS.landing.text} This exact framing is the match cut in SH24 → SH25.`,
  },
  {
    file: 'LOC_LANDING_NIGHT.png',
    kind: 'location',
    title: 'Central landing, night (edit)',
    ref: 'the night photo of the upper landing with the lamp on and the open two-screen monitor case on the small table beside the service door',
    editOf: 'LOC_LANDING_DAY.png',
    prompt: 'Edit the uploaded photo of the landing: identical framing and geometry, nothing moved. Night: the landing window is black-blue; the brass table lamp is ON, making a warm pool on the table and the panelled wall; the rest falls into deep but readable shadow. The dust sheet is gone from the chair at the left end of the table. On the table, beside the lamp, the small black hard-case field monitor from the product photo stands open, angled toward that chair so both screens are also partly visible to the camera, both glowing flat grey. The service door stays closed. No people, no text.',
    uploads: [
      { file: 'LOC_LANDING_DAY.png', job: 'exact framing and room' },
      { file: 'PROP_MONITOR.png', job: 'what the open monitor case looks like' },
    ],
    group: 'Landing',
    note: 'Screens stay blank grey in every generation; they are replaced in post.',
  },

  // --- Corridor -------------------------------------------------------------
  {
    file: 'LOC_CORRIDOR_DAY.png',
    kind: 'location',
    title: 'Upper corridor from the landing end, day',
    ref: 'the daytime photo of the upper corridor seen from the landing end, with the white nursery door standing open on the left',
    prompt: `Photorealistic location plate, vertical 9:16, no people. Camera at the landing end of a long upper corridor of an old English manor, eye level, 35mm, looking straight down it to a tall window at the far end: faded patterned wallpaper, dark wood floor with a worn runner, a row of closed doors on the right; on the LEFT wall about four metres from camera a white panelled door stands wide open into its room (it opens inward), showing a sliver of a small child’s room. A small table under a dust sheet against the right wall. Warm daylight from the far window. ${LOOKS.dayInterior}`,
    check: ['Nursery door open on the LEFT wall, about four metres in'],
    group: 'Corridor',
    note: MAPS.corridor.text,
  },
  {
    file: 'LOC_CORRIDOR_REV_DAY.png',
    kind: 'location',
    title: 'Upper corridor looking back to the landing, day',
    ref: 'the daytime photo of the upper corridor seen from the far window end looking back to the landing, with the white nursery door open on the right',
    prompt: 'Using the uploaded corridor photo for wallpaper, floor, runner, doors and light, and the uploaded landing photo for what is at the end: the reverse view. Camera near the far window end at eye level, 35mm, looking back up the corridor toward the central landing: at the end, the top of the main staircase banister, the narrow panelled service door with the small wooden table and brass lamp immediately to its left. The same white nursery door now stands open on the RIGHT wall, about four metres before the landing. Daylight from behind the camera. No people, no text.',
    uploads: [
      { file: 'LOC_CORRIDOR_DAY.png', job: 'corridor materials, the nursery door' },
      { file: 'LOC_LANDING_DAY.png', job: 'what the landing at the end looks like' },
    ],
    check: ['Nursery door open on the RIGHT wall', 'The landing with the table and service door visible at the far end'],
    group: 'Corridor',
  },
  {
    file: 'LOC_CORRIDOR_NIGHT.png',
    kind: 'location',
    title: 'Upper corridor from the landing end, night (edit)',
    ref: 'the night photo of the upper corridor from the landing end, with the open nursery door on the left spilling dim lamp light',
    editOf: 'LOC_CORRIDOR_DAY.png',
    prompt: 'Edit the uploaded photo of the manor corridor: same camera, same geometry, same doors, nothing moved. Night: the far window is black-blue; one warm wall sconce is lit on the right wall near the camera; the nursery door on the left still stands open and a dim warm lamp spill comes out of it onto the runner; the rest of the corridor is in soft deep shadow but readable. No people, no text.',
    uploads: [{ file: 'LOC_CORRIDOR_DAY.png', job: 'exact geometry' }],
    group: 'Corridor',
  },
  {
    file: 'LOC_CORRIDOR_REV_NIGHT.png',
    kind: 'location',
    title: 'Upper corridor looking back to the landing, night, nursery door closed (edit)',
    ref: 'the night photo of the upper corridor looking back toward the lit landing, with the white nursery door closed on the right',
    editOf: 'LOC_CORRIDOR_REV_DAY.png',
    prompt: 'Edit the uploaded reverse photo of the corridor: same camera, same geometry, nothing moved. Night: the window behind the camera is dark; one warm sconce lit on the wall between the landing and the nursery door; the white nursery door on the RIGHT wall is now CLOSED, its brass handle catching the light; at the far end the landing lamp glows warm on the small table beside the narrow service door, with the open black monitor case on it showing two glowing grey screens. Soft deep shadow, readable. No people, no text.',
    uploads: [
      { file: 'LOC_CORRIDOR_REV_DAY.png', job: 'exact geometry' },
      { file: 'LOC_LANDING_NIGHT.png', job: 'how the lit landing and monitor look at night' },
    ],
    group: 'Corridor',
  },

  // --- Nursery -----------------------------------------------------------------
  {
    file: 'LOC_NURSERY_FIXED_DAY.png',
    kind: 'location',
    title: 'NURSERY FIXED, day (hero plate)',
    ref: 'the daytime view of the nursery from the small camera high in the corner, door in the lower left',
    prompt: `Photorealistic, vertical 9:16, no people. The view from a small fixed camera mounted about 2.6 m high in the corner where the window wall meets the right-hand wall of a child’s nursery in an old English manor; the window is behind the camera. The camera looks diagonally across and down the room at about 30 degrees, very wide lens without fisheye distortion. Exact layout: the single white panelled door with a brass handle is on the LEFT-hand wall close to the camera end, fully visible in the lower-left third of the frame, closed, with a clear strip of bare wooden floorboards in front of it. From there the room runs away from the camera up the frame: a worn faded rug in the middle of the floor; a low wooden chest on the rug at the centre of the frame with a grey archival document box on its lid; a small wooden side table against the right-hand wall at mid-depth with a small fabric-shaded practical lamp (switched off) and a few old books; a white iron child’s bed made up tightly with faded old linen against the far wall; an armchair under a white dust sheet in the far-left corner; the far-right corner is empty bare floor. Sun-bleached wallpaper with a small repeating pattern, empty picture hooks, a pale rectangle where a picture hung. Pale daylight from the window behind the camera through thin curtains, dust in the light. ${LOOKS.fixed} No people, no dolls, no toys, no horror props.`,
    check: ['Door fully visible in the lower-LEFT third with bare floor in front of it', 'Chest with the grey box at frame centre', 'Lamp table on the right wall, bed on the far wall, armchair far-LEFT, far-RIGHT corner empty', 'No people, no dolls, no text'],
    group: 'Nursery',
    note: MAPS.nursery.text,
  },
  {
    file: 'LOC_NURSERY_FIXED_NIGHT.png',
    kind: 'location',
    title: 'NURSERY FIXED, night, empty (edit)',
    ref: 'the night view of the nursery from the small camera high in the corner, door in the lower left, lamp on',
    editOf: 'LOC_NURSERY_FIXED_DAY.png',
    prompt: `Edit the uploaded photo of the nursery seen from the high corner: identical camera, lens, framing and geometry, nothing moved. Night: the daylight is gone; the small lamp on the side table against the right-hand wall is ON and throws a dim warm pool across the rug, the low chest and the grey box; only weak spill reaches the door in the lower-left; the far corners fall into deep but readable shadow, so a still figure standing in the far-right corner, on the rug, or just behind someone at the door would be only just visible. A faint cool moonlight edge on the iron bed from the window behind the camera. ${LOOKS.fixed} Empty room, no people.`,
    uploads: [{ file: 'LOC_NURSERY_FIXED_DAY.png', job: 'exact camera and room' }],
    check: ['Overlays the day plate exactly at 50% opacity', 'Lamp on; the door and far corners dark but readable'],
    group: 'Nursery',
    note: 'Must overlay pixel-for-pixel on the day plate (check at 50% opacity). Every NURSERY FIXED frame is an edit of this image.',
  },
  {
    file: 'LOC_NURSERY_DOORWAY_DAY.png',
    kind: 'location',
    title: 'Nursery seen from the corridor through the doorway, day',
    ref: 'the daytime photo taken from the corridor looking through the open white nursery door into the room',
    prompt: `Using the uploaded high-corner nursery photo for the room, furniture and wallpaper, and the uploaded corridor photo for the corridor: camera in the upper corridor with its back against the corridor wall opposite the nursery door, eye level, 35mm, looking straight through the wide-open white panelled door into the nursery. In the foreground a strip of corridor floor with the worn runner. Through the doorway: straight ahead against the far wall of the view, the small side table with its lamp switched off; to the LEFT, deeper in the room, the low wooden chest on the worn rug with the grey archival box on its lid and the white iron child’s bed beyond it; to the RIGHT, the window wall with thin curtains letting in pale daylight, and above it, high up, the empty corner where the window wall meets the wall ahead. No camera mounted anywhere yet. No people. ${LOOKS.dayInterior}`,
    uploads: [
      { file: 'LOC_NURSERY_FIXED_DAY.png', job: 'the room: furniture, wallpaper, positions' },
      { file: 'LOC_CORRIDOR_DAY.png', job: 'the corridor floor, runner and door' },
    ],
    check: ['Chest and box to the LEFT inside, lamp table straight ahead, window on the RIGHT', 'The high corner ahead-right is empty (no camera yet)'],
    group: 'Nursery',
    note: 'Used for SH09 (clean view), SH13 (handheld POV) and SH14–SH16 (corridor angle). From the corridor, the landing is to the LEFT.',
  },
  {
    file: 'LOC_NURSERY_DOORWAY_NIGHT.png',
    kind: 'location',
    title: 'Nursery seen from the corridor through the doorway, night (edit)',
    ref: 'the night photo taken from the corridor looking through the open white nursery door, with the lamp on inside and a small red camera light high in the far corner',
    editOf: 'LOC_NURSERY_DOORWAY_DAY.png',
    prompt: 'Edit the uploaded photo looking from the corridor through the open nursery door: identical camera and geometry, nothing moved. Night: inside, the small lamp on the side table straight ahead is ON, making a dim warm pool over the rug, the low chest and the grey box; the window on the right is dark with a faint cool edge; high in the corner ahead-right above the window there is now a compact black camera on a small wall bracket with a small glowing red REC light. The corridor foreground is in dim warm sconce light. Deep readable shadow. No people, no text.',
    uploads: [
      { file: 'LOC_NURSERY_DOORWAY_DAY.png', job: 'exact geometry' },
      { file: 'PROP_FIXED_CAM.png', job: 'the camera on its wall bracket' },
    ],
    group: 'Nursery',
  },
  {
    file: 'LOC_NURSERY_DOOR_NIGHT.png',
    kind: 'location',
    title: 'Inside the nursery beside the door, night (cinematic)',
    ref: 'the night photo inside the nursery at eye level beside the closed white door, with the lamp-lit room opening to the right',
    prompt: `Using the uploaded high-corner night photo of the nursery for the room, furniture, wallpaper and lamp light: a new cinematic angle inside the same room at night. Camera at eye level, 35mm, standing close to the window wall about a metre from the corner by the door, looking along the left-hand wall: the closed white panelled door with its brass handle in three-quarter view on the LEFT of frame, a strip of bare floorboards in front of it; to the RIGHT and behind, the room opens up — the worn rug, the low chest with the grey box inside the warm pool of the practical lamp on the side table against the right-hand wall, the white iron bed against the far wall, the far corners in deep shadow. No people. ${LOOKS.night}`,
    uploads: [{ file: 'LOC_NURSERY_FIXED_NIGHT.png', job: 'the room, furniture and lamp light' }],
    group: 'Nursery',
    note: 'Cinematic angle: the Veiled Woman NEVER appears here. The room behind Clara is always empty.',
  },
];
