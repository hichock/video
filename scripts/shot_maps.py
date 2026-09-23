"""Generate top-down shot maps (SVG) for the arrival shots SH02-SH05.

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


def camera(cx, cy, heading_deg, fov_deg, reach, label, move_to=None, ldx=22, ldy=34):
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
    for X, Y, label, fg, halo in labels:
        out.append(f'<text x="{X:.0f}" y="{Y:.0f}" font-size="11" fill="{fg}" text-anchor="middle" font-weight="700" font-family="Arial, Helvetica, sans-serif" paint-order="stroke" stroke="{halo}" stroke-width="4">{label}</text>')
    for i, line in enumerate(caption):
        out.append(text(ox, oy + H + 40 + i * 16, line, 12, INK, 'start', 400))
    return out


def svg(shot, title, subtitle, plan, frame, notes):
    body = ''.join(plan + frame)
    notes_svg = ''.join(text(20, 848 + i * 18, n, 13, INK, 'start', 400) for i, n in enumerate(notes))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="{866 + 18*len(notes)}" viewBox="0 0 1160 {866 + 18*len(notes)}">
<rect width="100%" height="100%" fill="#ffffff"/>
<g transform="translate(20,40)">{body}</g>
{text(20, 26, f"{shot} — TOP-DOWN PLAN: positions and directions only, not an image to copy", 16, INK, 'start', 700)}
{text(20, 826, title, 14, INK, 'start', 700)}
{text(760, 26, subtitle, 12, MUTED, 'start', 400)}
{notes_svg}
</svg>'''


maps = {}

# ---------------- SH02 ----------------
plan = base_plan('from frame-LEFT')
plan += camera(300, 690, -90, 62, 560, 'CAMERA 24mm, eye level', move_to=(290, 610))
plan += person('owen', 178, 462, 0, note='case ALREADY OUT → set on gravel', label_dx=-170, label_dy=38)
plan += person('mara', 272, 462, 180, note='case STILL INSIDE → lifts out', label_dx=18, label_dy=30)
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
                    'Bearded man: case already out of the car → lowers it onto the gravel by the rear wheel. Small woman: case still in the boot → lifts it out.'])

# ---------------- SH03 ----------------
plan = base_plan('= frame-RIGHT in this reverse view')
plan += camera(330, 185, 90, 50, 520, 'CAMERA 35mm, back to the house', move_to=(330, 160))
plan += person('elias', 330, 262, -90, end=(330, 215), note=['walks TOWARD camera (= toward house),', 'camera at chest height,', 'eyes ABOVE the lens'], label_dx=22, label_dy=0)
plan += person('owen', 205, 470, -90, note='at the tailgate, half hidden by the SUV', label_dx=-190, label_dy=40)
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
plan += person('owen', 196, 500, -90, note='left edge, partly cut off', label_dx=-175, label_dy=34)
frame = frame_panel(760, 60, [
    ('box', 0.55, 0.05, 0.45, 0.35, 'MANOR + STEPS (soft)', '#cfc6b3'),
    ('box', 0.0, 0.38, 1.0, 0.3, 'SUV side-on: REAR/open boot LEFT, nose RIGHT', '#27402f'),
    ('fig', 0.05, 0.4, 0.1, 0.4, 'BEARDED', COL['owen']),
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
plan += camera(250, 670, -90, 60, 560, 'CAMERA 35mm, low, just inside the door', move_to=(270, 600), ldx=-180, ldy=-40)
plan += person('owen', 548, 448, -60, end=(430, 350), via=[(548, 405)], note=['START: right beside the service door,', 'RIGHT hand a hand’s width from the knob,', 'case in LEFT hand, head turned right;', 'tries the knob, then walks on', 'AWAY toward the stair'], label_dx=-300, label_dy=60)
frame = frame_panel(760, 60, [
    ('box', 0.0, 0.2, 0.14, 0.32, 'WINDOW', '#6f8fb8'),
    ('box', 0.3, 0.1, 0.4, 0.45, 'STAIR', '#d9cfbf'),
    ('box', 0.84, 0.3, 0.16, 0.36, 'SERVICE DOOR', '#8a6a45'),
    ('fig', 0.76, 0.3, 0.15, 0.5, 'BEARDED (back, head turned right)', COL['owen'], 8),
], ['Stair ahead, service door on the RIGHT wall.', 'He walks away from camera, right of centre,', 'and passes the service door on his right.'])
maps['SH06'] = svg('SH06', 'Owen carries the heavy case in and checks the service door — VO 3',
                   'Camera just inside the front door, looking into the hall', plan, frame,
                   ['Front door behind the camera. Service door on the RIGHT-hand wall (it leads to the service hall in SH17).',
                    'Start frame: his right hand a hand’s width from the knob; the door is still closed.'])

plan = hall_plan()
plan += camera(460, 590, -90, 58, 540, 'CAMERA 24mm, over his right shoulder, rises', move_to=(460, 520), ldx=-330, ldy=90)
plan += person('elias', 420, 540, -95, note=['frames the stair with the handheld', '(camera up, visible past his shoulder)'], label_dx=-300, label_dy=-10)
plan += person('clara', 305, 190, -90, end=(305, 110), label_dx=-190, label_dy=0, note=['climbing, left of the pair'])
plan += person('naomi', 360, 200, -90, end=(360, 120), label_dx=22, label_dy=10, note=['climbing, right of the pair'])
plan += person('owen', 330, 350, -90, end=(330, 280), label_dx=-280, label_dy=10, note=['starts up the stair behind them'])
plan += person('mara', 300, 650, -90, end=(305, 420), label_dx=-240, label_dy=0, note=['comes in from the front door', 'with her compact case'])
frame = frame_panel(760, 60, [
    ('box', 0.22, 0.02, 0.56, 0.6, 'STAIR (camera tilts up it)', '#d9cfbf'),
    ('fig', 0.4, 0.17, 0.05, 0.12, 'ICE-BLUE', COL['clara']),
    ('fig', 0.53, 0.14, 0.055, 0.14, 'CAMEL', COL['naomi']),
    ('fig', 0.48, 0.42, 0.09, 0.2, 'BEARDED (back)', COL['owen']),
    ('fig', 0.1, 0.66, 0.08, 0.22, 'RUST', COL['mara']),
    ('fig', 0.84, 0.36, 0.28, 0.52, 'OLIVE (back)', COL['elias'], -110),
], ['Tall man in the right foreground, back to camera,', 'camera raised. Women halfway up the stair,', 'bearded man at its foot, small woman lower-left.'])
maps['SH07'] = svg('SH07', 'Elias frames the stair; Naomi and Clara go up; Mara and Owen follow',
                   'Camera in the hall behind the tall man’s right shoulder', plan, frame,
                   ['Front door behind the camera. The camera rises past his shoulder and follows the two women up the stair.',
                    'Owen continues from SH06: already at the stair foot, not coming in again.'])

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
plan = upper_plan()
plan += camera(400, 200, 90, 52, 470, 'CAMERA 35mm, backing north', move_to=(400, 170))
plan += person('clara', 380, 380, -90, end=(380, 305), note=['walks toward camera on the', 'nursery-door side; slows at', 'the door and looks in'], label_dx=-250, label_dy=30)
plan += person('naomi', 422, 390, -90, end=(422, 315), note=['taller, walks beside her,', 'eyes on her'], label_dx=26, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.3, 0.12, 0.4, 0.34, 'CORRIDOR → LANDING', '#efe7da'),
    ('box', 0.8, 0.2, 0.2, 0.55, 'NURSERY DOOR (open)', '#ffffff'),
    ('fig', 0.36, 0.22, 0.15, 0.62, 'CAMEL (left)', COL['naomi']),
    ('fig', 0.64, 0.26, 0.14, 0.56, 'ICE-BLUE (right)', COL['clara']),
], ['Looking back toward the landing.', 'Open nursery door on the RIGHT wall', 'right beside the copper-haired woman.'])
maps['SH08'] = svg('SH08', 'Naomi and Clara walk the upper corridor; Clara slows at the nursery door',
                   'Reverse corridor view from the far-window end, looking south', plan, frame,
                   ['The women came up the main stair and walk north toward the far window (and the camera).',
                    'Copper-haired woman on frame-RIGHT = the door side (her left). Taller woman on frame-LEFT.'])

# ---------------- SH09 ----------------
plan = upper_plan()
plan += camera(426, 300, 180, 64, 330, 'CAMERA 35mm, glides north', move_to=(426, 265))
frame = frame_panel(760, 60, [
    ('box', 0.08, 0.0, 0.84, 1.0, '', '#f4efe6'),
    ('box', 0.62, 0.05, 0.3, 0.14, 'EMPTY CORNER (camera goes here later)', '#ffffff'),
    ('box', 0.66, 0.2, 0.26, 0.28, 'WINDOW', '#6f8fb8'),
    ('box', 0.12, 0.4, 0.78, 0.14, 'IRON BED (head left, foot right)', '#ffffff'),
    ('box', 0.1, 0.36, 0.14, 0.1, 'LAMP', '#b08a62'),
    ('box', 0.26, 0.62, 0.26, 0.1, 'CHEST + GREY BOX', '#5b3f2a'),
    ('box', 0.0, 0.5, 0.1, 0.2, 'CHAIR', '#ffffff'),
], ['From the corridor straight through the', 'open door. The camera glides left→right', '(toward the far window). Nothing moves.'])
maps['SH09'] = svg('SH09', 'Through the doorway: bed, chest, archival box',
                   'Camera in the corridor, back to the opposite wall, looking into the nursery (west)', plan, frame,
                   ['Same room as the approved high-corner plate, seen from its side: bed straight ahead, window ahead-right, chest ahead-left.',
                    'No people. The door leaf is open inward, on the LEFT of the doorway.'])

# ---------------- SH10 ----------------
plan = upper_plan()
plan += camera(400, 170, 90, 52, 470, 'CAMERA 35mm, backing north', move_to=(400, 140))
plan += person('clara', 380, 300, -90, end=(380, 240), note=['level with the door; head turned', 'to the doorway on her LEFT;', 'keeps moving past it'], label_dx=-250, label_dy=30)
plan += person('naomi', 422, 310, -90, end=(422, 250), note=['asks “This is the room?”', 'eyes on her'], label_dx=26, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.34, 0.12, 0.32, 0.34, 'CORRIDOR → LANDING', '#efe7da'),
    ('box', 0.84, 0.15, 0.16, 0.65, 'OPEN DOOR', '#ffffff'),
    ('fig', 0.36, 0.2, 0.16, 0.64, 'CAMEL (left)', COL['naomi']),
    ('fig', 0.66, 0.22, 0.15, 0.6, 'ICE-BLUE (looks right, into door)', COL['clara'], 14),
], ['Level with the doorway on the RIGHT.', 'She looks into it (to her left = frame-right)', 'while still walking toward camera.'])
maps['SH10'] = svg('SH10', 'NAOMI: “This is the room?” — Clara: “My mother said…”',
                   'Same reverse corridor view, a few steps later', plan, frame,
                   ['Both keep walking north toward the camera; nobody stops.',
                    'Dialogue: the taller woman first, then the copper-haired woman.'])

# ---------------- SH11 ----------------
plan = upper_plan()
plan += camera(400, 80, 90, 52, 520, 'CAMERA 35mm, backing north', move_to=(400, 55))
plan += person('clara', 380, 190, -90, end=(380, 140), note=['door now ~2 m behind her;', 'looks back once over her', 'LEFT shoulder at the box'], label_dx=-250, label_dy=30)
plan += person('naomi', 422, 200, -90, end=(422, 150), note=['follows her glance, then', 'keeps pace, says nothing'], label_dx=26, label_dy=40)
frame = frame_panel(760, 60, [
    ('box', 0.38, 0.14, 0.24, 0.3, 'LANDING (far)', '#efe7da'),
    ('box', 0.7, 0.22, 0.1, 0.3, 'DOOR (behind them)', '#ffffff'),
    ('fig', 0.34, 0.16, 0.18, 0.7, 'CAMEL (left)', COL['naomi']),
    ('fig', 0.66, 0.2, 0.17, 0.66, 'ICE-BLUE (right)', COL['clara']),
], ['The open door is now behind them on the', 'RIGHT wall. She glances back toward it', 'over her left shoulder.'])
maps['SH11'] = svg('SH11', 'Clara: “Her last letter is in that box…”',
                   'Same reverse corridor view, further toward the far window', plan, frame,
                   ['They have passed the nursery door; they are now between the door and the far window.',
                    'Her glance back goes toward frame-right (the door), never into the lens.'])

# ---------------- SH12 ----------------
plan = upper_plan()
plan += camera(400, 60, 90, 52, 580, 'CAMERA 35mm, LOCKED', None, ldx=50, ldy=-10)
plan += person('clara', 378, 120, -90, end=(372, 50), note=['pass the camera on its', 'RIGHT (west) side and exit'], label_dx=-230, label_dy=10)
plan += person('naomi', 402, 130, -90, end=(396, 55), label_dx=30, label_dy=60)
plan += person('owen', 428, 100, 180, note=['kneels at an open case against', 'the east wall, unpacking'], label_dx=40, label_dy=24)
plan += person('mara', 400, 560, -90, end=(372, 300), via=[(398, 330)], note=['from the landing with the camera', '+ bracket; turns in at the door'], label_dx=24, label_dy=10)
plan += person('elias', 410, 610, -90, end=(385, 350), label_dx=24, label_dy=30, note=['right behind her, raising the handheld'])
frame = frame_panel(760, 60, [
    ('box', 0.38, 0.14, 0.24, 0.3, 'LANDING (far)', '#efe7da'),
    ('box', 0.64, 0.22, 0.1, 0.28, 'DOOR', '#ffffff'),
    ('fig', 0.6, 0.3, 0.05, 0.14, '', COL['mara']),
    ('fig', 0.54, 0.32, 0.05, 0.15, '', COL['elias']),
    ('fig', 0.14, 0.55, 0.2, 0.3, 'BEARDED (kneeling)', COL['owen']),
    ('fig', 0.86, 0.05, 0.28, 0.9, 'ICE-BLUE + CAMEL exit right', COL['clara'], -60),
], ['Women pass the camera on the RIGHT.', 'Bearded man kneels in the LEFT foreground.', 'Small woman + tall man turn in at the door.'])
maps['SH12'] = svg('SH12', 'Transition: Mara carries NURSERY FIXED into the nursery, Elias follows',
                   'Same reverse corridor view, locked', plan, frame,
                   ['Owen works near the far-window end: in SH14 he walks from here toward the landing.',
                    'Mara and Elias come up from the landing and turn in through the nursery door (right wall).'])

# ---------------- SH13 ----------------
plan = upper_plan()
plan += camera(372, 300, 188, 58, 300, 'HANDHELD from the doorway (host, unseen)', None)
plan += person('mara', 104, 276, -135, note=['on a step stool in the corner', 'above the window, arms up,', 'mounting the camera'], label_dx=24, label_dy=34)
frame = frame_panel(760, 60, [
    ('box', 0.58, 0.28, 0.36, 0.32, 'WINDOW', '#6f8fb8'),
    ('box', 0.0, 0.55, 0.75, 0.16, 'IRON BED', '#ffffff'),
    ('box', 0.1, 0.76, 0.3, 0.1, 'CHEST + BOX', '#5b3f2a'),
    ('fig', 0.78, 0.08, 0.14, 0.42, 'RUST (on stool, arms up)', COL['mara'], 6),
], ['Corner above the window, ahead-RIGHT.', 'Bed below along the wall, chest', 'ahead-left on the rug.'])
maps['SH13'] = svg('SH13', 'Handheld from the doorway: Mara mounts NURSERY FIXED',
                   'The host films from the doorway toward the corner above the window', plan, frame,
                   ['This corner is the NURSERY FIXED position seen in the approved high-corner plate.',
                    'The camera’s tiny preview screen faces us (replaced in post).'])

# ---------------- SH14 ----------------
plan = upper_plan()
plan += camera(434, 300, 180, 46, 360, 'CAMERA 35mm, locked, back to the east wall', None)
plan += person('elias', 368, 300, 185, note=['in the doorway, filming the corner'], label_dx=-200, label_dy=60)
plan += person('mara', 104, 276, -135, label_dx=24, label_dy=34)
plan += person('owen', 400, 230, 90, end=(400, 380), note=['walks SOUTH (frame-left)', 'toward the landing, carrying', 'camera + tool pouch'], label_dx=24, label_dy=-10)
plan += person('naomi', 404, 170, 90, end=(404, 300), note=['a few steps behind him', 'with her recorder'], label_dx=-250, label_dy=-10)
frame = frame_panel(760, 60, [
    ('box', 0.3, 0.08, 0.4, 0.8, 'NURSERY DOORWAY', '#f4efe6'),
    ('fig', 0.62, 0.16, 0.04, 0.1, '', COL['mara']),
    ('fig', 0.5, 0.26, 0.15, 0.52, 'OLIVE (back)', COL['elias']),
    ('fig', 0.82, 0.18, 0.22, 0.74, 'BEARDED → LEFT', COL['owen'], -40),
    ('fig', 0.99, 0.2, 0.18, 0.7, 'CAMEL', COL['naomi'], 22),
], ['Camera faces the doorway. Landing is', 'frame-LEFT, far window frame-RIGHT.', 'People in the corridor walk right→left.'])
maps['SH14'] = svg('SH14', 'Owen passes with BELL BOARD FIXED; Elias/Mara banter',
                   'Corridor angle straight into the nursery doorway (west)', plan, frame,
                   ['Screen direction: toward the landing = frame-LEFT. Owen enters from frame-right and walks left.',
                    'The small woman is seen through the doorway, high in the far corner ahead-right.'])

# ---------------- SH15 ----------------
plan = upper_plan()
plan += camera(434, 300, 180, 46, 360, 'CAMERA 35mm, locked (same as SH14)', None)
plan += person('owen', 400, 320, 90, end=(400, 470), note=['keeps walking to frame-LEFT,', 'does not turn his head'], label_dx=24, label_dy=-40)
plan += person('naomi', 404, 250, 90, end=(404, 400), note=['turns her head to the man in the', 'doorway: one knowing smile'], label_dx=24, label_dy=-16)
plan += person('elias', 368, 300, 185, end=(400, 520), via=[(385, 330)], note=['grins, lowers the camera,', 'follows him out frame-LEFT'], label_dx=-230, label_dy=60)
plan += person('mara', 104, 276, -135, label_dx=24, label_dy=34)
frame = frame_panel(760, 60, [
    ('box', 0.3, 0.08, 0.4, 0.8, 'NURSERY DOORWAY', '#f4efe6'),
    ('fig', 0.62, 0.16, 0.04, 0.1, '', COL['mara']),
    ('fig', 0.6, 0.28, 0.12, 0.46, 'OLIVE', COL['elias'], 30),
    ('fig', 0.42, 0.16, 0.24, 0.78, 'BEARDED (profile ←)', COL['owen']),
    ('fig', 0.82, 0.18, 0.2, 0.72, 'CAMEL (profile, smiling)', COL['naomi']),
], ['Same locked angle as SH14.', 'Everyone exits frame-LEFT (landing side).', 'The small woman keeps working inside.'])
maps['SH15'] = svg('SH15', 'Owen: “That’s usually enough for him.” Naomi’s smile, Elias follows',
                   'Same corridor angle as SH14', plan, frame,
                   ['Owen and the tall man exit frame-LEFT toward the landing (then down the main stair in SH17).',
                    'Naomi’s smile is seen in profile: she turns her head to the doorway, not to the camera.'])

os.makedirs(OUT, exist_ok=True)
for k, v in maps.items():
    with open(os.path.join(OUT, f'{k}_map.svg'), 'w') as f:
        f.write(v)
print('wrote', list(maps))
