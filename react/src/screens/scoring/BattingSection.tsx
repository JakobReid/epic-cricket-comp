import { TrendingUp } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { LifeIndicator, CricketIcon } from "../../components/Shared";
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
    <div style={{ padding: "0 12px" }}>
      <div style={{
        background: t.card,
        borderRadius: t.radiusLg,
        overflow: "hidden",
        border: `2px solid ${color}`,
      }}>
        {/* Team header */}
        <div style={{ background: color, padding: "10px 14px 8px" }}>
          {/* Top row: label + overs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{
              fontFamily: t.fontDisplay, fontSize: 10, color: "rgba(255,255,255,0.7)",
              letterSpacing: 2, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <CricketIcon src={batLineal} color="#fff" size={11} opacity={0.7} />
              BATTING
            </div>
            <div style={{
              fontFamily: t.font, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600,
            }}>
              {completedOvers}.{ballsInCurrentOver} / {totalOvers} ov
            </div>
          </div>
          {/* Main row: team name + score */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 500, color: "#fff",
              textTransform: "uppercase", letterSpacing: 0.8,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <TeamLogo logoKey={logo} color="rgba(255,255,255,0.85)" size={16} />
              {teamName}
            </div>
            <div style={{ fontFamily: t.font, fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {wickets}
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}>/</span>
              {runs}
            </div>
          </div>
        </div>

        {/* Batter rows */}
        {batters.map((b, i) => {
          const isStriker = b.playerId === strikerId;
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : "—";
          return (
            <div key={b.playerId} style={{
              borderTop: i > 0 ? `1px solid ${t.border}` : undefined,
              background: isStriker ? `${color}08` : t.card,
            }}>
              <div style={{ padding: "10px 14px 10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                {/* Striker dot */}
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: isStriker ? color : "transparent",
                  border: isStriker ? "none" : `1.5px solid ${t.borderBright}`,
                  flexShrink: 0,
                  boxShadow: isStriker ? `0 0 6px ${color}60` : "none",
                }} />
                {/* Name + lives */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontFamily: t.fontSans, fontSize: 14, fontWeight: 700,
                      color: isStriker ? t.text : t.textDim,
                    }}>
                      {b.name}
                    </span>
                    <LifeIndicator total={b.totalLives} remaining={b.livesRemaining} />
                  </div>
                </div>
                {/* Runs + stats */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: t.font, fontWeight: 800, fontSize: 24, color: t.text, lineHeight: 1 }}>{b.runs}</span>
                    <span style={{ fontFamily: t.font, fontSize: 12, color: t.textMuted, fontWeight: 500 }}>({b.balls})</span>
                  </div>
                  <div style={{
                    fontFamily: t.font, fontSize: 11, color: t.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 2,
                  }}>
                    <TrendingUp size={9} color={t.textMuted} /> {sr}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
