# Continuity rules for AI-generated shots

These rules adapt the checks a script supervisor runs on a real film set to shots made
one generation at a time (keyframe image, then image-to-video). The AI model never sees
the previous shot, so every rule here has to be written into the prompt or checked by a
person before the next generation.

Use them for every scene, in this order: **map → coverage plan → per-shot staging → cut
check → keyframe approval → clip approval → continuity log.**

---

## 1. One overhead map per scene, drawn before any prompt

Real sets use a floor plan with the blocking drawn on it. Make one per scene (space) and
never change it after the plates are made.

The map fixes:

- **Walls, doors, windows, furniture**, each named, with which side it is on.
- **Light source(s)**: where the key light comes from (sun side, lamp, sconce).
- **The line of action (180° line)**: see §2.
- **Every camera position** used in the scene, numbered (A, B, C…), with its direction and lens.
- **Every character's path**: start mark, end mark, direction of travel, as arrows.
- **Entrances and exits**: which door or frame edge each person uses.
- **Where props live**: on a table, in a hand, on the floor, and when they move.

Write each camera position as a sentence the model can follow:
*"Camera B: on the landing, back to the window, facing the service door; the table is
frame-left of the door; the corridor opening is frame-right."*

Every plate and keyframe for that space repeats the relevant part of the map, word for word.

**Per-shot map image.** For shots with movement or several people, draw a top-down plan of
that shot: camera position, field of view and movement; each person as a dot with a facing
arrow and a dashed path to an end mark; the sun or key light; plus a small 9:16 frame
preview showing which third each thing lands in. Check the frame preview against the plan
before using it: in a reverse view, left and right swap. Upload the map with the keyframe
and tell the model it is a diagram for positions only, not something to draw
(`scripts/shot_maps.py`, `public/maps/`).

## 2. The 180° rule (line of action)

