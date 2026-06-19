import { RESEARCH_SYSTEM_PROMPT } from './anthropic-system';

export const CLAUDE_MODEL = 'claude-sonnet-4-6';

export interface AnthropicCacheControl {
  type: 'ephemeral';
  ttl?: '5m' | '1h';
}

export interface AnthropicTextBlock {
  type: 'text';
  text: string;
  cache_control?: AnthropicCacheControl;
}

export interface AnthropicMessageRequest {
  model: string;
  max_tokens: number;
  system?: AnthropicTextBlock[];
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AnthropicMessageResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string } | string;
  usage?: {
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export function buildResearchRequest(
  userPrompt: string,
  maxTokens: number,
): AnthropicMessageRequest {
  return {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: [
      {
        type: 'text',
        text: RESEARCH_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  };
}

export async function sendMessage(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildResearchRequest(prompt, maxTokens)),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as AnthropicMessageResponse;
  return data.content?.find((block) => block.type === 'text')?.text ?? '';
}

function extractBalancedJson(text: string, open: '{' | '[', close: '}' | ']'): string | null {
  const start = text.indexOf(open);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === open) depth++;
    if (char === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

export function extractJsonObject<T>(text: string): T {
  const json = extractBalancedJson(text, '{', '}');
  if (!json) throw new Error('No JSON found in response');
  return JSON.parse(json) as T;
}

export function extractJsonArray<T>(text: string): T {
  const json = extractBalancedJson(text, '[', ']');
  if (!json) throw new Error('No JSON array found');
  return JSON.parse(json) as T;
}
