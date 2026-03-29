import type { Delivery, InningsState } from "../store/types";

export interface LifeStats {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissalStr: string | null; // null = not out / still batting
}

export function dismissalDesc(
  d: Delivery,
  bowlers: InningsState["bowlers"],
): string {
  const bowlerName = bowlers[d.bowlerId]?.name ?? "?";
  const fielder = d.dismissal?.fielderName ?? "?";
  switch (d.dismissal?.type) {
    case "bowled":   return `b ${bowlerName}`;
    case "caught":   return `c ${fielder} b ${bowlerName}`;
    case "lbw":      return `lbw b ${bowlerName}`;
    case "run-out":  return d.dismissal.fielderName ? `run out (${fielder})` : "run out";
    case "stumped":  return `st ${fielder} b ${bowlerName}`;
    case "hit-wkt":  return `hit wkt b ${bowlerName}`;
    default:         return "out";
  }
}

export function computeBatterLives(
  batterId: string,
  deliveries: Delivery[],
  bowlers: InningsState["bowlers"],
  inningsActive: boolean,
): LifeStats[] {
  const mine = deliveries.filter(d => d.batterId === batterId);

  const lives: LifeStats[] = [];
  let cur: LifeStats = { runs: 0, balls: 0, fours: 0, sixes: 0, dismissalStr: null };

  for (const d of mine) {
    cur.runs += d.runs;
    if (d.isLegalBall) cur.balls++;
    if (d.runs === 4 && !d.extraType) cur.fours++;
    if (d.runs === 6 && !d.extraType) cur.sixes++;
    if (d.dismissal?.batterId === batterId) {
      cur.dismissalStr = dismissalDesc(d, bowlers);
      lives.push(cur);
      cur = { runs: 0, balls: 0, fours: 0, sixes: 0, dismissalStr: null };
    }
  }
  // Always show the current (not-out) life when the innings is active,
  // even if the batter hasn't faced a ball yet this life.
  if (inningsActive || cur.balls > 0 || cur.runs > 0) {
    lives.push(cur);
  }
  return lives;
}
