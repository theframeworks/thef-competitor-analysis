import { useCallback, useEffect, useState } from 'react';
import type { ProjectSummary } from '../types/domain';
import { deleteProject, listProjects } from '../lib/projects';
import { Toast } from './shared/Toast';

interface BookmarkLibraryProps {
  onNewResearch: () => void;
  onLoad: (id: string) => void;
}

export function BookmarkLibrary({ onNewResearch, onLoad }: BookmarkLibraryProps) {
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
      const message = e instanceof Error ? e.message : 'Could not load bookmarks';
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
      const message = e instanceof Error ? e.message : 'Could not load bookmark';
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
      const message = e instanceof Error ? e.message : 'Could not delete bookmark';
      setToast(message);
    } finally {
      setDeletingId(null);
    }
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  return (
    <div className="library-wrap">
      <div className="library-header">
        <div>
          <div className="setup-eyebrow">Competitor intelligence monitor</div>
          <div className="setup-title">Saved research</div>
          <div className="setup-sub library-sub">
            Open a bookmarked dashboard or start new competitor research.
          </div>
        </div>
        <div className="library-header-actions">
          <button type="button" className="pill pill-accent small" onClick={onNewResearch}><i className="ti ti-plus" aria-hidden="true" />New research</button>
        </div>
      </div>

      {loading && (
        <div className="library-state">
          <i className="ti ti-loader-2 spin" aria-hidden="true" />Loading bookmarks…
        </div>
      )}

      {!loading && error && (
        <div className="library-state library-error">
          <div>{error}</div>
          <button
            type="button"
            className="pill pill-accent small"
            onClick={() => void loadBookmarks()}><i className="ti ti-refresh" aria-hidden="true" />Retry</button>
        </div>
      )}

      {!loading && !error && bookmarks.length === 0 && (
        <div className="library-empty">
          <i className="ti ti-bookmark" aria-hidden="true" />
          <div className="library-empty-title">No saved bookmarks yet</div>
          <div className="library-empty-body">
            Build a competitor dashboard and save it to share with the team.
          </div>
        </div>
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="bookmark-list">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bookmark-row">
              <button
                type="button"
                className="bookmark-main"
                onClick={() => void handleOpen(bookmark.id)}
                disabled={loadingId === bookmark.id || deletingId === bookmark.id}><div className="bookmark-name">{bookmark.name}</div>
                <div className="bookmark-meta">{loadingId === bookmark.id ? (
                    <><i className="ti ti-loader-2 spin" aria-hidden="true" />Opening…</>
                  ) : (
                    <>
                      <span>{bookmark.anchorName}</span>
                      <span className="bookmark-dot">·</span>
                      <span>Updated {fmtTime(bookmark.updatedAt)}</span>
                    </>
                  )}</div></button>
              <button
                type="button"
                className="pill pill-danger pill-icon bookmark-delete"
                onClick={() => void handleDelete(bookmark.id, bookmark.name)}
                disabled={loadingId === bookmark.id || deletingId === bookmark.id}
                aria-label={`Delete ${bookmark.name}`}
                title="Delete bookmark"
              >
                {deletingId === bookmark.id ? (
                  <i className="ti ti-loader-2 spin" aria-hidden="true" />
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
