import { useCallback, useEffect, useState } from "react";
import { deleteProject, listProjects } from "../lib/projects";
import { btnPillAccentSmall, btnPillDangerIcon, cn } from "../lib/ui";
import type { ProjectSummary } from "../types/domain";
import { Toast } from "./shared/Toast";

interface BookmarkLibraryProps {
  onNewResearch: () => void;
  onLoad: (id: string) => void;
}

export function BookmarkLibrary({
  onNewResearch,
  onLoad,
}: BookmarkLibraryProps) {
  const [bookmarks, setBookmarks] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listProjects();
      setBookmarks(items);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not load bookmarks";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookmarks();
  }, [loadBookmarks]);

  async function handleOpen(id: string) {
    setLoadingId(id);
    try {
      await onLoad(id);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not load bookmark";
      setToast(message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete bookmark "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteProject(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      setToast(`Deleted "${name}".`);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not delete bookmark";
      setToast(message);
    } finally {
      setDeletingId(null);
    }
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="min-h-screen w-full max-w-content pt-9">
      <div className="mb-9 flex items-end justify-between gap-6 max-md:flex-col max-md:items-stretch">
        <div>
          <div className="mb-3.5 font-serif text-xs tracking-widest uppercase text-accent">
            Competitor intelligence monitor
          </div>
          <div className="mb-3 font-serif text-4xl leading-tight font-semibold">
            Saved research
          </div>
          <div className="text-sm leading-relaxed text-text-2">
            Open a bookmarked dashboard or start new competitor research.
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 max-md:justify-between">
          <button
            type="button"
            className={btnPillAccentSmall}
            onClick={onNewResearch}
          >
            <i className="ti ti-plus" aria-hidden="true" />
            New research
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2.5 py-6 text-sm text-text-2">
          <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
          Loading bookmarks…
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-start gap-2.5 py-6 text-sm text-red">
          <div>{error}</div>
          <button
            type="button"
            className={btnPillAccentSmall}
            onClick={() => void loadBookmarks()}
          >
            <i className="ti ti-refresh" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border-strong px-8 py-12 text-center text-text-2">
          <i
            className="ti ti-bookmark mb-3 text-3xl text-text-3"
            aria-hidden="true"
          />
          <div className="mb-2 font-serif text-xl text-text-1">
            No saved bookmarks yet
          </div>
          <div className="text-sm leading-relaxed">
            Build a competitor dashboard and save it to share with the team.
          </div>
        </div>
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="flex flex-col gap-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-card pr-2 transition-colors duration-150 has-[button.bookmark-main:hover:not(:disabled)]:border-border-strong has-[button.bookmark-main:hover:not(:disabled)]:bg-bg-card-hover max-md:flex-col max-md:items-stretch max-md:p-0 max-md:pb-2"
            >
              <button
                type="button"
                className="bookmark-main flex min-w-0 flex-1 cursor-pointer flex-col items-start justify-center gap-1 border-0 bg-transparent px-4.5 py-4 text-left font-inherit font-normal whitespace-normal text-inherit hover:not-disabled:bg-transparent active:not-disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => void handleOpen(bookmark.id)}
                disabled={
                  loadingId === bookmark.id || deletingId === bookmark.id
                }
              >
                <div className="text-base leading-snug font-semibold text-text-1">
                  {bookmark.name}
                </div>
                <div className="text-xs text-text-3">
                  {loadingId === bookmark.id ? (
                    <>
                      <i
                        className="ti ti-loader-2 animate-spin"
                        aria-hidden="true"
                      />
                      Opening…
                    </>
                  ) : (
                    <>
                      <span>{bookmark.anchorName}</span>
                      <span className="mx-1.5">·</span>
                      <span>Updated {fmtTime(bookmark.updatedAt)}</span>
                    </>
                  )}
                </div>
              </button>
              <button
                type="button"
                className={cn(
                  btnPillDangerIcon,
                  "shrink-0 max-md:mr-2 max-md:self-end",
                )}
                onClick={() => void handleDelete(bookmark.id, bookmark.name)}
                disabled={
                  loadingId === bookmark.id || deletingId === bookmark.id
                }
                aria-label={`Delete ${bookmark.name}`}
                title="Delete bookmark"
              >
                {deletingId === bookmark.id ? (
                  <i
                    className="ti ti-loader-2 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <i className="ti ti-trash" aria-hidden="true" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast text={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
