"""Generate top-down shot maps (SVG) for SH02-SH20 and one location map per main location.

Each map has two panels: an overhead plan of the drive (house, steps, SUV,
sun, camera with field of view and movement, people with facing and path)
and a 9:16 frame preview showing where things land in frame.
Run: python3 scripts/shot_maps.py  (writes public/maps/SHxx.svg)
"""
import math, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'maps')
COL = {'elias': '#6b7a3a', 'owen': '#2f3f8f', 'mara': '#9b3b2b', 'naomi': '#b88a45', 'clara': '#5d93bd'}
LABEL = {'elias': 'TALL MAN, OLIVE JACKET', 'owen': 'BIG BEARDED MAN, INDIGO', 'mara': 'SMALL WOMAN, RUST VEST',
         'naomi': 'TALL WOMAN, CAMEL COAT', 'clara': 'COPPER HAIR, ICE-BLUE BLOUSE'}
INK, MUTED = '#1b2324', '#667073'

# Plan coordinates: x 0..660, y 0..760; house at top (north), drive below.
HOUSE = (40, 40, 620, 110)
STEPS = (290, 110, 80, 40)
SUV = (190, 300, 70, 140)  # nose at top (toward house), rear at bottom


def arrow(x1, y1, x2, y2, color, width=3, dash=None, head=12):
    a = math.atan2(y2 - y1, x2 - x1)
    hx1, hy1 = x2 - head * math.cos(a - 0.45), y2 - head * math.sin(a - 0.45)
    hx2, hy2 = x2 - head * math.cos(a + 0.45), y2 - head * math.sin(a + 0.45)
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"{d}/>'
            f'<polygon points="{x2},{y2} {hx1:.1f},{hy1:.1f} {hx2:.1f},{hy2:.1f}" fill="{color}"/>')


def text(x, y, s, size=15, color=INK, anchor='start', weight=600):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}" font-family="Arial, Helvetica, sans-serif">{s}</text>'


def base_plan(sun_note):
    x, y, w, h = HOUSE
    sx, sy, sw, sh = STEPS
    bx, by, bw, bh = SUV
    p = [
        f'<rect x="0" y="0" width="660" height="760" fill="#efe8d8"/>',  # gravel
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#cfc6b3" stroke="{INK}" stroke-width="2"/>',
        text(350, 90, 'MANOR FACADE (house)', 20, INK, 'middle', 700),
        f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="#ddd5c3" stroke="{INK}"/>',
        text(330, 136, 'STEPS', 13, INK, 'middle'),
        f'<rect x="{sx+25}" y="{y+h-8}" width="30" height="8" fill="#5a3b22"/>',
        text(420, 104, 'FRONT DOOR', 13, INK, 'start'),
        # SUV: nose up, open tailgate at the bottom
        f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="12" fill="#27402f" stroke="{INK}" stroke-width="2"/>',
        f'<rect x="{bx+8}" y="{by+bh}" width="{bw-16}" height="18" fill="#3b5a44" stroke="{INK}"/>',
        text(bx + bw / 2, by + bh / 2 + 5, 'SUV', 16, '#ffffff', 'middle', 700),
        text(bx + bw / 2, by - 8, 'nose', 12, MUTED, 'middle'),
        text(bx + bw / 2, by + bh - 12, 'tailgate', 11, '#ffffff', 'middle', 400),
        text(bx + bw / 2, by + bh + 2, 'OPEN ↓', 11, '#ffffff', 'middle', 700),
        # sun from the west (left of the master view)
        '<circle cx="18" cy="420" r="14" fill="#f2b632"/>',
        arrow(34, 420, 110, 420, '#e0a020', 4),
        text(20, 455, 'LOW SUN', 13, '#a0700a'),
        text(20, 472, sun_note, 12, '#a0700a', weight=400),
        # scale
        '<line x1="520" y1="735" x2="620" y2="735" stroke="#667073" stroke-width="3"/>',
        text(570, 728, '≈ 4 m', 12, MUTED, 'middle', 400),
    ]
    return p


CAMS = []  # (shot or None, x, y, heading) — tagged by svg()
START_ONLY = False  # True from SH08: maps show the FIRST FRAME only (no paths, no camera moves)


def camera(cx, cy, heading_deg, fov_deg, reach, label, move_to=None, ldx=22, ldy=34, record=True):
    if START_ONLY:
        move_to = None
    if record:
        CAMS.append([None, cx, cy, heading_deg])
    a = math.radians(heading_deg)
    l, r = a - math.radians(fov_deg / 2), a + math.radians(fov_deg / 2)
    p1 = (cx + reach * math.cos(l), cy + reach * math.sin(l))
    p2 = (cx + reach * math.cos(r), cy + reach * math.sin(r))
    out = [f'<polygon points="{cx},{cy} {p1[0]:.0f},{p1[1]:.0f} {p2[0]:.0f},{p2[1]:.0f}" fill="#000000" fill-opacity="0.07" stroke="#000" stroke-opacity="0.35" stroke-dasharray="6 5"/>']
    if move_to:
        out.append(arrow(cx, cy, move_to[0], move_to[1], '#000000', 3, '4 4', 10))
    # camera body: rectangle rotated to heading
    deg = heading_deg
    out.append(f'<g transform="translate({cx},{cy}) rotate({deg})"><rect x="-16" y="-11" width="26" height="22" rx="3" fill="#111"/><polygon points="10,-8 22,-13 22,13 10,8" fill="#111"/></g>')
    out.append(text(cx + ldx, cy + ldy, label, 13, '#000', 'start', 700))
    return out


def person(pid, x, y, facing_deg, end=None, note=None, label_dx=16, label_dy=-14, via=None):
    if START_ONLY:
        end = via = None
    c = COL[pid]
    a = math.radians(facing_deg)
    out = []
    if end:
        pts = [(x, y)] + (via or []) + [end]
        for (x1, y1), (x2, y2) in zip(pts[:-2], pts[1:-1]):
            out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="3" stroke-dasharray="7 5"/>')
        out.append(arrow(pts[-2][0], pts[-2][1], end[0], end[1], c, 3, '7 5', 12))
        out.append(f'<circle cx="{end[0]}" cy="{end[1]}" r="11" fill="none" stroke="{c}" stroke-width="2.5"/>')
    out.append(f'<circle cx="{x}" cy="{y}" r="13" fill="{c}" stroke="#fff" stroke-width="2"/>')
    out.append(arrow(x, y, x + 34 * math.cos(a), y + 34 * math.sin(a), c, 5, None, 12))
    out.append(text(x + label_dx, y + label_dy, LABEL[pid], 12, c, 'start', 700))
    for i, line in enumerate([note] if isinstance(note, str) else (note or [])):
        out.append(text(x + label_dx, y + label_dy + 16 + i * 15, line, 12, INK, 'start', 400))
    return out


def frame_panel(ox, oy, items, caption):
    """9:16 frame preview. items: (kind, x, y, w, h, label, color) in 0..1 frame units."""
    W, H = 300, 533
    out = [text(ox, oy - 12, 'WHAT THE CAMERA SEES (9:16)', 15, INK, 'start', 700),
           f'<rect x="{ox}" y="{oy}" width="{W}" height="{H}" fill="#ffffff" stroke="{INK}" stroke-width="2"/>']
    for i in (1, 2):
        out.append(f'<line x1="{ox+W*i/3:.0f}" y1="{oy}" x2="{ox+W*i/3:.0f}" y2="{oy+H}" stroke="#c8cccd" stroke-dasharray="4 4"/>')
    out.append(text(ox + W / 6, oy + H + 18, 'LEFT', 11, MUTED, 'middle'))
    out.append(text(ox + W / 2, oy + H + 18, 'CENTRE', 11, MUTED, 'middle'))
    out.append(text(ox + 5 * W / 6, oy + H + 18, 'RIGHT', 11, MUTED, 'middle'))
    labels = []
    out.append(f'<clipPath id="frameclip"><rect x="{ox}" y="{oy}" width="{W}" height="{H}"/></clipPath><g clip-path="url(#frameclip)">')
    for it in items:
        kind, x, y, w, h, label, color = it[:7]
        dy = it[7] if len(it) > 7 else 0
        X, Y, WW, HH = ox + x * W, oy + y * H, w * W, h * H
        if kind == 'box':
            out.append(f'<rect x="{X:.0f}" y="{Y:.0f}" width="{WW:.0f}" height="{HH:.0f}" fill="{color}" fill-opacity="0.85" stroke="{INK}"/>')
            r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5))
            light = (0.299 * r + 0.587 * g + 0.114 * b) > 150
            labels.append((X + WW / 2, Y + 16, label, INK if light else '#ffffff', color))
        else:  # person figure: head + body
            out.append(f'<circle cx="{X:.0f}" cy="{Y:.0f}" r="{max(5, WW*0.35):.0f}" fill="{color}"/>')
            out.append(f'<rect x="{X-WW/2:.0f}" y="{Y+WW*0.4:.0f}" width="{WW:.0f}" height="{HH:.0f}" rx="4" fill="{color}"/>')
            if label:
                labels.append((X, Y + WW * 0.4 + HH + 14 + dy, label, color, '#ffffff'))
    out.append('</g>')
    for X, Y, label, fg, halo in labels:
        out.append(f'<text x="{X:.0f}" y="{Y:.0f}" font-size="11" fill="{fg}" text-anchor="middle" font-weight="700" font-family="Arial, Helvetica, sans-serif" paint-order="stroke" stroke="{halo}" stroke-width="4">{label}</text>')
    for i, line in enumerate(caption):
        out.append(text(ox, oy + H + 40 + i * 16, line, 12, INK, 'start', 400))
    return out


