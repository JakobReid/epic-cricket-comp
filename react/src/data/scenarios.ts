import type { Match, Team, InningsState, Delivery, BatterState, BowlerStats } from "../store/types";

// ─── Teams shared across scenarios ───────────────────────────────────────────

const mkTeam = (id: string, name: string, color: string, logo: string, players: [string, string][]): Team => ({
  id,
  name,
  color,
  logo,
  players: players.map(([pid, pname]) => ({ id: pid, name: pname })),
});

// Scenario A — "Backyard Bash" (live match)
const BA_TEAMS: Team[] = [
  mkTeam("ba-t0", "Backyard Legends", "#2196F3", "shield",  [["ba-t0-p0", "Jakob"], ["ba-t0-p1", "Matt"]]),
  mkTeam("ba-t1", "Street Smashers",  "#8E24AA", "star",    [["ba-t1-p0", "Tom"],  ["ba-t1-p1", "Luke"]]),
  mkTeam("ba-t2", "Park Royals",      "#43A047", "zap",     [["ba-t2-p0", "Sam"],  ["ba-t2-p1", "Dan"]]),
  mkTeam("ba-t3", "The Tail Enders",  "#FB8C00", "flame",   [["ba-t3-p0", "Chris"],["ba-t3-p1", "Ryan"]]),
];

// Scenario B — "Summer Classic" (completed match)
const SC_TEAMS: Team[] = [
  mkTeam("sc-t0", "Phoenix FC",       "#E53935", "crown",   [["sc-t0-p0", "Alex"], ["sc-t0-p1", "Jordan"]]),
  mkTeam("sc-t1", "The Wanderers",    "#00897B", "trophy",  [["sc-t1-p0", "Casey"],["sc-t1-p1", "Taylor"]]),
  mkTeam("sc-t2", "Northern Stars",   "#F9A825", "star",    [["sc-t2-p0", "Morgan"],["sc-t2-p1","Riley"]]),
  mkTeam("sc-t3", "City Strikers",    "#546E7A", "swords",  [["sc-t3-p0", "Drew"], ["sc-t3-p1", "Blake"]]),
];

// Scenario C — "Park Day" (upcoming match)
const PD_TEAMS: Team[] = [
  mkTeam("pd-t0", "Grasshoppers",     "#43A047", "flame",   [["pd-t0-p0", "Finn"],  ["pd-t0-p1", "Oscar"]]),
  mkTeam("pd-t1", "Sunset Sloggers",  "#E91E63", "swords",  [["pd-t1-p0", "Ivy"],   ["pd-t1-p1", "Zara"]]),
  mkTeam("pd-t2", "Riverbank XI",     "#2196F3", "rocket",  [["pd-t2-p0", "Luca"],  ["pd-t2-p1", "Noah"]]),
  mkTeam("pd-t3", "The Ducks",        "#FFCA28", "trophy",  [["pd-t3-p0", "Mia"],   ["pd-t3-p1", "Ella"]]),
];

// ─── Helper ───────────────────────────────────────────────────────────────────

let _did = 0;
function mkDel(
  over: number, ballInOver: number,
  batterId: string, bowlerId: string, bowlingTeamId: string,
  runs: number, displayBall: string,
  extras = 0, isLegal = true,
  dismissal?: Delivery["dismissal"],
): Delivery {
  return {
    id: _did++,
    over, ballInOver,
    batterId, bowlerId, bowlingTeamId,
    runs, extras, isLegalBall: isLegal,
    totalRuns: runs + extras,
    displayBall,
    dismissal,
  };
}

function bowlerStats(
  playerId: string, name: string, teamId: string, teamName: string,
  legalBalls: number, runsConceded: number, wickets = 0, wides = 0, noBalls = 0,
): BowlerStats {
  return { playerId, name, teamId, teamName, legalBalls, runsConceded, wickets, wides, noBalls };
}

function batter(
  playerId: string, name: string, lives: number, totalLives: number,
  runs: number, balls: number, fours: number, sixes: number,
): BatterState {
  return { playerId, name, livesRemaining: lives, totalLives, runs, balls, fours, sixes };
}

// ─── Scenario A: Live match — innings 1 complete, innings 2 in progress ───────
//
//  Backyard Legends (team 0) batted first → 112 runs, 3 wickets, 6 overs (done)
//  Street Smashers  (team 1) batting now  → 41 runs, 1 wicket, at ball 4 of over 3
//  Park Royals      (team 2) upcoming
//  The Tail Enders  (team 3) upcoming

