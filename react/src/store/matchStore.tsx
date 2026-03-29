import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Match,
  MatchStoreCtx,
  InningsState,
  BowlingTurn,
  BatterState,
  DeliveryInput,
  Delivery,
  FormatConfig,
  Team,
} from "./types";
import { SCENARIO_MATCHES } from "../data/scenarios";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createBowlingTurns(bowlingTeams: Team[], totalOvers: number): BowlingTurn[] {
  const base = Math.floor(totalOvers / bowlingTeams.length);
  const extra = totalOvers % bowlingTeams.length;
  let cur = 1;
  return bowlingTeams.map((team, i) => {
    const ov = base + (i < extra ? 1 : 0);
    const turn: BowlingTurn = { teamId: team.id, teamName: team.name, fromOver: cur, toOver: cur + ov - 1 };
    cur += ov;
    return turn;
  });
}

function createInnings(
  id: number,
  battingTeam: Team,
  bowlingTeams: Team[],
  config: FormatConfig,
): InningsState {
  const bowlingOrder = createBowlingTurns(bowlingTeams, config.overs);
  const firstTeam = bowlingTeams[0];
  const batters: BatterState[] = battingTeam.players.map(p => ({
    playerId: p.id,
    name: p.name,
    livesRemaining: config.wickets,
    totalLives: config.wickets,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
  }));

  return {
    id,
    battingTeamId: battingTeam.id,
    battingTeamName: battingTeam.name,
    bowlingOrder,
    batters,
    bowlers: {},
    deliveries: [],
    strikerId: battingTeam.players[0]?.id ?? "",
    nonStrikerId: battingTeam.players[1]?.id ?? battingTeam.players[0]?.id ?? "",
    currentBowlerId: firstTeam?.players[0]?.id ?? "",
    currentBowlingTeamId: firstTeam?.id ?? "",
    completedOvers: 0,
    ballsInCurrentOver: 0,
    runs: 0,
    wickets: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    status: "upcoming",
  };
}

function getBowlerForOver(
  overNumber: number, // 1-indexed
  innings: InningsState,
  teams: Team[],
): { bowlerId: string; bowlingTeamId: string } {
  const turn = innings.bowlingOrder.find(bt => overNumber >= bt.fromOver && overNumber <= bt.toOver);
  if (!turn) return { bowlerId: innings.currentBowlerId, bowlingTeamId: innings.currentBowlingTeamId };

  const team = teams.find(t => t.id === turn.teamId);
  if (!team || team.players.length === 0) return { bowlerId: innings.currentBowlerId, bowlingTeamId: innings.currentBowlingTeamId };

  if (turn.teamId !== innings.currentBowlingTeamId) {
    // New team: start with first player
    return { bowlerId: team.players[0].id, bowlingTeamId: turn.teamId };
  } else {
    // Same team: cycle to next player
    const prevIdx = team.players.findIndex(p => p.id === innings.currentBowlerId);
    const nextIdx = (prevIdx + 1) % team.players.length;
    return { bowlerId: team.players[nextIdx].id, bowlingTeamId: turn.teamId };
  }
}

