// ─── Core domain types ────────────────────────────────────────────────────────

export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type InningsStatus = 'upcoming' | 'in-progress' | 'complete';
export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye';
export type DismissalType = 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wkt';

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  logo: string;
  players: Player[];
}

export interface FormatConfig {
  name: string;
  overs: number;
  ballsPerOver: number;
  wickets: number;        // lives per batter
  catchBonus: number;
  playersPerTeam: number;
  teamsPerGame: number;
  retireAt: number;
  maxOversPerBowler: number;
  cantOutFirstBall: boolean;
  nickAndRun: boolean;
  lastManStands: boolean;
  oneHandOneBounce: boolean;
  freeHits: boolean;
}

// ─── Innings state types ───────────────────────────────────────────────────────

export interface BatterState {
  playerId: string;
  name: string;
  livesRemaining: number;
  totalLives: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
}

export interface BowlerStats {
  playerId: string;
  name: string;
  teamId: string;
  teamName: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
}

export interface Delivery {
  id: number;
  over: number;          // 0-indexed completed overs at time of delivery
  ballInOver: number;    // 0-indexed legal ball in over (−1 for wides/no-balls)
  batterId: string;
  bowlerId: string;
  bowlingTeamId: string;
  runs: number;          // bat runs
  extras: number;        // penalty + bye/leg-bye runs
  extraType?: ExtraType;
  isLegalBall: boolean;
  dismissal?: {
    type: DismissalType;
    batterId: string;
    fielderId?: string;
    fielderName?: string;
  };
  totalRuns: number;     // runs + extras → added to team score
  displayBall: string;   // '·', '1', '4', '6', 'W', 'Wd', 'Nb', 'B2', 'Lb3'
}

/** One bowling team's allocation of overs (1-indexed) */
export interface BowlingTurn {
  teamId: string;
  teamName: string;
  fromOver: number;
  toOver: number;
}

export interface InningsState {
  id: number;
  battingTeamId: string;
  battingTeamName: string;
  bowlingOrder: BowlingTurn[];
  batters: BatterState[];
  bowlers: Record<string, BowlerStats>; // keyed by playerId
  deliveries: Delivery[];
  strikerId: string;
  nonStrikerId: string;
  currentBowlerId: string;
  currentBowlingTeamId: string;
  completedOvers: number;
  ballsInCurrentOver: number; // legal balls in current over (0–ballsPerOver−1)
  runs: number;
  wickets: number;
  extras: { wides: number; noBalls: number; byes: number; legByes: number };
  status: InningsStatus;
}

// ─── Match ─────────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  name: string;
  status: MatchStatus;
  format: FormatConfig;
  teams: Team[];
  innings: InningsState[];
  currentInningsIndex: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export interface DeliveryInput {
  runs: number;
  extraType?: ExtraType;
  extraRuns?: number;  // for byes / leg-byes
  dismissal?: {
    type: DismissalType;
    fielderId?: string;
    fielderName?: string;
  };
}

export interface MatchStoreCtx {
  matches: Match[];
  currentMatchId: string | null;
  openMatch: (matchId: string) => void;
  createMatch: (
    format: FormatConfig,
    teams: Team[],
    battingOrder: Team[],
    bowlingOrders: Record<string, Team[]>,
  ) => string;
  startMatch: (matchId: string) => void;
  recordDelivery: (matchId: string, input: DeliveryInput) => void;
  endMatch: (matchId: string) => void;
  nextInnings: (matchId: string) => void;
  undoDelivery: (matchId: string) => void;
}
