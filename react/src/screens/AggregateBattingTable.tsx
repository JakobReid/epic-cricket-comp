import { Crown } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { TeamLogo } from "./setup/TeamsPage";
import type { AggregateBatter } from "../utils/aggregateStats";

function sr(runs: number, balls: number) {
  if (balls === 0) return "—";
  return ((runs / balls) * 100).toFixed(0);
}

interface Props {
  batters: AggregateBatter[];
}

export const AggregateBattingTable = ({ batters }: Props) => {
  const t = useTheme();

  if (batters.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>
        No batting data yet.
      </div>
    );
  }

  return (
    <div style={{
      background: t.card,
      border: `${t.borderWidth}px solid ${t.border}`,
      borderRadius: t.radiusLg, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", padding: "8px 14px",
        background: t.primary,
      }}>
        <span style={{ flex: 1, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>BATTER</span>
        {["R", "B", "4s", "6s", "SR"].map(h => (
          <span key={h} style={{
            width: h === "SR" ? 48 : 32, textAlign: "right",
            fontFamily: t.font, fontSize: 10, color: "#fff",
            letterSpacing: 1.5, textTransform: "uppercase",
          }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {batters.map((b, i) => {
        const isTop = i === 0;
        return (
        <div key={b.playerId} style={{
          display: "flex", padding: "10px 14px", alignItems: "center",
          borderTop: `${t.borderWidth}px solid ${isTop ? b.teamColor : t.border}`,
          borderLeft: isTop ? `3px solid ${b.teamColor}` : undefined,
          background: isTop ? `${b.teamColor}08` : t.card,
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {isTop && <Crown size={12} color={t.accent} />}
            <TeamLogo logoKey={b.teamLogo} color={b.teamColor} size={14} />
            <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: isTop ? b.teamColor : t.text }}>{b.name}</span>
          </div>
          <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 16, fontWeight: 800, color: t.text }}>{b.runs}</span>
          <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{b.balls}</span>
          <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{b.fours}</span>
          <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{b.sixes}</span>
          <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textMuted }}>{sr(b.runs, b.balls)}</span>
        </div>
        );
      })}
    </div>
  );
};
