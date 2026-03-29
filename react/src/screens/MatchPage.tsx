import { useState } from "react";
import { ChevronLeft, Radio } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useMatchStore } from "../store/matchStore";
import { LiveScoring } from "./scoring/LiveScoring";
import { Scorecard } from "./Scorecard";
import { MatchConfig } from "./MatchConfig";
import { TeamLogo } from "./setup/TeamsPage";

type MatchView = "live" | "scorecard" | "config";

export function MatchPage({ matchId, onBack }: { matchId: string; onBack: () => void }) {
  const t = useTheme();
  const { matches, endMatch } = useMatchStore();
  const match = matches.find(m => m.id === matchId);
  const isCompleted = match?.status === "completed";
  const [view, setView] = useState<MatchView>(isCompleted ? "scorecard" : "live");

  if (!match) return (
    <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>
      Match not found.
    </div>
  );

  const innings = match.innings[match.currentInningsIndex];
  const battingTeam = innings ? match.teams.find(tm => tm.id === innings.battingTeamId) : null;
  const bowlingTeam = innings ? match.teams.find(tm => tm.id === innings.currentBowlingTeamId) : null;
  const color = battingTeam?.color ?? t.primary;
  const bowlingColor = bowlingTeam?.color ?? t.secondary;
  const isLive = match.status === "live" && innings?.status === "in-progress";

  const bowlingTeamStats = innings
    ? Object.values(innings.bowlers)
        .filter(b => b.teamId === innings.currentBowlingTeamId)
        .reduce((acc, b) => ({ runs: acc.runs + b.runsConceded, wickets: acc.wickets + b.wickets }), { runs: 0, wickets: 0 })
    : null;

  const bowlingTurn = innings ? innings.bowlingOrder.find(bt =>
    bt.teamId === innings.currentBowlingTeamId &&
    (innings.completedOvers + 1) >= bt.fromOver &&
    (innings.completedOvers + 1) <= bt.toOver
  ) : null;
  const bowlerCompletedOvers = bowlingTurn ? innings!.completedOvers - (bowlingTurn.fromOver - 1) : 0;
  const bowlerTotalOvers = bowlingTurn ? bowlingTurn.toOver - bowlingTurn.fromOver + 1 : 0;
  const nextBattingInnings = match.innings[match.currentInningsIndex + 1] ?? null;
  const leadingInnings = match.innings
    .filter(i => i.status === "complete")
    .sort((a, b) => b.runs - a.runs)[0] ?? null;
  const leadingTeam = leadingInnings ? match.teams.find(tm => tm.id === leadingInnings.battingTeamId) ?? null : null;
  const nextBowlingTurn = bowlingTurn && innings
    ? innings.bowlingOrder.find(bt => bt.fromOver > bowlingTurn.toOver)
    : null;

  const handleEndMatch = () => {
    if (window.confirm("End this match early and view results?")) {
      endMatch(matchId);
      setView("scorecard");
    }
  };

  const iconBtn: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer", padding: 0,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };

  return (
    <div>

      {isLive && view === "live" && (
        <div style={{ background: t.bg, padding: "8px 14px 0 2px", display: "flex", alignItems: "center" }}>
          {/* Left: Exit button */}
          <button onClick={onBack} style={{ ...iconBtn, padding: "12px 8px", gap: 5, flexShrink: 0 }}>
            <ChevronLeft size={18} strokeWidth={2} color={t.textMuted} />
            <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 700, color: t.textMuted }}>Exit</span>
          </button>

          {/* Center: single row — status · format · leading · next up */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 0", flexWrap: "wrap" }}>
            {/* Status */}
            <span style={{
              fontFamily: t.fontSans, fontSize: 12, fontWeight: 800,
              color: "#fff", background: "rgba(210,20,20,0.85)",
              borderRadius: 4, padding: "3px 8px 3px 6px", letterSpacing: 1.2,
              textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5,
            }}>
              <Radio size={11} color="#fff" />
              Live
            </span>
            {/* Format */}
            <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text, whiteSpace: "nowrap" }}>
              {match.format.name}
            </span>
            {/* Leading */}
            {leadingInnings && leadingTeam && (
              <>
                <span style={{ color: t.border, fontSize: 14, lineHeight: 1, borderLeft: `1.5px solid ${t.border}`, height: 14, display: "inline-block" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: t.font, fontSize: 10, color: t.textMuted, whiteSpace: "nowrap", letterSpacing: 1 }}>LEADING:</span>
                  <TeamLogo logoKey={leadingTeam.logo ?? "shield"} color={leadingTeam.color ?? t.textMuted} size={13} />
                  <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text, whiteSpace: "nowrap" }}>{leadingTeam.name}</span>
                  <span style={{ fontFamily: t.font, fontSize: 15, fontWeight: 800, color: leadingTeam.color ?? t.text, whiteSpace: "nowrap" }}>{leadingInnings.wickets}/{leadingInnings.runs}</span>
                </div>
              </>
            )}
            {/* Next up */}
            {(nextBattingInnings || nextBowlingTurn) && (
              <>
                <span style={{ color: t.border, fontSize: 14, lineHeight: 1, borderLeft: `1.5px solid ${t.border}`, height: 14, display: "inline-block" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                  {nextBattingInnings && (() => {
                    const nextBattingTeam = match.teams.find(tm => tm.id === nextBattingInnings.battingTeamId);
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: t.font, fontSize: 10, color: t.textMuted, whiteSpace: "nowrap" }}>NEXT BAT:</span>
                        <TeamLogo logoKey={nextBattingTeam?.logo ?? "shield"} color={nextBattingTeam?.color ?? t.textMuted} size={11} />
                        <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 600, color: t.text, whiteSpace: "nowrap" }}>{nextBattingInnings.battingTeamName}</span>
                      </div>
                    );
                  })()}
                  {nextBowlingTurn && (() => {
                    const nextBowlingTeam = match.teams.find(tm => tm.id === nextBowlingTurn.teamId);
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: t.font, fontSize: 10, color: t.textMuted, whiteSpace: "nowrap" }}>NEXT BOWL:</span>
                        <TeamLogo logoKey={nextBowlingTeam?.logo ?? "shield"} color={nextBowlingTeam?.color ?? t.textMuted} size={11} />
                        <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 600, color: t.text, whiteSpace: "nowrap" }}>{nextBowlingTurn.teamName}</span>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Right spacer to balance exit button */}
          <div style={{ width: 68, flexShrink: 0 }} />
        </div>
      )}

      {view === "config" && (
        <div style={{
          background: t.bg, borderBottom: `${t.borderWidth}px solid ${t.border}`,
          padding: "0 14px 0 2px", display: "flex", alignItems: "center", gap: 6,
        }}>
          <button onClick={() => setView("live")} style={{ ...iconBtn, padding: "12px 8px" }}>
            <ChevronLeft size={18} color={t.textMuted} strokeWidth={2} />
          </button>
          <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>Match Settings</span>
        </div>
      )}

      {isLive && view === "scorecard" && (
        // Broadcast-style summary header — back goes to live
        <div style={{ display: "flex" }}>
          {/* Batting side */}
          <div style={{ flex: 1, background: color, display: "flex", alignItems: "center", padding: "12px 12px 12px 2px", gap: 8 }}>
            <button onClick={() => setView("live")} style={{ ...iconBtn, padding: "4px 4px 4px 8px", gap: 8, flexShrink: 0 }}>
              <ChevronLeft size={20} color="rgba(255,255,255,0.85)" strokeWidth={2} />
              <span style={{
                fontFamily: t.fontSans, fontSize: 10, fontWeight: 800,
                color: "#fff", background: "rgba(210,20,20,0.85)",
                border: "1.5px solid rgba(255,255,255,0.6)",
                borderRadius: 4, padding: "3px 7px 3px 5px", letterSpacing: 1.2,
                textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4,
              }}>
                <Radio size={9} color="#fff" />
                Live
              </span>
              <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                {match.format.name}
              </span>
            </button>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {innings.battingTeamName}
                </span>
                <TeamLogo logoKey={battingTeam?.logo ?? "shield"} color="rgba(255,255,255,0.9)" size={15} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  {innings.wickets}/{innings.runs}
                </span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>·</span>
                <span style={{ fontFamily: t.font, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  {innings.completedOvers}.{innings.ballsInCurrentOver}/{match.format.overs} ov
                </span>
              </div>
              {nextBattingInnings && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 4 }}>
                  <span style={{ fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>Next bat</span>
                  <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{nextBattingInnings.battingTeamName}</span>
                </div>
              )}
            </div>
          </div>
          {/* Bowling side */}
          <div style={{ flex: 1, background: bowlingColor, display: "flex", flexDirection: "column", justifyContent: "center", padding: "12px 16px 12px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <TeamLogo logoKey={bowlingTeam?.logo ?? "star"} color="rgba(255,255,255,0.9)" size={15} />
              <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {bowlingTeam?.name ?? "—"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {bowlingTeamStats && (
                <>
                  <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {bowlingTeamStats.wickets}/{bowlingTeamStats.runs}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>·</span>
                </>
              )}
              <span style={{ fontFamily: t.font, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                {bowlerCompletedOvers}.{innings.ballsInCurrentOver}/{bowlerTotalOvers} ov
              </span>
            </div>
            {nextBowlingTurn && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <span style={{ fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>Next bowl</span>
                <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{nextBowlingTurn.teamName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isLive && (
        // Plain header for completed / upcoming
        <div style={{
          background: t.bg, borderBottom: `${t.borderWidth}px solid ${t.border}`,
          padding: "0 14px 0 2px", display: "flex", alignItems: "center", gap: 6,
        }}>
          <button onClick={onBack} style={{ ...iconBtn, padding: "12px 8px" }}>
            <ChevronLeft size={18} color={t.textMuted} strokeWidth={2} />
          </button>
          <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>{match.name}</span>
        </div>
      )}

      {view === "live"      && <LiveScoring matchId={matchId} onScorecard={() => setView("scorecard")} onEndMatch={handleEndMatch} onSettings={() => setView("config")} />}
      {view === "scorecard" && <Scorecard matchId={matchId} />}
      {view === "config"    && <MatchConfig matchId={matchId} />}
    </div>
  );
}