def svg(shot, title, subtitle, plan, frame, notes):
    for c in CAMS:
        if c[0] is None:
            c[0] = shot
    body = ''.join(plan + frame)
    notes_svg = ''.join(text(20, 848 + i * 18, n, 13, INK, 'start', 400) for i, n in enumerate(notes))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="{866 + 18*len(notes)}" viewBox="0 0 1160 {866 + 18*len(notes)}">
<rect width="100%" height="100%" fill="#ffffff"/>
<g transform="translate(20,40)">{body}</g>
{text(20, 26, f"{shot} — FIRST FRAME ONLY: start positions and facing — not an image to copy" if START_ONLY else f"{shot} — TOP-DOWN PLAN: positions and directions only, not an image to copy", 16, INK, 'start', 700)}
{text(20, 826, title, 14, INK, 'start', 700)}
{text(760, 26, subtitle, 12, MUTED, 'start', 400)}
{notes_svg}
</svg>'''


maps = {}

# ---------------- SH02 ----------------
plan = base_plan('from frame-LEFT')
plan += camera(300, 690, -90, 62, 560, 'CAMERA 24mm, eye level', move_to=(290, 610))
plan += person('owen', 178, 462, 0, note='case ALREADY OUT → set on gravel', label_dx=-170, label_dy=38)
plan += person('mara', 272, 462, 180, note='case STILL INSIDE → stays in (lifted in SH04)', label_dx=18, label_dy=30)
plan += person('elias', 350, 330, -90, end=(338, 215), note=['walks AWAY toward the steps,', 'camera visible in his RIGHT hand,', 'stops short of the steps'], label_dx=22, label_dy=4)
plan.append(f'<circle cx="160" cy="430" r="7" fill="{COL["owen"]}" opacity="0.5"/>')
frame = frame_panel(760, 60 - 40 + 40, [
    ('box', 0.0, 0.0, 1.0, 0.42, 'MANOR FACADE', '#cfc6b3'),
    ('box', 0.62, 0.36, 0.2, 0.06, 'STEPS + DOOR', '#ddd5c3'),
    ('box', 0.04, 0.45, 0.5, 0.3, 'SUV (rear to camera, tailgate open)', '#27402f'),
    ('fig', 0.08, 0.6, 0.08, 0.2, 'BEARDED', COL['owen']),
    ('fig', 0.48, 0.6, 0.06, 0.16, 'RUST', COL['mara']),
    ('fig', 0.75, 0.5, 0.06, 0.17, 'OLIVE (back)', COL['elias']),
], ['SUV fills the LEFT half.', 'Tall man in the RIGHT third, back to camera,', 'open gravel between him and the steps.'])
maps['SH02'] = svg('SH02', 'Crew already unloading; the tall man heads for the door',
                   'Camera behind the SUV, slightly right, looking at the house', plan, frame,
                   ['Nobody looks at the camera. The tall man’s face is never seen.',
                    'Bearded man: case already out → lowers it onto the gravel by the rear wheel. Small woman: compact case stays IN the boot (she lifts it in SH04).'])

# ---------------- SH03 ----------------
plan = base_plan('= frame-RIGHT in this reverse view')
plan += camera(330, 185, 90, 50, 520, 'CAMERA 35mm, back to the house', move_to=(330, 160))
plan += person('elias', 330, 262, -90, end=(330, 215), note=['walks TOWARD camera (= toward house),', 'camera at chest height,', 'eyes ABOVE the lens'], label_dx=22, label_dy=0)
plan += person('owen', 205, 470, -90, note=['picks his case up off', 'the gravel by the rear wheel'], label_dx=-190, label_dy=40)
plan += person('mara', 250, 470, -90, label_dx=20, label_dy=38)
frame = frame_panel(760, 60, [
    ('box', 0.0, 0.0, 1.0, 0.45, 'DRIVE, LAWNS, TREES (house is BEHIND camera)', '#efe8d8'),
    ('box', 0.58, 0.38, 0.38, 0.16, 'SUV front-on', '#27402f'),
    ('fig', 0.9, 0.39, 0.04, 0.08, '', COL['owen']),
    ('fig', 0.66, 0.39, 0.035, 0.07, '', COL['mara']),
    ('fig', 0.5, 0.22, 0.24, 0.66, 'OLIVE (front, walking to us)', COL['elias']),
], ['The manor is NOT in frame.', 'SUV on frame-RIGHT, seen from its FRONT,', 'crew at its far end. Sun from frame-RIGHT.'])
maps['SH03'] = svg('SH03', 'The tall man walks toward the house — VO 1',
                   'Reverse view: camera between SUV and house, moving backward', plan, frame,
                   ['Continuity with SH02: he is on the gravel between the SUV and the steps, still walking toward the house.',
                    'He looks up above the lens at the upstairs windows (they are behind the camera). Never into the lens.'])

# ---------------- SH04 ----------------
plan = base_plan('= AHEAD of camera (backlight)')
plan += camera(420, 470, 180, 55, 330, 'CAMERA 50mm, side-on to the SUV', move_to=(420, 430))
plan += person('mara', 238, 478, -90, end=(292, 300), via=[(292, 478)], note=['faces INTO the boot (frame-right),', 'lifts the case out, then walks along', 'the camera side of the SUV', 'toward the house (frame-right)'], label_dx=-10, label_dy=64)
frame = frame_panel(760, 60, [
    ('box', 0.55, 0.05, 0.45, 0.35, 'MANOR + STEPS (soft)', '#cfc6b3'),
    ('box', 0.0, 0.38, 1.0, 0.3, 'SUV side-on: REAR/open boot LEFT, nose RIGHT', '#27402f'),
    ('fig', 0.36, 0.3, 0.16, 0.5, 'RUST (profile, facing right)', COL['mara'], 22),
], ['Open boot on frame-LEFT, nose toward the', 'house on frame-RIGHT. Low sun ahead:', 'she is backlit. She exits frame-RIGHT.'])
maps['SH04'] = svg('SH04', 'The small woman lifts the camera case, checks the latch — VO 2',
                   'Camera on the east side of the SUV looking across it (west)', plan, frame,
                   ['Case STILL INSIDE the boot in the start frame → she lifts it out, then walks toward the house along the camera side of the SUV.',
                    'Screen direction: toward the house = frame-RIGHT in this shot.'])

# ---------------- SH05 ----------------
plan = base_plan('= frame-RIGHT in this reverse view')
plan += camera(330, 185, 90, 50, 520, 'CAMERA 35mm, back to the house', move_to=(330, 165))
plan += person('clara', 305, 262, -90, end=(305, 232), note=['half a step ahead; points UP past', 'the camera at an upstairs window'], label_dx=-250, label_dy=-6)
plan += person('naomi', 362, 280, -90, end=(362, 248), note=['taller; listens,', 'eyes follow her raised arm'], label_dx=22, label_dy=10)
frame = frame_panel(760, 60, [
    ('box', 0.0, 0.0, 1.0, 0.4, 'DRIVE, LAWNS (house is BEHIND camera)', '#efe8d8'),
    ('box', 0.62, 0.36, 0.3, 0.1, 'SUV (soft)', '#27402f'),
    ('fig', 0.3, 0.2, 0.2, 0.66, 'CAMEL (left)', COL['naomi']),
    ('fig', 0.7, 0.24, 0.17, 0.66, 'ICE-BLUE (right)', COL['clara']),
], ['Tall woman on the LEFT, copper-haired', 'woman on the RIGHT half a step ahead,', 'arm raised above the lens. SUV behind', 'them on frame-RIGHT. No house in frame.'])
maps['SH05'] = svg('SH05', 'The two women walk to the front door; she points to a window',
                   'Reverse view: camera backing toward the house ahead of them', plan, frame,
                   ['Camera faces AWAY from the house: the tall woman is on frame-LEFT, the copper-haired woman on frame-RIGHT.',
                    'Both walk toward the camera. Eyes go above the lens, never into it.'])


# ===========================================================================
# Entrance hall (SH06, SH07)
# ===========================================================================

def hall_plan():
    p = [
        '<rect x="0" y="0" width="660" height="760" fill="#e9e4da"/>',
        f'<rect x="60" y="60" width="540" height="640" fill="#f3f0ea" stroke="{INK}" stroke-width="3"/>',
        text(330, 40, 'ENTRANCE HALL (north up)', 18, INK, 'middle', 700),
        # central stair rising north
        f'<rect x="250" y="70" width="160" height="260" fill="#d9cfbf" stroke="{INK}" stroke-width="2"/>',
        ''.join(f'<line x1="250" y1="{y}" x2="410" y2="{y}" stroke="#a89a85"/>' for y in range(90, 330, 20)),
        arrow(330, 310, 330, 90, INK, 3, None, 12),
        text(240, 200, 'CENTRAL STAIR ↑', 13, INK, 'end', 700),
        text(240, 216, 'up to the landing', 11, MUTED, 'end', 400),
        # front door (south wall)
        f'<rect x="295" y="692" width="70" height="16" fill="#fff6d8" stroke="{INK}"/>',
        text(330, 735, 'FRONT DOOR (open, bright)', 13, INK, 'middle', 700),
        # service door on the right-hand (east) wall
        f'<rect x="592" y="380" width="16" height="56" fill="#8a6a45" stroke="{INK}"/>',
        text(585, 372, 'SERVICE DOOR', 13, INK, 'end', 700),
        text(585, 452, '→ service hall', 12, MUTED, 'end', 400),
        # window on the left-hand (west) wall with a bar of sun
        f'<line x1="60" y1="330" x2="60" y2="450" stroke="#6f8fb8" stroke-width="7"/>',
        text(70, 322, 'TALL WINDOW', 12, MUTED, 'start', 700),
        '<polygon points="62,340 62,440 300,520 300,420" fill="#f2c14e" fill-opacity="0.35"/>',
        text(120, 470, 'bar of low sun', 12, '#a0700a', 'start', 400),
        # dust-sheeted furniture and boxes
        f'<rect x="90" y="560" width="70" height="46" rx="8" fill="#ffffff" stroke="{MUTED}"/>',
        text(125, 620, 'dust sheet', 11, MUTED, 'middle', 400),
        f'<rect x="500" y="560" width="60" height="40" fill="#cdb895" stroke="{MUTED}"/>',
        text(530, 615, 'boxes', 11, MUTED, 'middle', 400),
    ]
    return p


plan = hall_plan()
plan += camera(555, 340, 90, 44, 360, 'CAMERA 50mm, LOW, ~1 m off the east wall', None, ldx=-325, ldy=70)
plan += person('owen', 470, 560, -80, end=(575, 330), via=[(540, 420)], note=['START: walking toward camera, waist-up,', 'RIGHT hand reaching for the knob (door CLOSED),', 'case in LEFT hand; tries the knob, then', 'passes the camera on its LEFT (wall side)', 'toward the stair behind the camera'], label_dx=-150, label_dy=-90)
frame = frame_panel(760, 60, [
    ('box', 0.34, 0.12, 0.3, 0.4, 'FRONT DOOR (bright)', '#fff6d8'),
    ('box', 0.0, 0.08, 0.16, 0.8, 'SERVICE DOOR', '#8a6a45'),
    ('box', 0.8, 0.14, 0.2, 0.36, 'WINDOW', '#6f8fb8'),
    ('fig', 0.46, 0.3, 0.3, 0.63, 'BEARDED (3/4 front, waist-up)', COL['owen'], -200),
], ['MEDIUM shot, waist-up, low angle.', 'Looking BACK at the bright front door.', 'Service door right beside the camera at the', 'LEFT edge; his right hand goes to its knob.'])
maps['SH06'] = svg('SH06', 'Owen carries the heavy case in and checks the service door (MS, 50mm, low)',
                   'NEW ANGLE: beside the service door, looking back at the front door', plan, frame,
                   ['Front door AHEAD of the camera (backlight). Stair BEHIND the camera — not in frame.',
                    'Start frame: his right hand a hand’s width from the knob; the door is still closed.'])

START_ONLY = True  # SH07 onward: first frame only
plan = hall_plan()
plan += camera(372, 500, -90, 60, 470, 'CAMERA 24mm, behind his right shoulder', None, ldx=-330, ldy=110)
plan += person('elias', 392, 455, -95, note=['right foreground, back to camera,', 'handheld raised on the stair'], label_dx=26, label_dy=-6)
plan += person('clara', 300, 200, -90, note=['halfway up, LEFT,', 'climbing away'], label_dx=-250, label_dy=-90)
plan += person('naomi', 362, 210, -90, note=['halfway up, RIGHT, taller'], label_dx=26, label_dy=-20)
plan += person('owen', 350, 338, -90, note=['foot of the stair, right of', 'centre; case in LEFT hand'], label_dx=-300, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.2, 0.04, 0.56, 0.56, 'STAIR (going up, away)', '#d9cfbf'),
    ('box', 0.0, 0.22, 0.1, 0.3, 'WINDOW', '#6f8fb8'),
    ('box', 0.9, 0.3, 0.1, 0.34, 'SERVICE DOOR', '#8a6a45'),
    ('fig', 0.4, 0.2, 0.045, 0.13, 'ICE-BLUE', COL['clara']),
    ('fig', 0.54, 0.18, 0.05, 0.15, 'CAMEL', COL['naomi']),
    ('fig', 0.56, 0.44, 0.08, 0.2, 'BEARDED', COL['owen']),
    ('fig', 0.8, 0.34, 0.3, 0.68, 'OLIVE (back, handheld up)', COL['elias'], -140),
], ['FIRST FRAME. Looking UP the stair; the', 'front door is behind the camera (SH06', 'looked the other way). Women climb', 'away; tall man in the right foreground.'])
maps['SH07'] = svg('SH07', 'First frame: behind the tall man, looking up the stair; the women halfway up (WS, 24mm)',
                   'Mid-hall, looking north up the stair', plan, frame,
                   ['Opposite direction to SH06, so the cut reads as a new view.',
                    'The small woman walks in from behind the camera on the left only during the video.'])

# ===========================================================================
# Upper floor: corridor + nursery (SH08-SH15). North up.
# Corridor x 360-440, far window at the north end; nursery on its west side,
# door in the nursery's east wall near its north end; landing at the south.
# ===========================================================================

def upper_plan(show_room=True):
    p = [
        '<rect x="0" y="0" width="660" height="760" fill="#e6e1d8"/>',
        # corridor
        f'<rect x="360" y="30" width="80" height="610" fill="#efe7da" stroke="{INK}" stroke-width="2"/>',
        f'<rect x="385" y="50" width="30" height="570" fill="#b99a86" opacity="0.45"/>',
        '<line x1="368" y1="30" x2="432" y2="30" stroke="#6f8fb8" stroke-width="7"/>',
        text(452, 330, 'UPPER CORRIDOR', 13, INK, 'start', 700),
        # rooms on the east side
        f'<rect x="440" y="30" width="200" height="610" fill="#ddd6ca" stroke="{MUTED}"/>',
        ''.join(f'<rect x="436" y="{y}" width="8" height="40" fill="#8a6a45"/>' for y in (120, 380, 520)),
        text(540, 460, 'other rooms', 12, MUTED, 'middle', 400),
        # room north of the nursery
        f'<rect x="80" y="30" width="280" height="220" fill="#ddd6ca" stroke="{MUTED}"/>',
        text(220, 140, 'other room', 12, MUTED, 'middle', 400),
        text(355, 22, 'FAR WINDOW (north) →', 12, INK, 'end', 700),
        # landing
        f'<rect x="250" y="640" width="390" height="110" fill="#e0d6c4" stroke="{INK}" stroke-width="2"/>',
        text(445, 700, 'CENTRAL LANDING (south) — top of main stair', 13, INK, 'middle', 700),
        text(445, 718, 'monitor table + upper service door on its west wall', 11, MUTED, 'middle', 400),
        # nursery
        f'<rect x="80" y="250" width="280" height="370" fill="#f4efe6" stroke="{INK}" stroke-width="3"/>',
        text(220, 606, 'NURSERY', 16, INK, 'middle', 700),
        '<line x1="80" y1="265" x2="80" y2="345" stroke="#6f8fb8" stroke-width="7"/>',
        text(8, 300, 'WINDOW', 11, MUTED, 'start', 700),
        # nursery door on its east wall near the north end (hinged south, opens inward)
        f'<rect x="354" y="270" width="12" height="60" fill="#ffffff" stroke="{INK}"/>',
        f'<path d="M360 270 A60 60 0 0 0 300 330" fill="none" stroke="{MUTED}" stroke-dasharray="4 4"/>',
        text(300, 262, 'NURSERY DOOR', 12, INK, 'middle', 700),
    ]
    if show_room:
        p += [
            f'<rect x="86" y="390" width="62" height="200" rx="3" fill="#ffffff" stroke="{INK}"/>',
            text(117, 500, 'BED', 12, INK, 'middle', 700),
            text(117, 404, 'foot', 10, MUTED, 'middle', 400),
            f'<rect x="86" y="592" width="34" height="24" fill="#b08a62" stroke="{INK}"/>',
            '<circle cx="103" cy="604" r="6" fill="#f2b632"/>',
            text(124, 590, 'lamp', 10, MUTED, 'start', 400),
            f'<rect x="306" y="572" width="46" height="42" rx="6" fill="#ffffff" stroke="{INK}"/>',
            text(329, 566, 'armchair', 10, MUTED, 'middle', 400),
            f'<rect x="170" y="360" width="160" height="200" fill="none" stroke="{MUTED}" stroke-dasharray="5 4"/>',
            f'<rect x="215" y="430" width="60" height="40" fill="#5b3f2a" stroke="{INK}"/>',
            text(245, 455, 'CHEST', 10, '#ffffff', 'middle', 700),
            '<circle cx="92" cy="262" r="7" fill="#c1302a"/>',
            text(102, 244, 'NURSERY FIXED corner', 11, '#c1302a', 'start', 700),
        ]
    return p


# ---------------- SH08 ----------------
START_ONLY = True
plan = upper_plan()
plan += camera(400, 140, 90, 50, 540, 'CAMERA 35mm, ~3 m past the door', None, ldx=30, ldy=-6)
plan += person('clara', 382, 500, -90, note=['~7 m from camera, halfway between', 'the landing and the door, on the', 'door side; walking toward camera'], label_dx=64, label_dy=36)
plan += person('naomi', 420, 510, -90, note=['beside her, taller, eyes on her'], label_dx=26, label_dy=-30)
plan.append(text(446, 330, 'door: ALREADY OPEN, nobody here', 12, INK, 'start', 700))
plan.append(text(446, 410, 'empty runner, ~4 m — nobody on it', 12, MUTED, 'start', 400))
frame = frame_panel(760, 60, [
    ('box', 0.4, 0.2, 0.2, 0.18, 'LANDING (far end)', '#efe7da'),
    ('box', 0.8, 0.06, 0.2, 0.84, 'OPEN DOOR (close)', '#ffffff'),
    ('fig', 0.45, 0.4, 0.035, 0.17, 'CAMEL', COL['naomi'], 14),
    ('fig', 0.56, 0.42, 0.032, 0.15, 'ICE-BLUE', COL['clara']),
], ['FIRST FRAME. Wide, looking back to the landing.', 'Open door close to camera at the RIGHT edge.', 'The women SMALL and FAR, halfway to the', 'landing: empty floor between them and the door.'])
maps['SH08'] = svg('SH08', 'First frame: the two women far down the corridor; the open door close to camera, nobody at it',
                   'Reverse corridor view from the far-window end, looking south', plan, frame,
                   ['The door is already open (script C2) and nobody is near it. The women reach it only later, in the video.',
                    'Copper-haired woman on the door side (frame-right of centre); the taller woman frame-left of centre.'])

# ---------------- SH09 ----------------
plan = upper_plan()
plan += camera(384, 262, 128, 50, 380, 'CAMERA 35mm, just outside the door', None, ldx=20, ldy=-22)
frame = frame_panel(760, 60, [
    ('box', 0.0, 0.0, 0.14, 1.0, 'FRAME', '#f4efe6'),
    ('box', 0.86, 0.0, 0.14, 1.0, 'FRAME', '#f4efe6'),
    ('box', 0.14, 0.12, 0.2, 0.74, 'DOOR LEAF', '#ffffff'),
    ('box', 0.34, 0.24, 0.46, 0.2, 'FAR WALL', '#efe7da'),
    ('box', 0.35, 0.44, 0.12, 0.1, 'ARMCHAIR', '#ffffff'),
    ('box', 0.52, 0.42, 0.06, 0.08, '', '#b08a62'),
    ('box', 0.6, 0.5, 0.2, 0.12, 'BED', '#ffffff'),
    ('box', 0.8, 0.26, 0.06, 0.3, '', '#6f8fb8'),
    ('box', 0.44, 0.64, 0.18, 0.1, 'CHEST+BOX', '#5b3f2a'),
], ['FIRST FRAME = the approved image: through', 'the open door and DOWN the room. Leaf LEFT;', 'bed along the RIGHT wall, foot nearest; chest', 'centre; lamp far end; armchair far-left;', 'window (blue) on the right wall.'])
maps['SH09'] = svg('SH09', 'First frame: through the open door, down the length of the room (INSERT)',
                   'Just outside the door, looking in and down the room', plan, frame,
                   ['This matches the approved nursery plate: bed along the west wall, foot at the window end, lamp and armchair at the far end.',
                    'No people. SH13 and SH14 look straight across at the window corner instead.'])

# ---------------- SH10 ----------------
plan = upper_plan()
plan += camera(400, 170, 90, 52, 470, 'CAMERA 35mm, ahead of them', None)
plan += person('clara', 380, 300, -90, note=['level with the open door,', 'head turned to it (her LEFT)'], label_dx=-250, label_dy=30)
plan += person('naomi', 422, 310, -90, note=['beside her, eyes on her'], label_dx=26, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.34, 0.12, 0.32, 0.34, 'CORRIDOR → LANDING', '#efe7da'),
    ('box', 0.84, 0.15, 0.16, 0.65, 'OPEN DOOR', '#ffffff'),
    ('fig', 0.3, 0.3, 0.34, 0.72, 'CAMEL (waist-up)', COL['naomi'], -200),
    ('fig', 0.68, 0.34, 0.32, 0.7, 'ICE-BLUE (looks right)', COL['clara'], -180),
], ['FIRST FRAME: both level with the doorway', 'on the RIGHT, mid-stride. She looks into it', '(her left = frame-right).'])
maps['SH10'] = svg('SH10', 'First frame: both women level with the open doorway, mid-stride (MS, 35mm)',
                   'Same reverse corridor direction, tighter', plan, frame,
                   ['First frame only. The dialogue and the walk past the door are in the video prompt.'])

# ---------------- SH11 ----------------
plan = upper_plan()
plan += camera(436, 118, 124, 24, 300, 'CAMERA 85mm, ahead + to her side', None, ldx=20, ldy=-20)
plan += person('clara', 385, 190, -90, note=['~2 m past the door, eyes forward,', 'seen three-quarter'], label_dx=-290, label_dy=-40)
plan += person('naomi', 422, 200, -90, note=['soft shoulder, left foreground'], label_dx=26, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.78, 0.2, 0.22, 0.46, 'DOORWAY (soft)', '#ffffff'),
    ('fig', 0.04, 0.3, 0.32, 0.9, '', COL['naomi']),
    ('fig', 0.6, 0.3, 0.5, 0.9, 'ICE-BLUE (3/4, chest-up)', COL['clara'], -200),
], ['MEDIUM CLOSE-UP, 85mm, 45° off their', 'walking line (SH10 was straight on).', 'Taller woman a soft shoulder, LEFT;', 'the doorway soft behind her.'])
maps['SH11'] = svg('SH11', 'First frame: the copper-haired woman three-quarter, 45° off the corridor axis (MCU, 85mm)',
                   'Ahead of them, off to the taller woman’s side', plan, frame,
                   ['A new angle, not a tighter version of SH10: the camera moves 45° round to her side.',
                    'They have passed the nursery door; it is soft in the background behind her.'])

# ---------------- SH12 ----------------
plan = upper_plan()
plan += camera(410, 660, -90, 40, 640, 'CAMERA 24mm, LOCKED', None, ldx=30, ldy=-24)
plan += person('mara', 392, 440, -90, note=['a few steps short of the door,', 'back to camera; camera+bracket', 'right hand, monitor case left'], label_dx=26, label_dy=-30)
plan += person('elias', 420, 480, -90, label_dx=26, label_dy=24, note=['a step behind, handheld lowered'])
plan += person('clara', 385, 120, -90, label_dx=-250, label_dy=0, note=['far away near the window,', 'backs to camera'])
plan += person('naomi', 415, 130, -90, label_dx=26, label_dy=60)
plan += person('owen', 425, 60, 180, note=['kneels at an open case,', 'far end'], label_dx=26, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.38, 0.1, 0.24, 0.3, 'FAR WINDOW', '#6f8fb8'),
    ('box', 0.14, 0.26, 0.12, 0.4, 'NURSERY DOOR', '#ffffff'),
    ('fig', 0.45, 0.33, 0.02, 0.05, '', COL['clara']),
    ('fig', 0.53, 0.32, 0.022, 0.055, '', COL['naomi']),
    ('fig', 0.58, 0.4, 0.03, 0.04, 'BEARDED', COL['owen']),
    ('fig', 0.32, 0.46, 0.1, 0.3, 'RUST (back)', COL['mara']),
    ('fig', 0.5, 0.5, 0.11, 0.34, 'OLIVE (back)', COL['elias']),
], ['FIRST FRAME. Wide from the landing end.', 'Nursery door on the LEFT wall.', 'Small woman + tall man a few steps short', 'of it, backs to camera; others far away.'])
maps['SH12'] = svg('SH12', 'First frame: small woman and tall man a few steps short of the nursery door (WS, 24mm)',
                   'NEW ANGLE: from the landing end, looking north (plate direction)', plan, frame,
                   ['Opposite direction to SH08–SH11: a clear new setup.',
                    'The bearded man kneels at his open case near the far-window end.'])

# ---------------- SH13 ----------------
plan = upper_plan()
plan += camera(372, 300, 188, 58, 300, 'HANDHELD from the doorway (host, unseen)', None)
plan += person('mara', 104, 276, -135, note=['on a step stool in the corner', 'above the window, arms up,', 'hands on the camera + bracket'], label_dx=24, label_dy=34)
plan.append('<rect x="128" y="292" width="22" height="16" fill="#111"/>')
plan.append(text(154, 318, 'monitor case on the floor', 11, INK, 'start', 400))
frame = frame_panel(760, 60, [
    ('box', 0.58, 0.28, 0.36, 0.32, 'WINDOW', '#6f8fb8'),
    ('box', 0.0, 0.55, 0.75, 0.16, 'IRON BED', '#ffffff'),
    ('box', 0.1, 0.76, 0.3, 0.1, 'CHEST + BOX', '#5b3f2a'),
    ('fig', 0.78, 0.08, 0.14, 0.42, 'RUST (on stool, arms up)', COL['mara'], 6),
], ['Corner above the window, ahead-RIGHT.', 'Bed below along the wall, chest', 'ahead-left on the rug.'])
maps['SH13'] = svg('SH13', 'First frame: the small woman on the stool in the corner, hands on the camera (MS, handheld)',
                   'The host films from the doorway toward the corner above the window', plan, frame,
                   ['This corner is the NURSERY FIXED position seen in the approved high-corner plate.',
                    'The camera’s tiny preview screen faces us (replaced in post).'])

# ---------------- SH13A ----------------
plan = upper_plan()
plan += camera(400, 140, 90, 44, 560, 'CAMERA 35mm, a few m past the door', None, ldx=30, ldy=-6)
plan += person('owen', 402, 300, 90, note=['back to camera, just reaching', 'the open door; camera + pouch'], label_dx=40, label_dy=30)
plan += person('naomi', 386, 232, 90, note=['behind him, nearer camera,', 'eyes on her recorder'], label_dx=-270, label_dy=-70)
frame = frame_panel(760, 60, [
    ('box', 0.4, 0.2, 0.2, 0.2, 'LANDING (far end)', '#efe7da'),
    ('box', 0.8, 0.08, 0.2, 0.8, 'OPEN DOOR (empty)', '#ffffff'),
    ('fig', 0.52, 0.3, 0.1, 0.42, 'BEARDED (back)', COL['owen']),
    ('fig', 0.32, 0.34, 0.16, 0.6, 'CAMEL (back 3/4)', COL['naomi'], -240),
], ['FIRST FRAME: the approved reverse corridor', 'view. Both walk AWAY toward the landing;', 'he is just reaching the open door on the', 'RIGHT. Nobody in the doorway.'])
maps['SH13A'] = svg('SH13A', 'First frame: the bearded man reaching the open door, the woman with locs behind him (MWS, 35mm)',
                    'Corridor, looking back to the landing', plan, frame,
                    ['Script D3 on its own, before the banter inside the room (SH14).',
                     'Same direction as SH08 but not consecutive with it; the room is not visible from here.'])

# ---------------- SH14 ----------------
plan = upper_plan()
plan += camera(200, 604, -95, 50, 380, 'CAMERA 28mm, far end, locked', None, ldx=-185, ldy=46)
plan += person('mara', 110, 280, -135, note=['on the stool in the corner,', 'hands on the camera'], label_dx=40, label_dy=60)
plan.append('<rect x="128" y="292" width="22" height="16" fill="#111"/>')
plan += person('elias', 255, 420, -150, note=['inside the room, turned to her,', 'handheld raised'], label_dx=40, label_dy=-40)
plan.append(text(372, 360, 'door OUT of frame', 12, INK, 'start', 700))
frame = frame_panel(760, 60, [
    ('box', 0.0, 0.28, 0.2, 0.62, 'BED', '#ffffff'),
    ('box', 0.04, 0.08, 0.2, 0.18, 'WINDOW', '#6f8fb8'),
    ('box', 0.36, 0.7, 0.2, 0.1, 'CHEST + BOX', '#5b3f2a'),
    ('box', 0.86, 0.1, 0.14, 0.7, 'PLAIN WALL', '#efe7da'),
    ('fig', 0.66, 0.28, 0.12, 0.46, 'OLIVE (profile)', COL['elias'], 10),
    ('fig', 0.2, 0.1, 0.1, 0.26, 'RUST (on stool)', COL['mara'], 8),
], ['REVERSE of SH13, only two people:', 'small woman upper-left on the stool,', 'tall man inside the room right of centre.', 'No door and nobody else in frame.'])
maps['SH14'] = svg('SH14', 'First frame: the woman on the stool and the man filming her — only two people (MWS, 28mm)',
                   'Inside the nursery, far end, looking back', plan, frame,
                   ['The door is out of frame to the right; the camera is angled so only plain wall shows there.',
                    'The corridor pass (script D3) is its own shot, SH13A.'])

# ---------------- SH15 ----------------
plan = upper_plan()
plan += camera(410, 500, -90, 30, 480, 'CAMERA 50mm, static', None, ldx=30, ldy=36)
plan += person('owen', 405, 380, 90, note=['just past the door,', 'walking TOWARD camera, deadpan'], label_dx=30, label_dy=40)
plan += person('naomi', 418, 320, 90, note=['behind him, eyes ahead,', 'recorder in her hands'], label_dx=30, label_dy=-10)
plan += person('elias', 368, 300, 180, note=['in the doorway (profile),', 'filming into the room'], label_dx=-260, label_dy=50)
frame = frame_panel(760, 60, [
    ('box', 0.38, 0.08, 0.24, 0.26, 'FAR WINDOW', '#6f8fb8'),
    ('box', 0.0, 0.14, 0.2, 0.56, 'NURSERY DOOR', '#ffffff'),
    ('fig', 0.12, 0.3, 0.07, 0.3, 'OLIVE (profile)', COL['elias']),
    ('fig', 0.76, 0.3, 0.08, 0.28, 'CAMEL', COL['naomi']),
    ('fig', 0.5, 0.36, 0.3, 0.57, 'BEARDED (waist-up)', COL['owen'], -200),
], ['MEDIUM shot, 50mm, looking north.', 'Bearded man waist-up, walking at us.', 'Doorway on the LEFT wall with the tall man.', 'Taller woman behind, right of centre.'])
maps['SH15'] = svg('SH15', 'First frame: bearded man just past the door, walking at camera (MS, 50mm)',
                   'NEW ANGLE: in the corridor south of the door, looking north', plan, frame,
                   ['Frontal medium after the side-on wide of SH14: walking toward the landing = toward this camera.',
                    'Nobody has turned their head yet.'])

# ---------------- SH16 ----------------
plan = upper_plan()
plan += camera(434, 300, 180, 46, 360, 'CAMERA 35mm, locked, facing the doorway', None, ldx=-40, ldy=60)
plan += person('mara', 110, 280, -135, note=['through the doorway, ahead-right,', 'on the stool: final twist'], label_dx=40, label_dy=60)
plan.append('<rect x="128" y="292" width="22" height="16" fill="#111"/>')
plan.append(text(154, 318, 'monitor case on the floor', 11, INK, 'start', 400))
frame = frame_panel(760, 60, [
    ('box', 0.22, 0.08, 0.56, 0.82, 'DOORWAY (empty)', '#f4efe6'),
    ('box', 0.58, 0.26, 0.14, 0.2, 'WINDOW', '#6f8fb8'),
    ('box', 0.26, 0.5, 0.48, 0.12, 'BED (foot right)', '#ffffff'),
    ('box', 0.28, 0.66, 0.18, 0.08, 'CHEST', '#5b3f2a'),
    ('fig', 0.6, 0.12, 0.06, 0.18, 'RUST (on stool)', COL['mara'], 6),
], ['FIRST FRAME: from the corridor straight', 'into the empty doorway. Small woman', 'ahead-right, high in the corner.'])
maps['SH16'] = svg('SH16', 'First frame: through the empty doorway, the small woman on the stool in the corner (MWS, 35mm)',
                   'Corridor, square to the doorway', plan, frame,
                   ['Everyone else has gone toward the landing (frame-left).',
                    'SH15 looked north along the corridor; this faces the doorway (west).'])

# ---------------- SH17 ----------------
plan = hall_plan()
plan += camera(300, 640, -90, 60, 600, 'CAMERA 24mm, gimbal, pans right', None, ldx=-240, ldy=50)
plan += person('owen', 330, 330, 90, note=['first, on the last steps,', 'coming down toward camera'], label_dx=26, label_dy=-50)
plan += person('elias', 330, 270, 90, label_dx=26, label_dy=-30, note=['handheld raised on him'])
plan += person('mara', 330, 210, 90, label_dx=26, label_dy=-20, note=['monitor case'])
plan += person('naomi', 330, 150, 90, label_dx=26, label_dy=-10)
frame = frame_panel(760, 60, [
    ('box', 0.24, 0.04, 0.52, 0.56, 'STAIR', '#d9cfbf'),
    ('box', 0.86, 0.3, 0.14, 0.34, 'SERVICE DOOR', '#8a6a45'),
    ('box', 0.0, 0.26, 0.1, 0.3, 'WINDOW', '#6f8fb8'),
    ('fig', 0.5, 0.08, 0.035, 0.08, '', COL['naomi']),
    ('fig', 0.5, 0.2, 0.04, 0.09, '', COL['mara']),
    ('fig', 0.5, 0.32, 0.05, 0.12, 'OLIVE', COL['elias']),
    ('fig', 0.52, 0.46, 0.07, 0.2, 'BEARDED', COL['owen']),
], ['WIDE from the front door (plate direction).', 'Single file on the stair, coming down', 'toward camera. Service door frame-RIGHT,', 'CLOSED; nobody at it yet.'])
maps['SH17'] = svg('SH17', 'First frame: the four in single file on the stair, coming down (WS, 24mm)',
                   'Hall, VIEW A: from just inside the front door', plan, frame,
                   ['All four on the stair; nobody at the service door yet (it is CLOSED, frame-RIGHT).',
                    'Front door behind the camera.'])


# ===========================================================================
# Service hall (SH18-SH21). North up. Entered from the hall service door (west);
# the bell board is on the east (back) wall.
# ===========================================================================

def svc_plan():
    return [
        '<rect x="0" y="0" width="660" height="760" fill="#e6e1d8"/>',
        text(330, 40, 'SERVICE HALL (north up)', 18, INK, 'middle', 700),
        f'<rect x="200" y="180" width="400" height="420" fill="#efe8dc" stroke="{INK}" stroke-width="3"/>',
        f'<rect x="60" y="330" width="140" height="90" fill="#efe8dc" stroke="{INK}" stroke-width="2"/>',
        text(130, 316, 'short passage', 12, MUTED, 'middle', 400),
        f'<rect x="52" y="345" width="16" height="60" fill="#ffffff" stroke="{INK}"/>',
        text(60, 450, 'SERVICE DOOR', 12, INK, 'middle', 700),
        text(60, 466, '← entrance hall', 11, MUTED, 'middle', 400),
        # small high window on the north wall + cold shaft
        '<line x1="300" y1="180" x2="380" y2="180" stroke="#6f8fb8" stroke-width="7"/>',
        text(340, 170, 'SMALL HIGH WINDOW', 11, MUTED, 'middle', 700),
        '<polygon points="300,184 380,184 470,330 390,330" fill="#bcd0e6" fill-opacity="0.45"/>',
        text(392, 250, 'cold shaft of daylight', 11, '#4f6f95', 'start', 400),
        # bell board on the east wall, lower panel under it
        f'<rect x="586" y="320" width="14" height="100" fill="#5b3f2a" stroke="{INK}"/>',
        text(578, 300, 'BELL BOARD', 13, INK, 'end', 700),
        text(578, 314, '3×3 labelled windows, NURSERY = centre', 11, MUTED, 'end', 400),
        f'<rect x="572" y="350" width="12" height="40" fill="#8a6a45" stroke="{INK}"/>',
        # lower service door right of the board (south of it when facing east)
        f'<rect x="592" y="440" width="16" height="60" fill="#8a6a45" stroke="{INK}"/>',
        text(582, 526, 'LOWER SERVICE DOOR', 12, INK, 'end', 700),
        text(582, 542, '→ back stair', 11, MUTED, 'end', 400),
        '<circle cx="566" cy="336" r="5" fill="#f2b632"/>',
        text(330, 640, 'the lower wooden panel is under the board at knee height', 11, MUTED, 'middle', 400),
        text(330, 656, 'night: one bare bulb above the board', 11, MUTED, 'middle', 400),
    ]


# ---------------- SH18 ----------------
plan = svc_plan()
plan += camera(230, 380, 0, 50, 400, 'CAMERA 35mm, passage entrance, drifts in', move_to=(262, 380), ldx=-200, ldy=130)
plan += person('owen', 556, 382, 0, note=['at the board, about to crouch;', 'panel still CLOSED'], label_dx=-230, label_dy=180)
plan += person('elias', 512, 350, 10, note=['behind his LEFT shoulder,', 'handheld on the panel'], label_dx=-170, label_dy=70)
plan += person('mara', 430, 214, -90, note=['by the left (north) wall, the', 'monitor case just touching the floor'], label_dx=-230, label_dy=14)
plan += person('naomi', 350, 262, 10, note=['behind her, nearer camera'], label_dx=-150, label_dy=60)
frame = frame_panel(760, 60, [
    ('box', 0.46, 0.2, 0.3, 0.3, 'BELL BOARD', '#5b3f2a'),
    ('box', 0.52, 0.52, 0.18, 0.1, 'PANEL', '#8a6a45'),
    ('box', 0.8, 0.22, 0.14, 0.5, 'LOWER DOOR', '#8a6a45'),
    ('box', 0.06, 0.02, 0.26, 0.1, 'HIGH WINDOW', '#6f8fb8'),
    ('fig', 0.6, 0.34, 0.08, 0.3, 'BEARDED (back)', COL['owen'], 16),
    ('fig', 0.44, 0.33, 0.07, 0.3, 'OLIVE', COL['elias'], 12),
    ('fig', 0.16, 0.36, 0.06, 0.24, 'RUST', COL['mara']),
    ('fig', 0.3, 0.38, 0.11, 0.42, 'CAMEL (back)', COL['naomi']),
], ['WIDE from the passage entrance.', 'Board centre, lower door frame-RIGHT,', 'high window frame-LEFT.'])
maps['SH18'] = svg('SH18', 'First frame: bearded man at the board, panel CLOSED; the crew around him (WS, 35mm)',
                   'Service hall, VIEW A: from the passage entrance facing the board', plan, frame,
                   ['The hall service door is BEHIND the camera; everyone faces the board.',
                    'Same setup returns in SH21 (not consecutive, so it reads as the master of this scene).'])

# ---------------- SH19 ----------------
plan = svc_plan()
plan += camera(540, 392, 12, 34, 70, 'HANDHELD, close, looking down', None, ldx=-280, ldy=80)
plan += person('owen', 566, 416, -10, note=['only his hand and cuff', 'hold the panel OPEN'], label_dx=-250, label_dy=130)
frame = frame_panel(760, 60, [
    ('box', 0.06, 0.12, 0.7, 0.64, 'OPEN PANEL: CUT BELL WIRES', '#5b3f2a'),
    ('box', 0.74, 0.24, 0.26, 0.5, 'HIS HAND', COL['owen']),
], ['INSERT, 50mm handheld.', 'Cut wires fill the frame; his hand holds', 'the panel OPEN on the RIGHT.'])
maps['SH19'] = svg('SH19', 'First frame: the open panel, cut wires, his hand holding it (INSERT, 50mm)',
                   'Service hall, the host’s camera at knee height at the panel', plan, frame,
                   ['Hand on frame-RIGHT = he is on the camera’s right, as in SH18.'])

# ---------------- SH20 ----------------
plan = svc_plan()
plan += camera(520, 414, -12, 44, 84, 'HANDHELD 35mm, behind his RIGHT shoulder', None, ldx=-360, ldy=60)
plan += person('owen', 560, 386, 0, note=['square to the board; finger on', 'the NURSERY flag, not yet pressing'], label_dx=-320, label_dy=110)
plan += person('mara', 556, 312, 45, note=['left of the board, tightening', 'the camera on its clamp'], label_dx=-280, label_dy=-40)
frame = frame_panel(760, 60, [
    ('box', 0.3, 0.12, 0.46, 0.38, 'BELL BOARD · NURSERY', '#5b3f2a'),
    ('box', 0.84, 0.2, 0.16, 0.6, 'LOWER DOOR', '#8a6a45'),
    ('fig', 0.16, 0.26, 0.14, 0.5, 'RUST (3/4)', COL['mara']),
    ('fig', 0.7, 0.34, 0.34, 0.6, 'BEARDED (back 3/4, right profile)', COL['owen'], -200),
], ['MEDIUM, over his RIGHT shoulder.', 'NURSERY label readable above his finger.', 'Small woman frame-LEFT at her clamp.'])
maps['SH20'] = svg('SH20', 'First frame: finger on the NURSERY flag, not yet pressing; she at her clamp (MS, 35mm)',
                   'Service hall, closer: behind his right shoulder', plan, frame,
                   ['Change of size (WS → INSERT → MS) around one board keeps the cuts from jumping.',
                    'Her camera on its clamp is left of the board, facing it = BELL BOARD FIXED.'])


# ===========================================================================
# Location maps: one per main location. Two opposite views (A and B, 180°
# apart) = the columns of the 2×2 location sheet; day and night = its rows.
# Every shot setup that uses the location is marked with its number.
# ===========================================================================

def setup_marks(shots, color):
    out = []
    for shot, x, y, h in CAMS:
        if shot not in shots:
            continue
        a = math.radians(h)
        out.append(f'<line x1="{x}" y1="{y}" x2="{x + 26 * math.cos(a):.0f}" y2="{y + 26 * math.sin(a):.0f}" stroke="{color}" stroke-width="4"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="12" fill="#ffffff" stroke="{color}" stroke-width="3"/>')
        out.append(text(x, y + 4, shot[2:], 11, color, 'middle', 700))
    return out


def practical(x, y, label, anchor='start', dx=10, dy=4):
    return ['<circle cx="%d" cy="%d" r="8" fill="#f2b632" stroke="#8a5a00" stroke-width="2"/>' % (x, y),
            text(x + dx, y + dy, label, 11, '#8a5a00', anchor, 700)]


def sheet_panel(ox, oy, cells, uses):
    """The 2×2 location sheet as it should come out: columns = views, rows = day/night."""
    w, h, g = 140, 249, 12
    out = [text(ox, oy - 12, 'THE 2×2 LOCATION SHEET (one image)', 15, INK, 'start', 700)]
    for i, (title, lines, fill, ink) in enumerate(cells):
        x = ox + (i % 2) * (w + g)
        y = oy + (i // 2) * (h + g)
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{INK}" stroke-width="2"/>')
        out.append(text(x + 8, y + 20, title, 12, ink, 'start', 700))
        for j, ln in enumerate(lines):
            out.append(text(x + 8, y + 44 + j * 16, ln, 11, ink, 'start', 400))
    y0 = oy + 2 * h + g + 30
    for j, ln in enumerate(uses):
        out.append(text(ox, y0 + j * 17, ln, 12, INK, 'start', 400))
    return out


def loc_svg(key, title, subtitle, plan, panel, notes):
    body = ''.join(plan + panel)
    notes_svg = ''.join(text(20, 848 + i * 18, n, 13, INK, 'start', 400) for i, n in enumerate(notes))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="{866 + 18*len(notes)}" viewBox="0 0 1160 {866 + 18*len(notes)}">
<rect width="100%" height="100%" fill="#ffffff"/>
<g transform="translate(20,40)">{body}</g>
{text(20, 26, f"{key} — LOCATION MAP: view A, view B (180°), light, and every shot setup", 16, INK, 'start', 700)}
{text(20, 826, title, 14, INK, 'start', 700)}
{text(760, 26, subtitle, 12, MUTED, 'start', 400)}
{notes_svg}
</svg>'''


