import { TONE_COLORS } from "../constants/tone";
import { btnPillAccentSmall, btnTab, btnTabActive, cn } from "../lib/ui";
import type { Brand } from "../types/domain";
import { TierBadge } from "./shared/TierBadge";

type DetailTab = "overview" | "content" | "differentiation";

interface DetailPanelProps {
  brand: Brand;
  activeTab: DetailTab;
  setActiveTab: (tab: DetailTab) => void;
  onRefresh: () => void;
  refreshing: boolean;
  tiers: string[];
}

export function DetailPanel({
  brand,
  activeTab,
  setActiveTab,
  onRefresh,
  refreshing,
  tiers,
}: DetailPanelProps) {
  const toneColor = TONE_COLORS[brand.tone] ?? "var(--color-text-2)";

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-bg-card">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5.5 py-4.5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <span className="font-serif text-xl font-semibold">
              {brand.name}
            </span>
            <TierBadge tier={brand.tier} tiers={tiers} />
          </div>
          <div className="font-serif text-sm italic text-text-2">
            {brand.tagline}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className={btnPillAccentSmall}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <i
              className={cn("ti ti-refresh", refreshing && "animate-spin")}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-0 border-b border-border px-5.5">
        {(["overview", "content", "differentiation"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? btnTabActive : btnTab}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-5.5">
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-7 max-md:grid-cols-1">
            <div>
              <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
                Key message
              </div>
              <div className="text-sm leading-relaxed text-text-1">
                {brand.keyMessage}
              </div>
              <div className="mt-4.5">
                <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
                  Themes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(brand.themes || []).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-bg-raised px-2.5 py-1 text-xs leading-snug font-medium text-text-2"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
                Recent activity
              </div>
              <div className="text-sm leading-relaxed text-text-2">
                {brand.notable}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  {
                    label: "LinkedIn",
                    val: `${brand.linkedin || 0}K`,
                    icon: "ti-brand-linkedin",
                  },
                  {
                    label: "Instagram",
                    val: `${brand.instagram || 0}K`,
                    icon: "ti-brand-instagram",
                  },
                  {
                    label: "Activity",
                    val: brand.activity,
                    icon: "ti-activity",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg bg-bg-raised px-3.5 py-3"
                  >
                    <div className="mb-1.5 flex items-center gap-1 text-xs text-text-3">
                      <i className={`ti ${m.icon}`} aria-hidden="true" />{" "}
                      {m.label}
                    </div>
                    <div className="font-serif text-lg font-semibold">
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="grid grid-cols-2 gap-7 max-md:grid-cols-1">
            <div>
              <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
                Content formats
              </div>
              {(brand.formats || []).map((f) => (
                <div
                  key={f}
                  className="flex items-start gap-2 border-b border-border py-2 text-sm last:border-b-0"
                >
                  <i
                    className="ti ti-file-text mt-0.5 text-text-3"
                    aria-hidden="true"
                  />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
                Tone of voice
              </div>
              <div className="mb-4.5 inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: toneColor }}
                />
                <span style={{ fontWeight: 600, color: toneColor }}>
                  {brand.tone}
                </span>
              </div>
              <div className="mt-3.5 mb-2 text-xs tracking-widest uppercase text-text-3">
                Channel scale
              </div>
              {[
                { name: "LinkedIn", val: brand.linkedin || 0, max: 30000 },
                { name: "Instagram", val: brand.instagram || 0, max: 250 },
                { name: "YouTube", val: brand.youtube || 0, max: 200 },
              ].map((ch) => (
                <div key={ch.name} className="mb-3">
                  <div className="mb-1.5 flex justify-between text-xs text-text-2">
                    <span>{ch.name}</span>
                    <span>{ch.val}K</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-raised">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min(100, Math.round((ch.val / ch.max) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "differentiation" && (
          <div>
            <div className="mb-2 text-xs tracking-widest uppercase text-text-3">
              {brand.isAnchor
                ? "What sets you apart"
                : "What makes them distinct vs your brand"}
            </div>
            <div
              className={cn(
                "mb-4.5 rounded-lg border-l-4 border-l-accent bg-bg-raised px-5 py-4 text-sm leading-relaxed",
                !brand.differentiator && "text-text-3 italic",
              )}
            >
              {brand.differentiator || "No differentiation summary yet."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
