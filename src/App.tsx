import { useEffect, useMemo, useState } from 'react';
import { ALL_BEATS, SCRIPT, SCRIPT_META } from './data/script';
import { CHARACTERS, CAST, type CharId } from './data/characters';
import { ASSETS, MAPS } from './data/assets';
import { SHOTS } from './data/shots';
import { DECISIONS, OLD_PACK_PROBLEMS, PROCESS_NOTE } from './data/notes';
import { runQA, fmtTime, type Finding } from './lib/qa';
import { buildOrder, exportMarkdown, linesLost, timeline } from './lib/build';
import { fmt, keyframePrompt, videoPrompt } from './lib/prompts';
import { Checklist, CopyButton, PromptBlock, download, useStored } from './components/common';
import { ShotCard } from './components/ShotCard';
import { NurseryMap, UpperFloorMap } from './components/Diagrams';

const TABS = [
  ['overview', 'Overview'],
  ['shots', 'Shotlist'],
  ['maps', 'Shot maps'],
  ['script', 'Script check'],
  ['bible', 'Bible & maps'],
  ['build', 'Build order'],
  ['edit', 'Edit & audio'],
  ['qa', 'QA'],
  ['changes', 'Changes & decisions'],
  ['export', 'Export'],
] as const;
type Tab = (typeof TABS)[number][0];

function initialTab(): Tab {
  const h = location.hash.slice(1);
  return (TABS.find(([k]) => k === h)?.[0] ?? 'overview') as Tab;
}

