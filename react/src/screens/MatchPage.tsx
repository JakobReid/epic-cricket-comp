import { useState } from "react";
import { BarChart2, ChevronLeft } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useMatchStore } from "../store/matchStore";
import { NavBar, EccBrand } from "../components/NavBar";
import { StatusBadge } from "../components/Shared";
import { LiveScoring } from "./scoring/LiveScoring";
import { Scorecard } from "./Scorecard";
import { MatchConfig } from "./MatchConfig";
import { TeamLogo } from "./setup/TeamsPage";
import batLineal from "../assets/criquet-icons/bat-lineal.png";
import ballLineal from "../assets/criquet-icons/ball-lineal.png";

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
    <div style={{ background: t.bg, minHeight: "100vh" }}>

      {/* ── Live view nav ── */}
      {isLive && view === "live" && (
        <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{
            background: t.card, padding: "12px 14px", minHeight: 65,
            borderBottom: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <button onClick={onBack} style={{ ...iconBtn, padding: 2, flexShrink: 0 }}>
              <ChevronLeft size={18} color={t.textMuted} strokeWidth={2.5} />
            </button>
            <EccBrand onHome={onBack} />

            {/* Center: info panel */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              <StatusBadge status="live" />
              <span style={{ fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 500, color: t.textDim, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {match.format.name}
              </span>
              {leadingInnings && leadingTeam && (
                <>
                  <span style={{ width: 1, height: 14, background: t.border, display: "inline-block" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontFamily: t.font, fontSize: 9, color: t.textMuted, whiteSpace: "nowrap", letterSpacing: 1.5, textTransform: "uppercase" }}>LEAD</span>
                    <TeamLogo logoKey={leadingTeam.logo ?? "shield"} color={leadingTeam.color ?? t.textMuted} size={11} />
                    <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 700, color: t.text, whiteSpace: "nowrap" }}>{leadingTeam.name}</span>
                    <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 800, color: leadingTeam.color ?? t.primary, whiteSpace: "nowrap" }}>{leadingInnings.wickets}/{leadingInnings.runs}</span>
                  </div>
                </>
              )}
            </div>

            <button
              title="Scorecard"
              onClick={() => setView("scorecard")}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: t.primary, border: "none", borderRadius: t.btnRadius,
                padding: "6px 12px", cursor: "pointer", flexShrink: 0,
                fontFamily: t.fontDisplay, fontSize: 11, fontWeight: 600,
                color: "#fff", textTransform: "uppercase", letterSpacing: 1,
              }}
            >
              <BarChart2 size={13} color="#fff" />
              Score
            </button>
          </div>
        </div>
      )}

      {/* ── Config view nav ── */}
      {view === "config" && (
        <NavBar onHome={onBack}>
          <button onClick={() => setView("live")} style={{ ...iconBtn, padding: 4 }}>
            <ChevronLeft size={16} color={t.textMuted} strokeWidth={2.5} />
          </button>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 500, color: t.text, textTransform: "uppercase", letterSpacing: 0.8 }}>Match Settings</span>
        </NavBar>
      )}

      {/* ── Scorecard nav (during live match) — split team-color header ── */}
      {isLive && view === "scorecard" && (
        <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
            {/* Batting side */}
            {/* Batting side — right-aligned, icon near centre */}
            <div style={{
              flex: 1, background: color,
              display: "flex", alignItems: "center", padding: "12px 14px", minHeight: 65, gap: 10,
            }}>
              <button onClick={() => setView("live")} style={{ ...iconBtn, padding: 2, flexShrink: 0 }}>
                <ChevronLeft size={18} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
              </button>
              <EccBrand onHome={onBack} color="rgba(255,255,255,0.9)" />
              <StatusBadge status="live" />
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>
                  {innings.battingTeamName}
                </div>
                <div style={{ fontFamily: t.font, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                  {innings.completedOvers}.{innings.ballsInCurrentOver}/{match.format.overs} ov · {innings.wickets}/{innings.runs}
                </div>
              </div>
              <TeamLogo logoKey={battingTeam?.logo ?? "shield"} color="rgba(255,255,255,0.9)" size={18} />
            </div>
            {/* Bowling side */}
            <div style={{
              flex: 1, background: bowlingColor,
              display: "flex", alignItems: "center", padding: "12px 14px", minHeight: 65, gap: 10,
            }}>
              <TeamLogo logoKey={bowlingTeam?.logo ?? "star"} color="rgba(255,255,255,0.9)" size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>
                  {bowlingTeam?.name ?? "—"}
                </div>
                <div style={{ fontFamily: t.font, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                  {bowlingTeamStats ? `${bowlingTeamStats.wickets}/${bowlingTeamStats.runs} · ` : ""}{bowlerCompletedOvers}.{innings.ballsInCurrentOver}/{bowlerTotalOvers} ov
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Completed/upcoming match nav ── */}
      {!isLive && view !== "config" && (
        <NavBar onHome={onBack}>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 500, color: t.text, textTransform: "uppercase", letterSpacing: 0.8 }}>{match.name}</span>
        </NavBar>
      )}

      {view === "live"      && <LiveScoring matchId={matchId} onScorecard={() => setView("scorecard")} onEndMatch={handleEndMatch} onSettings={() => setView("config")} />}
      {view === "scorecard" && <Scorecard matchId={matchId} />}
      {view === "config"    && <MatchConfig matchId={matchId} />}
    </div>
  );
}
