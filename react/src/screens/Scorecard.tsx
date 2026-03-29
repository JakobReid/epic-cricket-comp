import { useState } from "react";
import { ChevronLeft, ListOrdered, Crown, Hand } from "lucide-react";
import batLineal from "../assets/criquet-icons/bat-lineal.png";
import ballLineal from "../assets/criquet-icons/ball-lineal.png";
import { useTheme } from "../ThemeContext";
import { CricketIcon, Pill } from "../components/Shared";
import { TeamLogo } from "./setup/TeamsPage";
import { useMatchStore } from "../store/matchStore";
import type { InningsState, Match } from "../store/types";
import { BatterScoreCard } from "./BatterScoreCard";
import { BowlerScoreCard } from "./BowlerScoreCard";
import { InningsCardHeader } from "../components/InningsCardHeader";
import { AggregateBattingTable } from "./AggregateBattingTable";
import { AggregateBowlingTable } from "./AggregateBowlingTable";
import { FieldingTable } from "./FieldingTable";
import { aggregateBatting, aggregateBowling, aggregateFielding } from "../utils/aggregateStats";

type ContextTab = "leaderboard" | "innings";
type StatView = "batting" | "bowling" | "fielding" | "overs";

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

function computeOverSummaries(innings: InningsState) {
  const result: { num: number; runs: number; events: string }[] = [];
  if (innings.deliveries.length > 0) {
    const maxOv = Math.max(...innings.deliveries.map(d => d.over));
    for (let ov = 0; ov <= maxOv; ov++) {
      const balls = innings.deliveries.filter(d => d.over === ov);
      const runs = balls.reduce((s, d) => s + d.totalRuns, 0);
      const events = balls.map(d => d.displayBall).join(" ");
      result.push({ num: ov + 1, runs, events });
    }
  }
  return result;
}


// ─── Shared overs content ─────────────────────────────────────────────────────

