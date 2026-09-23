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


def camera(cx, cy, heading_deg, fov_deg, reach, label, move_to=None):
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
    out.append(text(cx + 22, cy + 34, label, 13, '#000', 'start', 700))
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
            light = color in ('#cfc6b3', '#ddd5c3', '#efe8d8')
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
    notes_svg = ''.join(text(20, 812 + i * 18, n, 13, INK, 'start', 400) for i, n in enumerate(notes))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="{830 + 18*len(notes)}" viewBox="0 0 1160 {830 + 18*len(notes)}">
<rect width="100%" height="100%" fill="#ffffff"/>
<g transform="translate(20,40)">{body}</g>
{text(20, 26, f"{shot} — TOP-DOWN PLAN: positions and directions only, not an image to copy", 16, INK, 'start', 700)}
{text(20, 800 - 8, title, 14, INK, 'start', 700)}
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

os.makedirs(OUT, exist_ok=True)
for k, v in maps.items():
    with open(os.path.join(OUT, f'{k}_map.svg'), 'w') as f:
        f.write(v)
print('wrote', list(maps))