VIEW_A, VIEW_B, SIDE = '#1f5fa8', '#c0501f', '#667073'
DAY, DAYB, NIGHT = '#f6efd9', '#f6efd9', '#27303a'
locmaps = {}


def view(x, y, h, fov, reach, label, color, ldx, ldy):
    a = math.radians(h)
    l, r = a - math.radians(fov / 2), a + math.radians(fov / 2)
    return [f'<polygon points="{x},{y} {x + reach * math.cos(l):.0f},{y + reach * math.sin(l):.0f} {x + reach * math.cos(r):.0f},{y + reach * math.sin(r):.0f}" fill="{color}" fill-opacity="0.08" stroke="{color}" stroke-width="2" stroke-dasharray="8 5"/>',
            f'<g transform="translate({x},{y}) rotate({h})"><rect x="-18" y="-13" width="30" height="26" rx="3" fill="{color}"/><polygon points="12,-9 26,-15 26,15 12,9" fill="{color}"/></g>',
            text(x + ldx, y + ldy, label, 14, color, 'start', 700)]


# Exterior
plan = base_plan('A: from the LEFT · B: from the RIGHT')
plan += view(225, 690, -90, 56, 640, 'VIEW A — at the SUV, looking at the house', VIEW_A, -200, 40)
plan += view(330, 200, 90, 56, 540, 'VIEW B — back to the house, looking out', VIEW_B, 30, 30)
plan += practical(392, 140, 'night: door lantern')
plan += setup_marks(['SH02', 'SH04'], VIEW_A) + setup_marks(['SH03', 'SH05'], VIEW_B)
panel = sheet_panel(760, 60, [
    ('DAY · VIEW A', ['facade, steps centre', 'SUV rear, tailgate', 'open toward camera', 'sun from LEFT'], DAY, INK),
    ('DAY · VIEW B', ['house behind camera', 'SUV seen from FRONT', 'drive curves away', 'sun from RIGHT'], DAYB, INK),
    ('NIGHT · VIEW A', ['same framing', 'door lantern lit', '2 windows glow warm', 'blue night sky'], NIGHT, '#f3ead8'),
    ('NIGHT · VIEW B', ['same framing', 'cool moon from RIGHT', 'warm spill from the', 'house behind camera'], NIGHT, '#f3ead8'),
], ['View A: SH02 (EWS), SH04 (MCU, side-on).', 'View B: SH03, SH05 (reverse, tracking).', 'Master plate = day A. Reverse plate = day B.'])
locmaps['LOC_EXT'] = loc_svg('EXTERIOR', 'Exterior — arrival', 'Two opposite views of the drive, day and night', plan, panel,
                             ['The sun is on the LEFT of view A, so it is on the RIGHT of view B — never the same side in both.',
                              'The house is always ahead of anyone walking to it; the SUV is always behind them.'])

