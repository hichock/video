// Top-down maps of the two spaces where continuity breaks most easily.
// Plain SVG, coloured from theme tokens.

const stroke = 'var(--ink)';
const muted = 'var(--muted)';

export function NurseryMap() {
  return (
    <svg className="diagram" viewBox="0 0 380 440" role="img" aria-label="Top-down map of the nursery">
      <rect x="50" y="40" width="280" height="340" fill="var(--surface-2)" stroke={stroke} strokeWidth="2" />
      <text x="190" y="30" textAnchor="middle" className="dim">far wall</text>
      <text x="190" y="400" textAnchor="middle" className="dim">window wall (behind NURSERY FIXED)</text>
      <line x1="140" y1="380" x2="240" y2="380" stroke="var(--night)" strokeWidth="5" />
      {/* door on the left wall near the window end */}
      <rect x="44" y="290" width="12" height="50" fill="var(--surface)" stroke={stroke} />
      <path d="M56 290 A50 50 0 0 1 106 340" fill="none" stroke={muted} strokeDasharray="3 3" />
      <text x="10" y="318" className="dim">door</text>
      {/* furniture */}
      <rect x="95" y="44" width="110" height="46" rx="3" fill="var(--surface)" stroke={stroke} />
      <text x="150" y="72" textAnchor="middle">bed</text>
      <rect x="56" y="46" width="34" height="34" rx="4" fill="var(--surface)" stroke={stroke} />
      <text x="73" y="100" textAnchor="middle" className="dim">chair</text>
      <ellipse cx="190" cy="220" rx="95" ry="70" fill="none" stroke={muted} strokeDasharray="4 3" />
      <text x="190" y="300" textAnchor="middle" className="dim">rug</text>
      <rect x="165" y="200" width="50" height="30" fill="var(--surface)" stroke={stroke} />
      <text x="190" y="219" textAnchor="middle">chest</text>
      <rect x="300" y="195" width="26" height="40" fill="var(--surface)" stroke={stroke} />
      <circle cx="313" cy="215" r="7" fill="var(--brass)" />
      <text x="296" y="252" textAnchor="end" className="dim">lamp</text>
      {/* camera */}
      <path d="M326 376 L60 250 L220 44 Z" fill="var(--rec)" opacity="0.07" />
      <circle cx="326" cy="376" r="8" fill="var(--rec)" />
      <text x="322" y="360" textAnchor="end" fill="var(--rec)">NURSERY FIXED · 2.6 m</text>
      {/* Clara and the Woman */}
      <circle cx="72" cy="315" r="9" fill="var(--night)" />
      <line x1="72" y1="315" x2="58" y2="315" stroke="var(--surface)" strokeWidth="3" />
      <text x="82" y="345" fill="var(--night)">Clara, facing door</text>
      {[
        ['P1', 300, 70],
        ['P2', 240, 222],
        ['P3', 118, 312],
      ].map(([l, x, y]) => (
        <g key={l as string}>
          <circle cx={x as number} cy={y as number} r="9" fill="var(--ink)" />
          <text x={(x as number) + 13} y={(y as number) + 4}>{l}</text>
        </g>
      ))}
      <path d="M300 80 L246 212 M232 230 L128 306" stroke={stroke} strokeDasharray="2 4" fill="none" />
    </svg>
  );
}

export function UpperFloorMap() {
  return (
    <svg className="diagram" viewBox="0 0 380 420" role="img" aria-label="Top-down map of the upper floor and the service route">
      {/* corridor running up from the landing */}
      <rect x="180" y="30" width="60" height="270" fill="var(--surface-2)" stroke={stroke} strokeWidth="2" />
      <line x1="190" y1="30" x2="230" y2="30" stroke="var(--night)" strokeWidth="5" />
      <text x="250" y="40" className="dim">far window</text>
      {/* landing */}
      <rect x="120" y="300" width="200" height="100" fill="var(--surface-2)" stroke={stroke} strokeWidth="2" />
      <text x="300" y="392" textAnchor="end" className="dim">central landing / top of main stair</text>
      {/* nursery on the left of the corridor */}
      <rect x="30" y="140" width="150" height="150" fill="var(--surface)" stroke={stroke} strokeWidth="2" />
      <text x="105" y="210" textAnchor="middle">nursery</text>
      <rect x="175" y="160" width="10" height="40" fill="var(--brass)" />
      <text x="170" y="156" textAnchor="end" fill="var(--brass)">nursery door</text>
      <circle cx="42" cy="152" r="6" fill="var(--rec)" />
      <text x="54" y="166" fill="var(--rec)">NURSERY FIXED</text>
      <line x1="40" y1="140" x2="110" y2="140" stroke="var(--night)" strokeWidth="5" />
      {/* upper service door and monitor table on the landing's west wall:
          facing that wall, the table is immediately LEFT of the door and the
          corridor opening is on the RIGHT */}
      <rect x="114" y="316" width="10" height="36" fill="var(--ink)" />
      <rect x="126" y="356" width="24" height="36" fill="var(--brass)" />
      <text x="156" y="378" fill="var(--brass)">monitor table</text>
      <text x="130" y="330">upper service door</text>
      <text x="130" y="344" className="dim">→ back stair → bell board</text>
      {/* sconce */}
      <circle cx="236" cy="270" r="5" fill="var(--warn)" />
      <text x="248" y="274" className="dim">sconce</text>
      <path d="M210 290 L210 245" stroke={muted} markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill={muted} />
        </marker>
      </defs>
    </svg>
  );
}