- Draw an imaginary line through the two main people who face each other (or along a person's path of travel).
- Every camera in the scene stays on **one side** of that line. Then A stays on frame-left
  and B on frame-right in every shot, and eyelines stay consistent.
- Crossing the line is allowed only (a) on camera, with a visible move across it; (b)
  through a neutral shot straight down the line (head-on or from directly behind); or
  (c) after a clear cutaway that resets the geography. Note any crossing in the map.
- **Check per shot:** "Which side of the line is the camera on?" If the answer changes
  between two consecutive shots, the cut is broken.

## 3. Screen direction

- A person walking **frame-left to frame-right** keeps walking left-to-right in the next
  shot of the same journey, until they turn on camera or a neutral shot resets it.
- **Exit and entrance must match:** exit frame-right → enter the next shot from
  frame-left (they keep moving the same way through the world).
- A destination keeps its screen side: if the house is frame-right in the wide, a walk
  toward it goes frame-right in the close shots too.
- **Toward / away from the camera** is neutral. Use it to change direction or reset
  geography.
- Write direction in every prompt with a landmark, never a bare "walks":
  *"walks toward frame-right, toward the front steps"*.

## 4. Eyelines

- If A looks frame-right at B, then B looks frame-left at A in B's shot.
- A person looking at an off-screen object looks the same way every time we cut back
  (the monitor is always to the left of the person watching it, and so on).
- Height matters: a tall person looks down at a short one, and the short one looks up.
- For looks at something above or behind the camera, say where the eyes go: *"eyes lifted
  above the lens toward the upstairs windows"*. Never leave eyes to the model; the default
  failure is staring into the lens.
- **Nobody looks into the lens** unless it is written, deliberate, and a documentary
  moment that allows it.

## 5. Match cuts: the end of shot N is the start of shot N+1

This is the main continuity check between shots. For every cut, write down and compare:

| Item | Last frame of shot N | First frame of shot N+1 |
|---|---|---|
| Position of each person (against landmarks) | | |
| Body direction and head/eyes | | |
| Which hand holds which prop | | |
| Stage of the action (door half open, case lifted…) | | |
| Wardrobe state (sleeves, coat open, damage/marks) | | |
| Light and time of day | | |
| Screen direction of travel | | |

Rules:

- **The action overlaps.** Let the action run a little past the cut in N and start a
  little before it in N+1, so the editor has a match point (e.g. the door opening).
- **Nobody teleports.** If someone is at the steps in N, they can't be back on the
  gravel in N+1 unless time has visibly passed.
- **Props travel with hands.** Something picked up stays in that hand until it is put
  down on camera.
- **Change the angle enough (30° rule):** consecutive shots of the same subject differ by
  at least ~30° or a clear change of size. Otherwise it reads as a jump cut.
- **Match cut on purpose:** for a deliberate match cut (day → night), lock the framing
  exactly and change only what the story changes.

## 6. Per-shot staging card (write before the prompt)

For every person in frame:

- **View:** facing camera / three-quarter front / profile left / profile right /
  three-quarter back / from behind / small in the background / hands only.
- **Where:** a position against two landmarks.
- **Doing:** action, how far it has got in the start frame, and where the eyes go.
- **Hands:** what each hand holds and how it stays visible from this camera.
- **Start → end:** where they are at the first and last frame of the clip.

Prompt rules that come from this card:

- **Seen from behind means no face description.** Describing a face invites the model to
  show it. Give hair, build and clothes only.
- Say that character sheets are for **identity only, not pose**. Sheets face the camera,
  and models copy them.
- The video prompt's first line restates the **start frame** (who, where, facing), then
  the moves, each with a destination landmark.
- Timings in the prompt add up to the clip length, and one action lands per beat.
- **Dialogue in the video prompt only if the speaker is in frame.** Voice-over and
  off-screen lines go in the shot's audio notes (word for word, with timing and voice) and
  are laid in the edit. In the prompt they become silent beats (*“she goes still,
  listening toward the door”*; *“nobody on screen speaks”*).

## 6b. Lessons from test generations (image → video)

These failed in real tests. Each one is now a hard rule.

- **Props must be visible from the camera’s side.** Say which hand holds what and how it
  shows from this angle (*“camera held out to his right side so it shows beyond his arm
  from behind”*). Never write anything that hides it (“only his elbows show”). A prop the
  image hides, the video deletes.
- **State how far each action has got in the start frame:** ALREADY OUT / STILL INSIDE /
  door CLOSED / just starting to open / not yet pressing. Choose one and write it in
  capitals.
- **The video continues forward from that stage only.** Never re-describe an action the
  frame already shows as done (“lifts it out” when it is already out). The model will undo
  it to perform it again. Name the destination (*“lowers it onto the gravel beside the rear
  wheel; it stays on the ground”*) and add *“nothing already done is undone”*.
- **Place people by frame region plus landmark:** left third / centre / right third,
  foreground / midground / background, then the landmark. “Beyond the car” is read as
  “walking to the car”. Give people a clear path with nothing blocking it.
- **One simple action per person per clip** in short clips. Three people doing three
  things in 3 seconds means at least one of them goes wrong.
- **Character sheets pull their pose.** Say that sheets are for identity only.
- **Seen from behind = no face description,** only hair, build and clothes.
- **Old references override new text.** If a sheet or plate changed, regenerate it before
  generating anything that uploads it.

## 7. Camera continuity

- Each camera setup has an ID in the map; re-use the same ID (and the same plate) when you
  return to it.
- **Fixed / security cameras never move.** Every return is an edit of the same plate;
  check by overlaying at 50% opacity.
- Lens and height stay the same for a returning setup.
- Only use handheld when the operator is established in the story. The operator is never
  in his own shot.

## 8. Continuity log (the script supervisor's notes)

Keep one row per shot, updated when a take is approved:

- Shot ID, take, approved Y/N.
- Positions at start and end (short text).
- Props: who holds what, where it ends up.
- Wardrobe and makeup state (e.g. throat mark stage, sleeves up, coat on).
- Light: direction, time of day, practicals on or off.
- Anything that went wrong and must be matched or fixed next time.

Before generating shot N+1, read the log row for shot N.

## 9. Keyframe approval (before spending on video)

Reject and reroll the keyframe unless:

1. Every person is where the staging card says, facing the stated way.
2. Nobody looks into the lens unless written.
3. Wardrobe matches the sheet (list the 2–3 items the model tends to drop).
4. Props are in the right hands.
5. Location features are on the stated sides (doors, windows, rail, sun side).
6. It cuts with the approved last frame of the previous shot (§5 table).

## 10. Clip approval

- The first frame matches the approved keyframe (no jump at the start).
- Moves go in the stated screen direction and reach the stated landmark.
- Nobody turns toward the lens, and nothing that must stay still moves.
- The last frame matches what the next shot's staging card expects.

## 11. Order of work for a new scene

1. Read the scene in the script and list every beat.
2. Draw the overhead map (§1) and the line of action (§2).
3. Plan the coverage: camera IDs, one per shot, with which beats each covers.
4. Fill a staging card per shot (§6), including the start and end positions.
5. Run the cut check (§5) on paper for every pair of consecutive shots.
6. Only then write the plate, keyframe and video prompts.
7. Approve keyframes (§9) and clips (§10), updating the continuity log (§8) as you go.
