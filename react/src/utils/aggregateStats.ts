import type { InningsState, Match, BowlerStats } from "../store/types";

// ── Aggregate batting stats across all innings ──────────────────────────────

export interface AggregateBatter {
  playerId: string;
  name: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  teamLogo: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  innings: number; // how many innings they batted in
}

export function aggregateBatting(match: Match): AggregateBatter[] {
  const map: Record<string, AggregateBatter> = {};
  const completed = match.innings.filter(i => i.status !== "upcoming");

  for (const inn of completed) {
    const team = match.teams.find(tm => tm.id === inn.battingTeamId);
    for (const b of inn.batters) {
      const prev = map[b.playerId];
      if (prev) {
        prev.runs += b.runs;
        prev.balls += b.balls;
        prev.fours += b.fours;
        prev.sixes += b.sixes;
        prev.innings += 1;
      } else {
        map[b.playerId] = {
          playerId: b.playerId,
          name: b.name,
          teamId: inn.battingTeamId,
          teamName: inn.battingTeamName,
          teamColor: team?.color ?? "#888",
          teamLogo: team?.logo ?? "shield",
          runs: b.runs,
          balls: b.balls,
          fours: b.fours,
          sixes: b.sixes,
          innings: 1,
        };
      }
    }
  }

  return Object.values(map).sort((a, b) => b.runs - a.runs);
}

// ── Aggregate bowling stats across all innings ──────────────────────────────

export interface AggregateBowler {
  playerId: string;
  name: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  teamLogo: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  innings: number;
}

export function aggregateBowling(match: Match): AggregateBowler[] {
  const map: Record<string, AggregateBowler> = {};
  const completed = match.innings.filter(i => i.status !== "upcoming");

  for (const inn of completed) {
    for (const b of Object.values(inn.bowlers)) {
      const team = match.teams.find(tm => tm.id === b.teamId);
      const prev = map[b.playerId];
      if (prev) {
        prev.legalBalls += b.legalBalls;
        prev.runsConceded += b.runsConceded;
        prev.wickets += b.wickets;
        prev.wides += b.wides;
        prev.noBalls += b.noBalls;
        prev.innings += 1;
      } else {
        map[b.playerId] = {
          playerId: b.playerId,
          name: b.name,
          teamId: b.teamId,
          teamName: b.teamName,
          teamColor: team?.color ?? "#888",
          teamLogo: team?.logo ?? "shield",
          legalBalls: b.legalBalls,
          runsConceded: b.runsConceded,
          wickets: b.wickets,
          wides: b.wides,
          noBalls: b.noBalls,
          innings: 1,
        };
      }
    }
  }

  return Object.values(map).sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded);
}

// ── Aggregate fielding/catches across all innings ───────────────────────────

export interface AggregateCatcher {
  playerId: string;
  name: string;
  teamName: string;
  teamColor: string;
  teamLogo: string;
  catches: number;
}

export function aggregateFielding(match: Match): AggregateCatcher[] {
  const map: Record<string, AggregateCatcher> = {};
  const completed = match.innings.filter(i => i.status !== "upcoming");

  for (const inn of completed) {
    for (const d of inn.deliveries) {
      if (d.dismissal?.type === "caught" && d.dismissal.fielderId && d.dismissal.fielderName) {
        const fid = d.dismissal.fielderId;
        const fielderTeam = match.teams.find(tm => tm.players.some(p => p.id === fid));
        const prev = map[fid];
        if (prev) {
          prev.catches += 1;
        } else {
          map[fid] = {
            playerId: fid,
            name: d.dismissal.fielderName,
            teamName: fielderTeam?.name ?? "",
            teamColor: fielderTeam?.color ?? "#888",
            teamLogo: fielderTeam?.logo ?? "shield",
            catches: 1,
          };
        }
      }
    }
  }

  return Object.values(map).sort((a, b) => b.catches - a.catches);
}