# Hall
plan = hall_plan()
plan += view(330, 672, -90, 60, 600, 'VIEW A — from the front door', VIEW_A, 30, 10)
plan += view(330, 356, 90, 70, 340, 'VIEW B — from the stair foot, back', VIEW_B, -300, -70)
plan += practical(440, 350, 'night: lamp by the stair')
plan += setup_marks(['SH07', 'SH17'], VIEW_A) + setup_marks(['SH06'], VIEW_B)
panel = sheet_panel(760, 60, [
    ('DAY · VIEW A', ['stair straight ahead', 'service door RIGHT', 'window + sun LEFT', 'dust sheets, boxes'], DAY, INK),
    ('DAY · VIEW B', ['front door centre,', 'open, bright beyond', 'service door LEFT', 'window + sun RIGHT'], DAYB, INK),
    ('NIGHT · VIEW A', ['same framing', 'window black-blue', 'lamp by the stair', 'deep soft shadow'], NIGHT, '#f3ead8'),
    ('NIGHT · VIEW B', ['same framing', 'front door CLOSED', 'lamp spill from', 'behind camera'], NIGHT, '#f3ead8'),
], ['View A: SH07, SH17 (WS).', 'View B: SH06 (MS, low).', 'Master = the approved hall plate (day A).'])
locmaps['LOC_HALL'] = loc_svg('ENTRANCE HALL', 'Entrance hall', 'From the front door, and back from the stair foot', plan, panel,
                              ['Service door: RIGHT wall in view A, LEFT wall in view B. Window and sun bar: LEFT in A, RIGHT in B.',
                               'SH06 looks in the view-B direction; it must upload this sheet, not only the view-A plate.'])

