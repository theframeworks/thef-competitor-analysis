import { TONE_COLORS } from "../constants/tone";
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
    <div className="detail-panel">
      <div className="detail-head">
        <div>
          <div className="detail-title-row">
            <span className="detail-name">{brand.name}</span>
            {brand.isAnchor && <span className="anchor-pip">YOU</span>}
            <TierBadge tier={brand.tier} tiers={tiers} />
          </div>
          <div className="detail-tagline">{brand.tagline}</div>
        </div>
        <div className="detail-actions">
          <button
            type="button"
            className="pill pill-accent small"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <i
              className={`ti ti-refresh ${refreshing ? "spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="tab-row">
        {(["overview", "content", "differentiation"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-body">
        {activeTab === "overview" && (
          <div className="two-col">
            <div>
              <div className="eyebrow">Key message</div>
              <div className="body-text body-text-emphasis">
                {brand.keyMessage}
              </div>
              <div className="detail-themes">
                <div className="eyebrow">Themes</div>
                <div className="theme-pills">
                  {(brand.themes || []).map((t) => (
                    <span key={t} className="theme-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="eyebrow">Recent activity</div>
              <div className="body-text">{brand.notable}</div>
              <div className="metric-grid">
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
                  <div key={m.label} className="metric-box">
                    <div className="metric-box-label">
                      <i className={`ti ${m.icon}`} aria-hidden="true" />{" "}
                      {m.label}
                    </div>
                    <div className="metric-box-val">{m.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="two-col">
            <div>
              <div className="eyebrow">Content formats</div>
              {(brand.formats || []).map((f) => (
                <div key={f} className="format-row">
                  <i
                    className="ti ti-file-text format-icon"
                    aria-hidden="true"
                  />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="eyebrow">Tone of voice</div>
              <div className="tone-chip">
                <span className="tone-dot" style={{ background: toneColor }} />
                <span style={{ fontWeight: 600, color: toneColor }}>
                  {brand.tone}
                </span>
              </div>
              <div className="eyebrow channel-scale-label">Channel scale</div>
              {[
                { name: "LinkedIn", val: brand.linkedin || 0, max: 30000 },
                { name: "Instagram", val: brand.instagram || 0, max: 250 },
                { name: "YouTube", val: brand.youtube || 0, max: 200 },
              ].map((ch) => (
                <div key={ch.name} className="channel-bar-row">
                  <div className="channel-bar-head">
                    <span>{ch.name}</span>
                    <span>{ch.val}K</span>
                  </div>
                  <div className="channel-bar-track">
                    <div
                      className="channel-bar-fill"
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
            <div className="eyebrow">
              {brand.isAnchor
                ? "What sets you apart"
                : "What makes them distinct vs your brand"}
            </div>
            <div
              className={`diff-block ${!brand.differentiator ? "empty" : ""}`}
            >
              {brand.differentiator || "No differentiation summary yet."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
