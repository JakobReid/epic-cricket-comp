import { Crown } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { Badge } from "../components/Shared";
import { TeamLogo } from "./setup/TeamsPage";
import type { AggregateCatcher } from "../utils/aggregateStats";

interface Props {
  catches: AggregateCatcher[];
  catchBonus: number;
  color?: string;
  standalone?: boolean;
}

export const FieldingTable = ({ catches, catchBonus, color, standalone = true }: Props) => {
  const t = useTheme();
  const headerBg = color ?? t.primary;
  const headerText = color ? "rgba(255,255,255,0.7)" : t.headerText;
  const borderColor = color ?? t.headerBg;

  if (catches.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>
        No catches taken yet.
      </div>
    );
  }

  const content = (
    <>
      {/* Header */}
      <div style={{
        display: "flex", padding: "8px 14px",
        background: headerBg,
      }}>
        <span style={{ flex: 1, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>FIELDER</span>
        <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase" }}>C</span>
        {catchBonus > 0 && (
          <span style={{ width: 56, textAlign: "right", fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase" }}>PTS</span>
        )}
      </div>

      {/* Rows */}
      {catches.map((c, i) => {
        const isTop = i === 0;
        return (
        <div key={c.playerId} style={{
          display: "flex", padding: "10px 14px", alignItems: "center",
          borderTop: `${t.borderWidth}px solid ${isTop ? c.teamColor : t.border}`,
          borderLeft: isTop ? `3px solid ${c.teamColor}` : undefined,
          background: isTop ? `${c.teamColor}08` : t.card,
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {isTop && <Crown size={12} color={t.accent} />}
            <TeamLogo logoKey={c.teamLogo} color={c.teamColor} size={14} />
            <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: isTop ? c.teamColor : t.text }}>{c.name}</span>
            <span style={{ fontFamily: t.fontSans, fontSize: 11, color: t.textMuted }}>{c.teamName}</span>
          </div>
          <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 16, fontWeight: 800, color: t.text }}>{c.catches}</span>
          {catchBonus > 0 && (
            <span style={{ width: 56, textAlign: "right" }}>
              <Badge color={t.secondary}>+{c.catches * catchBonus}</Badge>
            </span>
          )}
        </div>
        );
      })}
    </>
  );

  if (standalone) {
    return (
      <div style={{
        background: t.card,
        border: color ? `2px solid ${borderColor}` : `${t.borderWidth}px solid ${t.border}`,
        borderRadius: t.radiusLg, overflow: "hidden",
      }}>
        {content}
      </div>
    );
  }

  return <div style={{ overflow: "hidden" }}>{content}</div>;
};
