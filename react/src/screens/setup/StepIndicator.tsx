import { Check } from "lucide-react";
import { useTheme } from "../../ThemeContext";

export const StepIndicator = ({ steps, stepLabels, sectionIcons, stepIdx, setActiveSection }: any) => {
  const t = useTheme();
  return (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
    {steps.map((s: string, i: number) => {
      const SIcon = sectionIcons[s];
      const isActive = i === stepIdx;
      const isDone = i < stepIdx;
      return (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <button onClick={() => setActiveSection(s)} style={{
            display: "flex", alignItems: "center", gap: "clamp(6px, 1vw, 10px)",
            background: "none", border: "none", cursor: "pointer", padding: "4px 0",
          }}>
            <div style={{
              width: "clamp(28px, 4.5vw, 42px)", height: "clamp(28px, 4.5vw, 42px)", borderRadius: "50%",
              background: isActive ? t.primary : isDone ? t.primary + "22" : t.cardAlt,
              border: `${t.borderWidth}px solid ${isActive ? t.primary : isDone ? t.primary : t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {isDone ? (
                <Check size={16} color={t.primary} strokeWidth={3} style={{ width: "45%", height: "45%" }} />
              ) : (
                <SIcon size={16} color={isActive ? "#fff" : t.textMuted} style={{ width: "45%", height: "45%" }} />
              )}
            </div>
            <span style={{
              fontFamily: t.fontSans, fontSize: "clamp(12px, 1.6vw, 16px)", fontWeight: 700,
              color: isActive ? t.text : isDone ? t.primary : t.textMuted,
            }}>
              {stepLabels[s]}
            </span>
          </button>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, marginLeft: "clamp(8px, 1.2vw, 14px)", marginRight: "clamp(8px, 1.2vw, 14px)",
              background: isDone ? t.primary : t.border,
              borderRadius: 1, transition: "background 0.2s",
            }} />
          )}
        </div>
      );
    })}
  </div>
  );
};
