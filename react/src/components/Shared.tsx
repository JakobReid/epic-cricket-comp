import { Heart } from "lucide-react";
import { useTheme } from "../ThemeContext";

export const Pill = ({ children, active, color, onClick }: any) => {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      background: active ? color + "1a" : "transparent",
      border: `${t.borderWidth}px solid ${active ? color || t.primary : t.border}`,
      color: active ? color || t.primary : t.textDim,
      borderRadius: t.radius, padding: "6px 14px", fontSize: 13,
      fontFamily: t.fontSans, fontWeight: 700, cursor: "pointer", transition: t.transition,
    }}>{children}</button>
  );
};

export const Badge = ({ children, color, bg }: any) => {
  const t = useTheme();
  return (
    <span style={{
      background: bg ?? color + "18", color, fontSize: 10, fontWeight: 700,
      fontFamily: t.font, padding: "2px 8px", borderRadius: 4,
      letterSpacing: 1, textTransform: "uppercase",
    }}>{children}</span>
  );
};

export const LifeIndicator = ({ total, remaining, color }: any) => {
  const t = useTheme();
  const c = color ?? t.danger;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <Heart key={i} size={10} fill={i < remaining ? c : "transparent"}
          color={c} strokeWidth={2.5} />
      ))}
    </div>
  );
};

export const IconBtn = ({ icon: Icon, size = 16, color, style = {}, onClick }: any) => {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: color || "inherit",
      cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
      justifyContent: "center", ...style,
    }}><Icon size={size} /></button>
  );
};
