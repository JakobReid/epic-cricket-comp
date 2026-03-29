import { useState } from "react";
import { ChevronLeft, ListOrdered, Crown, Hand, Medal } from "lucide-react";
import batLineal from "../assets/criquet-icons/bat-lineal.png";
import ballLineal from "../assets/criquet-icons/ball-lineal.png";
import { useTheme } from "../ThemeContext";
import { Badge } from "../components/Shared";
import { TeamLogo } from "./setup/TeamsPage";
import { useMatchStore } from "../store/matchStore";
import type { BatterState, BowlerStats, InningsState, Match } from "../store/types";
import { BatterScoreCard } from "./BatterScoreCard";
import { BowlerScoreCard } from "./BowlerScoreCard";
import { InningsCardHeader } from "../components/InningsCardHeader";

type ScorecardTab = "summary" | "batting" | "bowling" | "overs";

function ordinal(n: number) {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function oversStr(legalBalls: number) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function computeFOW(innings: InningsState) {
  const events: { wicket: number; score: number; name: string; overStr: string }[] = [];
  let score = 0;
  for (const d of innings.deliveries) {
    score += d.totalRuns;
    if (d.dismissal) {
      const batter = innings.batters.find(b => b.playerId === d.dismissal!.batterId);
      const overStr = d.ballInOver >= 0 ? `${d.over}.${d.ballInOver + 1}` : `${d.over}`;
      events.push({ wicket: events.length + 1, score, name: batter?.name ?? "?", overStr });
    }
  }
  return events;
}



// ─── Per-innings detail view ───────────────────────────────────────────────────

function InningsDetail({ innings, match, onBack }: { innings: InningsState; match: Match; onBack: () => void }) {
  const t = useTheme();
  const [subTab, setSubTab] = useState<"batting" | "bowling" | "overs">("batting");
  const team = match.teams.find(tm => tm.id === innings.battingTeamId);
  const color = team?.color ?? t.primary;

  // Group bowlers by team
  const bowlersByTeam: { teamName: string; color: string; logo: string; bowlers: typeof innings.bowlers[string][] }[] = [];
  for (const turn of innings.bowlingOrder) {
    const bowlingTeam = match.teams.find(tm => tm.id === turn.teamId);
    const teamBowlers = Object.values(innings.bowlers).filter(b => b.teamId === turn.teamId);
    if (teamBowlers.length > 0 || innings.status !== "upcoming") {
      bowlersByTeam.push({
        teamName: turn.teamName,
        color: bowlingTeam?.color ?? t.textMuted,
        logo: bowlingTeam?.logo ?? "shield",
        bowlers: teamBowlers,
      });
    }
  }

  // Per-over summary from deliveries
  const overSummaries: { num: number; runs: number; events: string }[] = [];
  if (innings.deliveries.length > 0) {
    const maxOv = Math.max(...innings.deliveries.map(d => d.over));
    for (let ov = 0; ov <= maxOv; ov++) {
      const balls = innings.deliveries.filter(d => d.over === ov);
      const runs = balls.reduce((s, d) => s + d.totalRuns, 0);
      const events = balls.map(d => d.displayBall).join(" ");
      overSummaries.push({ num: ov + 1, runs, events });
    }
  }

  const SUB_TABS = [
    { id: "batting" as const, label: "Batting" },
    { id: "bowling" as const, label: "Bowling" },
    { id: "overs" as const, label: "Overs" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        background: color, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
          <ChevronLeft size={18} color="#fff" strokeWidth={2.5} />
        </button>
        <TeamLogo logoKey={team?.logo ?? "shield"} color="rgba(255,255,255,0.85)" size={16} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontSans, fontSize: 16, fontWeight: 800, color: "#fff" }}>{innings.battingTeamName}</div>
          <div style={{ fontFamily: t.font, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {innings.wickets}/{innings.runs} · {oversStr(innings.completedOvers * 6)} ov
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", borderBottom: `${t.borderWidth}px solid ${t.border}`, background: t.bg }}>
        {SUB_TABS.map(({ id, label }) => {
          const active = subTab === id;
          return (
            <button key={id} onClick={() => setSubTab(id)} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
              marginBottom: -t.borderWidth,
              fontFamily: t.fontSans, fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? t.text : t.textMuted, cursor: "pointer",
            }}>{label}</button>
          );
        })}
      </div>

      <div style={{ padding: "12px 16px 40px", maxWidth: 640, margin: "0 auto" }}>
        {subTab === "batting" && (
          <BatterScoreCard color={color} innings={innings} />
        )}

        {subTab === "bowling" && (
          <BowlerScoreCard
            color={color}
            bowlers={bowlersByTeam.flatMap(({ color: tc, logo, bowlers: bs }) =>
              bs.map(b => ({ ...b, teamColor: tc, teamLogo: logo }))
            )}
            standalone
          />
        )}

        {subTab === "overs" && (
          <div style={{ background: t.card, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusLg, overflow: "hidden" }}>
            <div style={{ display: "flex", padding: "8px 14px", background: color }}>
              <span style={{ width: 32, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>OV</span>
              <span style={{ flex: 1, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>BALLS</span>
              <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>R</span>
            </div>
            {overSummaries.length === 0 ? (
              <div style={{ padding: "12px 14px", fontFamily: t.fontSans, fontSize: 13, color: t.textMuted }}>No overs bowled yet</div>
            ) : overSummaries.map((ov, i) => (
              <div key={ov.num} style={{ display: "flex", padding: "9px 14px", borderBottom: i < overSummaries.length - 1 ? `${t.borderWidth}px solid ${color}44` : undefined, alignItems: "center" }}>
                <span style={{ width: 36, fontFamily: t.font, fontSize: 13, fontWeight: 700, color: t.textDim }}>{ov.num}<sup style={{ fontSize: 9 }}>{ordinal(ov.num).slice(String(ov.num).length)}</sup></span>
                <span style={{ flex: 1, fontFamily: t.font, fontSize: 13, color: t.textDim, letterSpacing: 2 }}>{ov.events}</span>
                <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 14, fontWeight: 700, color: t.text }}>{ov.runs}</span>
              </div>
            ))}
            {(() => {
              const fow = computeFOW(innings);
              if (fow.length === 0) return null;
              return (
                <>
                  <div style={{ padding: "6px 14px", background: color, borderTop: `${t.borderWidth}px solid ${color}` }}>
                    <span style={{ fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>FALL OF WICKETS</span>
                  </div>
                  {fow.map((f, i) => (
                    <div key={f.wicket} style={{ display: "flex", padding: "8px 14px", borderBottom: i < fow.length - 1 ? `${t.borderWidth}px solid ${color}44` : undefined, alignItems: "center", gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: t.radius, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: t.font, fontSize: 11, fontWeight: 700, color: color, flexShrink: 0 }}>{f.wicket}</div>
                      <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, color: t.text }}>{f.name}</span>
                      <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 700, color: t.text }}>{f.score}</span>
                      <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, width: 36, textAlign: "right" }}>{f.overStr} ov</span>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Scorecard ────────────────────────────────────────────────────────────

export function Scorecard({ matchId }: { matchId: string }) {
  const t = useTheme();
  const { matches } = useMatchStore();
  const match = matches.find(m => m.id === matchId);
  const [tab, setTab] = useState<ScorecardTab>("summary");
  const [selectedInnings, setSelectedInnings] = useState<number | null>(null);

  if (!match) return null;

  if (selectedInnings !== null) {
    const inn = match.innings[selectedInnings];
    if (inn) return <InningsDetail innings={inn} match={match} onBack={() => setSelectedInnings(null)} />;
  }

  const TABS = [
    { id: "summary" as const, label: "Summary" },
    { id: "batting" as const, label: "Batting" },
    { id: "bowling" as const, label: "Bowling" },
    { id: "overs" as const, label: "Overs" },
  ];

  // ── Summary tab data ────────────────────────────────────────────────────────
  const completedInnings = match.innings.filter(i => i.status === "complete");
  const isComplete = match.status === "completed";

  const standings = match.innings.map(inn => {
    const team = match.teams.find(tm => tm.id === inn.battingTeamId);
    return {
      teamId: inn.battingTeamId,
      teamName: inn.battingTeamName,
      color: team?.color ?? t.textMuted,
      logo: team?.logo ?? "shield",
      runs: inn.runs,
      wickets: inn.wickets,
      overs: `${inn.completedOvers}.${inn.ballsInCurrentOver}`,
      batted: inn.status !== "upcoming",
    };
  }).sort((a, b) => {
    if (a.batted !== b.batted) return a.batted ? -1 : 1;
    return b.runs - a.runs;
  });
  const winner = standings.find(s => s.batted) ?? null;

  const allBatters: (BatterState & { teamName: string; teamColor: string; teamLogo: string })[] = completedInnings.flatMap(inn => {
    const team = match.teams.find(tm => tm.id === inn.battingTeamId);
    return inn.batters.map(b => ({ ...b, teamName: inn.battingTeamName, teamColor: team?.color ?? t.textMuted, teamLogo: team?.logo ?? "shield" }));
  });
  const bestBatter = [...allBatters].sort((a, b) => b.runs - a.runs)[0] ?? null;

  const summaryBowlerMap: Record<string, BowlerStats & { teamColor: string; teamLogo: string }> = {};
  for (const inn of completedInnings) {
    for (const b of Object.values(inn.bowlers)) {
      const team = match.teams.find(tm => tm.id === b.teamId);
      const prev = summaryBowlerMap[b.playerId];
      summaryBowlerMap[b.playerId] = {
        ...b,
        teamColor: team?.color ?? t.textMuted,
        teamLogo: team?.logo ?? "shield",
        legalBalls: (prev?.legalBalls ?? 0) + b.legalBalls,
        runsConceded: (prev?.runsConceded ?? 0) + b.runsConceded,
        wickets: (prev?.wickets ?? 0) + b.wickets,
      };
    }
  }
  const bestBowler = Object.values(summaryBowlerMap).sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded)[0] ?? null;

  const catchMap: Record<string, { name: string; teamName: string; teamColor: string; teamLogo: string; catches: number }> = {};
  for (const inn of completedInnings) {
    for (const d of inn.deliveries) {
      if (d.dismissal?.type === "caught" && d.dismissal.fielderId && d.dismissal.fielderName) {
        const fid = d.dismissal.fielderId;
        const fielderTeam = match.teams.find(tm => tm.players.some(p => p.id === fid));
        catchMap[fid] = {
          name: d.dismissal.fielderName,
          teamName: fielderTeam?.name ?? "",
          teamColor: fielderTeam?.color ?? t.textMuted,
          teamLogo: fielderTeam?.logo ?? "shield",
          catches: (catchMap[fid]?.catches ?? 0) + 1,
        };
      }
    }
  }
  const catches = Object.values(catchMap).sort((a, b) => b.catches - a.catches);

  const bestBatterSR = bestBatter && bestBatter.balls > 0
    ? ((bestBatter.runs / bestBatter.balls) * 100).toFixed(0) : "—";
  const bestBowlerOv = bestBowler ? `${Math.floor(bestBowler.legalBalls / 6)}.${bestBowler.legalBalls % 6}` : "—";
  const bestBowlerEcon = bestBowler && bestBowler.legalBalls > 0
    ? ((bestBowler.runsConceded / bestBowler.legalBalls) * 6).toFixed(1) : "—";


  const currentInnings = match.status === "live" ? match.innings[match.currentInningsIndex] : null;
  const currentBattingTeam = currentInnings ? match.teams.find(tm => tm.id === currentInnings.battingTeamId) : null;

  // Live status data
  const liveInnings = match.innings.find(i => i.status === "in-progress") ?? null;
  const nextInnings = match.innings.find(i => i.status === "upcoming") ?? null;
  const striker = liveInnings?.batters.find(b => b.playerId === liveInnings.strikerId) ?? null;
  const nonStriker = liveInnings?.batters.find(b => b.playerId === liveInnings.nonStrikerId) ?? null;
  const currentBowler = liveInnings ? liveInnings.bowlers[liveInnings.currentBowlerId] ?? null : null;
  const currentBowlingTeam = currentBowler ? match.teams.find(tm => tm.id === currentBowler.teamId) ?? null : null;
  const fieldingTeams = liveInnings
    ? match.teams.filter(tm =>
        tm.id !== liveInnings.battingTeamId &&
        tm.id !== currentBowler?.teamId
      )
    : [];
  const nextBattingTeam = nextInnings ? match.teams.find(tm => tm.id === nextInnings.battingTeamId) ?? null : null;
  const nextBowlingTurn = liveInnings
    ? liveInnings.bowlingOrder.find(bt => bt.fromOver > liveInnings.completedOvers + 1) ?? null
    : null;
  const nextBowlingTeam = nextBowlingTurn ? match.teams.find(tm => tm.id === nextBowlingTurn.teamId) ?? null : null;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `${t.borderWidth}px solid ${t.border}`, background: t.bg }}>
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              borderBottom: active ? `2px solid ${t.primary}` : "2px solid transparent",
              marginBottom: -t.borderWidth,
              fontFamily: t.fontSans, fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? t.text : t.textMuted, cursor: "pointer",
            }}>{label}</button>
          );
        })}
      </div>

      <div style={{ padding: "12px 16px 40px", maxWidth: 640, margin: "0 auto" }}>

        {/* ── Summary tab ───────────────────────────────────────────────── */}
        {tab === "summary" && (
          standings.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>
              No innings yet.
            </div>
          ) : (
            <div>
              {/* Winner banner */}
              {winner && (
                <div style={{
                  background: t.card, border: `${t.borderWidth}px solid ${winner.color}`,
                  borderRadius: t.radiusLg, overflow: "hidden", marginBottom: 16,
                }}>
                  {/* Coloured header band */}
                  <div style={{ background: winner.color, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Crown size={13} color="#fff" fill="#fff" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: t.font, letterSpacing: 2, textTransform: "uppercase" }}>
                      {isComplete ? "Winner" : "Leading"}
                    </span>
                  </div>
                  {/* Body */}
                  <div style={{ padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                      <TeamLogo logoKey={winner.logo} color={winner.color} size={28} />
                      <div style={{ fontFamily: t.fontSans, fontSize: 24, fontWeight: 800, color: t.text }}>{winner.teamName}</div>
                    </div>
                    <div style={{ fontFamily: t.font, fontSize: 28, fontWeight: 800, color: winner.color }}>
                      {winner.runs}
                      <span style={{ fontSize: 14, color: t.textMuted, fontWeight: 400 }}> ({winner.overs} ov)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Standings */}
              <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.font, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                <ListOrdered size={12} /> {isComplete ? "Final Standings" : "Current Standings"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {standings.map((s, i) => {
                  const isLeader = i === 0 && s.batted;
                  return (
                    <div key={s.teamId} style={{
                      background: t.card, border: `${t.borderWidth}px solid ${isLeader ? s.color : t.border}`,
                      borderRadius: t.radius, padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: t.radius,
                        background: isLeader ? s.color + "22" : t.cardAlt,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: t.font, fontSize: 14, fontWeight: 800,
                        color: isLeader ? s.color : t.textMuted,
                      }}>
                        {isLeader ? <Crown size={14} /> : (s.batted ? i + 1 : "—")}
                      </div>
                      <TeamLogo logoKey={s.logo} color={s.color} size={14} />
                      <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: t.text }}>{s.teamName}</span>
                      <div style={{ textAlign: "right" }}>
                        {s.batted ? (
                          <>
                            <span style={{ fontFamily: t.font, fontSize: 16, fontWeight: 800, color: isLeader ? s.color : t.text }}>{s.runs}</span>
                            <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, marginLeft: 4 }}>({s.overs})</span>
                          </>
                        ) : (
                          <span style={{ fontFamily: t.font, fontSize: 12, color: t.textMuted, fontStyle: "italic" }}>Yet to bat</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live status */}
              {liveInnings && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.font, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: t.danger, display: "inline-block" }} />
                    Now Playing
                  </div>
                  <div style={{ background: t.card, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusLg, overflow: "hidden" }}>

                    {/* Batting row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `${t.borderWidth}px solid ${t.border}` }}>
                      <div style={{ width: 56, fontFamily: t.font, fontSize: 10, fontWeight: 700, color: currentBattingTeam?.color ?? t.textMuted, letterSpacing: 1 }}>BATTING</div>
                      <TeamLogo logoKey={currentBattingTeam?.logo ?? "shield"} color={currentBattingTeam?.color ?? t.textMuted} size={13} />
                      <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{liveInnings.battingTeamName}</span>
                      <div style={{ textAlign: "right" }}>
                        {striker && <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.text }}><span style={{ width: 6, height: 6, borderRadius: 3, background: currentBattingTeam?.color ?? t.primary, display: "inline-block", marginRight: 5 }} />{striker.name} {striker.runs}({striker.balls})</div>}
                        {nonStriker && <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted }}>{nonStriker.name} {nonStriker.runs}({nonStriker.balls})</div>}
                      </div>
                    </div>

                    {/* Bowling row */}
                    {currentBowler && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: fieldingTeams.length > 0 ? `${t.borderWidth}px solid ${t.border}` : undefined }}>
                        <div style={{ width: 56, fontFamily: t.font, fontSize: 10, fontWeight: 700, color: currentBowlingTeam?.color ?? t.textMuted, letterSpacing: 1 }}>BOWLING</div>
                        <TeamLogo logoKey={currentBowlingTeam?.logo ?? "shield"} color={currentBowlingTeam?.color ?? t.textMuted} size={13} />
                        <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{currentBowlingTeam?.name ?? ""}</span>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.text }}>{currentBowler.name}</div>
                          <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>{currentBowler.wickets}/{currentBowler.runsConceded} ({Math.floor(currentBowler.legalBalls / 6)}.{currentBowler.legalBalls % 6} ov)</div>
                        </div>
                      </div>
                    )}

                    {/* Fielding rows */}
                    {fieldingTeams.map((ft, i) => (
                      <div key={ft.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: i < fieldingTeams.length - 1 ? `${t.borderWidth}px solid ${t.border}` : undefined }}>
                        <div style={{ width: 56, fontFamily: t.font, fontSize: 10, fontWeight: 700, color: ft.color ?? t.textMuted, letterSpacing: 1 }}>FIELDING</div>
                        <TeamLogo logoKey={ft.logo ?? "shield"} color={ft.color ?? t.textMuted} size={13} />
                        <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{ft.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Up next */}
                  {(nextInnings && nextBattingTeam || nextBowlingTurn) && (
                    <div style={{ marginTop: 8, background: t.card, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radius, overflow: "hidden" }}>
                      {nextInnings && nextBattingTeam && (
                        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: nextBowlingTurn ? `${t.borderWidth}px solid ${t.border}` : undefined }}>
                          <div style={{ fontFamily: t.font, fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1, width: 64 }}>NEXT BAT</div>
                          <TeamLogo logoKey={nextBattingTeam.logo ?? "shield"} color={nextBattingTeam.color ?? t.textMuted} size={13} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{nextBattingTeam.name}</span>
                        </div>
                      )}
                      {nextBowlingTurn && nextBowlingTeam && (
                        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontFamily: t.font, fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: 1, width: 64 }}>NEXT BOWL</div>
                          <TeamLogo logoKey={nextBowlingTeam.logo ?? "shield"} color={nextBowlingTeam.color ?? t.textMuted} size={13} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{nextBowlingTeam.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Player awards */}
              {(bestBatter || bestBowler) && (
                <>
                  <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.font, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
                    Player Awards
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    {bestBatter && (
                      <div style={{ flex: 1, background: t.card, border: `${t.borderWidth}px solid ${bestBatter.teamColor}`, borderRadius: t.radiusLg, padding: 14, textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: t.radius, background: bestBatter.teamColor, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <img src={batLineal} style={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }} />
                        </div>
                        <div style={{ fontSize: 11, color: bestBatter.teamColor, fontFamily: t.font, letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>BEST BATTER</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 3 }}>
                          <TeamLogo logoKey={bestBatter.teamLogo} color={bestBatter.teamColor} size={12} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 15, fontWeight: 800, color: t.text }}>{bestBatter.name}</span>
                        </div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          {bestBatter.runs} ({bestBatter.balls}) — SR {bestBatterSR}
                        </div>
                      </div>
                    )}
                    {bestBowler && (
                      <div style={{ flex: 1, background: t.card, border: `${t.borderWidth}px solid ${bestBowler.teamColor}`, borderRadius: t.radiusLg, padding: 14, textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: t.radius, background: bestBowler.teamColor, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <img src={ballLineal} style={{ width: 24, height: 24, filter: "brightness(0) invert(1)" }} />
                        </div>
                        <div style={{ fontSize: 11, color: bestBowler.teamColor, fontFamily: t.font, letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>BEST BOWLER</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 3 }}>
                          <TeamLogo logoKey={bestBowler.teamLogo} color={bestBowler.teamColor} size={12} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 15, fontWeight: 800, color: t.text }}>{bestBowler.name}</span>
                        </div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          {bestBowler.wickets}/{bestBowler.runsConceded} ({bestBowlerOv} ov) — Econ {bestBowlerEcon}
                        </div>
                      </div>
                    )}
                    {catches.length > 0 && (
                      <div style={{ flex: 1, background: t.card, border: `${t.borderWidth}px solid ${catches[0].teamColor}`, borderRadius: t.radiusLg, padding: 14, textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: t.radius, background: catches[0].teamColor, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                          <Hand size={22} color="#fff" />
                        </div>
                        <div style={{ fontSize: 11, color: catches[0].teamColor, fontFamily: t.font, letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>BEST CATCHER</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 3 }}>
                          <TeamLogo logoKey={catches[0].teamLogo} color={catches[0].teamColor} size={12} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 15, fontWeight: 800, color: t.text }}>{catches[0].name}</span>
                        </div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          {catches[0].catches} catches — +{catches[0].catches * match.format.catchBonus} pts
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Fielding catches */}
              {catches.length > 0 && (
                <>
                  <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.font, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                    <Medal size={12} /> Fielding Catches
                  </div>
                  <div style={{ background: t.card, border: `${t.borderWidth}px solid ${t.border}`, borderRadius: t.radiusLg, overflow: "hidden" }}>
                    {catches.map((c, i) => (
                      <div key={c.name} style={{
                        padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
                        borderBottom: i < catches.length - 1 ? `${t.borderWidth}px solid ${t.border}` : "none",
                      }}>
                        <div style={{ fontFamily: t.font, fontSize: 13, fontWeight: 800, color: t.textMuted, width: 20 }}>{i + 1}</div>
                        <TeamLogo logoKey={c.teamLogo} color={c.teamColor} size={14} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: t.text }}>{c.name}</span>
                          <span style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted, marginLeft: 6 }}>{c.teamName}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: t.font, fontSize: 14, fontWeight: 700, color: t.text }}>{c.catches}</span>
                          <Badge color={t.secondary}>+{c.catches * match.format.catchBonus}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        )}

        {/* ── Overs tab ─────────────────────────────────────────────────── */}
        {tab === "overs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {match.innings.filter(inn => inn.status !== "upcoming").map((inn, inIdx) => {
              const team = match.teams.find(tm => tm.id === inn.battingTeamId);
              const color = team?.color ?? t.primary;
              const realIdx = match.innings.indexOf(inn);

              const overSummaries: { num: number; runs: number; events: string }[] = [];
              if (inn.deliveries.length > 0) {
                const maxOv = Math.max(...inn.deliveries.map(d => d.over));
                for (let ov = 0; ov <= maxOv; ov++) {
                  const balls = inn.deliveries.filter(d => d.over === ov);
                  const runs = balls.reduce((s, d) => s + d.totalRuns, 0);
                  const events = balls.map(d => d.displayBall).join(" ");
                  overSummaries.push({ num: ov + 1, runs, events });
                }
              }

              return (
                <div key={inIdx} onClick={() => setSelectedInnings(realIdx)} style={{ border: `${t.borderWidth}px solid ${color}`, borderRadius: t.radiusLg, overflow: "hidden", cursor: "pointer" }}>
                  <InningsCardHeader color={color} logo={team?.logo ?? "shield"} teamName={inn.battingTeamName} wickets={inn.wickets} runs={inn.runs} inningsNum={inIdx + 1} />
                  <div style={{ background: t.card }}>
                    <div style={{ display: "flex", padding: "8px 14px", background: color }}>
                      <span style={{ width: 32, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>OV</span>
                      <span style={{ flex: 1, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>BALLS</span>
                      <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>R</span>
                    </div>
                    {overSummaries.length === 0 ? (
                      <div style={{ padding: "12px 14px", fontFamily: t.fontSans, fontSize: 13, color: t.textMuted }}>No overs bowled yet</div>
                    ) : overSummaries.map((ov, i) => (
                      <div key={ov.num} style={{ display: "flex", padding: "9px 14px", borderBottom: i < overSummaries.length - 1 ? `${t.borderWidth}px solid ${color}44` : undefined, alignItems: "center" }}>
                        <span style={{ width: 36, fontFamily: t.font, fontSize: 13, fontWeight: 700, color: t.textDim }}>{ov.num}<sup style={{ fontSize: 9 }}>{ordinal(ov.num).slice(String(ov.num).length)}</sup></span>
                        <span style={{ flex: 1, fontFamily: t.font, fontSize: 13, color: t.textDim, letterSpacing: 2 }}>{ov.events}</span>
                        <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 14, fontWeight: 700, color: t.text }}>{ov.runs}</span>
                      </div>
                    ))}
                    {(() => {
                      const fow = computeFOW(inn);
                      if (fow.length === 0) return null;
                      return (
                        <>
                          <div style={{ padding: "6px 14px", background: color, borderTop: `${t.borderWidth}px solid ${color}` }}>
                            <span style={{ fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1 }}>FALL OF WICKETS</span>
                          </div>
                          {fow.map((f, i) => (
                            <div key={f.wicket} style={{ display: "flex", padding: "8px 14px", borderBottom: i < fow.length - 1 ? `${t.borderWidth}px solid ${color}44` : undefined, alignItems: "center", gap: 10 }}>
                              <div style={{ width: 22, height: 22, borderRadius: t.radius, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: t.font, fontSize: 11, fontWeight: 700, color: color, flexShrink: 0 }}>{f.wicket}</div>
                              <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, color: t.text }}>{f.name}</span>
                              <span style={{ fontFamily: t.font, fontSize: 13, fontWeight: 700, color: t.text }}>{f.score}</span>
                              <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, width: 36, textAlign: "right" }}>{f.overStr} ov</span>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Batting tab ───────────────────────────────────────────────── */}
        {tab === "batting" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {match.innings.filter(i => i.status !== "upcoming").map((inn, i) => {
              const team = match.teams.find(tm => tm.id === inn.battingTeamId);
              const color = team?.color ?? t.primary;
              const realIdx = match.innings.indexOf(inn);
              return (
                <div key={i} onClick={() => setSelectedInnings(realIdx)} style={{ cursor: "pointer" }}>
                  <BatterScoreCard color={color} innings={inn} teamHeader={{ logo: team?.logo ?? "shield", inningsNum: realIdx + 1 }} />
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bowling tab ───────────────────────────────────────────────── */}
        {tab === "bowling" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {match.innings.filter(inn => inn.status !== "upcoming").map((inn, inIdx) => {
              const battingTeam = match.teams.find(tm => tm.id === inn.battingTeamId);
              const battingColor = battingTeam?.color ?? t.primary;
              const realIdx = match.innings.indexOf(inn);

              // Group bowlers by team using bowlingOrder
              const bowlersByTeam: { teamName: string; color: string; logo: string; bowlers: typeof inn.bowlers[string][] }[] = [];
              for (const turn of inn.bowlingOrder) {
                const bowlingTeam = match.teams.find(tm => tm.id === turn.teamId);
                const teamBowlers = Object.values(inn.bowlers).filter(b => b.teamId === turn.teamId);
                if (teamBowlers.length > 0) {
                  bowlersByTeam.push({
                    teamName: turn.teamName,
                    color: bowlingTeam?.color ?? t.textMuted,
                    logo: bowlingTeam?.logo ?? "shield",
                    bowlers: teamBowlers,
                  });
                }
              }

              if (bowlersByTeam.length === 0) return null;

              return (
                <div key={inIdx} onClick={() => setSelectedInnings(realIdx)} style={{ border: `${t.borderWidth}px solid ${battingColor}`, borderRadius: t.radiusLg, overflow: "hidden", cursor: "pointer" }}>
                  <InningsCardHeader color={battingColor} logo={battingTeam?.logo ?? "shield"} teamName={inn.battingTeamName} wickets={inn.wickets} runs={inn.runs} inningsNum={inIdx + 1} />
                  <BowlerScoreCard
                    color={battingColor}
                    bowlers={bowlersByTeam.flatMap(({ color: tc, logo, bowlers: bs }) =>
                      bs.map(b => ({ ...b, teamColor: tc, teamLogo: logo }))
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
