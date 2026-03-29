import { Heart, Radio, Clock, CheckCircle2 } from "lucide-react";
import { useTheme } from "../ThemeContext";

export const StatusBadge = ({ status }: { status: "live" | "upcoming" | "completed" }) => {
  const t = useTheme();
  if (status === "live") {
    return (
      <span style={{
        fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600,
        color: "#fff", background: t.danger,
        borderRadius: 3, padding: "2px 7px 2px 5px", letterSpacing: 1.5,
        textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4,
      }}>
        <Radio size={9} color="#fff" style={{ animation: "livePulse 1.5s ease-in-out infinite" }} />
        LIVE
      </span>
    );
  }
  const config = status === "upcoming"
    ? { label: "Upcoming", icon: Clock, color: t.accent }
    : { label: "Completed", icon: CheckCircle2, color: t.textMuted };
  const Icon = config.icon;
  return (
    <span style={{
      fontFamily: t.fontDisplay, fontSize: 10, fontWeight: 600,
      color: config.color, background: `${config.color}14`,
      border: `1px solid ${config.color}30`,
      borderRadius: 3, padding: "2px 7px", letterSpacing: 1.5,
      textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <Icon size={9} color={config.color} strokeWidth={2.5} />
      {config.label}
    </span>
  );
};

export const Pill = ({ children, active, color, onClick }: any) => {
  const t = useTheme();
  const c = color || t.primary;
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${c}18` : t.card,
        border: `${t.borderWidth}px solid ${active ? c : t.border}`,
        color: active ? c : t.textDim,
        borderRadius: t.radius,
        padding: "6px 14px",
        fontSize: 12,
        fontFamily: t.fontDisplay,
        fontWeight: 600,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        cursor: "pointer",
        transition: t.transition,
        boxShadow: active ? `0 0 8px ${c}20` : "none",
      }}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, color, bg }: any) => {
  const t = useTheme();
  return (
    <span
      style={{
        background: bg ?? `${color}18`,
        color,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: t.fontDisplay,
        padding: "2px 8px",
        borderRadius: t.radius,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        border: `1px solid ${color}25`,
      }}
    >
      {children}
    </span>
  );
};

export const LifeIndicator = ({ total, remaining, color }: any) => {
  const t = useTheme();
  const c = color ?? t.danger;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => {
        const alive = i < remaining;
        return (
          <Heart
            key={i}
            size={10}
            fill={alive ? c : "transparent"}
            color={c}
            strokeWidth={2.5}
            style={{
              opacity: alive ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
};

export const IconBtn = ({ icon: Icon, size = 16, color, style = {}, onClick }: any) => {
  const t = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: color || t.textDim,
        cursor: "pointer",
        padding: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: t.radius,
        transition: t.transition,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = t.cardAlt;
        e.currentTarget.style.color = color || t.text;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
        e.currentTarget.style.color = color || t.textDim;
      }}
    >
      <Icon size={size} />
    </button>
  );
};
