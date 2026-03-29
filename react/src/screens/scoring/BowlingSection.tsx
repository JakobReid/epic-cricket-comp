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
    <div style={{ padding: "0 12px" }}>
      <div style={{
        background: t.card,
        borderRadius: t.radiusLg,
        overflow: "hidden",
        border: `1px solid ${color}`,
      }}>
        {/* Bowling team header */}
        <div style={{ background: color, padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{
              fontFamily: t.fontDisplay, fontSize: 10, color: "rgba(255,255,255,0.7)",
              letterSpacing: 2, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <img src={ballLineal} style={{ width: 11, height: 11, filter: "brightness(0) invert(1)", opacity: 0.7 }} />
              BOWLING
            </div>
            <div style={{
              fontFamily: t.font, fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600,
            }}>
              OV {completedOvers + 1}
            </div>
          </div>
          <div style={{
            fontFamily: t.fontDisplay, fontSize: 14, fontWeight: 500, color: "#fff",
            textTransform: "uppercase", letterSpacing: 0.8,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <TeamLogo logoKey={bowlingTeamLogo} color="rgba(255,255,255,0.85)" size={14} />
            {bowlingTeamName}
          </div>
        </div>

        {/* Current bowler */}
        <div style={{
          background: t.card, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
          borderBottom: `1px solid ${t.border}`,
        }}>
          {/* Bowler dot + name + figures */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0,
                boxShadow: `0 0 6px ${color}60`,
              }} />
              <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>
                {currentBowler?.name ?? "—"}
              </span>
            </div>
            {currentBowler && (
              <div style={{
                fontFamily: t.font, fontSize: 12, color: t.textDim, marginTop: 3, marginLeft: 14,
                letterSpacing: 0.5,
              }}>
                {overs}-0-{currentBowler.runsConceded}-{currentBowler.wickets}
              </div>
            )}
          </div>
          {/* Wickets + economy */}
          {currentBowler && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, justifyContent: "flex-end" }}>
                <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: 22, color: t.text, lineHeight: 1 }}>{currentBowler.wickets}</span>
                <span style={{ fontFamily: t.font, fontSize: 12, color: t.textMuted }}>wkts</span>
              </div>
              <div style={{
                fontFamily: t.font, fontSize: 11, color: t.textMuted, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3,
              }}>
                <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>ECON</span>
                <span style={{ color: t.textDim, fontWeight: 600 }}>{econ}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bowling rotation strip */}
        <div style={{ display: "flex" }}>
          {rotation.map((bt, i) => {
            const isNow = bt.status === "now";
            const isDone = bt.status === "done";
            const teamColor = bt.team?.color ?? t.textDim;
            return (
              <div key={bt.teamId} style={{
                flex: 1, padding: "7px 6px",
                background: isNow ? `${teamColor}18` : t.bg,
                borderLeft: i > 0 ? `1px solid ${t.border}` : undefined,
                textAlign: "center",
                opacity: isDone ? 0.45 : 1,
                position: "relative",
              }}>
                {/* Active indicator bar */}
                {isNow && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                    background: teamColor,
                  }} />
                )}
                {bt.team && (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
                    <TeamLogo logoKey={bt.team.logo} color={isNow ? teamColor : isDone ? t.textMuted : teamColor} size={11} />
                  </div>
                )}
                <div style={{
                  fontFamily: t.fontSans, fontSize: 11, fontWeight: 700,
                  color: isNow ? t.text : isDone ? t.textMuted : t.textDim,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{bt.teamName}</div>
                <div style={{
                  fontFamily: t.font, fontSize: 10,
                  color: isNow ? teamColor : t.textMuted,
                  marginTop: 2, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: 0.5,
                }}>
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
