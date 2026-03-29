import { useTheme } from "../ThemeContext";
import { useMatchStore } from "../store/matchStore";
import { TeamLogo } from "./setup/TeamsPage";

interface Props {
  matchId: string;
}

export function MatchConfig({ matchId }: Props) {
  const t = useTheme();
  const { matches } = useMatchStore();
  const match = matches.find(m => m.id === matchId);

  if (!match) return null;

  const { format, teams } = match;

  const tag = (label: string) => (
    <span key={label} style={{
      fontFamily: t.font, fontSize: 10, fontWeight: 600,
      color: t.textMuted, background: t.cardAlt,
      padding: "2px 7px", borderRadius: 4,
    }}>{label}</span>
  );

  const ruleTags = [
    `${format.teamsPerGame} teams`,
    `${format.playersPerTeam}pp`,
    `${format.overs} ov`,
    `${format.ballsPerOver} ball`,
    `${format.wickets} wkt`,
    ...(format.catchBonus > 0 ? [`+${format.catchBonus} catch`] : []),
    ...(format.retireAt > 0 ? [`ret ${format.retireAt}`] : []),
    ...(format.maxOversPerBowler > 0 ? [`max ${format.maxOversPerBowler} ov/bwlr`] : []),
    ...(format.cantOutFirstBall ? ["safe 1st"] : []),
    ...(format.nickAndRun ? ["nick & run"] : []),
    ...(format.lastManStands ? ["LMS"] : []),
    ...(format.oneHandOneBounce ? ["OHOB"] : []),
    ...(format.freeHits ? ["free hits"] : []),
  ];

  const section: React.CSSProperties = {
    background: t.card,
    border: `${t.borderWidth}px solid ${t.border}`,
    borderRadius: t.radiusLg,
    padding: "14px 16px",
    marginBottom: 10,
  };

  const label: React.CSSProperties = {
    fontFamily: t.fontSans, fontSize: 11, fontWeight: 600,
    color: t.textMuted, textTransform: "uppercase", letterSpacing: 1,
    marginBottom: 8,
  };

  return (
    <div style={{ padding: 16, paddingBottom: 24, maxWidth: 640, margin: "0 auto" }}>

      {/* Format */}
      <div style={section}>
        <div style={label}>Format</div>
        <div style={{ fontFamily: t.fontSans, fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 8 }}>
          {format.name}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ruleTags.map(tag)}
        </div>
      </div>

      {/* Teams */}
      <div style={{ ...section, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px 10px", borderBottom: `${t.borderWidth}px solid ${t.border}` }}>
          <div style={label}>Teams</div>
        </div>
        {teams.map((team, i) => (
          <div key={team.id} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "12px 16px",
            borderBottom: i < teams.length - 1 ? `${t.borderWidth}px solid ${t.border}` : undefined,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: t.radius, flexShrink: 0,
              background: team.color + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TeamLogo logoKey={team.logo} color={team.color} size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>
                {team.name}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {team.players.map(p => (
                  <span key={p.id} style={{
                    fontFamily: t.font, fontSize: 11, color: t.textDim,
                    background: t.cardAlt, padding: "2px 8px", borderRadius: 4,
                  }}>{p.name}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Innings order */}
      <div style={section}>
        <div style={label}>Batting Order</div>
        {match.innings.map((inn, i) => (
          <div key={inn.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "5px 0",
            borderTop: i > 0 ? `${t.borderWidth}px solid ${t.border}` : undefined,
          }}>
            <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, minWidth: 18 }}>
              {i + 1}.
            </span>
            <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 600, color: t.text }}>
              {inn.battingTeamName}
            </span>
            <span style={{ fontFamily: t.font, fontSize: 11, color: t.textMuted, marginLeft: "auto" }}>
              {inn.status === "complete"
                ? `${inn.wickets}/${inn.runs} (${inn.completedOvers}.0 ov)`
                : inn.status === "in-progress"
                  ? "batting"
                  : "upcoming"}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
