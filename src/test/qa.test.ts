import { describe, expect, it } from 'vitest';
import { runQA } from '../lib/qa';
import { SHOTS } from '../data/shots';
import { keyframePrompt, videoPrompt } from '../lib/prompts';

describe('production QA', () => {
  const findings = runQA();

  it('has no errors', () => {
    const errors = findings.filter((f) => f.severity === 'error');
    expect(errors.map((e) => `${e.shot ?? '-'} [${e.rule}] ${e.msg}`)).toEqual([]);
  });

  it('builds a prompt for every shot', () => {
    for (const s of SHOTS) {
      expect(videoPrompt(s).length).toBeGreaterThan(50);
      expect(keyframePrompt(s).length).toBeGreaterThan(20);
    }
  });
});
