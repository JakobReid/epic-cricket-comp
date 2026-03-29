import { useTheme } from "../../ThemeContext";
import { TeamLogo } from "../setup/TeamsPage";
import ballLineal from "../../assets/criquet-icons/ball-lineal.png";
import type { BowlerStats, BowlingTurn, Team } from "../../store/types";

interface Props {
  bowlingTeamColor: string;
  bowlingTeamLogo: string;
  bowlingTeamName: string;
  currentBowler: BowlerStats | null;
  bowlingOrder: BowlingTurn[];
  completedOvers: number;
  teams: Team[];
}

export const BowlingSection = ({
  bowlingTeamColor, bowlingTeamLogo, bowlingTeamName,
  currentBowler, bowlingOrder, completedOvers, teams,
}: Props) => {
  const t = useTheme();
  const color = bowlingTeamColor;

  // Determine rotation status for each bowling team
  const currentOv = completedOvers + 1; // 1-indexed current over being bowled
  const rotation = bowlingOrder.map(bt => {
    const team = teams.find(tm => tm.id === bt.teamId);
    let status: "done" | "now" | "next";
    if (bt.toOver < currentOv) status = "done";
    else if (bt.fromOver <= currentOv && bt.toOver >= currentOv) status = "now";
    else status = "next";
    return { ...bt, status, team };
  });

  const overs = currentBowler ? `${Math.floor(currentBowler.legalBalls / 6)}.${currentBowler.legalBalls % 6}` : "0.0";
  const econ = currentBowler && currentBowler.legalBalls > 0
    ? ((currentBowler.runsConceded / currentBowler.legalBalls) * 6).toFixed(1)
    : "—";

  return (
    <div>
      <div style={{
        borderLeft: `${t.borderWidth}px solid ${color}`,
        borderRight: `${t.borderWidth}px solid ${color}`,
        borderBottom: `${t.borderWidth}px solid ${color}`,
        overflow: "hidden",
      }}>
        {/* Bowling team header */}
        <div style={{ background: color, padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: t.font, letterSpacing: 1.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
              <img src={ballLineal} style={{ width: 12, height: 12, filter: "brightness(0) invert(1)", opacity: 0.7 }} /> Bowling
            </div>
            <div style={{ fontFamily: t.font, fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
              Ov {completedOvers + 1}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#fff", fontFamily: t.fontSans, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
            <TeamLogo logoKey={bowlingTeamLogo} color="rgba(255,255,255,0.85)" size={13} />
            {bowlingTeamName}
          </div>
        </div>

        {/* Current bowler */}
        <div style={{
          background: t.card, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8,
          borderTop: `${t.borderWidth}px solid ${color}`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>
                {currentBowler?.name ?? "—"}
              </span>
            </div>
            {currentBowler && (
              <div style={{ fontFamily: t.font, fontSize: 12, color: t.textMuted, marginTop: 1, marginLeft: 16 }}>
                {overs}-0-{currentBowler.runsConceded}-{currentBowler.wickets}
              </div>
            )}
          </div>
          {currentBowler && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div>
                <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: 20, color: t.text }}>{currentBowler.wickets}</span>
                <span style={{ fontFamily: t.font, fontSize: 13, color: t.text }}> wkts</span>
              </div>
              <div style={{ fontFamily: t.font, fontSize: 12, color: t.textMuted, marginTop: 1 }}>Econ {econ}</div>
            </div>
          )}
        </div>

        {/* Bowling rotation strip */}
        <div style={{ display: "flex", borderTop: `${t.borderWidth}px solid ${color}` }}>
          {rotation.map((bt, i) => {
            const isNow = bt.status === "now";
            const isDone = bt.status === "done";
            const teamColor = bt.team?.color ?? t.textDim;
            return (
              <div key={bt.teamId} style={{
                flex: 1, padding: "8px 6px",
                background: isNow ? color : t.bg,
                borderLeft: i > 0 ? `${t.borderWidth}px solid ${color}` : undefined,
                textAlign: "center", opacity: isDone ? 0.6 : 1,
              }}>
                {bt.team && (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
                    <TeamLogo logoKey={bt.team.logo} color={isNow ? "rgba(255,255,255,0.85)" : teamColor} size={12} />
                  </div>
                )}
                <div style={{
                  fontFamily: t.fontSans, fontSize: 12, fontWeight: 700,
                  color: isNow ? "#fff" : t.textDim,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{bt.teamName}</div>
                <div style={{ fontFamily: t.font, fontSize: 11, color: isNow ? "rgba(255,255,255,0.7)" : t.textMuted, marginTop: 2, fontWeight: 600 }}>
                  {isNow ? "bowling" : isDone ? "done" : `ov ${bt.fromOver}–${bt.toOver}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
