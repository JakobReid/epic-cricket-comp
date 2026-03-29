import { useTheme } from "../../ThemeContext";
import type { Delivery } from "../../store/types";

function ballColor(d: Delivery, t: any): { bg: string; border: string; text: string } {
  if (d.dismissal) return { bg: t.danger, border: t.dangerDim, text: "#fff" };
  if (d.extraType === "wide" || d.extraType === "no-ball") return { bg: `${t.accent}22`, border: t.accentDim, text: t.accent };
  if (d.extraType === "bye" || d.extraType === "leg-bye") return { bg: "rgba(59,130,246,0.15)", border: "#3b82f6", text: "#3b82f6" };
  if (d.runs === 6) return { bg: `${t.primary}20`, border: t.primary, text: t.primary };
  if (d.runs === 4) return { bg: `${t.primary}18`, border: t.primaryDim, text: t.primary };
  if (d.runs === 0) return { bg: t.bgAlt, border: t.borderBright, text: t.textMuted };
  return { bg: t.card, border: t.borderBright, text: t.text };
}

interface Props {
  deliveries: Delivery[];  // all deliveries in current over
  ballsPerOver: number;
}

export const ThisOver = ({ deliveries, ballsPerOver }: Props) => {
  const t = useTheme();

  // Pad to ballsPerOver slots
  const slots = Array.from({ length: ballsPerOver }, (_, i) => deliveries[i] ?? null);

  return (
    <div style={{ padding: "6px 16px 10px" }}>
      <div style={{
        fontFamily: t.fontDisplay, fontSize: 10, color: t.textMuted,
        letterSpacing: 2, marginBottom: 8, textTransform: "uppercase", fontWeight: 500,
      }}>
        THIS OVER
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {slots.map((d, i) => {
          if (!d) {
            return (
              <div key={i} style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "transparent",
                border: `2px solid ${t.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }} />
            );
          }
          const { bg, border, text } = ballColor(d, t);
          const label = d.displayBall;
          const isDot = label === "·";
          return (
            <div key={i} style={{
              width: 44, height: 44, borderRadius: "50%",
              background: bg,
              border: `2px solid ${border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.font, fontSize: label.length > 2 ? 11 : 16, fontWeight: 800,
              color: text,
            }}>
              {isDot
                ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.textMuted }} />
                : label.toLowerCase()
              }
            </div>
          );
        })}
        {/* Show any extras (wides/no-balls) as additional chips beyond ballsPerOver */}
        {deliveries.slice(ballsPerOver).map((d, i) => {
          const { bg, border, text } = ballColor(d, t);
          return (
            <div key={`x-${i}`} style={{
              width: 44, height: 44, borderRadius: "50%",
              background: bg, border: `2px solid ${border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.font, fontSize: 11, fontWeight: 800, color: text,
            }}>
              {d.displayBall.toLowerCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