// Innings 1: Backyard Legends bat (complete)
const BA_INN0 = ((): InningsState => {
  _did = 0;
  // 6 overs, 36 legal balls → 112 runs, 3 wickets
  // Bowling order: t1(ov 1–2), t2(ov 3–4), t3(ov 5–6)
  // Batters: Jakob p0, Matt p1; striker = p0
  const p0 = "ba-t0-p0"; // Jakob
  const p1 = "ba-t0-p1"; // Matt
  const bowlers = {
    "ba-t1-p0": bowlerStats("ba-t1-p0","Tom",  "ba-t1","Street Smashers", 12, 36, 1),
    "ba-t1-p1": bowlerStats("ba-t1-p1","Luke", "ba-t1","Street Smashers", 12, 30, 0),
    "ba-t2-p0": bowlerStats("ba-t2-p0","Sam",  "ba-t2","Park Royals",     12, 28, 1),
    "ba-t2-p1": bowlerStats("ba-t2-p1","Dan",  "ba-t2","Park Royals",     12, 18, 1),
  };

  // Build a minimal deliveries array for the in-progress innings display
  // (we just need enough for realistic scorecard)
  const deliveries: Delivery[] = [
    mkDel(0,0,p0,"ba-t1-p0","ba-t1",1,"1"),
    mkDel(0,1,p1,"ba-t1-p0","ba-t1",4,"4"),
    mkDel(0,2,p0,"ba-t1-p0","ba-t1",0,"·"),
    mkDel(0,3,p0,"ba-t1-p0","ba-t1",2,"2"),
    mkDel(0,4,p1,"ba-t1-p0","ba-t1",0,"·"),
    mkDel(0,5,p1,"ba-t1-p0","ba-t1",4,"4"),
    mkDel(1,0,p0,"ba-t1-p1","ba-t1",6,"6"),
    mkDel(1,1,p1,"ba-t1-p1","ba-t1",0,"·"),
    mkDel(1,2,p1,"ba-t1-p1","ba-t1",2,"2"),
    mkDel(1,3,p0,"ba-t1-p1","ba-t1",4,"4"),
    mkDel(1,4,p1,"ba-t1-p1","ba-t1",0,"·"),
    mkDel(1,5,p1,"ba-t1-p1","ba-t1",4,"4"),
    mkDel(2,0,p0,"ba-t2-p0","ba-t2",1,"1"),
    mkDel(2,1,p1,"ba-t2-p0","ba-t2",0,"·"),
    mkDel(2,2,p1,"ba-t2-p0","ba-t2",4,"4"),
    mkDel(2,3,p0,"ba-t2-p0","ba-t2",0,"W",0,true,{type:"caught",batterId:p0,fielderId:"ba-t1-p0",fielderName:"Tom"}),
    mkDel(2,4,p1,"ba-t2-p0","ba-t2",2,"2"),
    mkDel(2,5,p0,"ba-t2-p0","ba-t2",0,"·"),
    mkDel(3,0,p0,"ba-t2-p1","ba-t2",6,"6"),
    mkDel(3,1,p1,"ba-t2-p1","ba-t2",4,"4"),
    mkDel(3,2,p0,"ba-t2-p1","ba-t2",0,"·"),
    mkDel(3,3,p0,"ba-t2-p1","ba-t2",4,"4"),
    mkDel(3,4,p1,"ba-t2-p1","ba-t2",0,"W",0,true,{type:"bowled",batterId:p1}),
    mkDel(3,5,p0,"ba-t2-p1","ba-t2",2,"2"),
    mkDel(4,0,p0,"ba-t2-p0","ba-t2",4,"4"),
    mkDel(4,1,p1,"ba-t2-p0","ba-t2",0,"·"),
    mkDel(4,2,p1,"ba-t2-p0","ba-t2",4,"4"),
    mkDel(4,3,p0,"ba-t2-p0","ba-t2",0,"W",0,true,{type:"caught",batterId:p0,fielderId:"ba-t2-p1",fielderName:"Dan"}),
    mkDel(4,4,p1,"ba-t2-p0","ba-t2",6,"6"),
    mkDel(4,5,p0,"ba-t2-p0","ba-t2",4,"4"),
    mkDel(5,0,p0,"ba-t2-p1","ba-t2",0,"·"),
    mkDel(5,1,p1,"ba-t2-p1","ba-t2",4,"4"),
    mkDel(5,2,p0,"ba-t2-p1","ba-t2",2,"2"),
    mkDel(5,3,p1,"ba-t2-p1","ba-t2",0,"·"),
    mkDel(5,4,p0,"ba-t2-p1","ba-t2",4,"4"),
    mkDel(5,5,p1,"ba-t2-p1","ba-t2",2,"2"),
  ];

  return {
    id: 0,
    battingTeamId: "ba-t0", battingTeamName: "Backyard Legends",
    bowlingOrder: [
      { teamId: "ba-t1", teamName: "Street Smashers", fromOver: 1, toOver: 2 },
      { teamId: "ba-t2", teamName: "Park Royals",      fromOver: 3, toOver: 6 },
    ],
    batters: [
      batter(p0, "Jakob", 1, 3, 63, 22, 6, 3),
      batter(p1, "Matt",  2, 3, 49, 14, 4, 2),
    ],
    bowlers,
    deliveries,
    strikerId: p0, nonStrikerId: p1,
    currentBowlerId: "ba-t2-p1", currentBowlingTeamId: "ba-t2",
    completedOvers: 6, ballsInCurrentOver: 0,
    runs: 112, wickets: 3,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    status: "complete",
  };
})();

