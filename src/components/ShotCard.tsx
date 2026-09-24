import { BEAT_BY_ID, SECTION_OF } from '../data/script';
import { ASSETS, MAPS } from '../data/assets';
import { compass, type Shot } from '../data/shots';
import type { Finding } from '../lib/qa';
import { fmtTime } from '../lib/qa';
import { approvalChecklist, fmt, keyframePrompt, klingSettings, refFor, videoPrompt, womanPrompt } from '../lib/prompts';
import { Checklist, PromptBlock } from './common';

const CAM_LABEL: Record<Shot['cam'], string> = {
  cinematic: 'cinematic',
  handheld: 'handheld',
  tripod: 'tripod',
  'fixed-nursery': 'NURSERY FIXED',
  'fixed-bellboard': 'BELL BOARD FIXED',
};

export function ShotCard({
  shot,
  start,
  done,
  onToggle,
  findings,
}: {
  shot: Shot;
  start: number;
  done: boolean;
  onToggle: () => void;
  findings: Finding[];
}) {
  const sec = SECTION_OF[shot.covers.find((c) => BEAT_BY_ID[c].kind !== 'sound') ?? shot.covers[0]];
  const fixed = shot.cam.startsWith('fixed');
  const w = womanPrompt(shot);
  const problems = findings.filter((f) => f.severity !== 'info');
  return (
    <article className={`shot${done ? ' done' : ''}`} id={shot.id}>
      <div className="slate">
        <div className="id">{shot.id}</div>
        <div className="tc">
          {fmtTime(start)} → {fmtTime(start + shot.edit)}
        </div>
        <div>script {sec?.time}</div>
        <label>
          <input type="checkbox" checked={done} onChange={onToggle} id={`done-${shot.id}`} /> done
        </label>
      </div>
      <div className="shot-body">
        <div className="pills">
          <span className={`pill ${fixed ? 'rec' : shot.cam === 'handheld' ? 'brass' : ''}`}>{CAM_LABEL[shot.cam]}</span>
          <span className={`pill ${shot.time === 'night' ? 'night' : ''}`}>{shot.time}</span>
          <span className="pill brass">{shot.size}</span>
          <span className="pill">{shot.lens}</span>
          <span className="pill">setup {shot.setup}</span>
          {shot.heading !== undefined && <span className="pill">camera faces {compass(shot.heading)}</span>}
          <span className="pill">order {fmt(shot.order)}s</span>
          <span className="pill">edit {fmt(shot.edit)}s</span>
          <span className={`pill ${shot.sound === 'native' ? 'ok' : ''}`}>{shot.sound === 'native' ? 'native audio' : 'sound off'}</span>
          {shot.video.vo && <span className="pill brass">host VO</span>}
          {shot.woman && <span className="pill rec">Woman {shot.woman.position} · still comp</span>}
          {shot.trim && <span className="pill warn">trim candidate</span>}
          {problems.map((p, i) => (
            <span key={i} className={`pill ${p.severity === 'error' ? 'rec' : 'warn'}`} title={p.msg}>
              {p.rule}
            </span>
          ))}
        </div>
        <p className="shot-title">{shot.title}</p>

        <details>
          <summary>Script beats ({shot.covers.join(', ')})</summary>
          <div className="script-quote">
            {shot.covers.map((id) => (
              <div key={id}>
                <span className="bid">{id}</span>
                {BEAT_BY_ID[id].text}
              </div>
            ))}
          </div>
        </details>

        <dl className="kv">
          <dt>Blocking</dt>
          <dd>{shot.blocking.replace(MAPS.nursery.text, 'Locked NURSERY FIXED map (see Bible).')}</dd>
          <dt>Uploads</dt>
          <dd>
            <ul className="uploads">
              {shot.kf.uploads.map((u) => (
                <li key={u.file}>
                  <code>{u.file}</code> <span className="job">— {u.job}</span>
                  {!refFor(u.file) && <span className="pill rec">unknown</span>}
                </li>
              ))}
            </ul>
          </dd>
          {shot.lowerThird && (
            <>
              <dt>Lower third</dt>
              <dd className="mono">{shot.lowerThird}</dd>
            </>
          )}
        </dl>

        {shot.map && (
          <figure className="shotmap">
            <a href={shot.map} target="_blank" rel="noreferrer">
              <img src={shot.map} alt={`Top-down shot map for ${shot.id}`} loading="lazy" />
            </a>
            <figcaption>
              Shot map — upload it with the keyframe as <code>MAP_{shot.id}.png</code>.{' '}
              <a href={shot.map} download={`MAP_${shot.id}.png`}>Download PNG</a>
            </figcaption>
          </figure>
        )}
        <PromptBlock title={`Keyframe · Nano Banana 2 → ${shot.kf.mode === 'plate' || shot.kf.mode === 'startEnd' ? 'no new image' : shot.kf.saveAs}`} text={keyframePrompt(shot)} />
        {(shot.kf.mode === 'generate' || shot.kf.mode === 'edit') && <Checklist id={shot.id} items={approvalChecklist(shot)} />}
        {(shot.kf.mode === 'plate' || shot.kf.mode === 'startEnd') &&
          [shot.kf.uploads[0].file, shot.kf.mode === 'startEnd' ? shot.kf.endFrame : undefined]
            .map((f) => ASSETS.find((x) => x.file === f))
            .filter((x): x is NonNullable<typeof x> => !!x && !!x.prompt)
            .map((x) => (
              <div key={x.file}>
                <PromptBlock
                  title={`Start frame image · Nano Banana 2 → ${x.file}`}
                  text={x.prompt!}
                  footer={x.uploads?.length ? `Upload: ${x.uploads.map((u) => `${u.file} (${u.job})`).join(' · ')}` : 'No uploads.'}
                />
                {x.check && <Checklist id={`plate-${x.file}`} items={x.check} />}
              </div>
            ))}
        {w && <PromptBlock title={`Veiled Woman layer → ${shot.woman!.file}`} text={w} footer="Mask the figure out of this still and composite it over the clip. She never moves." />}
        {shot.woman?.cleanPrompt && <PromptBlock title={`Clean start frame → ${shot.woman.cleanSaveAs}`} text={shot.woman.cleanPrompt} />}
        <PromptBlock title="Video · Kling 3.0" text={videoPrompt(shot)} footer={klingSettings(shot)} />

        <dl className="kv">
          <dt>Audio</dt>
          <dd>{shot.audio}</dd>
          {shot.post && (
            <>
              <dt>Post</dt>
              <dd>{shot.post}</dd>
            </>
          )}
          {shot.note && (
            <>
              <dt>Note</dt>
              <dd>{shot.note}</dd>
            </>
          )}
        </dl>
      </div>
    </article>
  );
}
