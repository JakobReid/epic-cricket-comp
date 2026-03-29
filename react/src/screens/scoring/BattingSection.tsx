import { TrendingUp } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { LifeIndicator } from "../../components/Shared";
import { TeamLogo } from "../setup/TeamsPage";
import batLineal from "../../assets/criquet-icons/bat-lineal.png";
import type { BatterState } from "../../store/types";

interface HeaderProps {
  color: string;
  logo: string;
  teamName: string;
  runs: number;
  wickets: number;
  completedOvers: number;
  ballsInCurrentOver: number;
  totalOvers: number;
}

interface Props extends HeaderProps {
  batters: BatterState[];
  strikerId: string;
}

export const BattingSection = ({
  color, logo, teamName,
  runs, wickets, completedOvers, ballsInCurrentOver, totalOvers,
  batters, strikerId,
}: Props) => {
  const t = useTheme();

  return (
    <div>
      <div style={{
        borderLeft: `${t.borderWidth}px solid ${color}`,
        borderRight: `${t.borderWidth}px solid ${color}`,
        borderBottom: `${t.borderWidth}px solid ${color}`,
        overflow: "hidden",
      }}>
        {/* Inline batting header */}
        <div style={{ background: color, padding: "8px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: t.font, letterSpacing: 1.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
              <img src={batLineal} style={{ width: 12, height: 12, filter: "brightness(0) invert(1)", opacity: 0.7 }} /> Batting
            </div>
            <div style={{ fontFamily: t.font, fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
              {completedOvers}.{ballsInCurrentOver} / {totalOvers} ov
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, color: "#fff", fontFamily: t.fontSans, fontWeight: 800, display: "flex", alignItems: "center", gap: 7 }}>
              <TeamLogo logoKey={logo} color="rgba(255,255,255,0.85)" size={13} />
              {teamName}
            </div>
            <div style={{ fontFamily: t.font, fontSize: 15, color: "#fff", fontWeight: 800 }}>
              {wickets}/{runs}
            </div>
          </div>
        </div>

        {/* Batters */}
        <div style={{ borderTop: `${t.borderWidth}px solid ${color}` }}>
          {batters.map((b, i) => {
            const isStriker = b.playerId === strikerId;
            const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : "—";
            return (
              <div key={b.playerId} style={{
                borderTop: i > 0 ? `${t.borderWidth}px solid ${color}` : undefined,
                background: t.card,
              }}>
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isStriker ? color : "transparent", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: t.fontSans, fontSize: 14, fontWeight: 700, color: t.text }}>{b.name}</span>
                      <LifeIndicator total={b.totalLives} remaining={b.livesRemaining} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div>
                      <span style={{ fontFamily: t.font, fontWeight: 700, fontSize: 20, color: t.text }}>{b.runs}</span>
                      <span style={{ fontFamily: t.font, fontSize: 13, color: t.text }}> ({b.balls})</span>
                    </div>
                    <div style={{ fontFamily: t.font, fontSize: 12, color: t.textMuted, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 1 }}>
                      <TrendingUp size={10} /> {sr} SR
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
