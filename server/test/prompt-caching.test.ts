import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RESEARCH_SYSTEM_PROMPT } from '../../client/src/lib/anthropic-system.ts';
import { buildResearchRequest } from '../../client/src/lib/api.ts';
import { brandResearchPrompt } from '../../client/src/lib/prompts.ts';

describe('Anthropic prompt caching', () => {
  it('marks the shared research system prompt for ephemeral caching', () => {
    const request = buildResearchRequest('Task: brand research\nBrand to research: "Acme"', 1200);

    assert.ok(request.system);
    assert.equal(request.system.length, 1);
    assert.equal(request.system[0]?.text, RESEARCH_SYSTEM_PROMPT);
    assert.deepEqual(request.system[0]?.cache_control, { type: 'ephemeral' });
  });

  it('keeps variable brand details in the user message', () => {
    const userPrompt = brandResearchPrompt('Acme Corp', 'Anchor Inc', false, true);
    const request = buildResearchRequest(userPrompt, 1200);

    assert.match(request.messages[0]?.content ?? '', /Brand to research: "Acme Corp"/);
    assert.match(request.messages[0]?.content ?? '', /Anchor brand for this project: "Anchor Inc"/);
    assert.match(request.messages[0]?.content ?? '', /refresh/);
    assert.doesNotMatch(request.system?.[0]?.text ?? '', /Acme Corp/);
  });

  it('uses a system prompt large enough for Sonnet cache breakpoints', () => {
    // Anthropic requires ~1,024 tokens; ~4 chars/token is a conservative lower bound.
    assert.ok(RESEARCH_SYSTEM_PROMPT.length >= 4096);
  });
});
