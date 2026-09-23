// What was wrong in the previous production pack, and the open decisions that
// belong to the producer. Shown in the app's "Changes & decisions" tab.

export interface Note {
  title: string;
  body: string;
  fix?: string;
}

export const OLD_PACK_PROBLEMS: Note[] = [
  {
    title: 'Reverse angles and night views were invented from text',
    body: 'Only one direction of each location existed as an approved image. Every reverse (SH06/SH07 looking back at the front door, the corridor from the far window, SH16 from the far end of the nursery) and every night plate was generated from words, so the far wall, the light side and the furniture drifted between angles.',
    fix: 'Each main location now has a location map (view A, view B at 180°, light by day and night, every shot setup) and ONE 2×2 location sheet prompt: day/night × view A/view B, generated from the approved master plate. Reverse and night plates and keyframes upload the sheet and name the panel they need. Classical rules that were missing (establishing shots, lead room, light direction, exit/entry sides, eye trace…) are in the continuity rules §7e; establishing and lead room are now automatic.',
  },
  {
    title: 'Flat coverage: every shot a full-body wide',
    body: 'Most shots were written as full-figure wides at 24–35mm, and SH06 and SH07 were the same hall angle at the same size with the people moved around. Nothing in the bible or script asks for this; it was a staging shortcut.',
    fix: 'Every shot now has a named camera setup and a shot size, and the size goes into the keyframe CAMERA line. SH06 is a low waist-up medium beside the service door looking back at the front door; SH07 is a high wide from the top of the stair; SH08 → SH10 → SH11 walks wide → medium → close-up; SH12 turns round to the landing end; SH15 is a frontal medium; SH16 is a reverse from the far end of the nursery. QA fails the build if two consecutive shots share both setup and size (unless marked as a match cut). New maps for SH06, SH07, SH11, SH12, SH15 and SH16, and a Shot maps tab to check them side by side.',
  },
  {
    title: 'The day mood drifted to “bright and happy”',
    body: 'While aligning the plates, the shared day look was rewritten with “warm, bright, elegant” and the exterior with “elegant, inviting, well kept”. Because LOOKS is shared, this changed every day plate and keyframe at once, and the hall came out like a property advert.',
    fix: 'Restored the approved wording (elegant and real, not a ruin, frozen in time, muted and slightly desaturated, deep soft shadows, heavy stillness) in the shared day looks, the hall plate (now the approved prompt word for word, plus the door and window sides). The exterior keeps the script’s own words (B1: elegant and inviting, not ruined) but with the same muted, frozen-in-time palette. Night looks were never touched.',
  },
  {
    title: 'The corridor did not match the generated nursery',
    body: 'The corridor plates were text-only: they never uploaded the nursery or hall images, so the door, wallpaper and the view through the doorway were invented. The nursery map also no longer matched the approved plate (bed along the right wall, lamp in the far-right corner, window beside the camera).',
    fix: 'The approved nursery plate is now the source of truth. One room description taken from it (NURSERY_LAYOUT) is used by every nursery prompt; the corridor plates upload the nursery (door, surround, wallpaper) and the hall (woodwork, floors). The floor plan was re-drawn so the corridor runs on past the nursery door to the far window, and the Veiled Woman positions moved off the lamp table.',
  },
  {
    title: 'Props vanished and actions ran backwards (second SH02 test)',
    body: 'The prompt told the image model the camera was held in front of his chest with “only his elbows show”, so the camera was invisible from behind and the video gave him empty hands. The keyframe showed the case already out of the car while the video prompt said “hauls a case out”, so the video put it back to perform the action again. The tall man was placed “beyond the car”, which the model read as walking toward the car.',
    fix: 'Every person now has a Hands line saying what each hand holds and how it stays visible from this camera. Every Doing line states how far the action has got in the start frame (ALREADY OUT / STILL INSIDE / CLOSED / not yet pressing), the video continues forward from it, and every video prompt says nothing already done is undone. Positions use frame thirds plus landmarks. QA flags hidden props, unstaged hands and repeated actions.',
  },
  {
    title: 'People turned the wrong way (found on the first SH02 test frame)',
    body: 'The facing direction was one clause inside a long paragraph, the prompt then described the face of a man who should be seen from behind, and the character sheets (all facing camera) pulled the pose. The video prompt never stated the start frame, so a wrong keyframe produced a wrong clip. The SH02 test also used the old character sheets (striped tee, gear round Mara’s neck, radio on her hip).',
    fix: 'Every person in every shot has structured staging: view (from behind / profile / facing), position against landmarks, action and eyeline. Seen-from-behind people get hair and clothes, never a face. Prompts say the sheets are for identity only, not pose. Every video prompt opens with the exact start frame. Every keyframe and plate has an approve-or-reroll checklist. Regenerate the character sheets from the new sheet prompts before any keyframe.',
  },
  {
    title: 'Scripted lines were not tracked to their shots',
    body: 'Lines lived in loose “Audio” notes with nothing checking that every scripted line landed somewhere.',
    fix: 'On-screen dialogue is word for word in the video prompt; host VO and off-screen lines are word for word in the shot’s audio notes. QA fails the build if any scripted line is missing.',
  },
  {
    title: 'Script beats were merged, dropped or moved',
    body: 'Missing or folded: C3 (clean view into the room), the C11 transition (Mara enters with NURSERY FIXED, Elias follows), D10 (Mara finishes the mount and follows with the monitor case), D11 (Owen leads everyone down to the service hall), H11/H15 (Clara inside fixes her eyes, obeys), I13 (the flag still down on BELL BOARD FIXED), and the separate 2:29 stair-turn and 2:36 door beats, which were folded into other shots. Naomi’s “Stay with me” (I10) was moved off-screen into the fixed-camera shot instead of the scripted cut to Naomi.',
    fix: '51 shots, every beat in script order. QA checks that every beat is covered and that the order never goes backwards.',
  },
  {
    title: 'The cut was squeezed to 72s without the producer’s yes',
    body: 'The script expects ~2:38–2:45. The old pack compressed to ~72s and suggested dropping whole beats to reach 66s.',
    fix: 'Full script cut runs 2:43. Trimming is a producer decision: the Edit tab has a trim calculator that shows exactly which beats and lines each cut loses. Nothing is cut by default.',
  },
  {
    title: 'Direction contradictions in the arrival',
    body: 'SH03: “from beside and slightly ahead of him … the front door ahead of him and visible over his shoulder” — impossible from ahead. SH05: camera ahead of the women with “the facade filling the frame behind them” while they walk toward it; the video prompt said “house behind them”.',
    fix: 'A locked exterior map with a master view and a reverse view. Walking-toward-the-house shots use the reverse plate: the house is behind the camera, the SUV behind the walker, and the sun flips to frame-right.',
  },
  {
    title: 'Handheld without a visible operator',
    body: 'SH07 and the stair shot were “handheld crew camera” POVs with no established operator, and the stair keyframe put Mara and Naomi ahead of a camera that was supposed to be Elias following Owen.',
    fix: 'Handheld only where the host is the established operator (SH13, SH19, SH20); QA checks the previous shot shows him. Stair, hall and other moves are cinematic and show the host holding his camera.',
  },
  {
    title: 'The stair had no locked handedness and the model had to invent the reverse view',
    body: 'The only stair plate looked down from the top, but SH14 asked for a bottom-up view “using the uploaded photo for the geometry”, so the rail and the turn could flip between Owen’s climb and Mara’s run. The 2:29 “lower door not visible yet” was not controlled.',
    fix: 'Two stair plates, lower flight first (from the turn) and upper flight derived from it, with the rail on frame-left and the turn direction written into every prompt. The night lower-flight plate hides the door in darkness.',
  },
  {
    title: 'Monitor station and match cut were not consistent',
    body: 'The day landing plate already had a closed monitor on the table, and then Mara “sets a monitor on the table” (two monitors). The day hold shot and the night shot used different framings, yet the night prompt said “identical framing to the daylight version”.',
    fix: 'Empty table in the day plate; Mara brings the case. SH24 (day hold) and SH25 (night) both use the exact LOC_LANDING framing. Screen layout is locked: LEFT = NURSERY FIXED, RIGHT = BELL BOARD FIXED.',
  },
  {
    title: 'Nursery geometry hid Clara’s throat',
    body: 'There was no left/right map of the room. With the camera behind Clara facing the door, the throat mark the whole story depends on could not be seen. The Woman’s far position was “near the armchair in the far corner opposite the door”, the same corner the camera was said to be in.',
    fix: 'One locked nursery map (door lower-left, lamp right, bed far wall, armchair far-left, empty far-right corner) repeated in every NURSERY FIXED prompt. The camera sees Clara three-quarter from behind her right shoulder, so the right side of her throat is always in frame. P1/P2/P3 are defined positions.',
  },
  {
    title: 'The Veiled Woman was in the animated start frames',
    body: 'The fixed-camera keyframes included the figure and relied on “stays completely still”, which video models don’t reliably obey. Each position was generated independently, so her look could change between returns.',
    fix: 'Clips are animated from Clara-only frames. The figure is added as a still layer made by editing the same frame, and each new position is an edit of the previous one (“same figure, only moved”). SH47 and SH51 share one untouched P3 layer. QA fails if she appears anywhere else or in a video prompt.',
  },
  {
    title: 'First reveal performance contradicted the script',
    body: 'SH24 had Clara with “both palms flat on the door, forehead almost touching the wood, shoulders shaking”. In the script she has just said “I don’t see anything”, and her hands stay low.',
    fix: 'SH34: hands low, shoulders tight, shallow breath, unaware. Fear then escalates with each return: swallow and two fingers, then a breath that barely lands, then the failed inhale.',
  },
  {
    title: 'Stale shot references all over the pack',
    body: '“Start frame for SH11”, “End frame for SH11 and the image on the monitor in SH19”, “Owen climbs it in SH09b; Mara runs down it in SH21”, post notes composite the Woman in “SH17, SH19 and SH22”, mark stages “stage 2 in the cold open, stage 1 in SH19, stage 3 in SH22”, QA “SH01, SH17, SH19, SH22”, budget for “23 shots” when the list had 31.',
    fix: 'Every reference in this app is generated from the data, so it can’t go stale.',
  },
  {
    title: 'Wardrobe broke the colour lanes and the props',
    body: 'Elias wore a rust-striped tee (Mara’s lane). Mara’s base was all black, with a headlamp and a radio already clipped on, although the script has her grab the radio and flashlight from the table. Owen had a tool belt and a long flashlight, which clash with the scripted tool pouch and Mara’s flashlight. Owen’s voice was “late 30s” for a 42-year-old.',
    fix: 'Elias: plain solid cream henley, no stripes. Mara: slate-grey cargo trousers, nothing round her neck; flashlight and radio live on the monitor table. Owen: canvas tool pouch only, no belt, no flashlight. Voices match the ages.',
  },
  {
    title: 'The exterior looked like a ruin',
    body: 'The old plate asked for ivy “crept too far”, weeds, dead geraniums, a black window and a desaturated palette. The script says bright, elegant, inviting, not ruined.',
    fix: 'Bright, warm, well-kept manor; the only hint is a few closed upper shutters. The unease comes from the story dressing inside.',
  },
  {
    title: 'The same acting boilerplate in every video prompt',
    body: '“Real, expressive human acting: the emotion is fully visible in the eyes, mouth, breath and hands…” was pasted into every prompt, including the wordless insert of the cut wires.',
    fix: 'Shot-specific physical direction (swallow, brow, two fingers, breath that lands barely, shoulders lift) and shot-specific “stays” lines.',
  },
  {
    title: 'Broken timings and crammed lines',
    body: 'SH21 had “1–2s” twice. “If I’m ever opening that letter, it’s tonight” was given 2s. Several prompts had beats that did not add up to the ordered length.',
    fix: 'QA checks that beats tile exactly from 0 to the ordered length and that each line fits its beat at a natural speed (warning above 3 words/s, error above 3.6).',
  },
  {
    title: 'Uploads were file names without jobs',
    body: 'Shots listed file names only. Nano Banana doesn’t read file names, and the rules require a job for every upload.',
    fix: 'Every upload has a visual description and a job, both inserted into the prompt automatically. QA fails if a prompt contains a file name.',
  },
];

