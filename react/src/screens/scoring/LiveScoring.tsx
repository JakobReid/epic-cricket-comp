import { BarChart2, Square, Settings, FastForward } from "lucide-react";
import { useMatchStore } from "../../store/matchStore";
import { BattingSection } from "./BattingSection";
import { BowlingSection } from "./BowlingSection";
import { ThisOver } from "./ThisOver";
import { ScoringControls } from "./ScoringControls";
import { useTheme } from "../../ThemeContext";
import type { DismissalType, ExtraType } from "../../store/types";

interface Props {
  matchId: string;
  onScorecard?: () => void;
  onEndMatch?: () => void;
  onNextInnings?: () => void;
  onSettings?: () => void;
}

export const LiveScoring = ({ matchId, onScorecard, onEndMatch, onNextInnings, onSettings }: Props) => {
  const t = useTheme();
  const { matches, recordDelivery, confirmOver, undoDelivery, nextInnings } = useMatchStore();
  const match = matches.find(m => m.id === matchId);

  if (!match) return null;

  const innings = match.innings[match.currentInningsIndex];
  const isLive = match.status === "live" && innings?.status === "in-progress";

  // Between-innings / match-complete banner
  if (match.status === "completed" || !innings || innings.status === "upcoming") {
    const lastDone = [...match.innings].reverse().find(i => i.status === "complete");
    const nextBattingTeam = innings ? match.teams.find(tm => tm.id === innings.battingTeamId) : null;
    const nextColor = nextBattingTeam?.color ?? t.primary;
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
        <div style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: t.radiusLg,
          padding: "32px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: match.status === "completed" ? t.primary : nextColor,
          }} />
          <div style={{
            fontFamily: t.fontDisplay, fontSize: 22, fontWeight: 600, color: t.text,
            textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12,
          }}>
            {match.status === "completed" ? "Match Complete" : "Innings Complete"}
          </div>
          {lastDone && (
            <div style={{ fontFamily: t.font, fontSize: 15, color: t.textDim, marginBottom: 4 }}>
              {lastDone.battingTeamName}: <span style={{ color: t.text, fontWeight: 700 }}>{lastDone.wickets}/{lastDone.runs}</span>
              <span style={{ color: t.textMuted, marginLeft: 6 }}>({lastDone.completedOvers}.0 ov)</span>
            </div>
          )}
          {match.status !== "completed" && (
            <div style={{
              marginTop: 16, fontFamily: t.fontSans, fontSize: 14, color: t.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{ fontFamily: t.font, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: t.textMuted }}>NEXT</span>
              <span style={{ color: nextColor, fontWeight: 700 }}>{innings?.battingTeamName ?? "—"}</span>
              <span>to bat</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasNextInnings = match.currentInningsIndex + 1 < match.innings.length;

  const handleNextInnings = () => {
    if (window.confirm("End this innings and move to the next?")) {
      nextInnings(matchId);
    }
  };

  // Derive display data from current innings
  const battingTeam = match.teams.find(t => t.id === innings.battingTeamId);
  const bowlingTeam = match.teams.find(t => t.id === innings.currentBowlingTeamId);

  // Deliveries in current over
  const currentOverDeliveries = innings.deliveries.filter(d => d.over === innings.completedOvers);

  // All fielders (players from all non-batting teams)
  const fielders = match.teams
    .filter(t => t.id !== innings.battingTeamId)
    .flatMap(t => t.players.map(p => ({ id: p.id, name: p.name })));

  const handleRun = (runs: number) => {
    recordDelivery(matchId, { runs });
  };

  const handleExtra = (type: ExtraType, extraRuns?: number) => {
    recordDelivery(matchId, { runs: 0, extraType: type, extraRuns });
  };

  const handleDismissal = (type: DismissalType, fielderId?: string, fielderName?: string) => {
    recordDelivery(matchId, {
      runs: 0,
      dismissal: { type, fielderId, fielderName },
    });
  };

  const actionBtnStyle: React.CSSProperties = {
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 20, cursor: "pointer", padding: "5px 10px",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
  };

  return (
    <>
      <style>{`
        .live-scoring {
          max-width: 640px;
          margin: 0 auto;
          padding-bottom: 140px;
        }
        @media (min-width: 640px) {
          .live-scoring {
            min-height: calc(100vh - 48px);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }
        .live-scoring-content {
          display: flex;
          flex-direction: column;
          gap: clamp(0px, calc(20vh - 146px), 16px);
        }
      `}</style>
      <div className="live-scoring">
        <div className="live-scoring-content">
          {/* Action bar - dark pills */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, padding: "8px 12px 4px" }}>
            {[
              { icon: <Settings size={13} color={t.textDim} />, label: null, onClick: onSettings, title: "Match settings" },
              ...(hasNextInnings ? [{ icon: <FastForward size={13} color={t.textDim} />, label: null, onClick: handleNextInnings, title: "Next innings" }] : []),
              { icon: <Square size={12} color={t.danger} fill={t.danger} strokeWidth={0} />, label: null, onClick: onEndMatch, title: "End match" },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} title={btn.title} style={actionBtnStyle}>
                {btn.icon}
                {btn.label && <span style={{ fontFamily: t.fontSans, fontSize: 11, fontWeight: 600, color: t.textDim }}>{btn.label}</span>}
              </button>
            ))}
          </div>
          <BattingSection
            color={battingTeam?.color ?? t.primary}
            logo={battingTeam?.logo ?? "shield"}
            teamName={innings.battingTeamName}
            runs={innings.runs}
            wickets={innings.wickets}
            completedOvers={innings.completedOvers}
            ballsInCurrentOver={innings.ballsInCurrentOver}
            totalOvers={match.format.overs}
            batters={innings.batters}
            strikerId={innings.strikerId}
          />
          <BowlingSection
            bowlingTeamColor={bowlingTeam?.color ?? t.secondary}
            bowlingTeamLogo={bowlingTeam?.logo ?? "star"}
            bowlingTeamName={bowlingTeam?.name ?? innings.currentBowlingTeamId}
            currentBowler={innings.bowlers[innings.currentBowlerId] ?? null}
            bowlingOrder={innings.bowlingOrder}
            completedOvers={innings.completedOvers}
            teams={match.teams}
          />
          <ThisOver
            deliveries={currentOverDeliveries}
            ballsPerOver={match.format.ballsPerOver}
          />
        </div>
        <ScoringControls
          onRun={handleRun}
          onExtra={handleExtra}
          onDismissal={handleDismissal}
          onUndo={() => undoDelivery(matchId)}
          onConfirmOver={() => confirmOver(matchId)}
          onNextOver={() => confirmOver(matchId)}
          overComplete={innings.ballsInCurrentOver >= match.format.ballsPerOver}
          fielders={fielders}
          disabled={!isLive || innings.ballsInCurrentOver >= match.format.ballsPerOver}
        />
      </div>
    </>
  );
};