// Innings 2: Street Smashers batting — over 3, ball 4 in progress (41/1)
const BA_INN1 = ((): InningsState => {
  const p0 = "ba-t1-p0"; // Tom  — striker
  const p1 = "ba-t1-p1"; // Luke — non-striker
  // Bowling order: t0(ov 1–2), t2(ov 3–4), t3(ov 5–6)

  const deliveries: Delivery[] = [
    // Over 1 (t0 bowling — Jakob ba-t0-p0)
    mkDel(0,0,p0,"ba-t0-p0","ba-t0",0,"·"),
    mkDel(0,1,p0,"ba-t0-p0","ba-t0",4,"4"),
    mkDel(0,2,p1,"ba-t0-p0","ba-t0",1,"1"),
    mkDel(0,3,p0,"ba-t0-p0","ba-t0",2,"2"),
    mkDel(0,4,p1,"ba-t0-p0","ba-t0",0,"·"),
    mkDel(0,5,p1,"ba-t0-p0","ba-t0",4,"4"),
    // Over 2 (t0 bowling — Matt ba-t0-p1)
    mkDel(1,0,p0,"ba-t0-p1","ba-t0",0,"·"),
    mkDel(1,1,p0,"ba-t0-p1","ba-t0",2,"2"),
    mkDel(1,2,p1,"ba-t0-p1","ba-t0",0,"W",0,true,{type:"caught",batterId:p1,fielderId:"ba-t0-p0",fielderName:"Jakob"}),
    mkDel(1,3,p0,"ba-t0-p1","ba-t0",4,"4"),
    mkDel(1,4,p1,"ba-t0-p1","ba-t0",0,"·"),
    mkDel(1,5,p1,"ba-t0-p1","ba-t0",6,"6"),
    // Over 3, partial (t2 bowling — Sam ba-t2-p0) — 4 balls in
    mkDel(2,0,p0,"ba-t2-p0","ba-t2",1,"1"),
    mkDel(2,1,p1,"ba-t2-p0","ba-t2",4,"4"),
    mkDel(2,2,p0,"ba-t2-p0","ba-t2",0,"·"),
    mkDel(2,3,p1,"ba-t2-p0","ba-t2",0,"·"),
  ];

  return {
    id: 1,
    battingTeamId: "ba-t1", battingTeamName: "Street Smashers",
    bowlingOrder: [
      { teamId: "ba-t0", teamName: "Backyard Legends", fromOver: 1, toOver: 2 },
      { teamId: "ba-t2", teamName: "Park Royals",       fromOver: 3, toOver: 4 },
      { teamId: "ba-t3", teamName: "The Tail Enders",   fromOver: 5, toOver: 6 },
    ],
    batters: [
      batter(p0, "Tom",  3, 3, 22, 10, 1, 0), // striker
      batter(p1, "Luke", 2, 3, 19, 8,  1, 1), // non-striker (lost a life)
    ],
    bowlers: {
      "ba-t0-p0": bowlerStats("ba-t0-p0","Jakob","ba-t0","Backyard Legends",6,11,0),
      "ba-t0-p1": bowlerStats("ba-t0-p1","Matt","ba-t0","Backyard Legends", 6,12,1),
      "ba-t2-p0": bowlerStats("ba-t2-p0","Sam","ba-t2","Park Royals",       4, 5,0),
    },
    deliveries,
    strikerId: p1, nonStrikerId: p0,
    currentBowlerId: "ba-t2-p0", currentBowlingTeamId: "ba-t2",
    completedOvers: 2, ballsInCurrentOver: 4,
    runs: 41, wickets: 1,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    status: "in-progress",
  };
})();

