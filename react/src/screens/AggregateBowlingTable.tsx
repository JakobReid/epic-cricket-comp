import { Crown } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { TeamLogo } from "./setup/TeamsPage";
import type { AggregateBowler } from "../utils/aggregateStats";

function oversStr(legalBalls: number) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function econ(runs: number, legalBalls: number) {
  if (legalBalls === 0) return "—";
  return ((runs / legalBalls) * 6).toFixed(1);
}

interface Props {
  bowlers: AggregateBowler[];
}

export const AggregateBowlingTable = ({ bowlers }: Props) => {
  const t = useTheme();

  if (bowlers.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>
        No bowling data yet.
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
        display: "flex", justifyContent: "space-between", padding: "8px 14px",
        background: t.primary,
      }}>
        <span style={{ fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>BOWLER</span>
        <div style={{ display: "flex" }}>
          {["O", "R", "W", "Econ"].map(h => (
            <span key={h} style={{
              width: h === "Econ" ? 48 : 32, textAlign: "right",
              fontFamily: t.font, fontSize: 10, color: "#fff",
              letterSpacing: 1.5, textTransform: "uppercase",
            }}>{h}</span>
          ))}
        </div>
      </div>

      {/* Rows */}
      {bowlers.map((b, i) => {
        const isTop = i === 0;
        return (<div key={b.playerId} style={{
          display: "flex", justifyContent: "space-between", padding: "10px 14px", alignItems: "center",
          borderTop: `${t.borderWidth}px solid ${isTop ? b.teamColor : t.border}`,
          borderLeft: isTop ? `3px solid ${b.teamColor}` : undefined,
          background: isTop ? `${b.teamColor}08` : t.card,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            {isTop && <Crown size={12} color={t.accent} />}
            <TeamLogo logoKey={b.teamLogo} color={b.teamColor} size={14} />
            <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: isTop ? b.teamColor : t.text }}>{b.name}</span>
          </div>
          <div style={{ display: "flex", flexShrink: 0 }}>
            <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{oversStr(b.legalBalls)}</span>
            <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 14, fontWeight: 700, color: t.text }}>{b.runsConceded}</span>
            <span style={{
              width: 32, textAlign: "right", fontFamily: t.font, fontSize: 14, fontWeight: 800,
              color: b.wickets > 0 ? t.danger : t.textDim,
            }}>{b.wickets}</span>
            <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textMuted }}>{econ(b.runsConceded, b.legalBalls)}</span>
          </div>
        </div>
        );
      })}
    </div>
  );
};