export const DECISIONS: Note[] = [
  {
    title: 'Video prompts carry only on-screen dialogue (producer decision)',
    body: 'Host VO (SH03, SH04, SH06) and off-screen lines (Elias through the door in SH32, Owen from the monitor in SH34, Naomi through the door in SH47) are no longer in the video prompts. This replaces the earlier rule that every scripted line must be in the video prompt. VO shots now say “nobody on screen speaks”; off-screen moments are written as silent listening beats.',
    fix: 'Each of those lines is word for word in its shot’s audio notes, with the timing and voice. QA fails if one is missing there or leaks into a video prompt.',
  },
  {
    title: 'Cold open: mark stage',
    body: 'The rules say the cold open equals the final-cliff pose; the script says “a faint pressure mark is forming” and “Clara presses two fingers to the mark”. Built: the final pose, cropped, two fingers pressed into the mark by the hooked hand, with the FAINT mark (the script wins on what happens).',
    fix: 'Producer: keep faint (script) or switch SH01 to the dark mark for an exact match with SH51?',
  },
  {
    title: 'Where NURSERY FIXED hangs',
    body: 'The rules place the mount “in the far corner opposite the door”. Seen from the doorway it is exactly that: high in the far corner across the room, above the window, red REC light visible. But it sits on the window/right-wall corner, so when Clara faces the door the camera sees her three-quarter from behind her right shoulder and the throat mark is readable. A camera directly behind her would only see her back.',
    fix: 'Producer: approve the map before plates are generated.',
  },
  {
    title: 'Mara’s stair turn appears twice in the script',
    body: 'At 2:09 she “takes the stair turn and continues down”; at 2:29 she “reaches the middle turn … rounds it”. Built as one continuous turn: SH46 ends as she swings into it, SH49 shows her rounding it from the landing.',
  },
  {
    title: 'Blocking-only beats',
    body: 'F17 (“Mara and Owen remain at the monitor station”) and the tail of C11 (“Owen and Naomi continue working nearby”) are staging facts. They are written into the blocking of SH29/SH12 and paid off in SH33/SH14 instead of getting their own shots.',
  },
  {
    title: 'Off-screen lines over fixed-camera shots',
    body: 'Owen’s “There’s someone behind her” (SH34), Clara’s “My neck…” (SH40) and Naomi’s “Clara. Stay with me.” (SH47) are generated silent on NURSERY FIXED and laid in post in the cast voice. The prompt still carries each line with its voice.',
  },
  {
    title: 'Mara’s reply in SH14 is in the background',
    body: 'To keep Owen passing, Elias in the doorway and Mara in the corner in one geography, Mara delivers “You’ve been here twenty minutes” small, through the doorway, still working. If a close-up is wanted, add a handheld pickup from SH13’s framing.',
  },
  {
    title: 'Runtime',
    body: 'The full script cut runs ~2:43, matching the script. If the delivery must be ~60s, use the trim calculator in the Edit tab and approve the list; the rules forbid dropping beats silently.',
  },
  {
    title: 'Creative choices not specified by the bible',
    body: 'Faces, ages, ethnicities and exact heights; Clara’s copper hair, ice-blue blouse and English accent; all voices; the dark green SUV; the nursery layout; the stair handedness; the monitor’s screen order.',
  },
];