// Innings 3 + 4: upcoming
const BA_INN2: InningsState = {
  id: 2,
  battingTeamId: "ba-t2", battingTeamName: "Park Royals",
  bowlingOrder: [
    { teamId: "ba-t0", teamName: "Backyard Legends", fromOver: 1, toOver: 2 },
    { teamId: "ba-t1", teamName: "Street Smashers",  fromOver: 3, toOver: 4 },
    { teamId: "ba-t3", teamName: "The Tail Enders",  fromOver: 5, toOver: 6 },
  ],
  batters: [
    batter("ba-t2-p0","Sam",  3,3,0,0,0,0),
    batter("ba-t2-p1","Dan",  3,3,0,0,0,0),
  ],
  bowlers: {}, deliveries: [],
  strikerId: "ba-t2-p0", nonStrikerId: "ba-t2-p1",
  currentBowlerId: "ba-t0-p0", currentBowlingTeamId: "ba-t0",
  completedOvers: 0, ballsInCurrentOver: 0,
  runs: 0, wickets: 0,
  extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
  status: "upcoming",
};

const BA_INN3: InningsState = {
  id: 3,
  battingTeamId: "ba-t3", battingTeamName: "The Tail Enders",
  bowlingOrder: [
    { teamId: "ba-t0", teamName: "Backyard Legends", fromOver: 1, toOver: 2 },
    { teamId: "ba-t1", teamName: "Street Smashers",  fromOver: 3, toOver: 4 },
    { teamId: "ba-t2", teamName: "Park Royals",       fromOver: 5, toOver: 6 },
  ],
  batters: [
    batter("ba-t3-p0","Chris",3,3,0,0,0,0),
    batter("ba-t3-p1","Ryan", 3,3,0,0,0,0),
  ],
  bowlers: {}, deliveries: [],
  strikerId: "ba-t3-p0", nonStrikerId: "ba-t3-p1",
  currentBowlerId: "ba-t0-p0", currentBowlingTeamId: "ba-t0",
  completedOvers: 0, ballsInCurrentOver: 0,
  runs: 0, wickets: 0,
  extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
  status: "upcoming",
};

// ─── Scenario B: Completed match ──────────────────────────────────────────────

function completedInnings(
  id: number,
  battingTeamId: string, battingTeamName: string,
  bowlingOrder: InningsState["bowlingOrder"],
  p0id: string, p0name: string, p0lives: number, p0runs: number, p0balls: number, p0fours: number, p0sixes: number,
  p1id: string, p1name: string, p1lives: number, p1runs: number, p1balls: number, p1fours: number, p1sixes: number,
  bowlers: Record<string, BowlerStats>,
  totalRuns: number, totalWickets: number,
  bowlingTeamId: string,
): InningsState {
  return {
    id,
    battingTeamId, battingTeamName,
    bowlingOrder,
    batters: [
      batter(p0id, p0name, p0lives, 3, p0runs, p0balls, p0fours, p0sixes),
      batter(p1id, p1name, p1lives, 3, p1runs, p1balls, p1fours, p1sixes),
    ],
    bowlers, deliveries: [],
    strikerId: p0id, nonStrikerId: p1id,
    currentBowlerId: "", currentBowlingTeamId: bowlingTeamId,
    completedOvers: 6, ballsInCurrentOver: 0,
    runs: totalRuns, wickets: totalWickets,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    status: "complete",
  };
}