# Corridor
plan = upper_plan(show_room=False)
plan += view(400, 632, -90, 36, 610, 'VIEW A — landing end → far window', VIEW_A, 30, -44)
plan += view(400, 44, 90, 36, 600, 'VIEW B — far window → landing', VIEW_B, 30, 4)
plan += practical(432, 480, 'night: sconce (east wall)')
plan += practical(265, 690, 'night: landing lamp', 'end', -12, 4)
plan += setup_marks(['SH12', 'SH15'], VIEW_A) + setup_marks(['SH08', 'SH10', 'SH13A'], VIEW_B) + setup_marks(['SH09', 'SH11', 'SH16'], SIDE)
panel = sheet_panel(760, 60, [
    ('DAY · VIEW A', ['far window ahead', 'nursery door open', 'on the LEFT wall', '2/3 of the way'], DAY, INK),
    ('DAY · VIEW B', ['landing at the end', 'nursery door open', 'on the RIGHT wall,', '~3 m from camera'], DAYB, INK),
    ('NIGHT · VIEW A', ['same framing', 'window black-blue', 'sconce on RIGHT wall', 'lamp spill from door'], NIGHT, '#f3ead8'),
    ('NIGHT · VIEW B', ['same framing', 'sconce on LEFT wall', 'landing lamp glows', 'at the far end'], NIGHT, '#f3ead8'),
], ['View A: SH12 (WS), SH15 (MS).', 'View B: SH08 (WS), SH10 (MS), SH13A (MWS).', 'Side (grey): SH09, SH11 (diagonal), SH16.'])
locmaps['LOC_COR'] = loc_svg('UPPER CORRIDOR', 'Upper corridor', 'Landing end and far-window end', plan, panel,
                             ['Nursery door: LEFT wall in view A, RIGHT wall in view B. The sconce is on the east wall: RIGHT in A, LEFT in B.',
                              'The nursery door stays open in all four panels; its state per shot is set in the shot prompt.'])

