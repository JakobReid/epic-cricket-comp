import { useTheme } from "../../ThemeContext";
import type { Delivery } from "../../store/types";

function ballColor(d: Delivery, t: any): { bg: string; border: string; text: string } {
  if (d.dismissal) return { bg: t.danger, border: t.danger, text: "#fff" };
  if (d.extraType === "wide" || d.extraType === "no-ball") return { bg: "#f59e0b", border: "#d97706", text: "#fff" };
  if (d.extraType === "bye" || d.extraType === "leg-bye") return { bg: "#3b82f6", border: "#2563eb", text: "#fff" };
  if (d.runs === 6) return { bg: t.primary, border: t.primaryDim, text: "#fff" };
  if (d.runs === 4) return { bg: t.primary + "cc", border: t.primary, text: "#fff" };
  if (d.runs === 0) return { bg: t.primary, border: t.primary, text: "#fff" };
  return { bg: t.primary, border: t.primary, text: "#fff" };
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
    <div style={{ padding: "10px 16px 12px" }}>
      <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.font, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
        This Over
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {slots.map((d, i) => {
          if (!d) {
            return (
              <div key={i} style={{
                width: 44, height: 44, borderRadius: 22,
                background: "transparent",
                border: `3px solid ${t.primary}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }} />
            );
          }
          const { bg, border, text } = ballColor(d, t);
          const label = d.displayBall;
          const isDot = label === "·";
          return (
            <div key={i} style={{
              width: 44, height: 44, borderRadius: 22,
              background: bg,
              border: `${t.borderWidth}px solid ${border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.font, fontSize: label.length > 2 ? 12 : 18, fontWeight: 800,
              color: text,
            }}>
              {isDot
                ? <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fff" }} />
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
              width: 44, height: 44, borderRadius: 22,
              background: bg, border: `${t.borderWidth}px solid ${border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.font, fontSize: 12, fontWeight: 800, color: text,
            }}>
              {d.displayBall.toLowerCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
