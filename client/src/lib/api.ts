export const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';

export interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

export interface AnthropicMessageResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string } | string;
}

export async function sendMessage(prompt: string, maxTokens: number): Promise<string> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as AnthropicMessageResponse;
  return data.content?.find((block) => block.type === 'text')?.text ?? '';
}

export function extractJsonObject<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');
  return JSON.parse(jsonMatch[0]) as T;
}

export function extractJsonArray<T>(text: string): T {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found');
  return JSON.parse(jsonMatch[0]) as T;
}