function applyDelivery(
  innings: InningsState,
  input: DeliveryInput,
  match: Match,
): InningsState {
  const config = match.format;
  const isLegal = input.extraType !== "wide" && input.extraType !== "no-ball";
  const extraPenalty = !isLegal ? 1 : 0;
  const byeRuns = (input.extraType === "bye" || input.extraType === "leg-bye") ? (input.extraRuns ?? 0) : 0;
  const batRuns = input.runs;
  const totalRuns = batRuns + extraPenalty + byeRuns;

  let displayBall: string;
  if (input.dismissal) {
    displayBall = "W";
  } else if (input.extraType === "wide") {
    displayBall = "Wd";
  } else if (input.extraType === "no-ball") {
    displayBall = "Nb";
  } else if (input.extraType === "bye") {
    displayBall = byeRuns > 0 ? `B${byeRuns}` : "B";
  } else if (input.extraType === "leg-bye") {
    displayBall = byeRuns > 0 ? `Lb${byeRuns}` : "Lb";
  } else if (batRuns === 0) {
    displayBall = "·";
  } else {
    displayBall = String(batRuns);
  }

  const delivery: Delivery = {
    id: innings.deliveries.length,
    over: innings.completedOvers,
    ballInOver: isLegal ? innings.ballsInCurrentOver : -1,
    batterId: innings.strikerId,
    bowlerId: innings.currentBowlerId,
    bowlingTeamId: innings.currentBowlingTeamId,
    runs: batRuns,
    extras: extraPenalty + byeRuns,
    extraType: input.extraType,
    isLegalBall: isLegal,
    dismissal: input.dismissal ? { ...input.dismissal, batterId: innings.strikerId } : undefined,
    totalRuns,
    displayBall,
  };

  let ni: InningsState = { ...innings, deliveries: [...innings.deliveries, delivery] };

  // ── Update batter stats
  ni.batters = ni.batters.map(b => {
    if (b.playerId !== innings.strikerId) return b;
    const isOut = !!input.dismissal;
    return {
      ...b,
      runs: b.runs + batRuns,
      balls: b.balls + (isLegal ? 1 : 0),
      fours: b.fours + (batRuns === 4 && !input.extraType ? 1 : 0),
      sixes: b.sixes + (batRuns === 6 && !input.extraType ? 1 : 0),
      livesRemaining: isOut ? Math.max(0, b.livesRemaining - 1) : b.livesRemaining,
    };
  });

  // ── Update bowler stats
  const bowlingTeam = match.teams.find(t => t.id === innings.currentBowlingTeamId);
  const bowlerPlayer = bowlingTeam?.players.find(p => p.id === innings.currentBowlerId);
  const prev = ni.bowlers[innings.currentBowlerId] ?? {
    playerId: innings.currentBowlerId,
    name: bowlerPlayer?.name ?? "Unknown",
    teamId: innings.currentBowlingTeamId,
    teamName: bowlingTeam?.name ?? "Unknown",
    legalBalls: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0,
  };
  ni.bowlers = {
    ...ni.bowlers,
    [innings.currentBowlerId]: {
      ...prev,
      legalBalls: prev.legalBalls + (isLegal ? 1 : 0),
      runsConceded: prev.runsConceded + totalRuns,
      wickets: prev.wickets + (input.dismissal ? 1 : 0),
      wides: prev.wides + (input.extraType === "wide" ? 1 : 0),
      noBalls: prev.noBalls + (input.extraType === "no-ball" ? 1 : 0),
    },
  };

  // ── Update innings totals
  ni.runs += totalRuns;
  if (input.dismissal) ni.wickets += 1;
  if (input.extraType === "wide") ni.extras.wides += 1;
  else if (input.extraType === "no-ball") ni.extras.noBalls += 1;
  else if (input.extraType === "bye") ni.extras.byes += byeRuns;
  else if (input.extraType === "leg-bye") ni.extras.legByes += byeRuns;

  // ── Handle legal ball + over progression
  let completedAnOver = false;
  if (isLegal) {
    ni.ballsInCurrentOver += 1;
    if (ni.ballsInCurrentOver >= config.ballsPerOver) {
      ni.completedOvers += 1;
      ni.ballsInCurrentOver = 0;
      completedAnOver = true;
    }
  }

  // ── Striker swap: odd bat runs then end-of-over (independent operations)
  if (isLegal && batRuns % 2 === 1) {
    [ni.strikerId, ni.nonStrikerId] = [ni.nonStrikerId, ni.strikerId];
  }
  if (completedAnOver) {
    [ni.strikerId, ni.nonStrikerId] = [ni.nonStrikerId, ni.strikerId];
  }

  // ── After over: advance bowler or end innings
  if (completedAnOver) {
    if (ni.completedOvers >= config.overs) {
      ni.status = "complete";
    } else {
      const next = getBowlerForOver(ni.completedOvers + 1, ni, match.teams);
      ni.currentBowlerId = next.bowlerId;
      ni.currentBowlingTeamId = next.bowlingTeamId;
    }
  }

  return ni;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<MatchStoreCtx | null>(null);

export function MatchStoreProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(SCENARIO_MATCHES);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  // Undo history per match: matchId → stack of full Match snapshots
  const [undoStacks, setUndoStacks] = useState<Record<string, Match[]>>({});

  const openMatch = (matchId: string) => setCurrentMatchId(matchId);

  const createMatch = (
    format: FormatConfig,
    teams: Team[],
    battingOrder: Team[],
    bowlingOrders: Record<string, Team[]>,
  ): string => {
    const id = `match-${Date.now()}`;
    const innings: InningsState[] = battingOrder.map((bt, i) => {
      const bowlers = bowlingOrders[bt.id] ?? battingOrder.filter(t => t.id !== bt.id);
      return createInnings(i, bt, bowlers, format);
    });

    const match: Match = {
      id,
      name: `${battingOrder[0]?.name ?? "Match"} vs ${battingOrder[1]?.name ?? "All"}`,
      status: "upcoming",
      format,
      teams,
      innings,
      currentInningsIndex: 0,
      createdAt: new Date().toISOString(),
    };

    setMatches(prev => [match, ...prev]);
    setCurrentMatchId(id);
    return id;
  };

  const startMatch = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const innings = m.innings.map((inn, i) => i === 0 ? { ...inn, status: "in-progress" as const } : inn);
      return { ...m, status: "live" as const, innings, startedAt: new Date().toISOString() };
    }));
  };

  const recordDelivery = (matchId: string, input: DeliveryInput) => {
    setMatches(prev => {
      const match = prev.find(m => m.id === matchId);
      if (!match || match.status !== "live") return prev;

      const inn = match.innings[match.currentInningsIndex];
      if (!inn || inn.status !== "in-progress") return prev;

      // Save undo snapshot
      setUndoStacks(us => ({
        ...us,
        [matchId]: [...(us[matchId] ?? []), match],
      }));

      const updatedInn = applyDelivery(inn, input, match);
      let newInnings = match.innings.map((x, i) =>
        i === match.currentInningsIndex ? updatedInn : x
      );

      let newCurrentIdx = match.currentInningsIndex;
      let newStatus: Match["status"] = match.status;
      let endedAt = match.endedAt;

      if (updatedInn.status === "complete") {
        const nextIdx = match.currentInningsIndex + 1;
        if (nextIdx >= match.innings.length) {
          newStatus = "completed";
          endedAt = new Date().toISOString();
        } else {
          newCurrentIdx = nextIdx;
          newInnings = newInnings.map((x, i) =>
            i === nextIdx ? { ...x, status: "in-progress" as const } : x
          );
        }
      }

      return prev.map(m => m.id !== matchId ? m : {
        ...m,
        innings: newInnings,
        currentInningsIndex: newCurrentIdx,
        status: newStatus,
        endedAt,
      });
    });
  };

  const endMatch = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      // Mark current innings complete if in-progress
      const innings = m.innings.map((inn, i) =>
        i === m.currentInningsIndex && inn.status === "in-progress"
          ? { ...inn, status: "complete" as const }
          : inn
      );
      return { ...m, status: "completed" as const, innings, endedAt: new Date().toISOString() };
    }));
  };

  const nextInnings = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId || m.status !== "live") return m;
      const inn = m.innings[m.currentInningsIndex];
      if (!inn || inn.status !== "in-progress") return m;
      const completedInn = { ...inn, status: "complete" as const };
      const nextIdx = m.currentInningsIndex + 1;
      if (nextIdx >= m.innings.length) {
        const innings = m.innings.map((x, i) => i === m.currentInningsIndex ? completedInn : x);
        return { ...m, status: "completed" as const, innings, endedAt: new Date().toISOString() };
      }
      const innings = m.innings.map((x, i) => {
        if (i === m.currentInningsIndex) return completedInn;
        if (i === nextIdx) return { ...x, status: "in-progress" as const };
        return x;
      });
      return { ...m, innings, currentInningsIndex: nextIdx };
    }));
  };

  const undoDelivery = (matchId: string) => {
    const stack = undoStacks[matchId];
    if (!stack || stack.length === 0) return;
    const prev = stack[stack.length - 1];
    setMatches(ms => ms.map(m => m.id === matchId ? prev : m));
    setUndoStacks(us => ({ ...us, [matchId]: us[matchId].slice(0, -1) }));
  };

  return (
    <Ctx.Provider value={{ matches, currentMatchId, openMatch, createMatch, startMatch, recordDelivery, endMatch, nextInnings, undoDelivery }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMatchStore(): MatchStoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMatchStore must be used within MatchStoreProvider");
  return ctx;
}
