import { useTheme } from "../ThemeContext";
import { TeamLogo } from "../screens/setup/TeamsPage";

interface Props {
  color: string;
  logo: string;
  teamName: string;
  wickets: number;
  runs: number;
  inningsNum?: number;
}

export function InningsCardHeader({ color, logo, teamName, wickets, runs, inningsNum }: Props) {
  const t = useTheme();
  return (
    <div style={{ background: color, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
      {inningsNum !== undefined && (
        <div style={{ fontFamily: t.font, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 4 }}>
          Innings {inningsNum}
        </div>
      )}
      <TeamLogo logoKey={logo} color="rgba(255,255,255,0.85)" size={13} />
      <span style={{ fontFamily: t.fontSans, fontSize: 13, fontWeight: 700, color: "#fff", flex: 1 }}>{teamName}</span>
      <span style={{ fontFamily: t.font, fontSize: 15, fontWeight: 800, color: "#fff" }}>{wickets}/{runs}</span>
    </div>
  );
}