# Nursery
plan = upper_plan()
plan += view(94, 264, 52, 72, 400, 'VIEW A — NURSERY FIXED (high corner)', VIEW_A, 90, -70)
plan += view(250, 604, -90, 64, 360, 'VIEW B — far end, eye level', VIEW_B, -200, 50)
plan += practical(103, 604, 'night: lamp', 'end', -26, 4)
plan += setup_marks(['SH14'], VIEW_B) + setup_marks(['SH13'], SIDE)
panel = sheet_panel(760, 60, [
    ('DAY · VIEW A', ['= approved plate', 'door lower-LEFT', 'bed on RIGHT wall', 'lamp far-RIGHT'], DAY, INK),
    ('DAY · VIEW B', ['window far-LEFT,', 'empty corner above', 'bed on LEFT wall', 'door on RIGHT wall'], DAYB, INK),
    ('NIGHT · VIEW A', ['same framing', 'lamp ON far-right', 'door CLOSED', 'corners dark'], NIGHT, '#f3ead8'),
    ('NIGHT · VIEW B', ['same framing', 'lamp ON near LEFT', 'door CLOSED', 'corners dark'], NIGHT, '#f3ead8'),
], ['View A: SH01 and every NURSERY FIXED frame.', 'View B: SH14 (MWS). Side (grey): SH13.', 'Veiled Woman: view A only, never view B.'])
locmaps['LOC_NUR'] = loc_svg('NURSERY', 'Nursery', 'The high corner view and its reverse from the far end', plan, panel,
                             ['Bed along the west wall: RIGHT of frame in view A, LEFT in view B. Door on the east wall: LEFT in A, RIGHT in B.',
                              'No camera in the corner in any panel: the sheet is the bare room; the mounted camera is added per shot (from SH13 on).'])

