import { useRef, useState } from "react";
import {
  fallbackBrandData,
  researchBrandData,
  researchCrossThemes,
  researchOpportunities,
} from "../lib/research";
import { btnPillAccentSmall, cn, fieldBase, textareaBase } from "../lib/ui";
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
    <div className="flex min-h-screen w-full max-w-content flex-col pt-9 pb-16">
      {onBack && <BackLink label="Back to library" onClick={handleBack} />}
      <div className="flex flex-col justify-start">
        <div className="mb-3.5 font-serif text-xs tracking-widest uppercase text-accent">
          Competitor intelligence monitor
        </div>
        <div className="mb-3 font-serif text-4xl leading-tight font-semibold">
          Build a brand intelligence dashboard
        </div>
        <div className="mb-9 max-w-lg text-sm leading-relaxed text-text-2">
          Enter your brand and the competitors you want to track. Claude will
          research each one&apos;s positioning, content themes, tone, and
          channel scale, then generate a live dashboard you can keep refreshing.
        </div>

        {!building && (
          <>
            <div className="mb-5.5">
              <label
                className="mb-1.5 block text-xs font-semibold text-text-1"
                htmlFor="anchor-brand"
              >
                Your brand
              </label>
              <input
                id="anchor-brand"
                type="text"
                className={cn(fieldBase, "w-full")}
                placeholder="e.g. UST, Acme Corp, Northwind…"
                value={anchor}
                onChange={(e) => setAnchor(e.target.value)}
              />
            </div>

            <div className="mb-5.5">
              <label
                className="mb-1.5 block text-xs font-semibold text-text-1"
                htmlFor="competitors"
              >
                Competitors
              </label>
              <textarea
                id="competitors"
                className={cn(textareaBase, "w-full")}
                placeholder={
                  "One per line or comma-separated, e.g.\nAccenture\nInfosys\nCognizant"
                }
                value={competitorsRaw}
                onChange={(e) => setCompetitorsRaw(e.target.value)}
                rows={6}
              />
              <div className="mt-1.5 text-xs leading-normal text-text-3">
                {competitorsDeduped.length > 0
                  ? `${competitorsDeduped.length} competitor${competitorsDeduped.length === 1 ? "" : "s"} detected: ${competitorsDeduped.slice(0, 6).join(", ")}${competitorsDeduped.length > 6 ? "…" : ""}`
                  : "Separate names with commas or new lines. Up to 30 competitors."}
              </div>
            </div>

            {error && <div className="mt-2 text-xs text-red">{error}</div>}

            <div className="mt-2 flex items-center gap-2.5">
              <button
                type="button"
                className={btnPillAccentSmall}
                onClick={handleBuild}
              >
                <i className="ti ti-sparkles" aria-hidden="true" />
                Build dashboard
              </button>
              <span className="text-xs text-text-3">
                {brandCount} brand{brandCount === 1 ? "" : "s"} to research
              </span>
            </div>
          </>
        )}

        {building && (
          <div className="mt-7">
            <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
              Researching brands
            </div>
            <div className="mt-3.5 h-0.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1.5 text-xs text-text-3">
              {buildProgress.current} of {buildProgress.total}
            </div>
            <div className="mt-3.5 max-h-56 overflow-y-auto rounded-lg border border-border bg-bg-card px-3.5 py-2.5">
              {buildLog.map((row) => (
                <div
                  key={row.text}
                  className={cn(
                    "py-1 font-mono text-xs text-text-2",
                    row.status === "ok" && "text-accent",
                    row.status === "err" && "text-red",
                  )}
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
