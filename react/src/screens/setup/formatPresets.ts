import wicketLineal from "../../assets/criquet-icons/wicket-lineal.png";
import stadiumLineal from "../../assets/criquet-icons/stadium-lineal.png";
import fastBallLineal from "../../assets/criquet-icons/fast-ball-lineal.png";

export const FORMAT_PRESETS = [
  {
    name: "Pairs Cricket",
    img: wicketLineal,
    desc: "2-player teams, lives system, rotating bowlers",
    config: { overs: 6, ballsPerOver: 6, wickets: 3, catchBonus: 5, playersPerTeam: 2, teamsPerGame: 4, retireAt: 0, maxOversPerBowler: 0, cantOutFirstBall: false, nickAndRun: true, lastManStands: true, oneHandOneBounce: false, freeHits: true },
  },
  {
    name: "Standard",
    img: stadiumLineal,
    desc: "Traditional limited-overs cricket",
    config: { overs: 20, ballsPerOver: 6, wickets: 1, catchBonus: 0, playersPerTeam: 11, teamsPerGame: 2, retireAt: 0, maxOversPerBowler: 4, cantOutFirstBall: false, nickAndRun: false, lastManStands: false, oneHandOneBounce: false, freeHits: true },
  },
  {
    name: "Backyard Bash",
    img: fastBallLineal,
    desc: "Quick games, small teams, high action",
    config: { overs: 4, ballsPerOver: 8, wickets: 2, catchBonus: 0, playersPerTeam: 3, teamsPerGame: 2, retireAt: 25, maxOversPerBowler: 0, cantOutFirstBall: true, nickAndRun: true, lastManStands: true, oneHandOneBounce: true, freeHits: false },
  },
];
