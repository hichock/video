// Locked character identities. Every prompt pulls its descriptors from here,
// so a character is described with the same words in every shot.

export type CharId = 'elias' | 'mara' | 'naomi' | 'owen' | 'clara' | 'veiled';

export interface Character {
  id: CharId;
  name: string;
  role: string;
  sheetFile: string;
  /** How image prompts point at the uploaded sheet (models don't read file names). */
  sheetRef: string;
  /** Visible-only descriptor for video prompts and in-prompt references. Never a name. */
  short: string;
  /** Face and body, repeated in keyframe prompts. */
  look: string;
  /** What shows when the face does not: build and hair seen from behind. */
  fromBehind: string;
  /** What the person approving a keyframe must see (wardrobe lock). */
  mustSee: string;
  /** Full wardrobe, repeated whenever the body is visible. */
  wardrobe: string;
  /** Props the character owns and carries. */
  props: string;
  heightCm: number;
  lane: string;
  bible: string;
  sheetPrompt: string;
  voiceDesign?: string;
  voiceInPrompt?: string;
  lowerThird?: string;
}

const SHEET_TAIL =
  'Cast like a character actor, not a model: real imperfections, uneven features, visible pores, natural asymmetry, laugh lines. Memorable at thumbnail size. Soft even studio light. No text, no labels, no logos.';