function OversContent({ color, overSummaries, fow }: {
  color: string;
  overSummaries: { num: number; runs: number; events: string }[];
  fow: { wicket: number; score: number; name: string; overStr: string }[];
}) {
  const t = useTheme();
  return (
    <div style={{ background: t.card }}>
      <div style={{
        display: "flex", padding: "8px 14px",
        background: color,
        borderBottom: `${t.borderWidth}px solid ${t.border}`,
      }}>
        <span style={{ width: 32, fontFamily: t.font, fontSize: 10, color: "#fff", letterSpacing: 1.5 }}>OV</span>
        <span style={{ flex: 1, fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 }}>BALLS</span>
        <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5 }}>R</span>
      </div>
      {overSummaries.length === 0 ? (
        <div style={{ padding: "14px", fontFamily: t.fontSans, fontSize: 13, color: t.textMuted }}>No overs bowled yet</div>
      ) : overSummaries.map((ov, i) => (
        <div key={ov.num} style={{
          display: "flex", padding: "9px 14px", alignItems: "center",
          borderBottom: i < overSummaries.length - 1 ? `${t.borderWidth}px solid ${t.border}` : undefined,
          background: t.card,
        }}>
          <span style={{ width: 36, fontFamily: t.font, fontSize: 13, fontWeight: 800, color: t.textDim }}>
            {ov.num}<sup style={{ fontSize: 9, color: t.textMuted }}>{ordinal(ov.num).slice(String(ov.num).length)}</sup>
          </span>
          <span style={{ flex: 1, fontFamily: t.font, fontSize: 13, color: t.textDim, letterSpacing: 2 }}>{ov.events}</span>
          <span style={{ width: 32, textAlign: "right", fontFamily: t.font, fontSize: 15, fontWeight: 800, color: t.text }}>{ov.runs}</span>
        </div>
      ))}
      {fow.length > 0 && (
        <>
          <div style={{
            padding: "7px 14px",
            background: `${color}22`,
            borderTop: `${t.borderWidth}px solid ${t.border}`,
          }}>
            <span style={{ fontFamily: t.fontDisplay, fontSize: 11, color: t.textDim, letterSpacing: 2, textTransform: "uppercase" }}>Fall of Wickets</span>
          </div>
          {fow.map((f, i) => (
            <div key={f.wicket} style={{
              display: "flex", padding: "8px 14px", alignItems: "center", gap: 10,
              borderBottom: i < fow.length - 1 ? `${t.borderWidth}px solid ${t.border}` : undefined,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: t.radius,
                background: color, border: `${t.borderWidth}px solid ${color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: t.font, fontSize: 11, fontWeight: 800, color, flexShrink: 0,
              }}>{f.wicket}</div>
              <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, color: t.text }}>{f.name}</span>
              <span style={{ fontFamily: t.font, fontSize: 14, fontWeight: 800, color: t.text }}>{f.score}</span>
              <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, width: 40, textAlign: "right" }}>{f.overStr} ov</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Per-innings detail view ───────────────────────────────────────────────────

function InningsDetail({ innings, match, inningsNum, onBack }: { innings: InningsState; match: Match; inningsNum: number; onBack: () => void }) {
  const t = useTheme();
  const [view, setView] = useState<StatView>("batting");
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

  const overSummaries = computeOverSummaries(innings);
  const fow = computeFOW(innings);

  // Innings-level catches
  const innCatches: Record<string, { playerId: string; name: string; teamName: string; teamColor: string; teamLogo: string; catches: number }> = {};
  for (const d of innings.deliveries) {
    if (d.dismissal?.type === "caught" && d.dismissal.fielderId && d.dismissal.fielderName) {
      const fid = d.dismissal.fielderId;
      const fielderTeam = match.teams.find(tm => tm.players.some(p => p.id === fid));
      innCatches[fid] = {
        playerId: fid,
        name: d.dismissal.fielderName,
        teamName: fielderTeam?.name ?? "",
        teamColor: fielderTeam?.color ?? t.textMuted,
        teamLogo: fielderTeam?.logo ?? "shield",
        catches: (innCatches[fid]?.catches ?? 0) + 1,
      };
    }
  }
  const innCatchList = Object.values(innCatches).sort((a, b) => b.catches - a.catches);

  const PILLS: { id: StatView; label: string }[] = [
    { id: "batting", label: "Batting" },
    { id: "bowling", label: "Bowling" },
    { id: "fielding", label: "Fielding" },
    { id: "overs", label: "Overs" },
  ];

  return (
    <div>
      {/* Team-colored header band */}
      <div style={{
        background: color,
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: `2px solid ${color}`,
      }}>
        <button onClick={onBack} style={{
          background: "rgba(0,0,0,0.25)", border: "none", cursor: "pointer",
          padding: 6, display: "flex", alignItems: "center",
          borderRadius: t.radius,
        }}>
          <ChevronLeft size={18} color="#fff" strokeWidth={2.5} />
        </button>
        <div style={{
          fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 700,
          color: "rgba(255,255,255,0.6)", letterSpacing: 1.8, textTransform: "uppercase",
        }}>
          INN {inningsNum}
        </div>
        <TeamLogo logoKey={team?.logo ?? "shield"} color="rgba(255,255,255,0.9)" size={18} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.fontDisplay, fontSize: 18, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>
            {innings.battingTeamName}
          </div>
          <div style={{ fontFamily: t.font, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
            {innings.wickets}/{innings.runs} · {oversStr(innings.completedOvers * 6)} ov
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 16px" }}>
        {PILLS.map(({ id, label }) => (
          <Pill key={id} active={view === id} color={t.primary} onClick={() => setView(id)}>
            {label}
          </Pill>
        ))}
      </div>

      <div style={{ padding: "0 16px 40px", maxWidth: 640, margin: "0 auto" }}>
        {view === "batting" && (
          <BatterScoreCard color={color} innings={innings} />
        )}

        {view === "bowling" && (
          <BowlerScoreCard
            color={color}
            bowlers={bowlersByTeam.flatMap(({ color: tc, logo, bowlers: bs }) =>
              bs.map(b => ({ ...b, teamColor: tc, teamLogo: logo }))
            )}
            standalone
          />
        )}

        {view === "fielding" && (
          innCatchList.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>No catches this innings</div>
          ) : (
            <FieldingTable catches={innCatchList} catchBonus={match.format.catchBonus} color={color} />
          )
        )}

        {view === "overs" && (
          <div style={{
            background: t.card, border: `2px solid ${color}`,
            borderRadius: t.radiusLg, overflow: "hidden",
          }}>
            <OversContent color={color} overSummaries={overSummaries} fow={fow} />
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
  const [contextTab, setContextTab] = useState<ContextTab>("leaderboard");
  const [statView, setStatView] = useState<StatView>("batting");
  const [selectedInnings, setSelectedInnings] = useState<number | null>(null);

  if (!match) return null;

  if (selectedInnings !== null) {
    const inn = match.innings[selectedInnings];
    if (inn) return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, background: t.bg, overflow: "auto" }}>
        <InningsDetail innings={inn} match={match} inningsNum={selectedInnings + 1} onBack={() => setSelectedInnings(null)} />
      </div>
    );
  }

  const CONTEXT_TABS: { id: ContextTab; label: string }[] = [
    { id: "leaderboard", label: "Leaderboard" },
    { id: "innings", label: "Innings" },
  ];

  const STAT_VIEWS: { id: StatView; label: string }[] = [
    { id: "batting", label: "Batting" },
    { id: "bowling", label: "Bowling" },
    { id: "fielding", label: "Fielding" },
  ];

  // ── Computed data ──────────────────────────────────────────────────────────
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

  // Aggregate stats
  const aggBatters = aggregateBatting(match);
  const aggBowlers = aggregateBowling(match);
  const aggCatches = aggregateFielding(match);

  const bestBatter = aggBatters[0] ?? null;
  const bestBatterSR = bestBatter && bestBatter.balls > 0
    ? ((bestBatter.runs / bestBatter.balls) * 100).toFixed(0) : "—";

  const bestBowler = aggBowlers[0] ?? null;
  const bestBowlerOv = bestBowler ? oversStr(bestBowler.legalBalls) : "—";
  const bestBowlerEcon = bestBowler && bestBowler.legalBalls > 0
    ? ((bestBowler.runsConceded / bestBowler.legalBalls) * 6).toFixed(1) : "—";

  // Live status data
  const liveInnings = match.innings.find(i => i.status === "in-progress") ?? null;
  const nextInnings = match.innings.find(i => i.status === "upcoming") ?? null;
  const currentBattingTeam = liveInnings ? match.teams.find(tm => tm.id === liveInnings.battingTeamId) : null;
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
      {/* ── Context tabs ── */}
      <div style={{ display: "flex", background: t.card, borderBottom: `${t.borderWidth}px solid ${t.border}` }}>
        {CONTEXT_TABS.map(({ id, label }) => {
          const active = contextTab === id;
          return (
            <button key={id} onClick={() => setContextTab(id)} style={{
              flex: 1, padding: "10px 0", background: "transparent", border: "none", borderRadius: 0,
              borderBottom: active ? `2px solid ${t.primary}` : "2px solid transparent",
              fontFamily: t.fontDisplay, fontSize: 12, fontWeight: active ? 700 : 500,
              color: active ? t.text : t.textMuted, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: 1.5, outline: "none",
            }}>{label}</button>
          );
        })}
      </div>

      <div style={{ padding: "12px 16px 40px", maxWidth: 640, margin: "0 auto" }}>

        {/* ════════════════════════════════════════════════════════════════════
            LEADERBOARD TAB
           ════════════════════════════════════════════════════════════════════ */}
        {contextTab === "leaderboard" && (
          standings.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: t.textMuted, fontFamily: t.fontSans }}>
              No innings yet.
            </div>
          ) : (
            <div>
              {/* Winner banner */}
              {winner && (
                <div style={{
                  background: t.card,
                  border: `2px solid ${winner.color}`,
                  borderRadius: t.radiusLg, overflow: "hidden", marginBottom: 16,
                }}>
                  <div style={{
                    background: winner.color,
                    padding: "6px 14px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Crown size={12} color="#fff" />
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#fff",
                      fontFamily: t.fontDisplay, letterSpacing: 3, textTransform: "uppercase",
                    }}>
                      {isComplete ? "Match Result" : "Leading"}
                    </span>
                  </div>
                  <div style={{
                    padding: "20px 14px 18px", textAlign: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
                      <TeamLogo logoKey={winner.logo} color={winner.color} size={32} />
                      <div style={{ fontFamily: t.fontDisplay, fontSize: 26, fontWeight: 700, color: t.text, textTransform: "uppercase", letterSpacing: 2 }}>
                        {winner.teamName}
                      </div>
                    </div>
                    <div style={{ fontFamily: t.font, fontSize: 32, fontWeight: 800, color: winner.color, letterSpacing: 1 }}>
                      {winner.runs}
                      <span style={{ fontSize: 14, color: t.textMuted, fontWeight: 400, marginLeft: 6 }}>({winner.overs} ov)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Standings */}
              <div style={{
                fontSize: 11, color: t.textDim, fontFamily: t.fontDisplay, letterSpacing: 2.5,
                marginBottom: 8, textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <ListOrdered size={12} /> {isComplete ? "Final Standings" : "Current Standings"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
                {standings.map((s, i) => {
                  const isLeader = i === 0 && s.batted;
                  return (
                    <div key={s.teamId} style={{
                      background: t.card,
                      border: `${isLeader ? 2 : t.borderWidth}px solid ${isLeader ? s.color : t.border}`,
                      borderRadius: t.radius, padding: "11px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: t.radius,
                        background: isLeader ? `${s.color}22` : t.bgAlt,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: t.font, fontSize: 13, fontWeight: 800,
                        color: isLeader ? s.color : t.textMuted,
                      }}>
                        {isLeader ? <Crown size={13} color={s.color} /> : (s.batted ? i + 1 : "—")}
                      </div>
                      <TeamLogo logoKey={s.logo} color={s.color} size={14} />
                      <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 14, fontWeight: 600, color: t.text }}>{s.teamName}</span>
                      <div style={{ textAlign: "right" }}>
                        {s.batted ? (
                          <>
                            <span style={{ fontFamily: t.font, fontSize: 17, fontWeight: 800, color: isLeader ? s.color : t.text }}>{s.runs}</span>
                            <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, marginLeft: 4 }}>({s.overs})</span>
                          </>
                        ) : (
                          <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, fontStyle: "italic" }}>Yet to bat</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Player awards */}
              {(bestBatter || bestBowler) && (
                <>
                  <div style={{
                    fontSize: 11, color: t.textDim, fontFamily: t.fontDisplay, letterSpacing: 2.5,
                    marginBottom: 8, textTransform: "uppercase",
                  }}>
                    Player Awards
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {bestBatter && (
                      <div onClick={() => setStatView("batting")} style={{
                        flex: 1, background: t.card,
                        border: `2px solid ${bestBatter.teamColor}`,
                        borderRadius: t.radiusLg, padding: "14px 10px", textAlign: "center",
                        cursor: "pointer",
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: t.radius,
                          background: `${bestBatter.teamColor}15`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 8px",
                        }}>
                          <CricketIcon src={batLineal} color={bestBatter.teamColor} size={22} opacity={0.85} />
                        </div>
                        <div style={{
                          fontSize: 10, color: bestBatter.teamColor, fontFamily: t.fontDisplay,
                          letterSpacing: 2, fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
                        }}>Best Batter</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 4 }}>
                          <TeamLogo logoKey={bestBatter.teamLogo} color={bestBatter.teamColor} size={12} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 800, color: t.text }}>{bestBatter.name}</span>
                        </div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          {bestBatter.runs} ({bestBatter.balls}) — SR {bestBatterSR}
                        </div>
                      </div>
                    )}
                    {bestBowler && (
                      <div onClick={() => setStatView("bowling")} style={{
                        flex: 1, background: t.card,
                        border: `2px solid ${bestBowler.teamColor}`,
                        borderRadius: t.radiusLg, padding: "14px 10px", textAlign: "center",
                        cursor: "pointer",
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: t.radius,
                          background: `${bestBowler.teamColor}15`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 8px",
                        }}>
                          <CricketIcon src={ballLineal} color={bestBowler.teamColor} size={22} opacity={0.85} />
                        </div>
                        <div style={{
                          fontSize: 10, color: bestBowler.teamColor, fontFamily: t.fontDisplay,
                          letterSpacing: 2, fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
                        }}>Best Bowler</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 4 }}>
                          <TeamLogo logoKey={bestBowler.teamLogo} color={bestBowler.teamColor} size={12} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 800, color: t.text }}>{bestBowler.name}</span>
                        </div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          {bestBowler.wickets}/{bestBowler.runsConceded} ({bestBowlerOv} ov) — Econ {bestBowlerEcon}
                        </div>
                      </div>
                    )}
                    {aggCatches.length > 0 && (
                      <div onClick={() => setStatView("fielding")} style={{
                        flex: 1, background: t.card,
                        border: `2px solid ${aggCatches[0].teamColor}`,
                        borderRadius: t.radiusLg, padding: "14px 10px", textAlign: "center",
                        cursor: "pointer",
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: t.radius,
                          background: `${aggCatches[0].teamColor}15`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 8px",
                        }}>
                          <Hand size={20} color={aggCatches[0].teamColor} />
                        </div>
                        <div style={{
                          fontSize: 10, color: aggCatches[0].teamColor, fontFamily: t.fontDisplay,
                          letterSpacing: 2, fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
                        }}>Best Catcher</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 4 }}>
                          <TeamLogo logoKey={aggCatches[0].teamLogo} color={aggCatches[0].teamColor} size={12} />
                          <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 800, color: t.text }}>{aggCatches[0].name}</span>
                        </div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          {aggCatches[0].catches} catches — +{aggCatches[0].catches * match.format.catchBonus} pts
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Stat view pills */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                {STAT_VIEWS.map(({ id, label }) => (
                  <Pill key={id} active={statView === id} color={t.primary} onClick={() => setStatView(id)}>
                    {label}
                  </Pill>
                ))}
              </div>

              {/* Aggregate stat table based on pill selection */}
              {statView === "batting" && <AggregateBattingTable batters={aggBatters} />}
              {statView === "bowling" && <AggregateBowlingTable bowlers={aggBowlers} />}
              {statView === "fielding" && <FieldingTable catches={aggCatches} catchBonus={match.format.catchBonus} />}
            </div>
          )
        )}

        {/* ════════════════════════════════════════════════════════════════════
            INNINGS TAB
           ════════════════════════════════════════════════════════════════════ */}
        {contextTab === "innings" && (
          <div>
            {/* Now playing status */}
            {liveInnings && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, color: t.textDim, fontFamily: t.fontDisplay, letterSpacing: 2.5,
                  marginBottom: 8, textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: t.danger, display: "inline-block",
                    boxShadow: `0 0 8px ${t.danger}88`,
                    animation: "pulse 2s infinite",
                  }} />
                  Now Playing
                </div>
                <div style={{
                  background: t.card,
                  border: `${t.borderWidth}px solid ${t.borderBright}`,
                  borderRadius: t.radiusLg, overflow: "hidden",
                }}>
                  {/* Batting row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                    borderBottom: `${t.borderWidth}px solid ${t.border}`,
                  }}>
                    <div style={{
                      width: 56, fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600,
                      color: currentBattingTeam?.color ?? t.textMuted, letterSpacing: 1.5, textTransform: "uppercase",
                    }}>BAT</div>
                    <TeamLogo logoKey={currentBattingTeam?.logo ?? "shield"} color={currentBattingTeam?.color ?? t.textMuted} size={13} />
                    <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{liveInnings.battingTeamName}</span>
                    <div style={{ textAlign: "right" }}>
                      {striker && (
                        <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.text, display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: currentBattingTeam?.color ?? t.primary,
                            display: "inline-block",
                          }} />
                          {striker.name} <span style={{ fontFamily: t.font, fontWeight: 700 }}>{striker.runs}</span>({striker.balls})
                        </div>
                      )}
                      {nonStriker && (
                        <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.textMuted }}>
                          {nonStriker.name} <span style={{ fontFamily: t.font }}>{nonStriker.runs}</span>({nonStriker.balls})
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bowling row */}
                  {currentBowler && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                      borderBottom: fieldingTeams.length > 0 ? `${t.borderWidth}px solid ${t.border}` : undefined,
                    }}>
                      <div style={{
                        width: 56, fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600,
                        color: currentBowlingTeam?.color ?? t.textMuted, letterSpacing: 1.5, textTransform: "uppercase",
                      }}>BOWL</div>
                      <TeamLogo logoKey={currentBowlingTeam?.logo ?? "shield"} color={currentBowlingTeam?.color ?? t.textMuted} size={13} />
                      <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{currentBowlingTeam?.name ?? ""}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: t.fontSans, fontSize: 12, color: t.text }}>{currentBowler.name}</div>
                        <div style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted }}>
                          <span style={{ color: currentBowler.wickets > 0 ? t.danger : t.textDim, fontWeight: 700 }}>{currentBowler.wickets}</span>/{currentBowler.runsConceded} ({Math.floor(currentBowler.legalBalls / 6)}.{currentBowler.legalBalls % 6} ov)
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Fielding rows */}
                  {fieldingTeams.map((ft, i) => (
                    <div key={ft.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                      borderBottom: i < fieldingTeams.length - 1 ? `${t.borderWidth}px solid ${t.border}` : undefined,
                    }}>
                      <div style={{
                        width: 56, fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600,
                        color: ft.color ?? t.textMuted, letterSpacing: 1.5, textTransform: "uppercase",
                      }}>FIELD</div>
                      <TeamLogo logoKey={ft.logo ?? "shield"} color={ft.color ?? t.textMuted} size={13} />
                      <span style={{ flex: 1, fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{ft.name}</span>
                    </div>
                  ))}
                </div>
                {/* Up next */}
                {(nextInnings && nextBattingTeam || nextBowlingTurn) && (
                  <div style={{
                    marginTop: 6, background: t.card,
                    border: `${t.borderWidth}px solid ${t.border}`,
                    borderRadius: t.radius, overflow: "hidden",
                  }}>
                    {nextInnings && nextBattingTeam && (
                      <div style={{
                        padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
                        borderBottom: nextBowlingTurn ? `${t.borderWidth}px solid ${t.border}` : undefined,
                      }}>
                        <div style={{ fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: 1.5, width: 64, textTransform: "uppercase" }}>NEXT BAT</div>
                        <TeamLogo logoKey={nextBattingTeam.logo ?? "shield"} color={nextBattingTeam.color ?? t.textMuted} size={13} />
                        <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{nextBattingTeam.name}</span>
                      </div>
                    )}
                    {nextBowlingTurn && nextBowlingTeam && (
                      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: 1.5, width: 64, textTransform: "uppercase" }}>NEXT BOWL</div>
                        <TeamLogo logoKey={nextBowlingTeam.logo ?? "shield"} color={nextBowlingTeam.color ?? t.textMuted} size={13} />
                        <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: t.text }}>{nextBowlingTeam.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stat view pills */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {STAT_VIEWS.map(({ id, label }) => (
                <Pill key={id} active={statView === id} color={t.primary} onClick={() => setStatView(id)}>
                  {label}
                </Pill>
              ))}
            </div>

            {/* Innings cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {match.innings.filter(inn => inn.status !== "upcoming").map((inn, inIdx) => {
                const team = match.teams.find(tm => tm.id === inn.battingTeamId);
                const color = team?.color ?? t.primary;
                const realIdx = match.innings.indexOf(inn);

                if (statView === "batting") {
                  return (
                    <div key={inIdx} onClick={() => setSelectedInnings(realIdx)} style={{ cursor: "pointer" }}>
                      <BatterScoreCard color={color} innings={inn} teamHeader={{ logo: team?.logo ?? "shield", inningsNum: inIdx + 1 }} />
                    </div>
                  );
                }

                if (statView === "bowling") {
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
                    <div key={inIdx} onClick={() => setSelectedInnings(realIdx)} style={{
                      border: `2px solid ${color}`,
                      borderRadius: t.radiusLg, overflow: "hidden", cursor: "pointer",
                    }}>
                      <InningsCardHeader color={color} logo={team?.logo ?? "shield"} teamName={inn.battingTeamName} wickets={inn.wickets} runs={inn.runs} inningsNum={inIdx + 1} />
                      <BowlerScoreCard
                        color={color}
                        bowlers={bowlersByTeam.flatMap(({ color: tc, logo, bowlers: bs }) =>
                          bs.map(b => ({ ...b, teamColor: tc, teamLogo: logo }))
                        )}
                      />
                    </div>
                  );
                }

                // fielding view for innings
                if (statView === "fielding") {
                  const innCatches: Record<string, { name: string; teamName: string; teamColor: string; teamLogo: string; catches: number; playerId: string }> = {};
                  for (const d of inn.deliveries) {
                    if (d.dismissal?.type === "caught" && d.dismissal.fielderId && d.dismissal.fielderName) {
                      const fid = d.dismissal.fielderId;
                      const fielderTeam = match.teams.find(tm => tm.players.some(p => p.id === fid));
                      innCatches[fid] = {
                        playerId: fid,
                        name: d.dismissal.fielderName,
                        teamName: fielderTeam?.name ?? "",
                        teamColor: fielderTeam?.color ?? t.textMuted,
                        teamLogo: fielderTeam?.logo ?? "shield",
                        catches: (innCatches[fid]?.catches ?? 0) + 1,
                      };
                    }
                  }
                  const innCatchList = Object.values(innCatches).sort((a, b) => b.catches - a.catches);
                  return (
                    <div key={inIdx} onClick={() => setSelectedInnings(realIdx)} style={{
                      border: `2px solid ${color}`,
                      borderRadius: t.radiusLg, overflow: "hidden", cursor: "pointer",
                    }}>
                      <InningsCardHeader color={color} logo={team?.logo ?? "shield"} teamName={inn.battingTeamName} wickets={inn.wickets} runs={inn.runs} inningsNum={inIdx + 1} />
                      {innCatchList.length === 0 ? (
                        <div style={{ padding: "14px", fontFamily: t.fontSans, fontSize: 13, color: t.textMuted, background: t.card }}>No catches this innings</div>
                      ) : (
                        <FieldingTable catches={innCatchList} catchBonus={match.format.catchBonus} color={color} standalone={false} />
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