const SC_INN0 = completedInnings(
  0,"sc-t0","Phoenix FC",
  [{teamId:"sc-t1",teamName:"The Wanderers",fromOver:1,toOver:2},{teamId:"sc-t2",teamName:"Northern Stars",fromOver:3,toOver:4},{teamId:"sc-t3",teamName:"City Strikers",fromOver:5,toOver:6}],
  "sc-t0-p0","Alex",2, 68, 20, 7, 3,
  "sc-t0-p1","Jordan",3, 58, 18, 5, 2,
  {
    "sc-t1-p0": bowlerStats("sc-t1-p0","Casey","sc-t1","The Wanderers",12,34,1),
    "sc-t1-p1": bowlerStats("sc-t1-p1","Taylor","sc-t1","The Wanderers",12,28,0),
    "sc-t2-p0": bowlerStats("sc-t2-p0","Morgan","sc-t2","Northern Stars",12,22,1),
    "sc-t2-p1": bowlerStats("sc-t2-p1","Riley","sc-t2","Northern Stars",12,20,0),
    "sc-t3-p0": bowlerStats("sc-t3-p0","Drew","sc-t3","City Strikers",12,18,1),
    "sc-t3-p1": bowlerStats("sc-t3-p1","Blake","sc-t3","City Strikers",12,6,0),
  },
  134, 3, "sc-t3"
);

const SC_INN1 = completedInnings(
  1,"sc-t1","The Wanderers",
  [{teamId:"sc-t0",teamName:"Phoenix FC",fromOver:1,toOver:2},{teamId:"sc-t2",teamName:"Northern Stars",fromOver:3,toOver:4},{teamId:"sc-t3",teamName:"City Strikers",fromOver:5,toOver:6}],
  "sc-t1-p0","Casey",3, 52, 22, 4, 1,
  "sc-t1-p1","Taylor",2, 49, 16, 4, 2,
  {
    "sc-t0-p0": bowlerStats("sc-t0-p0","Alex","sc-t0","Phoenix FC",12,30,0),
    "sc-t0-p1": bowlerStats("sc-t0-p1","Jordan","sc-t0","Phoenix FC",12,28,1),
    "sc-t2-p0": bowlerStats("sc-t2-p0","Morgan","sc-t2","Northern Stars",12,19,1),
    "sc-t2-p1": bowlerStats("sc-t2-p1","Riley","sc-t2","Northern Stars",12,16,0),
    "sc-t3-p0": bowlerStats("sc-t3-p0","Drew","sc-t3","City Strikers",12,14,0),
    "sc-t3-p1": bowlerStats("sc-t3-p1","Blake","sc-t3","City Strikers",12,11,0),
  },
  118, 2, "sc-t3"
);

const SC_INN2 = completedInnings(
  2,"sc-t2","Northern Stars",
  [{teamId:"sc-t0",teamName:"Phoenix FC",fromOver:1,toOver:2},{teamId:"sc-t1",teamName:"The Wanderers",fromOver:3,toOver:4},{teamId:"sc-t3",teamName:"City Strikers",fromOver:5,toOver:6}],
  "sc-t2-p0","Morgan",3, 44, 18, 3, 1,
  "sc-t2-p1","Riley",3, 61, 20, 6, 2,
  {
    "sc-t0-p0": bowlerStats("sc-t0-p0","Alex","sc-t0","Phoenix FC",12,24,0),
    "sc-t0-p1": bowlerStats("sc-t0-p1","Jordan","sc-t0","Phoenix FC",12,22,0),
    "sc-t1-p0": bowlerStats("sc-t1-p0","Casey","sc-t1","The Wanderers",12,21,0),
    "sc-t1-p1": bowlerStats("sc-t1-p1","Taylor","sc-t1","The Wanderers",12,18,0),
    "sc-t3-p0": bowlerStats("sc-t3-p0","Drew","sc-t3","City Strikers",12,14,0),
    "sc-t3-p1": bowlerStats("sc-t3-p1","Blake","sc-t3","City Strikers",12,8,0),
  },
  107, 0, "sc-t3"
);

