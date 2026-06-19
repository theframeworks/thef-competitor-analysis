import { useState } from 'react';

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

interface AnthropicMessageResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string } | string;
}

export default function App() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function testClaude() {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 64,
          messages: [
            {
              role: 'user',
              content: 'Reply with exactly: "Competitor Intelligence Monitor is online."',
            },
          ],
        }),
      });

      const data = (await res.json()) as AnthropicMessageResponse;

      if (!res.ok) {
        const message =
          typeof data.error === 'string'
            ? data.error
            : data.error?.message ?? `Request failed (${res.status})`;
        throw new Error(message);
      }

      const text = data.content?.find((block) => block.type === 'text')?.text;
      setResponse(text ?? JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-page text-text-1">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-6 py-12">
        <header className="text-center">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-text-1">
            Competitor Intelligence Monitor
          </h1>
          <p className="mt-2 text-sm text-text-2">
            Monorepo scaffold — verify the Anthropic proxy works end-to-end.
          </p>
        </header>

        <div className="w-full rounded-lg border border-border bg-bg-card p-6">
          <button
            type="button"
            onClick={testClaude}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-sm border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-[#06231c] transition hover:border-accent-strong hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? 'Calling Claude…' : 'Test Claude'}
          </button>

          {error && (
            <p className="mt-4 rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {response && (
            <div className="mt-4 rounded-sm border border-border bg-bg-raised px-4 py-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-3">
                Response
              </p>
              <p className="font-serif text-base text-accent">{response}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
