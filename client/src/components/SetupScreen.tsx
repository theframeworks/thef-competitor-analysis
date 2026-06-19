import { useRef, useState } from "react";
import {
  fallbackBrandData,
  researchBrandData,
  researchCrossThemes,
  researchOpportunities,
} from "../lib/research";
import { brandId, parseCompetitorList, slugify } from "../lib/utils";
import type { BuildLogRow, Project } from "../types/domain";
import { BackLink } from "./shared/BackLink";

interface SetupScreenProps {
  onStart: (project: Project) => void;
  onBack?: () => void;
}

export function SetupScreen({ onStart, onBack }: SetupScreenProps) {
  const [anchor, setAnchor] = useState("");
  const [competitorsRaw, setCompetitorsRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState({ current: 0, total: 0 });
  const [buildLog, setBuildLog] = useState<BuildLogRow[]>([]);
  const cancelRef = useRef(false);

  const competitors = parseCompetitorList(competitorsRaw);

  async function handleBuild() {
    setError(null);
    if (!anchor.trim()) {
      setError("Enter your brand name.");
      return;
    }
    if (competitors.length === 0) {
      setError("Enter at least one competitor.");
      return;
    }
    const anchorTrimmed = anchor.trim();
    const competitorsDeduped = competitors.filter(
      (name) => name.toLowerCase() !== anchorTrimmed.toLowerCase(),
    );
    if (competitorsDeduped.length === 0) {
      setError("Enter at least one competitor other than your brand.");
      return;
    }
    if (competitorsDeduped.length > 30) {
      setError("Please limit to 30 competitors at a time.");
      return;
    }

    setBuilding(true);
    cancelRef.current = false;
    setBuildLog([]);

    const allNames = [anchorTrimmed, ...competitorsDeduped];
    setBuildProgress({ current: 0, total: allNames.length + 2 });
    const brands: Project["brands"] = [];

    for (let i = 0; i < allNames.length; i++) {
      if (cancelRef.current) {
        setBuilding(false);
        return;
      }
      const name = allNames[i];
      const isAnchor = i === 0;
      setBuildLog((l) => [
        ...l,
        { text: `Researching ${name}…`, status: "pending" },
      ]);
      try {
        const parsed = await researchBrandData(name, anchorTrimmed, isAnchor);
        const existingIds = brands.map((b) => b.id);
        brands.push({
          id: brandId(name, i, existingIds),
          name,
          isAnchor,
          ...parsed,
        });
        setBuildLog((l) =>
          l.map((row, idx) =>
            idx === l.length - 1
              ? { text: `${name} researched`, status: "ok" }
              : row,
          ),
        );
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        brands.push({
          id: `${slugify(name)}-${i}`,
          name,
          isAnchor,
          ...fallbackBrandData(),
        });
        setBuildLog((l) =>
          l.map((row, idx) =>
            idx === l.length - 1
              ? { text: `${name} — failed (${message})`, status: "err" }
              : row,
          ),
        );
      }
      setBuildProgress({ current: i + 1, total: allNames.length + 2 });
      await new Promise((r) => setTimeout(r, 300));
    }

    if (cancelRef.current) {
      setBuilding(false);
      return;
    }

    let opportunities: Project["opportunities"] = [];
    setBuildLog((l) => [
      ...l,
      {
        text: "Synthesizing differentiation opportunities…",
        status: "pending",
      },
    ]);
    try {
      opportunities = await researchOpportunities(anchorTrimmed, brands);
      setBuildLog((l) =>
        l.map((row, idx) =>
          idx === l.length - 1
            ? { text: "Opportunities synthesized", status: "ok" }
            : row,
        ),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setBuildLog((l) =>
        l.map((row, idx) =>
          idx === l.length - 1
            ? {
                text: `Opportunity synthesis failed (${message})`,
                status: "err",
              }
            : row,
        ),
      );
    }
    setBuildProgress({
      current: allNames.length + 1,
      total: allNames.length + 2,
    });

    if (cancelRef.current) {
      setBuilding(false);
      return;
    }

    let crossThemes: Project["crossThemes"] = null;
    setBuildLog((l) => [
      ...l,
      { text: "Identifying cross-brand themes…", status: "pending" },
    ]);
    try {
      crossThemes = await researchCrossThemes(anchorTrimmed, brands);
      setBuildLog((l) =>
        l.map((row, idx) =>
          idx === l.length - 1
            ? { text: "Cross-brand themes identified", status: "ok" }
            : row,
        ),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setBuildLog((l) =>
        l.map((row, idx) =>
          idx === l.length - 1
            ? {
                text: `Cross-brand theme analysis failed (${message})`,
                status: "err",
              }
            : row,
        ),
      );
    }
    setBuildProgress({
      current: allNames.length + 2,
      total: allNames.length + 2,
    });

    if (cancelRef.current) {
      setBuilding(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 400));

    if (cancelRef.current) {
      setBuilding(false);
      return;
    }

    setBuilding(false);
    onStart({
      anchorName: anchorTrimmed,
      brands,
      opportunities,
      crossThemes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  function handleBack() {
    if (building) {
      cancelRef.current = true;
    }
    onBack?.();
  }

  const anchorTrimmed = anchor.trim();
  const competitorsDeduped = competitors.filter(
    (name) =>
      !anchorTrimmed || name.toLowerCase() !== anchorTrimmed.toLowerCase(),
  );
  const brandCount = competitorsDeduped.length + (anchorTrimmed ? 1 : 0);
  const progressPct = buildProgress.total
    ? Math.round((buildProgress.current / buildProgress.total) * 100)
    : 0;

  return (
    <div className="setup-wrap">
      {onBack && <BackLink label="Back to library" onClick={handleBack} />}
      <div className="setup-main">
        <div className="setup-eyebrow">Competitor intelligence monitor</div>
        <div className="setup-title">Build a brand intelligence dashboard</div>
        <div className="setup-sub">
          Enter your brand and the competitors you want to track. Claude will
          research each one&apos;s positioning, content themes, tone, and
          channel scale, then generate a live dashboard you can keep refreshing.
        </div>

        {!building && (
          <>
            <div className="setup-field">
              <label className="setup-label" htmlFor="anchor-brand">
                Your brand
              </label>
              <input
                id="anchor-brand"
                type="text"
                placeholder="e.g. UST, Acme Corp, Northwind…"
                value={anchor}
                onChange={(e) => setAnchor(e.target.value)}
              />
            </div>

            <div className="setup-field">
              <label className="setup-label" htmlFor="competitors">
                Competitors
              </label>
              <textarea
                id="competitors"
                placeholder={
                  "One per line or comma-separated, e.g.\nAccenture\nInfosys\nCognizant"
                }
                value={competitorsRaw}
                onChange={(e) => setCompetitorsRaw(e.target.value)}
                rows={6}
              />
              <div className="setup-hint">
                {competitorsDeduped.length > 0
                  ? `${competitorsDeduped.length} competitor${competitorsDeduped.length === 1 ? "" : "s"} detected: ${competitorsDeduped.slice(0, 6).join(", ")}${competitorsDeduped.length > 6 ? "…" : ""}`
                  : "Separate names with commas or new lines. Up to 30 competitors."}
              </div>
            </div>

            {error && <div className="setup-error">{error}</div>}

            <div className="setup-actions">
              <button
                type="button"
                className="pill pill-accent small"
                onClick={handleBuild}
              >
                <i className="ti ti-sparkles" aria-hidden="true" />
                Build dashboard
              </button>
              <span className="setup-count">
                {brandCount} brand{brandCount === 1 ? "" : "s"} to research
              </span>
            </div>
          </>
        )}

        {building && (
          <div className="build-progress">
            <div className="eyebrow">Researching brands</div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="progress-label">
              {buildProgress.current} of {buildProgress.total}
            </div>
            <div className="build-log">
              {buildLog.map((row) => (
                <div
                  key={row.text}
                  className={`build-log-row ${row.status === "ok" ? "ok" : row.status === "err" ? "err" : ""}`}
                >
                  {row.status === "ok"
                    ? "✓ "
                    : row.status === "err"
                      ? "✗ "
                      : "… "}
                  {row.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
