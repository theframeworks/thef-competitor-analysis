import { useCallback, useRef, useState } from 'react';
import { ACTIVITY_ORDER } from '../constants/tone';
import { researchBrandData, researchCrossThemes, researchOpportunities } from '../lib/research';
import type { Brand, Project } from '../types/domain';
import { BrandCard } from './BrandCard';
import { BrandListRow } from './BrandListRow';
import { CrossThemesSection } from './CrossThemesSection';
import { DetailPanel } from './DetailPanel';
import { SettingsPanel } from './SettingsPanel';
import { Toast } from './shared/Toast';

type DetailTab = 'overview' | 'content' | 'differentiation';
type ViewMode = 'grid' | 'list';
type SortMode = 'name' | 'activity' | 'linkedin';

interface DashboardProps {
  project: Project;
  updateProject: (updater: Project | ((prev: Project) => Project)) => void;
  isSaved: boolean;
  saving: boolean;
  onSaveBookmark: (name: string) => Promise<void>;
  onPersist: (project: Project) => Promise<boolean>;
  onBackToLibrary: () => void;
}

export function Dashboard({
  project,
  updateProject,
  isSaved,
  saving,
  onSaveBookmark,
  onPersist,
  onBackToLibrary,
}: DashboardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState<SortMode>('name');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState({
    current: 0,
    total: 0,
    brand: '',
  });
  const [view, setView] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshingOpps, setRefreshingOpps] = useState(false);
  const [refreshingThemes, setRefreshingThemes] = useState(false);
  const cancelRef = useRef(false);
  const projectRef = useRef(project);
  projectRef.current = project;

  const brands = project.brands;
  const tiers = ['All', ...Array.from(new Set(brands.map((b) => b.tier))).sort()];

  function touchUpdated(newBrands?: Brand[], newOpps?: Project['opportunities']) {
    const updatedAt = new Date().toISOString();
    updateProject((prev) => ({
      ...prev,
      brands: newBrands ?? prev.brands,
      opportunities: newOpps !== undefined ? newOpps : prev.opportunities,
      updatedAt,
    }));
    const current = projectRef.current;
    return {
      ...current,
      brands: newBrands ?? current.brands,
      opportunities: newOpps !== undefined ? newOpps : current.opportunities,
      updatedAt,
    };
  }

  function promptBookmarkName(): string | null {
    const defaultName = project.name ?? `${project.anchorName} competitors`;
    const name = window.prompt('Bookmark name:', defaultName);
    if (name === null) return null;
    return name.trim() || defaultName;
  }

  async function handleSaveClick() {
    const name = promptBookmarkName();
    if (!name) return;
    try {
      await onSaveBookmark(name);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save bookmark';
      setToast(message);
    }
  }

  const filtered = brands
    .filter((b) => filter === 'All' || b.tier === filter)
    .filter(
      (b) =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.themes || []).some((t) => t.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      if (a.isAnchor) return -1;
      if (b.isAnchor) return 1;
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'activity')
        return ACTIVITY_ORDER[b.activity] - ACTIVITY_ORDER[a.activity];
      if (sort === 'linkedin') return b.linkedin - a.linkedin;
      return 0;
    });

  const refreshAll = useCallback(async () => {
    cancelRef.current = false;
    setRefreshing(true);
    const list = [...brands];
    setRefreshProgress({ current: 0, total: list.length, brand: '' });
    let errorCount = 0;
    let updated = [...brands];

    for (let i = 0; i < list.length; i++) {
      if (cancelRef.current) break;
      const brand = list[i];
      setRefreshProgress({ current: i + 1, total: list.length, brand: brand.name });
      try {
        const parsed = await researchBrandData(
          brand.name,
          project.anchorName,
          brand.isAnchor,
          true,
        );
        updated = updated.map((b) => (b.id === brand.id ? { ...b, ...parsed } : b));
        touchUpdated(updated);
      } catch {
        errorCount++;
      }
      await new Promise((r) => setTimeout(r, 350));
    }

    setRefreshing(false);
    setRefreshProgress({ current: 0, total: 0, brand: '' });
    const finalProject = {
      ...projectRef.current,
      brands: updated,
      updatedAt: new Date().toISOString(),
    };
    touchUpdated(updated);
    const persisted = project.id ? await onPersist(finalProject) : true;
    if (persisted) {
      setToast(
        errorCount > 0
          ? `Refreshed with ${errorCount} error(s). Cached data kept for those brands.`
          : 'All brands refreshed successfully.',
      );
    }
  }, [brands, project.id, onPersist]);

  const refreshOne = useCallback(
    async (brandId: string) => {
      const brand = brands.find((b) => b.id === brandId);
      if (!brand) return;
      setRefreshing(true);
      setRefreshProgress({ current: 1, total: 1, brand: brand.name });
      try {
        const parsed = await researchBrandData(
          brand.name,
          project.anchorName,
          brand.isAnchor,
          true,
        );
        const updated = brands.map((b) => (b.id === brandId ? { ...b, ...parsed } : b));
        const finalProject = touchUpdated(updated);
        const persisted = project.id ? await onPersist(finalProject) : true;
        if (persisted) {
          setToast(`${brand.name} refreshed.`);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        setToast(`Could not refresh ${brand.name}: ${message}`);
      }
      setRefreshing(false);
      setRefreshProgress({ current: 0, total: 0, brand: '' });
    },
    [brands, project, onPersist],
  );

  const refreshOpportunities = useCallback(async () => {
    setRefreshingOpps(true);
    try {
      const opps = await researchOpportunities(project.anchorName, brands);
      const finalProject = touchUpdated(undefined, opps);
      const persisted = project.id ? await onPersist(finalProject) : true;
      if (persisted) {
        setToast('Opportunities regenerated.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setToast(`Could not regenerate opportunities: ${message}`);
    }
    setRefreshingOpps(false);
  }, [brands, project, onPersist]);

  const refreshCrossThemes = useCallback(async () => {
    setRefreshingThemes(true);
    try {
      const themes = await researchCrossThemes(project.anchorName, brands);
      const updatedAt = new Date().toISOString();
      const finalProject = { ...projectRef.current, crossThemes: themes, updatedAt };
      updateProject((prev) => ({
        ...prev,
        crossThemes: themes,
        updatedAt,
      }));
      const persisted = project.id ? await onPersist(finalProject) : true;
      if (persisted) {
        setToast('Cross-brand themes regenerated.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setToast(`Could not regenerate themes: ${message}`);
    }
    setRefreshingThemes(false);
  }, [brands, project, onPersist]);

  function selectBrand(id: string) {
    setSelected((prev) => (prev === id ? null : id));
    setActiveTab('overview');
  }

  const selectedBrand = brands.find((b) => b.id === selected);
  const fmtTime = project.updatedAt
    ? new Date(project.updatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const stats = [
    {
      label: 'Very high activity',
      val: brands.filter((b) => b.activity === 'very-high').length,
    },
    { label: 'High activity', val: brands.filter((b) => b.activity === 'high').length },
    { label: 'Tiers represented', val: tiers.length - 1 },
    { label: 'Competitors tracked', val: brands.length - 1 },
    {
      label: 'Avg LinkedIn scale',
      val:
        Math.round(brands.reduce((s, b) => s + (b.linkedin || 0), 0) / brands.length) + 'K',
    },
  ];

  return (
    <>
      <h1 className="sr-only">
        Competitor intelligence dashboard for {project.anchorName}
      </h1>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onBackToLibrary={onBackToLibrary}
        />
      )}

      <div className="topbar">
        <div>
          <div className="brand-mark">{project.anchorName} · Brand Intelligence</div>
          <div className="page-title">Competitor Monitor</div>
          <div className="page-sub">
            {brands.length} brands tracked
            {fmtTime ? ` · Last updated ${fmtTime}` : ''}
          </div>
          {refreshing && refreshProgress.total > 0 && (
            <div className="refresh-progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.round((refreshProgress.current / refreshProgress.total) * 100)}%`,
                  }}
                />
              </div>
              <div className="progress-label">
                {refreshProgress.current} of {refreshProgress.total} · researching{' '}
                {refreshProgress.brand}
              </div>
            </div>
          )}
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="ghost small"
            onClick={() => void handleSaveClick()}
            disabled={saving}
          >
            <i className={`ti ti-bookmark ${saving ? 'spin' : ''}`} aria-hidden="true" />
            {isSaved ? 'Update bookmark' : 'Save bookmark'}
          </button>
          <button
            type="button"
            className="ghost small"
            onClick={() => setShowSettings(true)}
          >
            <i className="ti ti-settings" aria-hidden="true" /> Settings
          </button>
          <button
            type="button"
            className="small"
            onClick={() => setView((v) => (v === 'grid' ? 'list' : 'grid'))}
          >
            <i
              className={`ti ${view === 'grid' ? 'ti-list' : 'ti-layout-grid'}`}
              aria-hidden="true"
            />
            {view === 'grid' ? 'List' : 'Grid'}
          </button>
          <button
            type="button"
            className="primary small"
            onClick={refreshAll}
            disabled={refreshing}
          >
            <i className={`ti ti-refresh ${refreshing ? 'spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Researching…' : 'Refresh all'}
          </button>
        </div>
      </div>

      <div className="anchor-banner">
        <i className="ti ti-flag-3" aria-hidden="true" />
        Tracking {project.anchorName} against {brands.length - 1} competitor
        {brands.length - 1 === 1 ? '' : 's'}
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search brands or themes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {tiers.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
          <option value="name">Sort: A–Z</option>
          <option value="activity">Sort: activity</option>
          <option value="linkedin">Sort: LinkedIn scale</option>
        </select>
        <div className="result-count">{filtered.length} shown</div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {view === 'grid' ? (
        <div className="brand-grid">
          {filtered.map((b) => (
            <BrandCard
              key={b.id}
              brand={b}
              selected={selected === b.id}
              tiers={tiers}
              onSelect={() => selectBrand(b.id)}
            />
          ))}
        </div>
      ) : (
        <div className="list-table">
          {filtered.map((b) => (
            <BrandListRow
              key={b.id}
              brand={b}
              selected={selected === b.id}
              tiers={tiers}
              onSelect={() => selectBrand(b.id)}
            />
          ))}
        </div>
      )}

      {selectedBrand && (
        <DetailPanel
          brand={selectedBrand}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setSelected(null)}
          onRefresh={() => refreshOne(selectedBrand.id)}
          refreshing={refreshing}
          tiers={tiers}
        />
      )}

      <CrossThemesSection
        crossThemes={project.crossThemes}
        onRefresh={refreshCrossThemes}
        refreshing={refreshingThemes || refreshing}
      />

      <div className="opp-section">
        <div className="opp-section-head">
          <div className="eyebrow eyebrow-flush">
            {project.anchorName} differentiation opportunities
          </div>
          <button
            type="button"
            className="small"
            onClick={refreshOpportunities}
            disabled={refreshingOpps || refreshing}
          >
            <i
              className={`ti ti-refresh ${refreshingOpps ? 'spin' : ''}`}
              aria-hidden="true"
            />
            {refreshingOpps ? 'Synthesizing…' : 'Regenerate'}
          </button>
        </div>
        {project.opportunities && project.opportunities.length > 0 ? (
          <div className="opp-grid">
            {project.opportunities.map((o, i) => (
              <div key={i} className="opp-card">
                <div className="opp-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="opp-title">{o.title}</div>
                <div className="opp-body">{o.body}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="opp-empty">
            No opportunities generated yet. Click Regenerate to synthesize differentiation ideas
            from the current brand set.
          </div>
        )}
      </div>

      <div className="footer-note">
        <span>
          Research compiled for {project.anchorName} · powered by Claude via a server-side
          proxy
        </span>
        <span>
          {isSaved
            ? `Bookmark saved${project.name ? `: ${project.name}` : ''}`
            : 'Unsaved session — save to share with the team'}
        </span>
      </div>

      {toast && <Toast text={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