export const PROCESS_NOTE = `PROCESS NOTE — The Haunted Crew, Ep 1 “Answer the Bell, Part 1” (test cut)

Cut: the full locked script in order — cold open, arrival with all three host VO lines and four lower thirds, Clara’s warning and the letter, setup banter, the cut wiring and hand-reset flag, the service route up to the monitor, day-to-night match cut, the bell, Clara’s choice, the locked door, three NURSERY FIXED returns, Mara’s run down the same route, ending on Clara’s failed breath. Runtime ___.

Creative choices not specified in the bible: faces, ages, ethnicities, heights, Clara’s look and English accent, all voices, the nursery layout, stair handedness, monitor screen order — all designed within each character’s bible colour lane.

Pipeline
1. Character sheets and a height lineup locked first (Nano Banana 2).
2. Location plates built day first; night and fixed-camera versions are edits of the same image so geometry never changes.
3. Keyframes per shot from 2–5 described references (Nano Banana 2). NURSERY FIXED frames are successive edits of one plate; the Veiled Woman is a still layer made the same way and composited, so she never moves.
4. Video: Kling 3.0 image-to-video on Higgsfield, one shot per generation, 3–10s. Start and end frames for the bell flag. ___ takes generated, ___ used.
5. Voices: ElevenLabs Voice Design; host VO recorded first; on-camera lines voice-swapped for consistency.
6. Post: fixed-camera overlays, monitor screen replacements, composited apparition, throat-mark tracking, grade, titles, watermark (tool: ___).
No HeyGen. Watermark on all assets.

Time: ___ h. Cost: ___. With more time I would: ___`;