export default function App() {
  const [tab, setTabState] = useState<Tab>(initialTab);
  const setTab = (t: Tab) => {
    setTabState(t);
    history.replaceState(null, '', `#${t}`);
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    const onHash = () => {
      const t = TABS.find(([k]) => k === location.hash.slice(1))?.[0];
      if (t) setTabState(t);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [done, setDone] = useStored<Record<string, boolean>>('hc.done', {});
  const [theme, setTheme] = useStored<'system' | 'light' | 'dark'>('hc.theme', 'system');
  const findings = useMemo(runQA, []);
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warns = findings.filter((f) => f.severity === 'warn').length;

  if (theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);

  const toggle = (k: string) => setDone((d) => ({ ...d, [k]: !d[k] }));

  return (
    <>
      <header className="bar">
        <div className="bar-inner">
          <div className="brand">
            <h1>The Haunted Crew · Ep 1</h1>
            <span className="sub">“Answer the Bell, Part 1” · 9:16 · Nano Banana 2 → Kling 3.0</span>
            <span className="spacer" />
            <button type="button" className={`pill ${errors ? 'rec' : 'ok'}`} style={{ border: 0, cursor: 'pointer' }} onClick={() => setTab('qa')}>
              {errors ? `${errors} QA errors` : 'QA clean'} · {warns} notes
            </button>
            <select aria-label="Theme" id="theme" value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
              <option value="system">System theme</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <nav className="tabs" role="tablist">
            {TABS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main>
        {tab === 'overview' && <Overview done={done} setTab={setTab} findings={findings} />}
        {tab === 'shots' && <Shots done={done} toggle={toggle} findings={findings} />}
        {tab === 'maps' && <ShotMaps findings={findings} />}
        {tab === 'script' && <ScriptCheck />}
        {tab === 'bible' && <Bible />}
        {tab === 'build' && <Build done={done} toggle={toggle} />}
        {tab === 'edit' && <Edit />}
        {tab === 'qa' && <QA findings={findings} />}
        {tab === 'changes' && <Changes />}
        {tab === 'export' && <Export />}
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------

/** Quick visual check: every shot map of the test scope side by side, with size and setup. */
function ShotMaps({ findings }: { findings: Finding[] }) {
  const scope = SHOTS.slice(0, 20);
  const coverage = findings.filter((f) => f.rule === 'Coverage' && scope.some((s) => s.id === f.shot));
  return (
    <section className="section">
      <h2>Shot maps, SH01–SH20</h2>
      <p className="lead">Top-down plan of every shot of the test scope, in cut order. Read them in sequence: the camera setup or the shot size should change at every cut, and people should leave one map where they start the next. Click a map to open it full size.</p>
      <div className="sizestrip" aria-label="Shot sizes in cut order">
        {scope.map((s) => (
          <span key={s.id} className={`sizechip size-${s.size}`} title={`${s.id} · ${s.setup}`}>
            <b>{s.id.slice(2)}</b>
            {s.size}
          </span>
        ))}
      </div>
      {coverage.length > 0 && (
        <div>
          {coverage.map((f, i) => (
            <div className="finding" key={i}>
              <span className={`pill ${f.severity === 'error' ? 'rec' : 'warn'}`}>{f.severity}</span>
              <span className="mono">{f.shot}</span>
              <span>{f.msg}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mapgrid">
        {scope.map((s) => (
          <figure key={s.id} className="mapcell">
            {s.map ? (
              <a href={s.map} target="_blank" rel="noreferrer">
                <img src={s.map} alt={`Top-down map of ${s.id}`} loading="lazy" />
              </a>
            ) : (
              <div className="nomap">No map — {s.cam === 'fixed-nursery' ? 'locked NURSERY FIXED frame' : 'not drawn yet'}</div>
            )}
            <figcaption>
              <div className="pills">
                <span className="pill mono">{s.id}</span>
                <span className="pill brass">{s.size}</span>
                <span className="pill">{s.lens}</span>
              </div>
              <div className="setup">{s.setup}</div>
              <div className="dim">{s.title}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Overview({ done, setTab, findings }: { done: Record<string, boolean>; setTab: (t: Tab) => void; findings: Finding[] }) {
  const total = SHOTS.reduce((a, s) => a + s.edit, 0);
  const gen = SHOTS.reduce((a, s) => a + s.order, 0);
  const shotsDone = SHOTS.filter((s) => done[s.id]).length;
  const assetsDone = buildOrder().filter((b) => done[b.file]).length;
  const [price, setPrice] = useStored<number>('hc.price', 0.11);
  const [takes, setTakes] = useStored<number>('hc.takes', 3);
  const lines = ALL_BEATS.filter((b) => b.kind === 'line' || b.kind === 'vo').length;
  return (
    <>
      <section className="section">
        <h2>From the locked script to 51 shots</h2>
        <p className="lead">
          Every beat of the Notion script is in, in script order. Each shot has a keyframe prompt for Nano Banana 2 and a video prompt for Kling 3.0. The prompts are assembled from one locked set of character descriptions, room maps and looks, so the same person or room gets the same words in every shot. Every change is checked automatically against the script and the production rules.
        </p>
        <div className="stats">
          <div className="stat"><b>{SHOTS.length}</b><span>shots, one generation each</span></div>
          <div className="stat"><b>{ALL_BEATS.length}</b><span>script beats, all covered</span></div>
          <div className="stat"><b>{lines}</b><span>scripted lines, word for word (on-screen in prompts, VO and off-screen in edit notes)</span></div>
          <div className="stat"><b>{fmtTime(total)}</b><span>full script cut (script: ~2:38–2:45)</span></div>
          <div className="stat"><b>{shotsDone}/{SHOTS.length}</b><span>shots marked done</span></div>
          <div className="stat"><b>{assetsDone}/{buildOrder().length}</b><span>images marked done</span></div>
        </div>
      </section>

      <section className="section">
        <h3>Order of work</h3>
        <ol className="steps">
          {[
            ['Record the voices first', 'Design the five voices in ElevenLabs and record the three host VO lines, so the intro is cut to real line lengths.', 'edit'],
            ['Characters and lineup', 'Six sheets, text only, rerolled until each face is right, then the height lineup. Never regenerate an approved sheet.', 'build'],
            ['Props and plates', 'Day plates first. Night and fixed-camera versions are edits of the same image; check the nursery night plate over the day plate at 50% opacity.', 'build'],
            ['Keyframes, in build order', 'The Build order tab lists every image after the images it depends on. NURSERY FIXED frames are successive edits of one frame.', 'build'],
            ['Veiled Woman layers', 'P1 → P2 → P3, each an edit of the previous one: same figure, only moved. Check the three side by side.', 'bible'],
            ['Video', 'Kling 3.0 image-to-video, one shot per generation. Draft on Turbo/Standard, final on Pro. Save takes as SH34_t02, selects as SH34_t02_SELECT.', 'shots'],
            ['Audio', 'Voice-swap every native-audio line to the cast voice; lay the off-screen lines, bell, flag clack, breaths.', 'edit'],
            ['Edit and finish', 'Screen replacements, feed overlays, Woman composites, grade, lower thirds, watermark, 1080×1920 export, process note.', 'edit'],
          ].map(([t, d, target], i) => (
            <li key={t}>
              <span className="pill brass">{i + 1}</span>
              <a href={`#${target}`} onClick={(e) => { e.preventDefault(); setTab(target as Tab); }}><b>{t}</b></a>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h3>Generation budget</h3>
        <p className="lead">Check the current Higgsfield price for Kling 3.0 Pro; the default here is only a placeholder.</p>
        <div className="toolbar">
          <label htmlFor="price">Price per second, USD</label>
          <input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ width: 90 }} />
          <label htmlFor="takes">Takes per shot</label>
          <input id="takes" type="number" step="1" min="1" value={takes} onChange={(e) => setTakes(Number(e.target.value))} style={{ width: 70 }} />
          <span className="pill brass">{gen}s ordered × {takes} = {gen * takes}s ≈ ${(gen * takes * price).toFixed(0)}</span>
        </div>
      </section>

      <section className="section">
        <h3>Sources, in priority order</h3>
        <p>
          1. <a href={SCRIPT_META.url} target="_blank" rel="noreferrer">Script</a> — what happens and what is said. 2. <a href={SCRIPT_META.bibleUrl} target="_blank" rel="noreferrer">Bible</a> — how it may be shown. 3. Production rules (handoff). {findings.filter((f) => f.severity === 'error').length === 0 && 'All automated checks pass.'}
        </p>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function Shots({ done, toggle, findings }: { done: Record<string, boolean>; toggle: (k: string) => void; findings: Finding[] }) {
  const [section, setSection] = useStored<string>('hc.section', 'all');
  const [q, setQ] = useState('');
  const [hideDone, setHideDone] = useStored<boolean>('hc.hideDone', false);
  useEffect(() => {
    let id: string | null = null;
    try {
      id = sessionStorage.getItem('jump');
      sessionStorage.removeItem('jump');
    } catch {
      /* ignore */
    }
    if (id) requestAnimationFrame(() => document.getElementById(id!)?.scrollIntoView({ block: 'start' }));
  }, []);
  const rows = timeline().filter(({ shot }) => {
    if (section !== 'all' && shot.section !== section) return false;
    if (hideDone && done[shot.id]) return false;
    if (q) {
      const hay = `${shot.id} ${shot.title} ${videoPrompt(shot)} ${keyframePrompt(shot)}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  return (
    <section className="section">
      <div className="toolbar">
        <select id="section" aria-label="Script section" value={section} onChange={(e) => setSection(e.target.value)}>
          <option value="all">All sections</option>
          {SCRIPT.map((s) => (
            <option key={s.id} value={s.id}>
              {s.time} · {s.heading.split('/')[0].trim()}
            </option>
          ))}
        </select>
        <input id="search" type="search" placeholder="Search shots and prompts" value={q} onChange={(e) => setQ(e.target.value)} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input id="hide-done" type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide done
        </label>
        <span className="pill">{rows.length} shots</span>
      </div>
      {rows.map(({ shot, start }) => (
        <ShotCard key={shot.id} shot={shot} start={start} done={!!done[shot.id]} onToggle={() => toggle(shot.id)} findings={findings.filter((f) => f.shot === shot.id)} />
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------

const normLine = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...');

function ScriptCheck() {
  const cover: Record<string, string> = {};
  for (const s of SHOTS) for (const c of s.covers) cover[c] = s.id;
  return (
    <section className="section">
      <h2>Script, line by line, against the shots</h2>
      <p className="lead">Every beat of the locked script and the shot that carries it. Dialogue spoken by someone in frame must be word for word in that shot’s video prompt. Host VO and off-screen lines are laid in the edit, so they must be word for word in the shot’s audio notes instead.</p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Beat</th>
              <th>Script</th>
              <th>Shot</th>
              <th>Line</th>
            </tr>
          </thead>
          <tbody>
            {SCRIPT.map((sec) => (
              <FragmentRows key={sec.id} head={`${sec.time} · ${sec.heading}`}>
                {sec.beats.map((b) => {
                  const shot = SHOTS.find((s) => s.id === cover[b.id]);
                  const inShot = b.kind === 'line' && !b.offScreen;
                  const hasLine = b.line ? !!shot && normLine(inShot ? videoPrompt(shot) : shot.audio).includes(normLine(b.line)) : null;
                  return (
                    <tr key={b.id}>
                      <td className="mono">{b.id}</td>
                      <td>{b.text}</td>
                      <td className="mono">{shot ? <a href={`#shots`} onClick={() => { try { sessionStorage.setItem('jump', shot.id); } catch { /* ignore */ } }}>{shot.id}</a> : <span className="pill rec">missing</span>}</td>
                      <td>{hasLine === null ? '' : hasLine ? <span className="pill ok">{b.kind === 'line' && !b.offScreen ? 'in video prompt' : 'in edit notes'}</span> : <span className="pill rec">missing</span>}</td>
                    </tr>
                  );
                })}
              </FragmentRows>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FragmentRows({ head, children }: { head: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="sec">
        <td colSpan={4}>{head}</td>
      </tr>
      {children}
    </>
  );
}

// ---------------------------------------------------------------------------

function Bible() {
  return (
    <>
      <section className="section">
        <h2>Cast</h2>
        <p className="lead">Character sheets are the only identity references. Every prompt uses the descriptor below, never a name, and restates the full wardrobe whenever the body is visible.</p>
        <div className="grid2">
          {(Object.keys(CHARACTERS) as CharId[]).map((id) => {
            const c = CHARACTERS[id];
            return (
              <div className="panel" key={id}>
                <h3>
                  {c.name} <span className="pill">{c.role}</span> {CAST.includes(id) && <span className="pill">{c.heightCm} cm</span>}
                </h3>
                <dl className="kv">
                  <dt>In prompts</dt>
                  <dd>{c.short}</dd>
                  <dt>Wardrobe</dt>
                  <dd>{c.wardrobe}</dd>
                  <dt>Colour lane</dt>
                  <dd>{c.lane}</dd>
                  {c.voiceDesign && (
                    <>
                      <dt>Voice</dt>
                      <dd>
                        {c.voiceDesign} <CopyButton text={c.voiceDesign} />
                      </dd>
                    </>
                  )}
                </dl>
                <PromptBlock title={`Sheet → ${c.sheetFile}`} text={c.sheetPrompt} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Locked maps</h2>
        <p className="lead">One map per space. Directions are given as the camera sees them, and the prompts repeat them.</p>
        <div className="grid2">
          <div className="panel">
            <h3>Nursery · NURSERY FIXED <span className="pill rec">Woman only here</span></h3>
            <NurseryMap />
            <p>{MAPS.nursery.text}</p>
            <p>{MAPS.veiled.text}</p>
          </div>
          <div className="panel">
            <h3>Upper floor and service route</h3>
            <UpperFloorMap />
            <p>{MAPS.corridor.text}</p>
            <p>{MAPS.landing.text}</p>
          </div>
          {(['exterior', 'hall', 'serviceHall', 'stair'] as const).map((k) => (
            <div className="panel" key={k}>
              <h3>{MAPS[k].title}</h3>
              <p>{MAPS[k].text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Continuity ladders</h2>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>NURSERY FIXED return</th>
                <th>Woman</th>
                <th>Throat mark</th>
                <th>Clara</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="mono">SH01 cold open (crop)</td><td>dark slice at the edge (P3 layer, cropped)</td><td>faint, forming</td><td>final-cliff pose, two fingers at the mark</td></tr>
              <tr><td className="mono">SH34 first reveal</td><td>P1 far-right corner</td><td>none</td><td>hands low, unaware</td></tr>
              <tr><td className="mono">SH40 second return</td><td>P2 halfway, on the rug</td><td>faint line</td><td>swallows, two fingers rise</td></tr>
              <tr><td className="mono">SH47 third position</td><td>P3 one body length</td><td>darker</td><td>breath barely lands, hand at throat</td></tr>
              <tr><td className="mono">SH51 final cliff</td><td>P3, same layer, unmoved</td><td>dark band</td><td>inhale fails, hand on door, knees give</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function Build({ done, toggle }: { done: Record<string, boolean>; toggle: (k: string) => void }) {
  const steps = buildOrder();
  let lastStage = '';
  return (
    <section className="section">
      <h2>Build order</h2>
      <p className="lead">Every image in the order it must be made: nothing appears before the images it is built from. Save each approved image under exactly the listed name; later prompts refer to it.</p>
      {steps.map((b) => {
        const head = b.stage !== lastStage ? <h3 key={`h-${b.stage}`} style={{ marginTop: 12 }}>{b.stage}</h3> : null;
        lastStage = b.stage;
        const asset = ASSETS.find((a) => a.file === b.file);
        return (
          <div key={b.file} style={{ display: 'grid', gap: 8 }}>
            {head}
            <div className={`panel${done[b.file] ? ' done' : ''}`} style={done[b.file] ? { opacity: 0.6 } : undefined}>
              <h3>
                <input type="checkbox" id={`asset-${b.file}`} checked={!!done[b.file]} onChange={() => toggle(b.file)} aria-label={`Mark ${b.file} done`} />
                <code>{b.file}</code> <span style={{ fontFamily: 'var(--body)', fontSize: 14, fontWeight: 400 }}>{b.title}</span>
                {b.editOf && <span className="pill">edit of {b.editOf}</span>}
              </h3>
              {b.uploads.length > 0 && (
                <ul className="uploads">
                  {b.uploads.map((u) => (
                    <li key={u.file}>
                      <code>{u.file}</code> <span className="job">— {u.job}</span>
                    </li>
                  ))}
                </ul>
              )}
              {b.prompt ? <PromptBlock title="Prompt" text={b.prompt} /> : null}
              {b.check?.length ? <Checklist id={`asset-${b.file}`} items={b.check} /> : null}
              {(b.note || asset?.note) && <p className="lead" style={{ fontSize: 14 }}>{b.note ?? asset?.note}</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ---------------------------------------------------------------------------

function Edit() {
  const [cutList, setCutList] = useStored<string[]>('hc.cut', []);
  const cut = new Set(cutList);
  const rows = timeline();
  const trimmed = timeline(cut);
  const total = trimmed.length ? trimmed[trimmed.length - 1].end : 0;
  const lost = linesLost(cut);
  const vo = ALL_BEATS.filter((b) => b.kind === 'vo');
  return (
    <>
      <section className="section">
        <h2>Edit map</h2>
        <p className="lead">
          The full script cut at natural line speed. Ticking “cut” is a <b>proposal for the producer</b>: it recalculates the runtime and lists every beat and line that would be lost. Nothing is cut in the shotlist.
        </p>
        <div className="toolbar">
          <span className={`pill ${cut.size ? 'warn' : 'ok'}`}>Runtime {fmtTime(total)}{cut.size ? ` (full: ${fmtTime(rows[rows.length - 1].end)})` : ''}</span>
          {cut.size > 0 && <button className="btn" onClick={() => setCutList([])}>Clear proposal</button>}
          {cut.size > 0 && <span className="pill rec">{lost.length} scripted lines lost</span>}
        </div>
        {cut.size > 0 && (
          <div className="panel">
            <h3>This proposal removes</h3>
            <ul>
              {SHOTS.filter((s) => cut.has(s.id)).map((s) => (
                <li key={s.id}>
                  <b className="mono">{s.id}</b> — beats {s.covers.join(', ')}
                </li>
              ))}
            </ul>
            {lost.length > 0 && (
              <p>
                Lines lost: {lost.map((b) => `“${b.line}”`).join(' · ')}
              </p>
            )}
          </div>
        )}
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Cut?</th>
                <th>Shot</th>
                <th className="num">In</th>
                <th className="num">Len</th>
                <th>What happens</th>
                <th>Sound</th>
                <th>Post</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ shot, start }) => (
                <tr key={shot.id} className={cut.has(shot.id) ? 'cut' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      id={`cut-${shot.id}`}
                      aria-label={`Propose cutting ${shot.id}`}
                      checked={cut.has(shot.id)}
                      onChange={() => setCutList(cut.has(shot.id) ? cutList.filter((x) => x !== shot.id) : [...cutList, shot.id])}
                    />
                  </td>
                  <td className="mono">
                    {shot.id}
                    {shot.trim && <div><span className="pill warn" title={shot.trim}>candidate</span></div>}
                  </td>
                  <td className="num">{fmtTime(start)}</td>
                  <td className="num">{fmt(shot.edit)}s</td>
                  <td>{shot.title}{shot.lowerThird && <div className="mono" style={{ color: 'var(--brass)' }}>LT: {shot.lowerThird}</div>}</td>
                  <td>{shot.audio}</td>
                  <td>{shot.post ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Voices</h2>
        <p className="lead">Record the host VO first and cut the intro to it. Every native-audio line is voice-swapped (ElevenLabs Voice Changer) to the cast voice so each character sounds the same in every clip.</p>
        <div className="grid2">
          <div className="panel">
            <h3>Host VO lines</h3>
            {vo.map((b) => (
              <div key={b.id} className="toolbar" style={{ justifyContent: 'space-between' }}>
                <span>
                  <span className="mono" style={{ color: 'var(--brass)' }}>{b.id}</span> “{b.line}”
                </span>
                <CopyButton text={b.line!} />
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>Sound rules</h3>
            <p>Day: ambience and a light investigative music bed under the host VO, falling away as Naomi and Clara reach the upper floor. Night: no music — room tone, the bell, the flag clack, breathing, footsteps. Cut all sound on black.</p>
            <p>Finishing: fixed-camera overlays (screen blend), running timecode, blinking REC, grain, cold grade on feeds; lower thirds once per crew member in the bottom fifth; faces in the middle band; watermark; export 1080×1920, H.264.</p>
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function QA({ findings }: { findings: Finding[] }) {
  const order = { error: 0, warn: 1, info: 2 } as const;
  const sorted = [...findings].sort((a, b) => order[a.severity] - order[b.severity]);
  return (
    <section className="section">
      <h2>Automated QA</h2>
      <p className="lead">
        The same checks run in <code>npm test</code> and block the Vercel build on any error: every beat covered in script order; every scripted line verbatim in its prompt; VO clips silent; two speakers at most per clip; timings add up to the ordered length; lines fit at natural speed; no names or file names in prompts; 2–5 uploads, each with a job; identity reference for everyone visible; the Woman only on NURSERY FIXED and never animated; handheld only with an established operator; the mark and distance ladders in order; no two consecutive shots from the same setup at the same size.
      </p>
      <div>
        {sorted.map((f, i) => (
          <div className="finding" key={i}>
            <span className={`pill ${f.severity === 'error' ? 'rec' : f.severity === 'warn' ? 'warn' : 'ok'}`}>{f.severity}</span>
            <span className="mono">{f.shot ?? '—'}</span>
            <span>
              <b>{f.rule}.</b> {f.msg}
            </span>
          </div>
        ))}
      </div>
      <h3>Manual QA before export</h3>
      <ul>
        <li>Faces and full wardrobe match the sheets in every shot; Elias and Owen never merge; Mara, Naomi and Clara never merge.</li>
        <li>Heights right in group shots: Elias 190 ≈ Owen 188 &gt; Naomi 182 &gt; Clara 170 &gt; Mara 158.</li>
        <li>NURSERY FIXED identical in SH34, SH40, SH47, SH51 (toggle them at 100% in the edit); SH01 is a crop of SH51.</li>
        <li>The Woman is a still layer, only on NURSERY FIXED, closer each return, identical in SH47 and SH51.</li>
        <li>Mark: none → faint → darker → dark. Clara’s throat readable at night.</li>
        <li>Stair handrail on frame-left in SH22, SH46, SH49. Monitor: left = NURSERY FIXED, right = BELL BOARD FIXED.</li>
        <li>NURSERY label readable on the board; the same voice for each character across clips; watermark on; no HeyGen.</li>
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------

function Changes() {
  return (
    <>
      <section className="section">
        <h2>What was wrong in the previous pack</h2>
        <p className="lead">Checked against the script, the bible and the production rules. Each item says what the old pack did and what this build does instead.</p>
        <div className="notes">
          {OLD_PACK_PROBLEMS.map((n) => (
            <div className="note" key={n.title}>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
              {n.fix && <p className="fix">{n.fix}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Deviations and producer decisions</h2>
        <p className="lead">Every place this build interprets or departs from a source, listed so nothing changes silently.</p>
        <div className="notes">
          {DECISIONS.map((n) => (
            <div className="note" key={n.title}>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
              {n.fix && <p className="ask">{n.fix}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function Export() {
  const md = useMemo(exportMarkdown, []);
  const json = useMemo(() => JSON.stringify({ shots: SHOTS.map((s) => ({ ...s, keyframePrompt: keyframePrompt(s), videoPrompt: videoPrompt(s) })), assets: buildOrder() }, null, 2), []);
  return (
    <section className="section">
      <h2>Export</h2>
      <p className="lead">Everything in one file: build order with every image prompt, then every shot with its keyframe, Woman layer and video prompts.</p>
      <div className="toolbar">
        <button className="btn" onClick={() => download('HauntedCrew_Ep1_prompts.md', md)}>Download Markdown</button>
        <button className="btn" onClick={() => download('HauntedCrew_Ep1_prompts.json', json, 'application/json')}>Download JSON</button>
        <CopyButton text={md} label="Copy all as Markdown" />
      </div>
      <PromptBlock title="Process note template" text={PROCESS_NOTE} />
      <PromptBlock
        title="Delivery folder"
        text={`/HauntedCrew_Ep1
  00_brief/            script, bible, rules, this app's export
  01_characters/       CH_*.png, CH_LINEUP.png
  02_locations_props/  LOC_*.png, PROP_*.png, MARK_STAGES.png
  03_keyframes/        KF_SH01.png … KF_SH51.png, KF_SH34_W.png, KF_SH40_W.png, KF_SH47_W.png
  04_video_takes/      SH34_t01.mp4, SH34_t02_SELECT.mp4 …
  05_audio/            vo/, dialogue/, sfx/
  06_edit/             project file, overlays
  07_export/           HauntedCrew_Ep1_9x16.mp4
  PROCESS_NOTE.md`}
      />
    </section>
  );
}
