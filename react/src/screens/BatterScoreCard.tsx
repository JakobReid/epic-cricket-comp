import { useTheme } from "../ThemeContext";
import { TeamLogo } from "./setup/TeamsPage";
import { InningsCardHeader } from "../components/InningsCardHeader";
import { computeBatterLives } from "../utils/batterLives";
import type { InningsState } from "../store/types";

function sr(runs: number, balls: number) {
  if (balls === 0) return "—";
  return ((runs / balls) * 100).toFixed(0);
}

interface Props {
  color: string;
  innings: InningsState;
  teamHeader?: { logo: string; inningsNum?: number };
}

export const BatterScoreCard = ({ color, innings, teamHeader }: Props) => {
  const t = useTheme();

  return (
    <div style={{
      background: t.card,
      border: `${t.borderWidth}px solid ${color}`,
      borderRadius: t.radiusLg,
      overflow: "hidden",
    }}>
      {/* Optional team header band */}
      {teamHeader && (
        <InningsCardHeader
          color={color}
          logo={teamHeader.logo}
          teamName={innings.battingTeamName}
          wickets={innings.wickets}
          runs={innings.runs}
          inningsNum={teamHeader.inningsNum}
        />
      )}

      {/* Column headers */}
      <div style={{
        display: "flex", padding: "8px 14px",
        background: color,
      }}>
        <span style={{ flex: 1, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1.5, textTransform: "uppercase" }}>BATTER</span>
        {["R", "B", "4s", "6s", "SR"].map(h => (
          <span key={h} style={{
            width: h === "SR" ? 48 : 32, textAlign: "right",
            fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.7)",
            letterSpacing: 1.5, textTransform: "uppercase",
          }}>{h}</span>
        ))}
      </div>

      {/* Batter rows */}
      {innings.batters.map((b, bi) => {
        const lives = computeBatterLives(b.playerId, innings.deliveries, innings.bowlers, innings.status === "in-progress");
        const isLast = bi === innings.batters.length - 1;
        const isStriker = b.playerId === innings.strikerId;
        const isBatterNotOut = innings.status === "complete" && lives.some(l => l.dismissalStr === null);

        return (
          <div key={b.playerId} style={{ borderBottom: !isLast ? `${t.borderWidth}px solid ${t.border}` : undefined }}>
            {/* Name row */}
            <div style={{
              display: "flex", padding: "10px 14px", alignItems: "center",
              background: t.cardAlt,
              borderBottom: lives.length > 0 ? `${t.borderWidth}px solid ${t.border}` : undefined,
            }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                {isStriker && innings.status === "in-progress" && (
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: color, flexShrink: 0,
                    boxShadow: `0 0 6px ${color}88`,
                  }} />
                )}
                <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>{b.name}</span>
              </div>
              <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 16, fontWeight: 800, color: t.text }}>
                {b.runs}{isBatterNotOut ? <sup style={{ fontSize: 9, fontWeight: 800, color: t.textMuted }}>*</sup> : ""}
              </span>
              <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{b.balls}</span>
              <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{b.fours}</span>
              <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textDim }}>{b.sixes}</span>
              <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 12, color: t.textMuted }}>{sr(b.runs, b.balls)}</span>
            </div>

            {/* Per-life sub-rows */}
            {lives.map((life, li) => {
              const isNotOut = life.dismissalStr === null;
              return (
                <div key={li} style={{
                  display: "flex", padding: "7px 14px 7px 28px", alignItems: "center",
                  borderTop: li > 0 ? `${t.borderWidth}px solid ${t.border}` : undefined,
                  background: t.card,
                }}>
                  <span style={{ flex: 1, fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                    {isNotOut ? "not out" : life.dismissalStr}
                  </span>
                  <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 13, fontWeight: 700, color: t.text }}>
                    {life.runs}{innings.status === "complete" && isNotOut ? <sup style={{ fontSize: 9, fontWeight: 700, color: t.textMuted }}>*</sup> : ""}
                  </span>
                  <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 11, color: t.textMuted }}>{life.balls}</span>
                  <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 11, color: t.textMuted }}>{life.fours}</span>
                  <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 11, color: t.textMuted }}>{life.sixes}</span>
                  <span style={{ width: 48, textAlign: "right", fontFamily: t.font, fontSize: 11, color: t.textMuted }}>{sr(life.runs, life.balls)}</span>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Extras footer */}
      <div style={{ padding: "9px 14px", background: color }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: t.font, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            Extras: Wd {innings.extras.wides} · Nb {innings.extras.noBalls} · B {innings.extras.byes} · Lb {innings.extras.legByes}
          </span>
          <span style={{ fontFamily: t.font, fontSize: 11, fontWeight: 700, color: "#fff" }}>
            Total: {innings.extras.wides + innings.extras.noBalls + innings.extras.byes + innings.extras.legByes}
          </span>
        </div>
      </div>
    </div>
  );
};