export const CHARACTERS: Record<CharId, Character> = {
  elias: {
    id: 'elias',
    name: 'Elias Vale',
    role: 'Field lead / host',
    sheetFile: 'CH_ELIAS_sheet.png',
    sheetRef: 'the character sheet of the tall, lean man with messy shoulder-length sandy hair in a worn olive waxed field jacket',
    short: 'the tall lean man with messy sandy hair in the olive field jacket',
    look: 'man, 35, 190 cm, tall and lean with long limbs, sun-freckled weathered skin, messy shoulder-length sandy hair he pushes back, light stubble, slightly broken nose, crooked grin with a small chip in one front tooth, restless blue-green eyes',
    fromBehind: 'tall lean build, long legs, messy shoulder-length sandy hair',
    mustSee: 'olive waxed jacket over a PLAIN cream henley (no stripes), brown trousers, brown boots, sticker-covered black handheld camera',
    wardrobe: 'worn olive waxed field jacket with sleeves pushed up, a plain solid cream henley (no stripes), brown canvas work trousers, scuffed brown leather boots, woven leather bracelet on the left wrist',
    props: 'a battered compact black handheld cinema camera with a top handle, a flip-out side monitor and faded location stickers',
    heightCm: 190,
    lane: 'Olive / earth / stone. Never black tactical.',
    bible: 'Tall, lean, warm earth/stone/olive field clothing. Handheld camera or practical gear in hand. Never generic black tactical styling.',
    sheetPrompt: `Photorealistic character reference sheet, vertical 9:16 canvas split into four panels on a plain neutral mid-grey studio background: front head-and-shoulders, three-quarter head-and-shoulders, profile, and full body standing. The same man in every panel: 35 years old, 190 cm, tall and lean with long limbs, sun-freckled weathered skin, messy shoulder-length sandy hair pushed back off his face, light stubble, a slightly broken nose, a crooked grin with a small chip in one front tooth, restless blue-green eyes. Wardrobe, identical in every panel: worn olive waxed field jacket with the sleeves pushed up his forearms, a plain solid cream henley underneath (no stripes, no pattern), brown canvas work trousers, scuffed brown leather boots, a woven leather bracelet on his left wrist. In the full-body panel he holds a battered compact black handheld cinema camera with a top handle, a flip-out side monitor and faded location stickers. Warm, energetic, a little reckless. ${SHEET_TAIL} Not tactical, no cap, no black clothing, nothing rust-coloured.`,
    voiceDesign: 'Male, mid-30s, warm confident American voice, conversational and relaxed, a hint of a smile; close-mic documentary narration for the host VO.',
    voiceInPrompt: 'a warm, relaxed American male voice',
    lowerThird: 'ELIAS VALE — FIELD LEAD / HOST',
  },
  mara: {
    id: 'mara',
    name: 'Mara Chen',
    role: 'Camera & systems',
    sheetFile: 'CH_MARA_sheet.png',
    sheetRef: 'the character sheet of the small wiry East Asian woman with choppy silver-tipped black hair in a rust-burgundy utility vest',
    short: 'the small woman with choppy silver-tipped black hair in the rust-burgundy vest',
    look: 'East Asian woman, 30, 158 cm, small and wiry, pale warm skin, a faint scar through her left eyebrow, short choppy jet-black hair with bleached silver tips, a stack of small silver hoops up her left ear, sharp dark eyes, an unimpressed half-frown',
    fromBehind: 'small wiry build, short choppy black hair with silver tips',
    mustSee: 'rust-burgundy vest over a black thermal, slate-grey cargo trousers, black boots; nothing round her neck, no radio on her hip in the day',
    wardrobe: 'rust-burgundy canvas utility vest with a coiled cable, a roll of gaffer tape and a carabiner clipped to it, black long-sleeve thermal top, slate-grey cargo trousers, heavy black boots',
    props: 'compact black fixed-camera case in the day; flashlight and radio only at night, picked up from the monitor table',
    heightCm: 158,
    lane: 'Rust / burgundy accent, compact technical silhouette. Never all-black tactical.',
    bible: 'Compact silhouette, practical technical clothing, distinct from Naomi and Clara. A rust/burgundy accent may identify her. Never styled as a generic operator in all-black tactical gear.',
    sheetPrompt: `Photorealistic character reference sheet, vertical 9:16 canvas split into four panels on a plain neutral mid-grey studio background: front head-and-shoulders, three-quarter, profile, and full body standing. The same woman in every panel: East Asian, 30 years old, 158 cm, small and wiry, pale warm skin with a faint scar through her left eyebrow, short choppy jet-black hair with bleached silver tips, a stack of small silver hoops up her left ear, sharp dark eyes, a permanently unimpressed half-frown. Wardrobe, identical in every panel: a rust-burgundy canvas utility vest with a coiled cable, a roll of gaffer tape and a carabiner clipped to it, over a black long-sleeve thermal top; slate-grey cargo trousers; heavy black boots. Nothing hanging round her neck, no radio, no headlamp. ${SHEET_TAIL} No glasses, no glamour makeup.`,
    voiceDesign: 'Female, early 30s, dry, precise, slightly clipped American voice.',
    voiceInPrompt: 'a dry, clipped American female voice',
    lowerThird: 'MARA CHEN — CAMERA & SYSTEMS',
  },
  naomi: {
    id: 'naomi',
    name: 'Naomi Brooks',
    role: 'Evidence & interviews',
    sheetFile: 'CH_NAOMI_sheet.png',
    sheetRef: 'the character sheet of the very tall Black woman with long locs piled high on her head in a long camel coat',
    short: 'the very tall woman with locs piled high in the long camel coat',
    look: 'Black woman, 34, 182 cm, very tall and graceful, deep brown skin, long locs piled high on her head with small gold cuffs, a wide warm smile with a small gap between her front teeth, deep plum lipstick, thin gold rings on both hands',
    fromBehind: 'very tall graceful build, locs piled high on her head with small gold cuffs',
    mustSee: 'long camel coat, cream knit, plum wide-leg trousers, brown ankle boots, silver cassette recorder on a strap',
    wardrobe: 'long flowing camel coat, cream chunky knit sweater, deep plum wide-leg trousers, brown leather ankle boots',
    props: 'a vintage silver cassette recorder on a leather strap across her body',
    heightCm: 182,
    lane: 'Camel / cream / plum. Softer than Mara, still practical.',
    bible: 'Taller, graceful silhouette. Warm camel/cream/plum tones. Visually softer than Mara but still practical and capable.',
    sheetPrompt: `Photorealistic character reference sheet, vertical 9:16 canvas split into four panels on a plain neutral mid-grey studio background: front head-and-shoulders, three-quarter, profile, and full body standing. The same woman in every panel: Black, 34 years old, 182 cm, very tall and graceful, deep brown skin, long locs piled high on her head with small gold cuffs in them, a wide warm smile with a small gap between her front teeth, deep plum lipstick, several thin gold rings on both hands. Wardrobe, identical in every panel: a long flowing camel coat over a cream chunky knit sweater, deep plum wide-leg trousers, brown leather ankle boots, and a vintage silver cassette recorder on a leather strap across her body. Warm, calm, observant. ${SHEET_TAIL}`,
    voiceDesign: 'Female, mid-30s, warm, firm, calm American voice; slows down under pressure.',
    voiceInPrompt: 'a warm, calm American female voice',
    lowerThird: 'NAOMI BROOKS — EVIDENCE & INTERVIEWS',
  },
  owen: {
    id: 'owen',
    name: 'Owen Reyes',
    role: 'Safety & logistics',
    sheetFile: 'CH_OWEN_sheet.png',
    sheetRef: 'the character sheet of the huge bearded Latino man with a white streak in his black beard in an indigo watch cap and indigo chore coat',
    short: 'the huge bearded man in the indigo watch cap and indigo chore coat',
    look: 'Latino man, 42, 188 cm and huge, bear-like build with very broad shoulders and a round belly, warm tan skin, thick black beard with one bold white streak down the chin, heavy brows, small kind brown eyes, a deadpan face, faded simple tattoos on his forearms',
    fromBehind: 'huge bear-like build, very broad shoulders, indigo knit watch cap',
    mustSee: 'indigo watch cap, indigo chore coat, indigo trousers, tan boots, white streak in the black beard; no tool belt',
    wardrobe: 'indigo knit watch cap, indigo chore coat over a grey tee, dark indigo work trousers, tan leather work boots',
    props: 'the heavier black equipment case on arrival; a small canvas tool pouch during setup; the battery monitor at night',
    heightCm: 188,
    lane: 'Indigo / workwear blue. Broadest silhouette. Must never merge with Elias.',
    bible: 'Broadest crew silhouette, indigo/workwear blue, practical boots, utility gear. Must not visually merge with Elias.',
    sheetPrompt: `Photorealistic character reference sheet, vertical 9:16 canvas split into four panels on a plain neutral mid-grey studio background: front head-and-shoulders, three-quarter, profile, and full body standing. The same man in every panel: Latino, 42 years old, 188 cm and huge, a bear-like build with very broad shoulders and a round belly, warm tan skin, a thick black beard with one bold white streak down the chin, heavy brows, small kind brown eyes, a deadpan face, faded simple tattoos on his forearms. Wardrobe, identical in every panel: an indigo knit watch cap, an indigo chore coat over a grey tee, dark indigo work trousers, tan leather work boots. ${SHEET_TAIL} No olive, no earth tones, no tactical gear, no tool belt.`,
    voiceDesign: 'Male, early 40s, low, deadpan, unhurried American voice.',
    voiceInPrompt: 'a low, deadpan American male voice',
    lowerThird: 'OWEN REYES — SAFETY & LOGISTICS',
  },
  clara: {
    id: 'clara',
    name: 'Clara Bellweather',
    role: 'Owner (guest)',
    sheetFile: 'CH_CLARA_sheet.png',
    sheetRef: 'the character sheet of the woman with copper-red hair in a low bun and a pale ice-blue silk blouse',
    short: 'the woman with copper-red hair in a low bun and the pale ice-blue blouse',
    look: 'woman, 38, 170 cm, slim and upright, pale skin with faint freckles, copper-red hair in a loose low bun with strands falling around her face, grey-blue eyes, a long elegant face, tired and guarded',
    fromBehind: 'slim upright build, copper-red hair in a loose low bun',
    mustSee: 'pale ice-blue open-collar silk blouse with the throat visible, light grey trousers, dark loafers; no scarf or necklace',
    wardrobe: 'pale ice-blue silk blouse with a soft open collar so her whole throat is visible, light grey wool trousers, dark brown leather loafers, small pearl stud earrings, her mother’s old gold wristwatch',
    props: 'none',
    heightCm: 170,
    lane: 'Pale ice-blue / light grey. Throat always visible.',
    bible: 'Intelligent, controlled, not an eccentric believer. Throat must stay readable for the pressure mark.',
    sheetPrompt: `Photorealistic character reference sheet, vertical 9:16 canvas split into four panels on a plain neutral mid-grey studio background: front head-and-shoulders, three-quarter, profile, and full body standing. The same woman in every panel: 38 years old, 170 cm, slim and upright, pale skin with faint freckles, striking copper-red hair in a loose low bun with strands falling around her face, grey-blue eyes, a long elegant face with a tired, guarded expression. Wardrobe, identical in every panel: a slightly old-fashioned pale ice-blue silk blouse with a soft open collar so her whole throat is clearly visible, light grey wool trousers, dark brown leather loafers, small pearl stud earrings and an old gold wristwatch. ${SHEET_TAIL} No high collar, no scarf, no turtleneck, no necklace, nothing gothic.`,
    voiceDesign: 'Female, late 30s, quiet, precise English accent; grief held under the surface.',
    voiceInPrompt: 'a quiet, precise English female voice',
  },
  veiled: {
    id: 'veiled',
    name: 'The Veiled Woman',
    role: 'Apparition — NURSERY FIXED only',
    sheetFile: 'CH_VEILED_sheet.png',
    sheetRef: 'the full-body reference of the still woman in a black Edwardian mourning dress with a smoke-grey veil over her whole face',
    short: 'the still veiled figure in the black mourning dress',
    look: 'adult woman with ordinary human proportions, standing perfectly still, arms straight at her sides, face fully covered',
    fromBehind: 'adult woman’s build, smoke-grey veil falling to the chest',
    mustSee: 'black high-collared mourning dress to the floor, smoke-grey veil covering the whole face',
    wardrobe: 'late-Edwardian black mourning dress with a high collar, long sleeves and a long narrow floor-length skirt; an opaque smoke-grey veil covering the whole head and face, falling to the chest; pale human hands',
    props: 'none',
    heightCm: 168,
    lane: 'Black dress, smoke-grey veil. No glow, no transparency.',
    bible: 'Appears only on NURSERY FIXED. Never walks, reaches or touches. No readable face.',
    sheetPrompt:
      'Photorealistic full-body reference, vertical 9:16, plain dark-grey studio background, soft top light. An adult woman with ordinary human proportions standing perfectly still, arms straight at her sides, facing camera. She wears a late-Edwardian black mourning dress with a high collar, long sleeves and a long narrow floor-length skirt. An opaque smoke-grey veil covers her entire head and face and falls to her chest; no facial features are visible through it. Pale human hands. Realistic fabric weight and texture. Calm and still. No glow, no transparency, no smoke, no claws, no horror makeup, no text.',
  },
};

export const CREW: CharId[] = ['elias', 'mara', 'naomi', 'owen'];
export const CAST: CharId[] = ['elias', 'mara', 'naomi', 'owen', 'clara'];
export const NAMES = ['Elias', 'Mara', 'Naomi', 'Owen', 'Clara', 'Vale', 'Chen', 'Brooks', 'Reyes', 'Bellweather'];

export const LINEUP_PROMPT = `Photorealistic full-body height lineup of the five people from the uploaded character sheets, standing side by side on a plain light-grey studio background, facing camera, even soft light. Left to right: ${CHARACTERS.elias.short} (190 cm, tallest, lean); ${CHARACTERS.owen.short} (188 cm, by far the broadest); ${CHARACTERS.naomi.short} (182 cm); ${CHARACTERS.clara.short} (170 cm); ${CHARACTERS.mara.short} (158 cm, shortest). Keep every face, hairstyle and full outfit exactly as on their sheets, including trousers and shoes. A faint height scale on the wall behind them. No text labels.`;
