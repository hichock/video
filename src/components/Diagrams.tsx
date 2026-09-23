// Top-down maps of the two spaces where continuity breaks most easily.
// Plain SVG, coloured from theme tokens. North is up. The nursery layout
// matches the approved LOC_NURSERY_FIXED_DAY plate.

const stroke = 'var(--ink)';
const muted = 'var(--muted)';

/** Nursery plan. NURSERY FIXED sits in the north-west corner looking south-east. */
export function NurseryMap() {
  return (
    <svg className="diagram" viewBox="0 0 380 460" role="img" aria-label="Top-down map of the nursery">
      <rect x="60" y="40" width="260" height="360" fill="var(--surface-2)" stroke={stroke} strokeWidth="2" />
      <text x="190" y="30" textAnchor="middle" className="dim">north wall (camera end)</text>
      <text x="190" y="420" textAnchor="middle" className="dim">far wall</text>
      {/* window on the west wall right beside the camera corner */}
      <line x1="60" y1="60" x2="60" y2="130" stroke="var(--night)" strokeWidth="6" />
      <text x="8" y="100" className="dim">window</text>
      {/* door on the east wall near the north end (NURSERY FIXED's left wall) */}
      <rect x="314" y="70" width="12" height="54" fill="var(--surface)" stroke={stroke} />
      <path d="M314 70 A54 54 0 0 0 260 124" fill="none" stroke={muted} strokeDasharray="3 3" />
      <text x="330" y="102" className="dim">door →</text>
      <text x="330" y="116" className="dim">corridor</text>
      {/* bed along the west wall, head at the far (south) end */}
      <rect x="66" y="170" width="62" height="190" rx="3" fill="var(--surface)" stroke={stroke} />
      <text x="97" y="270" textAnchor="middle" transform="rotate(-90 97 270)">iron bed</text>
      <text x="97" y="186" textAnchor="middle" className="dim">foot</text>
      {/* bedside table + lamp far-right corner (SW) */}
      <rect x="66" y="364" width="34" height="30" fill="var(--surface)" stroke={stroke} />
      <circle cx="83" cy="379" r="7" fill="var(--brass)" />
      <text x="106" y="392" className="dim">lamp</text>
      {/* armchair far-left corner (SE) */}
      <rect x="276" y="352" width="40" height="42" rx="5" fill="var(--surface)" stroke={stroke} />
      <text x="296" y="346" textAnchor="middle" className="dim">armchair</text>
      {/* rug and chest */}
      <rect x="140" y="150" width="150" height="190" fill="none" stroke={muted} strokeDasharray="4 3" />
      <text x="215" y="334" textAnchor="middle" className="dim">rug</text>
      <rect x="182" y="215" width="54" height="34" fill="var(--surface)" stroke={stroke} />
      <text x="209" y="236" textAnchor="middle">chest</text>
      {/* camera and its view */}
      <path d="M68 48 L330 130 L200 400 Z" fill="var(--rec)" opacity="0.07" />
      <circle cx="68" cy="48" r="8" fill="var(--rec)" />
      <text x="82" y="62" fill="var(--rec)">NURSERY FIXED · 2.6 m</text>
      {/* Clara at the door and the Woman's positions */}
      <circle cx="296" cy="97" r="9" fill="var(--night)" />
      <line x1="296" y1="97" x2="310" y2="97" stroke="var(--surface)" strokeWidth="3" />
      <text x="236" y="150" fill="var(--night)">Clara, facing door</text>
      {[
        ['P1', 200, 372],
        ['P2', 168, 240],
        ['P3', 262, 130],
      ].map(([l, x, y]) => (
        <g key={l as string}>
          <circle cx={x as number} cy={y as number} r="9" fill="var(--ink)" />
          <text x={(x as number) - 26} y={(y as number) + 4}>{l}</text>
        </g>
      ))}
      <path d="M200 362 L172 250 M170 230 L256 138" stroke={stroke} strokeDasharray="2 4" fill="none" />
    </svg>
  );
}

/** Upper floor: corridor, nursery, landing. */
export function UpperFloorMap() {
  return (
    <svg className="diagram" viewBox="0 0 380 460" role="img" aria-label="Top-down map of the upper floor and the service route">
      {/* corridor running north from the landing */}
      <rect x="190" y="20" width="60" height="330" fill="var(--surface-2)" stroke={stroke} strokeWidth="2" />
      <line x1="200" y1="20" x2="240" y2="20" stroke="var(--night)" strokeWidth="6" />
      <text x="256" y="30" className="dim">far window (N)</text>
      {/* nursery on the west side */}
      <rect x="40" y="110" width="150" height="200" fill="var(--surface)" stroke={stroke} strokeWidth="2" />
      <text x="115" y="230" textAnchor="middle">nursery</text>
      <line x1="40" y1="120" x2="40" y2="160" stroke="var(--night)" strokeWidth="6" />
      <circle cx="50" cy="120" r="6" fill="var(--rec)" />
      <text x="60" y="134" fill="var(--rec)">NURSERY FIXED</text>
      <rect x="185" y="128" width="10" height="36" fill="var(--brass)" />
      <text x="258" y="150" fill="var(--brass)">nursery door</text>
      <line x1="200" y1="146" x2="255" y2="146" stroke="var(--brass)" strokeDasharray="3 3" />
      {/* landing */}
      <rect x="110" y="350" width="240" height="90" fill="var(--surface-2)" stroke={stroke} strokeWidth="2" />
      <text x="340" y="432" textAnchor="end" className="dim">central landing / top of main stair</text>
      {/* upper service door and monitor table on the landing's west wall */}
      <rect x="104" y="362" width="10" height="34" fill="var(--ink)" />
      <rect x="116" y="400" width="24" height="34" fill="var(--brass)" />
      <text x="146" y="420" fill="var(--brass)">monitor table</text>
      <text x="120" y="376">upper service door</text>
      <text x="120" y="390" className="dim">→ back stair → bell board</text>
      {/* sconce */}
      <circle cx="246" cy="300" r="5" fill="var(--warn)" />
      <text x="256" y="304" className="dim">sconce</text>
      <path d="M220 340 L220 60" stroke={muted} markerEnd="url(#arr)" />
      <text x="226" y="250" className="dim" transform="rotate(-90 226 250)">walking from the landing →</text>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill={muted} />
        </marker>
      </defs>
    </svg>
  );
}
