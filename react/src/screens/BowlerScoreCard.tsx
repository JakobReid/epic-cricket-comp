import { useTheme } from "../ThemeContext";
import { TeamLogo } from "./setup/TeamsPage";
import type { BowlerStats } from "../store/types";

function oversStr(legalBalls: number) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function econ(runs: number, legalBalls: number) {
  if (legalBalls === 0) return "—";
  return ((runs / legalBalls) * 6).toFixed(1);
}

export interface BowlerWithTeam extends BowlerStats {
  teamColor: string;
  teamLogo: string;
}

interface Props {
  color: string;
  bowlers: BowlerWithTeam[];
  standalone?: boolean;
}

export const BowlerScoreCard = ({ color, bowlers, standalone = false }: Props) => {
  const t = useTheme();

  const content = (
    <>
      {/* Column headers */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 14px", borderBottom: `${t.borderWidth}px solid ${color}`, background: color }}>
        <span style={{ fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>BOWLER</span>
        <div style={{ display: "flex" }}>
          {["O", "R", "W", "Econ"].map(h => (
            <span key={h} style={{ width: h === "Econ" ? 48 : 32, textAlign: "right", fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>{h}</span>
          ))}
        </div>
      </div>

      {/* Bowler rows */}
      {bowlers.length === 0 ? (
        <div style={{ padding: "12px 14px", fontFamily: t.fontSans, fontSize: 13, color: t.textMuted }}>No bowlers yet</div>
      ) : bowlers.map((b, bi) => (
        <div key={b.playerId} style={{
          display: "flex", justifyContent: "space-between", padding: "9px 14px", alignItems: "center",
          background: t.card,
          borderTop: bi > 0 ? `${t.borderWidth}px solid ${color}44` : undefined,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
            <TeamLogo logoKey={b.teamLogo} color={b.teamColor} size={13} />
            <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: t.text }}>{b.name}</span>
          </div>
          <div style={{ display: "flex", flexShrink: 0 }}>
            <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.text }}>{oversStr(b.legalBalls)}</span>
            <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 14, fontWeight: 700, color: t.text }}>{b.runsConceded}</span>
            <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 14, fontWeight: 700, color: b.wickets > 0 ? t.danger : t.text }}>{b.wickets}</span>
            <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.text }}>{econ(b.runsConceded, b.legalBalls)}</span>
          </div>
        </div>
      ))}
    </>
  );

  if (standalone) {
    return (
      <div style={{ background: t.card, border: `${t.borderWidth}px solid ${color}`, borderRadius: t.radiusLg, overflow: "hidden" }}>
        {content}
      </div>
    );
  }

  return <div style={{ overflow: "hidden" }}>{content}</div>;
};