const SC_INN3 = completedInnings(
  3,"sc-t3","City Strikers",
  [{teamId:"sc-t0",teamName:"Phoenix FC",fromOver:1,toOver:2},{teamId:"sc-t1",teamName:"The Wanderers",fromOver:3,toOver:4},{teamId:"sc-t2",teamName:"Northern Stars",fromOver:5,toOver:6}],
  "sc-t3-p0","Drew",2, 38, 16, 3, 0,
  "sc-t3-p1","Blake",3, 54, 19, 4, 2,
  {
    "sc-t0-p0": bowlerStats("sc-t0-p0","Alex","sc-t0","Phoenix FC",12,16,1),
    "sc-t0-p1": bowlerStats("sc-t0-p1","Jordan","sc-t0","Phoenix FC",12,18,0),
    "sc-t1-p0": bowlerStats("sc-t1-p0","Casey","sc-t1","The Wanderers",12,20,0),
    "sc-t1-p1": bowlerStats("sc-t1-p1","Taylor","sc-t1","The Wanderers",12,14,1),
    "sc-t2-p0": bowlerStats("sc-t2-p0","Morgan","sc-t2","Northern Stars",12,16,0),
    "sc-t2-p1": bowlerStats("sc-t2-p1","Riley","sc-t2","Northern Stars",12,10,0),
  },
  94, 2, "sc-t2"
);

// ─── Scenario C: Upcoming ─────────────────────────────────────────────────────

function upcomingInnings(id: number, bat: Team, bowlers: Team[]): InningsState {
  const bOrder = bowlers.map((t, i) => {
    const chunk = Math.ceil(6 / bowlers.length);
    return { teamId: t.id, teamName: t.name, fromOver: i * chunk + 1, toOver: Math.min((i + 1) * chunk, 6) };
  });
  return {
    id,
    battingTeamId: bat.id, battingTeamName: bat.name,
    bowlingOrder: bOrder,
    batters: bat.players.map(p => batter(p.id, p.name, 3, 3, 0, 0, 0, 0)),
    bowlers: {}, deliveries: [],
    strikerId: bat.players[0].id, nonStrikerId: bat.players[1].id,
    currentBowlerId: bowlers[0].players[0].id, currentBowlingTeamId: bowlers[0].id,
    completedOvers: 0, ballsInCurrentOver: 0,
    runs: 0, wickets: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    status: "upcoming",
  };
}

// ─── Final scenario matches ───────────────────────────────────────────────────

export const SCENARIO_MATCHES: Match[] = [
  {
    id: "scenario-live",
    name: "Backyard Bash",
    status: "live",
    format: {
      name: "Pairs Cricket",
      overs: 6, ballsPerOver: 6, wickets: 3, catchBonus: 5,
      playersPerTeam: 2, teamsPerGame: 4,
      retireAt: 0, maxOversPerBowler: 0,
      cantOutFirstBall: false, nickAndRun: true, lastManStands: true,
      oneHandOneBounce: false, freeHits: true,
    },
    teams: BA_TEAMS,
    innings: [BA_INN0, BA_INN1, BA_INN2, BA_INN3],
    currentInningsIndex: 1,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "scenario-completed",
    name: "Summer Classic",
    status: "completed",
    format: {
      name: "Pairs Cricket",
      overs: 6, ballsPerOver: 6, wickets: 3, catchBonus: 5,
      playersPerTeam: 2, teamsPerGame: 4,
      retireAt: 0, maxOversPerBowler: 0,
      cantOutFirstBall: false, nickAndRun: false, lastManStands: false,
      oneHandOneBounce: false, freeHits: false,
    },
    teams: SC_TEAMS,
    innings: [SC_INN0, SC_INN1, SC_INN2, SC_INN3],
    currentInningsIndex: 4,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 5 * 3600 * 1000).toISOString(),
  },
  {
    id: "scenario-upcoming",
    name: "Park Day",
    status: "upcoming",
    format: {
      name: "Pairs Cricket",
      overs: 6, ballsPerOver: 6, wickets: 3, catchBonus: 5,
      playersPerTeam: 2, teamsPerGame: 4,
      retireAt: 0, maxOversPerBowler: 0,
      cantOutFirstBall: false, nickAndRun: true, lastManStands: true,
      oneHandOneBounce: true, freeHits: false,
    },
    teams: PD_TEAMS,
    innings: [
      upcomingInnings(0, PD_TEAMS[0], [PD_TEAMS[1], PD_TEAMS[2], PD_TEAMS[3]]),
      upcomingInnings(1, PD_TEAMS[1], [PD_TEAMS[0], PD_TEAMS[2], PD_TEAMS[3]]),
      upcomingInnings(2, PD_TEAMS[2], [PD_TEAMS[0], PD_TEAMS[1], PD_TEAMS[3]]),
      upcomingInnings(3, PD_TEAMS[3], [PD_TEAMS[0], PD_TEAMS[1], PD_TEAMS[2]]),
    ],
    currentInningsIndex: 0,
    createdAt: new Date().toISOString(),
  },
];