# Service hall
plan = svc_plan()
plan += view(230, 380, 0, 50, 400, 'VIEW A — facing the board', VIEW_A, 10, 110)
plan += view(560, 380, 180, 50, 420, 'VIEW B — back to the board', VIEW_B, -340, 190)
plan += setup_marks(['SH18', 'SH19', 'SH20'], VIEW_A)
panel = sheet_panel(760, 60, [
    ('DAY · VIEW A', ['bell board centre', 'lower door RIGHT', 'high window LEFT', 'cold shaft of light'], DAY, INK),
    ('DAY · VIEW B', ['passage to the hall', 'door open, bright', 'high window RIGHT', 'board behind camera'], DAYB, INK),
    ('NIGHT · VIEW A', ['same framing', 'bare bulb above', 'the board, lit', 'walls fall dark'], NIGHT, '#f3ead8'),
    ('NIGHT · VIEW B', ['same framing', 'hall door CLOSED', 'bulb spill from', 'behind camera'], NIGHT, '#f3ead8'),
], ['View A: SH18, SH21 (WS), SH19 (INSERT),', 'SH20 (MS).', 'View B: not used yet — for entrances later.'])
locmaps['LOC_SVC'] = loc_svg('SERVICE HALL', 'Service hall and bell board', 'Facing the board, and back toward the hall', plan, panel,
                             ['Lower service door: immediately RIGHT of the board in view A. High window: LEFT in A, RIGHT in B.',
                              'BELL BOARD FIXED is clamped left of the board, facing it.'])

maps.update(locmaps)

os.makedirs(OUT, exist_ok=True)
for k, v in maps.items():
    with open(os.path.join(OUT, f'{k}_map.svg' if k.startswith('SH') else f'{k}.svg'), 'w') as f:
        f.write(v)
print('wrote', list(maps))
